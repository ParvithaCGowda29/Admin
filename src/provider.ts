import type { DataProvider } from '@refinedev/core';
import {ADMIN_SHEETS,ACTIVITY_SHEET,adminSheet} from './admin';
export type RecordRow = {id:string;values:string[];sourceRow?:number};
// Browser-only storage keyed to the shipped sheet NAMES, so adding columns to a sheet (like
// the Step 9 User Management expansion) never changes the key and never orphans saved rows.
const revision=ADMIN_SHEETS.map(s=>s.name).join('|');
let hash=2166136261;
for(let i=0;i<revision.length;i++)hash=Math.imul(hash^revision.charCodeAt(i),16777619);
const KEY=`bullm-admin-v1-${(hash>>>0).toString(16)}`;
// Snapshots written by earlier builds (keyed to the full sheet definitions) are migrated
// forward on read: old rows keep their saved values and new columns are filled from the
// matching seed row, so a schema change never wipes anyone's edits.
const LEGACY_KEYS=['bullm-admin-v1-cf090c91'];
function readStore(key:string):Record<string,RecordRow[]>{try{return JSON.parse(localStorage.getItem(key)||'{}')}catch{return {}}}
function migrate(rows:any,name:string):RecordRow[]|null{
 const sheet=adminSheet(name)!;
 if(!Array.isArray(rows)||!rows.every((r:any)=>typeof r.id==='string'&&Array.isArray(r.values)&&r.values.every((v:any)=>typeof v==='string')))return null;
 const seeds=new Map(sheet.rows.map(r=>[r.id,r.values]));
 return rows.map((r:any)=>{
  const v=[...r.values];
  if(v.length<sheet.headers.length){
   const seed=seeds.get(r.id)||[];
   for(let i=v.length;i<sheet.headers.length;i++)v.push(seed[i]||'');
  }
  return {id:r.id,values:v.slice(0,sheet.headers.length)};
 });
}
// The Activity log lives under its own key, independent of the sheet-definition hash, so
// code changes never wipe the trail. Newest entries first, capped at 200.
const ACT_KEY='bullm-admin-activity-v1';
export function loadActivity():RecordRow[]{
 try{const a=JSON.parse(localStorage.getItem(ACT_KEY)||'[]');if(Array.isArray(a)&&a.every((r:any)=>typeof r.id==='string'&&Array.isArray(r.values)&&r.values.length===ACTIVITY_SHEET.headers.length&&r.values.every((v:any)=>typeof v==='string')))return a;}catch{}
 return [];
}
export function logActivity(entries:RecordRow[]){
 try{localStorage.setItem(ACT_KEY,JSON.stringify([...entries,...loadActivity()].slice(0,200)))}catch{}
}
export function loadRows(name:string):RecordRow[]{
 const sheet=adminSheet(name)!;
 if(sheet.readOnly)return sheet.name==='Activity'?loadActivity():structuredClone(sheet.rows);
 try{
  const current=readStore(KEY)[name];
  if(Array.isArray(current)&&current.every((r:any)=>typeof r.id==='string'&&Array.isArray(r.values)&&r.values.length===sheet.headers.length&&r.values.every((v:any)=>typeof v==='string')))return current;
  for(const legacy of LEGACY_KEYS){
   const migrated=migrate(readStore(legacy)[name],name);
   if(migrated){saveRows(name,migrated);return migrated;}
  }
 }catch{}
 return structuredClone(sheet.rows);
}
export function saveRows(name:string,rows:RecordRow[]){
 if(adminSheet(name)?.readOnly)throw Error('This table is read-only.');
 let saved:any={};try{saved=JSON.parse(localStorage.getItem(KEY)||'{}')}catch{}
 localStorage.setItem(KEY,JSON.stringify({...saved,[name]:rows}));
}
export const dataProvider:DataProvider={
 getList:async({resource})=>({data:loadRows(resource) as any,total:loadRows(resource).length}),
 getOne:async({resource,id})=>{const data=loadRows(resource).find(r=>r.id===id);if(!data)throw Error('Record not found');return{data:data as any}},
 create:async({resource,variables})=>{const row=variables as RecordRow;saveRows(resource,[...loadRows(resource),row]);return{data:row as any}},
 update:async({resource,id,variables})=>{const row={...loadRows(resource).find(r=>r.id===id),...variables as object,id:String(id)} as RecordRow;saveRows(resource,loadRows(resource).map(r=>r.id===id?row:r));return{data:row as any}},
 deleteOne:async({resource,id})=>{const row=loadRows(resource).find(r=>r.id===id);saveRows(resource,loadRows(resource).filter(r=>r.id!==id));return{data:row as any}},
 getApiUrl:()=>''
};
