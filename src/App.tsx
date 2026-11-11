import {useMemo,useRef,useState,useEffect,type MouseEvent as ReactMouseEvent} from 'react';
import {useList,useUpdate,useDelete} from '@refinedev/core';
import {AgGridReact} from 'ag-grid-react';
import Fuse from 'fuse.js';
import {AllCommunityModule,ModuleRegistry,themeQuartz,type ColDef,type CellValueChangedEvent,type ICellRendererParams} from 'ag-grid-community';
import {loadRows,saveRows,logActivity,loadActivity,type RecordRow} from './provider';
import {newId} from './id';
import {SearchCommand} from './SearchCommand';
// Demo role switcher (doc Q1: "hide, don't tease"). Frontend-only: no sign-in, no real
// security - the Control Room doc puts real authentication and per-action role checks on the
// backend. Viewer is read-only; Admin and FDE both edit (the doc names no split between them).
type Role='Admin'|'FDE'|'Viewer';
import bullmLogoLight from './assets/bullm-logo-light.png';
import bullmLogoDark from './assets/bullm-logo-dark.png';
import {StackedHighlight,type Hits} from './cells';
import {SortFilter} from './SortFilter';
import {ADMIN_SHEETS,ACTIVITY_SHEET,adminSheet,userDetail} from './admin';
ModuleRegistry.registerModules([AllCommunityModule]);
// Section names live in the URL hash, so every screen has a stable, shareable link.
function sectionFromHash():string{
 let name='';
 try{name=decodeURIComponent(window.location.hash.replace(/^#/,''))}catch{}
 return ADMIN_SHEETS.concat([ACTIVITY_SHEET]).some(s=>s.name===name)?name:ADMIN_SHEETS[0].name;
}
// Activity log helpers: local timestamp like the other masters' dd-mm-yyyy dates.
function stamp():string{
 const t=new Date();const p=(n:number)=>String(n).padStart(2,'0');
 return `${p(t.getDate())}-${p(t.getMonth()+1)}-${t.getFullYear()} ${p(t.getHours())}:${p(t.getMinutes())}`;
}
const clip=(t:string)=>t.length>140?t.slice(0,137)+'...':t;
// Same AG Grid Quartz parameters as the BuLLM Masters web.
const lightTheme=themeQuartz.withParams({accentColor:'#F2F9FD',backgroundColor:'#ffffff',headerBackgroundColor:'#F5F8FD',borderColor:'#DCE3EE',selectedRowBackgroundColor:'rgba(0,108,153,.10)',rowHoverColor:'rgba(15,27,45,.04)',fontFamily:'Inter, Arial, sans-serif',fontSize:14,headerFontSize:16,rowVerticalPaddingScale:1.2});
const darkTheme=themeQuartz.withParams({accentColor:'#5B83F2',backgroundColor:'#101E32',foregroundColor:'#E6EDF7',headerBackgroundColor:'#142540',borderColor:'#22395C',selectedRowBackgroundColor:'rgba(91,131,242,.16)',rowHoverColor:'rgba(91,131,242,.07)',fontFamily:'Inter, Arial, sans-serif',fontSize:14,headerFontSize:16,rowVerticalPaddingScale:1.2});
// Admin Status cells render as pills: positive states green, everything else neutral.
const STATUS_ON=/^(active|on|connected|enabled|paid|current)$/i;
const STATUS_WARN=/^paused$/i;
const STATUS_INFO=/^scheduled$/i;
function StatusChip({value}:{value?:string}){const v=(value||'').trim();if(!v)return null;const tone=STATUS_ON.test(v)?'on':STATUS_WARN.test(v)?'warn':STATUS_INFO.test(v)?'info':'off';return <span className={'status-chip '+tone}>{v}</span>}
// Hover (i) beside a nav entry: the section summary plus its field guide.
function AdminInfo({name,summary}:{name:string;summary:string}){
 const[open,setOpen]=useState(false);const closeTimer=useRef<ReturnType<typeof setTimeout>>();
 function show(){clearTimeout(closeTimer.current);setOpen(true)}
 function hide(){closeTimer.current=setTimeout(()=>setOpen(false),180)}
 const sheet=adminSheet(name);
 return <span className="master-info" onMouseEnter={show} onMouseLeave={hide} onFocus={()=>setOpen(true)} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setOpen(false)}} onKeyDown={e=>{if(e.key==='Escape'){setOpen(false);e.stopPropagation()}}}>
 <button className="info" aria-label={`Information about ${name}`} aria-expanded={open} onClick={e=>{e.stopPropagation();setOpen(!open)}}>i</button>
 {open&&<span className="master-info-panel" role="region" aria-label={`${name} information`} tabIndex={0}>
 <strong>{name}</strong><span>{summary}</span>
 {sheet&&<span className="field-guide"><b>Field guide</b>{sheet.headers.map((h,i)=><span key={h} className="field-row"><b>{h}</b><span>{sheet.descriptions[i]||''}</span></span>)}</span>}
 </span>}
 </span>;
}
// Step 9 (doc Q6): per-user detail panel. Read-only in this demo: it shows the effective
// skills, models, limits and guardrails a user inherits from their role, with per-user
// exceptions badged as overrides. Rate limits (throughput) and budgets (spend) are separate
// knobs, per the doc. Nothing here is enforced by a backend.
const USER_TABS=['Profile','Skills','Models','Limits','Guardrails','Activity'];
function UserDrawer({row,tab,onTab,onClose}:{row:RecordRow;tab:string;onTab:(t:string)=>void;onClose:()=>void}){
 const sheet=adminSheet('User Management')!;
 const d=userDetail(row);
 const acts=loadActivity().filter(a=>a.values[1]==='User Management'&&a.values[3]===row.values[0]);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose()};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[]);
 return <div className="drawer-overlay" onMouseDown={onClose}><aside className="user-drawer" role="dialog" aria-label={`Details for ${row.values[1]||row.values[0]}`} onMouseDown={e=>e.stopPropagation()}>
 <div className="drawer-head"><div><h2>{row.values[1]||row.values[0]}</h2><p>{row.values[0]} · {row.values[3]} · inherits {d.inherits} role defaults</p></div><button onClick={onClose} aria-label="Close details">×</button></div>
 <div className="drawer-tabs" role="tablist">{USER_TABS.map(t=><button key={t} role="tab" aria-selected={tab===t} className={tab===t?'active':''} onClick={()=>onTab(t)}>{t}</button>)}</div>
 <div className="drawer-body">
 {tab==='Profile'&&<dl className="profile-list">{sheet.headers.map((h,i)=><div key={h}><dt>{h}</dt><dd>{row.values[i]||'(empty)'}</dd></div>)}</dl>}
 {tab==='Skills'&&d.skills.map(sk=><div className="drawer-card" key={sk.name}><b>{sk.name}{sk.override&&<span className="override-badge">override</span>}</b><span>{sk.subs.join(' · ')}</span></div>)}
 {tab==='Models'&&<><div className="drawer-card"><b>Model access (grid summary)</b><span>{row.values[7]||'(empty)'} - edit this in the table</span></div><h3>Allowlist inherited from {d.inherits} role</h3>{d.models.map(m=><div className="drawer-card" key={m.name}><b>{m.name}{m.override&&<span className="override-badge">override</span>}</b></div>)}<p className="drawer-note">The grid cell is the summary; the list above is the role default it summarizes. Production enforcement lives on this role's Bifrost virtual key at the gateway; both are demo data.</p></>}
 {tab==='Limits'&&<><h3>Rate limits (throughput)</h3>{d.rateLimits.map(l=><div className="drawer-card" key={l.label}><b>{l.label}{l.override&&<span className="override-badge">override</span>}</b><span>{l.value}</span></div>)}<h3>Budgets (spend)</h3>{d.budgets.map(l=><div className="drawer-card" key={l.label}><b>{l.label}</b><span>{l.value}</span></div>)}</>}
 {tab==='Guardrails'&&d.guardrails.map(g=><div className="drawer-card" key={g.layer}><b>{g.layer}</b><span>{g.items.join(' · ')}</span></div>)}
 {tab==='Activity'&&(acts.length?acts.slice(0,20).map(a=><div className="drawer-card" key={a.id}><b>{a.values[2]} · {a.values[4]}</b><span>{a.values[0]} · {a.values[5]} {'→'} {a.values[6]}</span></div>):<p className="drawer-note">No changes recorded for this user yet. Edits made in User Management appear here.</p>)}
 </div>
 <div className="drawer-foot">Demo data · inherits {d.inherits} role defaults · not enforced by any backend</div>
 </aside></div>;
}
export default function App(){
 const[dark,setDark]=useState(()=>{try{const q=new URLSearchParams(location.search).get('theme');if(q)return q==='dark';return localStorage.getItem('bullm-admin-theme')==='dark'}catch{return false}});
 useEffect(()=>{document.documentElement.dataset.theme=dark?'dark':'light';try{localStorage.setItem('bullm-admin-theme',dark?'dark':'light')}catch{}return()=>{delete document.documentElement.dataset.theme}},[dark]);
 const[role,setRole]=useState<Role>(()=>{try{const r=localStorage.getItem('bullm-admin-role-v1');return r==='Admin'||r==='Viewer'?r:'FDE'}catch{return 'FDE'}});
 useEffect(()=>{try{localStorage.setItem('bullm-admin-role-v1',role)}catch{}},[role]);
 const canEdit=role!=='Viewer';
 const[active,setActive]=useState<string>(sectionFromHash);const[query,setQuery]=useState('');const[,setHistory]=useState<Record<string,string[]>>(()=>{try{return JSON.parse(localStorage.getItem('bullm-admin-search-history-v1')||'{}')}catch{return {}}});const[notice,setNotice]=useState('');const[error,setError]=useState(false);const[localRevision,setLocalRevision]=useState(0);const[mobile,setMobile]=useState(false);const[menuCount,setMenuCount]=useState(1);const[menu,setMenu]=useState<{x:number;y:number;row?:RecordRow;header?:boolean}|null>(null);const[selectedCount,setSelectedCount]=useState(0);const[globalOpen,setGlobalOpen]=useState(false);const[pending,setPending]=useState<Map<string,{id:string;before:string[];after:string[]}>>(new Map());const[preview,setPreview]=useState<{row:string;col:string;oldV:string;newV:string}[]|null>(null);const[undoInfo,setUndoInfo]=useState<{items:{row:RecordRow;index:number}[]}|null>(null);const undoTimer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
 const[detail,setDetail]=useState<{row:RecordRow;tab:string}|null>(null);
 const sheet=adminSheet(active);const grid=useRef<AgGridReact<RecordRow>>(null);
function goto(name:string){
 if(name!==active&&pending.size>0){
  if(!window.confirm(`You have ${pending.size} unsaved change${pending.size>1?'s':''} in ${active}. Leave without saving?`))return;
  setPending(new Map());
 }
 setActive(name);window.location.hash=encodeURIComponent(name);
}
useEffect(()=>{
 const onHash=()=>{
  const next=sectionFromHash();
  if(next!==active&&pending.size>0){
   if(!window.confirm(`You have ${pending.size} unsaved change${pending.size>1?'s':''} in ${active}. Leave without saving?`)){window.location.hash=encodeURIComponent(active);return}
   setPending(new Map());
  }
  setActive(next);
 };
 window.addEventListener('hashchange',onHash);
 return ()=>window.removeEventListener('hashchange',onHash);
},[active,pending]);
// Ctrl+K / Cmd+K toggles the global search-all palette.
useEffect(()=>{
 const onKey=(e:KeyboardEvent)=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setGlobalOpen(o=>!o)}};
 window.addEventListener('keydown',onKey);
 return ()=>window.removeEventListener('keydown',onKey);
},[]);
// Jump from the global palette: switch section, then seed its search so the row is revealed.
function jumpTo(section:string,title:string){
 if(section===active){setQuery(title);return}
 goto(section);
 window.setTimeout(()=>setQuery(title),0);
}
 const {data,refetch}=useList<RecordRow>({resource:sheet?.name||ADMIN_SHEETS[0].name,pagination:{mode:'off'},queryOptions:{queryKey:['admin',active,localRevision]}});
 const {mutateAsync:update}=useUpdate();const{mutateAsync:remove}=useDelete();
 const rows=data?.data||[];
 // Snapshot of last-saved values per row: the grid edits row objects in place, so pending
 // changes are diffed against this copy (old vs new) before anything is saved.
 const savedById=useMemo(()=>new Map<string,string[]>((data?.data||[]).map((r:RecordRow)=>[r.id,[...r.values]])),[data?.data]);const searchTerm=query.trim();const minLen=Math.min(searchTerm.length,3);
 // Header status (doc Q1: status lives where the work lives): Model Switching shows the
 // default model as a chip; Observability shows enabled/paused signal counts.
 const headerStatus=useMemo(()=>{
  if(!sheet)return null;
  const statusIdx=sheet.headers.indexOf('Status');
  if(active==='Model Switching'){
   const defIdx=sheet.headers.indexOf('Default');
   const cur=rows.find((r:RecordRow)=>(r.values[defIdx]||'').trim().toLowerCase()==='yes');
   return cur?{label:'Active model',value:cur.values[1],tone:'on'}:null;
  }
  if(active==='Observability'&&statusIdx>=0){
   const on=rows.filter((r:RecordRow)=>STATUS_ON.test((r.values[statusIdx]||'').trim())).length;
   const paused=rows.filter((r:RecordRow)=>STATUS_WARN.test((r.values[statusIdx]||'').trim())).length;
   return {label:'Signals',value:`${on} enabled · ${paused} paused`,tone:paused?'warn':'on'};
  }
  return null;
 },[active,sheet,rows]);
 const fields=useMemo(()=>[...(sheet?.headers||[]).map((_,i)=>({name:String(i),getFn:(r:RecordRow)=>r.values[i]}))],[data?.data]);
 const fuse=useMemo(()=>new Fuse(data?.data||[],{threshold:0.2,ignoreLocation:true,includeMatches:true,includeScore:true,keys:fields}),[fields]);
 // Same search behavior as Masters: plain per-word contains first, tight Fuse typo matches second.
 const results=useMemo(()=>{if(!searchTerm)return null;const words=searchTerm.toLowerCase().split(/\s+/);const fuzzy=new Map(fuse.search(searchTerm).filter(r=>(r.score??1)<=0.2).map(r=>[r.item.id,r.matches||[]]));const out:{item:RecordRow;hits:Map<string,[number,number][]>}[]=[];
  for(const item of rows){const exact=new Map<string,[number,number][]>();const every=words.every(w=>{let found=false;for(const f of fields){const v=f.getFn(item).toLowerCase();for(let at=v.indexOf(w);at>=0;at=v.indexOf(w,at+1)){found=true;exact.set(f.name,[...(exact.get(f.name)||[]),[at,at+w.length-1]])}}return found});
   if(every)out.push({item,hits:exact});else if(fuzzy.has(item.id))out.push({item,hits:new Map(fuzzy.get(item.id)!.map(m=>[m.key||'',m.indices.filter(([start,end])=>end-start+1>=minLen)]))})}
  return out},[fuse,fields,rows,searchTerm,minLen]);const searched=useMemo(()=>results?results.map(r=>r.item):rows,[results,rows]);const filtered=searched;
 // Empty states that teach (doc Q1): say what the section controls and what the first
 // action does, instead of a blank pane. Two cases: no rows at all vs. search filtered all out.
 const noRowsText=rows.length
  ?`No matching ${sheet?.noun||'rows'} - try different words, or clear the search to see everything.`
  :`No ${sheet?.noun||'rows'} yet. ${sheet?.summary||''}${sheet?.readOnly?' Make a change in any other section and it appears here.':canEdit?` Right-click the table and choose "Add row" to create the first one.`:' Switch to the Admin or FDE demo role to add the first one.'}`;
 const hits=useRef<Hits>(new Map());hits.current=new Map((results||[]).filter(r=>[...r.hits.values()].some(v=>v.length)).map(r=>[r.item.id,r.hits]));useEffect(()=>{grid.current?.api?.redrawRows()},[results]);
 const message=(text:string,bad=false)=>{setNotice(text);setError(bad)};
 const counts=Object.fromEntries([...ADMIN_SHEETS,ACTIVITY_SHEET].map(s=>[s.name,loadRows(s.name).length]));
 const menuRows=Math.min(100,Math.max(1,Math.floor(menuCount)||1));
 const columns=useMemo<ColDef<RecordRow>[]>(()=>{if(!sheet)return [];const col=(colId:string,headerName:string,i:number,get:(v:string)=>string,set:(v:string,next:string)=>string,minWidth:number,width:number,pinned?:'left'):ColDef<RecordRow>=>({colId,headerName,headerTooltip:sheet.descriptions[i],valueGetter:p=>get(p.data?.values[i]||''),valueSetter:p=>{if(!p.data)return false;p.data.values[i]=set(p.data.values[i]||'',String(p.newValue??''));return true},editable:canEdit&&!sheet.readOnly,cellEditor:'agLargeTextCellEditor',cellEditorPopup:true,cellEditorParams:{maxLength:50000,rows:8,cols:45},minWidth,width,pinned,wrapText:true,autoHeight:true,tooltipValueGetter:p=>get(p.data?.values[i]||''),sortable:false,filter:SortFilter,resizable:true,cellRenderer:StackedHighlight,cellRendererParams:{hlKey:colId}});const same=(v:string)=>v,replace=(_:string,next:string)=>next;
  // Admin tables hold 7 columns and fit the content width without horizontal scrolling.
  const defs=sheet.headers.flatMap((h,i)=>i===0?[col('0',h,0,same,replace,200,220,'left')]:[col(String(i),h,i,same,replace,120,175)]);
  if(active==='User Management'&&defs[0])defs[0].cellRenderer=(p:ICellRendererParams<RecordRow,string>&{hlKey:string})=><span className="user-id-cell"><button type="button" className="user-open" title="Open detail panel" aria-label={`Open details for ${p.data?.values?.[1]||p.value||'this user'}`} onClick={e=>{e.stopPropagation();if(p.data)setDetail({row:{id:p.data.id,values:[...p.data.values]},tab:'Profile'})}}>▸</button><StackedHighlight {...p}/></span>;
  for(const def of defs){if(def.headerName==='Status'){def.cellRenderer=StatusChip;def.cellRendererParams={};}}
  return defs},[active,canEdit]);
 useEffect(()=>{setQuery('');setNotice('');setSelectedCount(0);setMobile(false);setMenu(null);setPending(new Map());setUndoInfo(null);setDetail(null);void refetch()},[active]);
 // Switching to Viewer drops unsaved edits, open menus and the undo offer so no edit state lingers.
 useEffect(()=>{if(!canEdit){setPending(new Map());setPreview(null);setMenu(null);setSelectedCount(0);setUndoInfo(null);grid.current?.api?.stopEditing();void refetch();setLocalRevision(v=>v+1)}},[role]);
 useEffect(()=>{const term=query.trim();if(!term)return;const timer=setTimeout(()=>{setHistory(current=>{const next={...current,[active]:[term,...(current[active]||[]).filter(v=>v!==term)].slice(0,12)};try{localStorage.setItem('bullm-admin-search-history-v1',JSON.stringify(next))}catch{}return next})},800);return()=>clearTimeout(timer)},[query,active]);
 useEffect(()=>{if(!menu)return;const close=()=>setMenu(null);const key=(e:KeyboardEvent)=>{if(e.key==='Escape')close()};window.addEventListener('click',close);window.addEventListener('keydown',key);window.addEventListener('resize',close);return()=>{window.removeEventListener('click',close);window.removeEventListener('keydown',key);window.removeEventListener('resize',close)}},[menu]);
 function changed(e:CellValueChangedEvent<RecordRow>){
 if(!canEdit||!e.data)return;
 const row=e.data;
 setPending(cur=>{
  const next=new Map(cur);
  const before=next.get(row.id)?.before||savedById.get(row.id)||row.values.map(()=> '');
  const same=before.length===row.values.length&&before.every((v:string,i:number)=>v===row.values[i]);
  if(same)next.delete(row.id);else next.set(row.id,{id:row.id,before,after:[...row.values]});
  return next;
 });
}
// Save flow (doc Q1: changes are explicit): the Save bar opens an old-vs-new preview first.
function diffs():{row:string;col:string;oldV:string;newV:string}[]{
 const out:{row:string;col:string;oldV:string;newV:string}[]=[];
 if(!sheet)return out;
 for(const p of pending.values()){
  for(let i=0;i<sheet.headers.length;i++){
   const o=p.before[i]||'',n=p.after[i]||'';
   if(o!==n)out.push({row:p.before[0]||p.id,col:sheet.headers[i],oldV:o,newV:n});
  }
 }
 return out;
}
function askSave(){if(!canEdit)return;const d=diffs();if(d.length)setPreview(d);else setPending(new Map());}
async function confirmSave(){if(!canEdit)return;
 const entries=[...pending.values()];
 const d=diffs();
 setPreview(null);
 try{
  for(const p of entries){await update({resource:active,id:p.id,values:{id:p.id,values:p.after}})}
  logActivity(d.map(x=>({id:newId(),values:[stamp(),active,'Edit',x.row,x.col,x.oldV,x.newV]})));
  setPending(new Map());
  message(`${entries.length} row${entries.length>1?'s':''} saved on this device.`);
  await refetch();setLocalRevision(v=>v+1);
 }catch(err){message(String(err),true)}
}
function discardAll(){
 setPending(new Map());
 message('Unsaved changes discarded.');
 void refetch();setLocalRevision(v=>v+1);
}
// Delete undo window: keep the removed rows for a few seconds and offer Undo in the toast.
function armUndo(gone:{row:RecordRow;index:number}[]){
 clearTimeout(undoTimer.current);
 setUndoInfo({items:gone});
 undoTimer.current=setTimeout(()=>setUndoInfo(null),8000);
}
async function doUndo(){if(!canEdit)return;
 if(!undoInfo)return;
 const items=[...undoInfo.items].sort((a,b)=>a.index-b.index);
 clearTimeout(undoTimer.current);setUndoInfo(null);
 try{
  const cur=loadRows(active);
  for(const it of items)cur.splice(Math.min(it.index,cur.length),0,it.row);
  saveRows(active,cur);
  logActivity(items.map(it=>({id:newId(),values:[stamp(),active,'Undo delete',it.row.values[0]||it.row.id,'(row)','(deleted)',clip(it.row.values.join(' · '))]})));
  await refetch();setLocalRevision(v=>v+1);
  message('Delete undone.');
 }catch(err){message(String(err),true)}
}
 async function add(n:number){if(!canEdit||!sheet||sheet.readOnly)return;setMenu(null);grid.current?.api?.stopEditing();const fresh=Array.from({length:n},()=>({id:newId(),values:sheet.headers.map(()=>'')}));try{saveRows(active,[...loadRows(active),...fresh]);logActivity([{id:newId(),values:[stamp(),active,'Add',`${n} new row${n>1?'s':''}`,'(row)','','(added)']}]);setQuery('');await refetch();setLocalRevision(v=>v+1);message(`${n} row${n>1?'s':''} added. Double-click a cell to fill it.`);setTimeout(()=>{const api=grid.current?.api;if(api){const first=api.getDisplayedRowCount()-n;api.ensureIndexVisible(first,'top');api.startEditingCell({rowIndex:first,colKey:'0'})}},100)}catch(err){message(String(err),true)}}
 async function deleteRow(row:RecordRow){setMenu(null);if(!canEdit||!sheet||sheet.readOnly)return;if(!confirm(`Delete "${row.values[0].trim()||'this row'}" from ${active}?`))return;try{const saved=savedById.get(row.id);const idx=loadRows(active).findIndex((r:RecordRow)=>r.id===row.id);await remove({resource:active,id:row.id});logActivity([{id:newId(),values:[stamp(),active,'Delete',(saved||row.values)[0]||row.id,'(row)',clip((saved||row.values).join(' · ')),'(deleted)']}]);setPending(cur=>{const next=new Map(cur);next.delete(row.id);return next});await refetch();setLocalRevision(v=>v+1);armUndo([{row:{id:row.id,values:saved?[...saved]:[...row.values]},index:idx<0?Number.MAX_SAFE_INTEGER:idx}]);message('Row deleted.')}catch(err){message(String(err),true)}}
 async function deleteSelected(){if(!canEdit||!sheet||sheet.readOnly)return;const ids=new Set((grid.current?.api.getSelectedRows()||[]).map((r:RecordRow)=>r.id));if(!ids.size||!confirm(`Delete ${ids.size} row${ids.size>1?'s':''}?`))return;try{const savedRows=loadRows(active);const gone=savedRows.map((r:RecordRow,index:number)=>({row:r,index})).filter(it=>ids.has(it.row.id));saveRows(active,savedRows.filter((r:RecordRow)=>!ids.has(r.id)));logActivity(gone.map(it=>({id:newId(),values:[stamp(),active,'Delete',it.row.values[0]||it.row.id,'(row)',clip(it.row.values.join(' · ')),'(deleted)']})));setPending(cur=>{const next=new Map(cur);for(const id of ids)next.delete(id);return next});await refetch();setLocalRevision(v=>v+1);setSelectedCount(0);armUndo(gone);message(`${ids.size} row${ids.size>1?'s':''} deleted.`)}catch(err){message(String(err),true)}}
 function contextMenu(e:ReactMouseEvent){if(!canEdit)return;const target=e.target as HTMLElement;const rowId=target.closest('.ag-row')?.getAttribute('row-id');const onHeader=!!target.closest('.ag-header-cell');if(!rowId&&!onHeader&&!target.closest('.ag-root'))return;e.preventDefault();setMenuCount(1);setMenu({x:Math.min(e.clientX,window.innerWidth-230),y:Math.min(e.clientY,window.innerHeight-140),row:rowId?rows.find((r:RecordRow)=>r.id===rowId):undefined,header:onHeader&&!rowId})}
 return <div className="app"><aside className={mobile?'open':''}><a className="brand" href="#" onClick={e=>{e.preventDefault();goto(ADMIN_SHEETS[0].name)}} aria-label="BuLLM admin home"><img className="brand-logo" src={dark?bullmLogoDark:bullmLogoLight} alt=""/></a><div className="nav-label">WORKSPACE</div><nav className="nav-branches" aria-label="Admin sections">{[...ADMIN_SHEETS,ACTIVITY_SHEET].map(s=><div key={s.name} className={'nav-branch '+(active===s.name?'selected':'')}><button className="nav-item" aria-current={active===s.name?'page':undefined} onClick={()=>goto(s.name)}><span>{s.name}</span></button><AdminInfo name={s.name} summary={s.summary}/><small>{counts[s.name]}</small></div>)}</nav><div className="sidebar-foot"><div>FDE workspace</div></div></aside><main><header><div className="crumb"><button className="menu" onClick={()=>setMobile(!mobile)} aria-label="Toggle navigation">☰</button><div className="page-title"><div className="page-title-row"><h1>{`Admin · ${active}`}</h1>{headerStatus&&<span className={'header-status '+headerStatus.tone} title={headerStatus.label}><small>{headerStatus.label}</small>{headerStatus.value}</span>}</div><p>{sheet?.summary||'Workspace administration for the BuLLM web.'}</p></div></div><div className="header-right"><button className="global-search" onClick={()=>setGlobalOpen(true)} aria-label="Search all sections (Ctrl+K)">Search all <kbd>Ctrl K</kbd></button><button className="theme-toggle" title={dark?'Switch to light mode':'Switch to dark mode'} aria-label={dark?'Switch to light mode':'Switch to dark mode'} aria-pressed={dark} onClick={()=>setDark(!dark)}>{dark?<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/></svg>:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>}</button><label className="role-picker" title="Demo role switcher: changes what this browser shows. Not real sign-in - a production app checks roles on the server.">Role (demo)<select value={role} onChange={e=>{const next=e.target.value as Role;if(next==='Viewer'&&pending.size>0&&!window.confirm(`You have ${pending.size} unsaved change${pending.size>1?'s':''} in ${active}. Switching to Viewer discards them. Continue?`)){e.target.value=role;return}setRole(next)}} aria-label="Demo role"><option>Admin</option><option>FDE</option><option>Viewer</option></select></label><span className="status-dot"/>FDE workspace<div className="avatar" aria-hidden="true">F</div></div></header><section className="content">{sheet?<><div className="toolbar"><SearchCommand active={active} sheet={sheet} rows={rows} query={query} onQuery={setQuery} globalOpen={globalOpen} onGlobalClose={()=>setGlobalOpen(false)} onJump={jumpTo}/></div>{canEdit&&pending.size>0&&<div className="savebar" role="status"><span>{pending.size} unsaved change{pending.size>1?'s':''} in {active}</span><button className="primary" onClick={askSave}>Save</button><button onClick={discardAll}>Discard</button></div>}<div className="tools"><span>{filtered.length} of {rows.length} {sheet.noun}</span>{canEdit&&!sheet.readOnly&&selectedCount>0&&<button className="danger" onClick={deleteSelected}>Delete selected ({selectedCount})</button>}</div><div className="table-note"><span>{sheet.readOnly?'Read-only log · Updates automatically as you work':canEdit?'✎ Double-click to edit · Changes apply to the whole workspace':'Read-only in the Viewer role (demo)'}{active==='User Management'?' · Click ▸ by a User ID for the detail panel':''}</span><span>{sheet.headers.length} fixed columns</span></div><div className="grid" onContextMenu={contextMenu}><AgGridReact<RecordRow> key={active+'-'+role} ref={grid} theme={dark?darkTheme:lightTheme} rowData={filtered} columnDefs={columns} animateRows={false} getRowId={p=>p.data.id} onCellValueChanged={changed} context={hits} getRowClass={p=>p.data&&hits.current.has(p.data.id)?'search-hit':undefined} onSelectionChanged={e=>setSelectedCount(e.api.getSelectedRows().length)} rowSelection={canEdit&&!sheet.readOnly?{mode:'multiRow',enableClickSelection:false,selectAll:'filtered'}:undefined} selectionColumnDef={{pinned:'left',width:48,minWidth:48,maxWidth:48,resizable:false}} stopEditingWhenCellsLoseFocus rowHeight={64} headerHeight={46} tooltipShowDelay={300} defaultColDef={{suppressMovable:true}} overlayNoRowsTemplate={noRowsText}/></div>{menu&&<div className="pop-menu context-menu" role="menu" style={{left:menu.x,top:menu.y}} onClick={e=>e.stopPropagation()}>{canEdit&&!sheet.readOnly&&<div className="menu-add"><input type="number" min={1} max={100} aria-label="Rows to add" value={menuCount||''} onChange={e=>setMenuCount(e.target.valueAsNumber)} onKeyDown={e=>{if(e.key==='Enter')void add(menuRows)}}/><button role="menuitem" className="primary" onClick={()=>void add(menuRows)}>Add {menuRows>1?`${menuRows} rows`:'row'}</button></div>}{menu.row&&canEdit&&!sheet.readOnly&&<button role="menuitem" className="danger" onClick={()=>deleteRow(menu.row!)}>Delete row</button>}{menu.header&&<p>Fixed column. Can't be deleted.</p>}</div>}<div className="footer"><span>Hover a header for its description.</span><span>Saved in this browser only · No backend connected</span></div></>:null}{detail&&<UserDrawer row={detail.row} tab={detail.tab} onTab={t=>setDetail({...detail,tab:t})} onClose={()=>setDetail(null)}/>}{preview&&<div className="preview-overlay" onMouseDown={()=>setPreview(null)}><div className="preview-dialog" role="dialog" aria-label="Confirm changes" onMouseDown={e=>e.stopPropagation()}><h2>Apply {preview.length} change{preview.length>1?'s':''} to {active}?</h2><div className="preview-list">{preview.map((d,i)=><div className="preview-row" key={i}><b>{d.row}</b><span className="preview-col">{d.col}</span><span className="preview-old">{d.oldV||'(empty)'}</span><span className="preview-arrow">{'→'}</span><span className="preview-new">{d.newV||'(empty)'}</span></div>)}</div><div className="preview-actions"><button onClick={()=>setPreview(null)}>Cancel</button><button className="primary" onClick={()=>void confirmSave()}>Apply changes</button></div></div></div>}{notice&&<div role={error?'alert':'status'} className={'notice '+(error?'error':'')}>{notice}{undoInfo&&!error&&canEdit&&<button className="undo" onClick={()=>void doUndo()}>Undo</button>}<button onClick={()=>{setNotice('');setUndoInfo(null)}} aria-label="Dismiss notification">×</button></div>}</section></main></div>
}
