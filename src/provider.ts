import type { DataProvider } from '@refinedev/core';
import {ADMIN_SHEETS,adminSheet} from './admin';
export type RecordRow = {id:string;values:string[];sourceRow?:number};
// Browser-only storage keyed to the shipped sheet definitions, so an updated build never
// hides rows saved under an older snapshot.
const revision=JSON.stringify(ADMIN_SHEETS);
let hash=2166136261;
for(let i=0;i<revision.length;i++)hash=Math.imul(hash^revision.charCodeAt(i),16777619);
const KEY=`bullm-admin-v1-${(hash>>>0).toString(16)}`;
export function loadRows(name:string):RecordRow[]{
 const sheet=adminSheet(name)!;
 if(sheet.readOnly)return structuredClone(sheet.rows);
 try { const saved=JSON.parse(localStorage.getItem(KEY)||'{}')[name];if(Array.isArray(saved)&&saved.every((r:any)=>typeof r.id==='string'&&Array.isArray(r.values)&&r.values.length===sheet.headers.length&&r.values.every((v:any)=>typeof v==='string')))return saved; }catch{}
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
