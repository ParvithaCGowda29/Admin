import {useEffect,useMemo,useRef,useState} from 'react';
import {Command} from 'cmdk';
import type {RecordRow} from './provider';
import {IconSearch} from './icons';
import {ADMIN_SHEETS} from './admin';
import {loadRows} from './provider';

type SheetMeta={name:string;headers:string[]};

type Props={active:string;sheet:SheetMeta;rows:RecordRow[];query:string;onQuery:(q:string)=>void;globalOpen:boolean;onGlobalClose:()=>void;onJump:(section:string,title:string)=>void};

const matchesRow=(row:RecordRow,words:string[])=>words.every(w=>row.values.some(v=>v.toLowerCase().includes(w)));

// cmdk search panel anchored to the toolbar search field: chips, browse-by-field and grouped
// matches drive the existing table filter; the grid stays visible behind the panel.
export function SearchCommand({active,sheet,rows,query,onQuery,globalOpen,onGlobalClose,onJump}:Props){
 const[open,setOpen]=useState(false);
 const[field,setField]=useState<number|null>(null);
 const wrap=useRef<HTMLDivElement>(null);
 useEffect(()=>{const onDoc=(e:MouseEvent)=>{if(wrap.current&&!wrap.current.contains(e.target as Node)){setOpen(false);setField(null)}};document.addEventListener('mousedown',onDoc);return()=>document.removeEventListener('mousedown',onDoc)},[]);
 useEffect(()=>{setField(null);setOpen(false)},[active]);
 const headers=sheet.headers;
 const displayIdx=headers.length>1?1:0;
 // Categorical columns (2..12 distinct values) power the chips and browse-by-field groups.
 const categorical=useMemo(()=>{
  const out:{i:number;label:string;values:string[]}[]=[];
  for(let i=1;i<headers.length;i++){
   const seen=new Map<string,number>();
   for(const r of rows){const v=(r.values[i]||'').trim();if(v)seen.set(v,(seen.get(v)||0)+1)}
   if(seen.size>=2&&seen.size<=12)out.push({i,label:headers[i],values:[...seen.entries()].sort((a,b)=>b[1]-a[1]).map(([v])=>v)});
  }
  return out.slice(0,4);
 },[rows,headers]);
 const suggestions=useMemo(()=>{
  const vals:string[]=[];
  for(const c of categorical)for(const v of c.values){if(!vals.includes(v))vals.push(v);if(vals.length>=4)return vals}
  // Tabs without a few-valued column (Skills): fall back to real cell values, name column first, short values first.
  const order=[displayIdx,...headers.map((_,i)=>i).filter(i=>i!==displayIdx)];
  for(const maxLen of [60,Infinity])for(const i of order)for(const r of rows){const v=(r.values[i]||'').trim();if(v&&v.length<=maxLen&&!vals.includes(v)){vals.push(v);if(vals.length>=4)return vals}}
  return vals;
 },[categorical,rows,headers,displayIdx]);
 const history=useMemo(()=>{if(!open)return[];try{return (JSON.parse(localStorage.getItem('bullm-search-history-v1')||'{}')[active]||[]) as string[]}catch{return[]}},[active,open]);
 const words=query.trim().toLowerCase().split(/\s+/).filter(Boolean);
 const matches=useMemo(()=>words.length?rows.filter(r=>matchesRow(r,words)).slice(0,8):[],[rows,query,words.length]);
 const pick=(value:string)=>{onQuery(value);setOpen(false);setField(null)};
 // Global palette (opened with Ctrl+K): search every section, jump straight to the row.
 const[gQuery,setGQuery]=useState('');
 useEffect(()=>{if(globalOpen)setGQuery('')},[globalOpen]);
 const gResults=useMemo(()=>{
  if(!globalOpen)return[] as {section:string;title:string;meta:string;isSection:boolean}[];
  const ws=gQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if(!ws.length)return[] as {section:string;title:string;meta:string;isSection:boolean}[];
  const out:{section:string;title:string;meta:string;isSection:boolean}[]=[];
  for(const s of ADMIN_SHEETS){
   if(ws.every((w:string)=>s.name.toLowerCase().includes(w)))out.push({section:s.name,title:s.name,meta:'Go to section',isSection:true});
   for(const r of loadRows(s.name)){
    if(out.length>=12)break;
    if(matchesRow(r,ws)){
     const title=(r.values[1]||r.values[0]||r.id).trim();
     out.push({section:s.name,title,meta:(r.values[0]||'').trim(),isSection:false});
    }
   }
   if(out.length>=12)break;
  }
  return out;
 },[globalOpen,gQuery]);
 const gSections=useMemo(()=>[...new Set(gResults.map(r=>r.section))],[gResults]);
 const globalPalette=globalOpen&&<div className="global-overlay" onMouseDown={onGlobalClose}>
  <div className="global-palette" onMouseDown={e=>e.stopPropagation()}>
   <Command shouldFilter={false} label="Search all Admin sections">
    <Command.Input autoFocus value={gQuery} onValueChange={setGQuery} onKeyDown={e=>{if(e.key==='Escape')onGlobalClose()}} placeholder="Search every section - settings, users, models..." aria-label="Search all sections"/>
    <Command.List className="global-list">
     {gQuery.trim()!==''&&gResults.length===0&&<div className="global-empty">No matches in any section - try different words.</div>}
     {gSections.map(sec=><Command.Group key={sec} heading={sec}>{gResults.filter(r=>r.section===sec).map(r=><Command.Item key={sec+':'+r.title} value={sec+':'+r.title} className="global-item" onSelect={()=>{onJump(r.section,r.isSection?'':r.title);onGlobalClose()}}><span className="search-item-title">{r.title}</span><small>{r.meta}</small></Command.Item>)}</Command.Group>)}
    </Command.List>
    <div className="global-foot">↑ ↓ Navigate · Enter Jump to row · Esc Close</div>
   </Command>
  </div>
 </div>;
 return <>
 <div className="search-cmd" ref={wrap}>
  <Command shouldFilter={false} label={`Search ${active}`}>
   <div className="search-input-row">
    <span className="search-icon" aria-hidden="true"><IconSearch size={15}/></span>
    <Command.Input value={query} onValueChange={v=>{onQuery(v);setOpen(true)}} onFocus={()=>setOpen(true)} onKeyDown={e=>{if(e.key==='Escape'){setOpen(false);setField(null)}}} placeholder={`Search ${active}...`} aria-label={`Search ${active}`}/>
    {query&&<button type="button" className="search-clear" aria-label="Clear search" onMouseDown={e=>e.preventDefault()} onClick={()=>onQuery('')}>×</button>}
   </div>
   {open&&<Command.List className="search-panel">
    {words.length===0?<>
     {history.length>0&&<Command.Group heading="Recent searches">{history.slice(0,4).map(h=><Command.Item key={`h-${h}`} value={`h:${h}`} onSelect={()=>pick(h)}><span className="search-item-title">{h}</span></Command.Item>)}</Command.Group>}
     {suggestions.length>0&&<Command.Group heading="Suggested searches"><div className="search-chips">{suggestions.map(s=><button type="button" key={s} className="search-chip" title={s} onMouseDown={e=>e.preventDefault()} onClick={()=>pick(s)}>{s}</button>)}</div></Command.Group>}
     {categorical.length>0&&<Command.Group heading="Browse by field">{field===null
      ?categorical.map(c=><Command.Item key={c.label} value={`f:${c.label}`} onSelect={()=>setField(c.i)}><span className="search-item-title">{c.label}</span><span className="search-item-hint" aria-hidden>→</span></Command.Item>)
      :categorical.filter(c=>c.i===field).map(c=><div key={c.label}>{c.values.slice(0,8).map(v=><Command.Item key={v} value={`fv:${v}`} onSelect={()=>pick(v)}><span className="search-item-title">{v}</span><small>{c.label}</small></Command.Item>)}</div>)}</Command.Group>}
     {history.length===0&&suggestions.length===0&&categorical.length===0&&<div className="search-empty">Type to search {active}</div>}
    </>:<>
     {matches.length>0
      ?<Command.Group heading={`${active} · ${matches.length} match${matches.length===1?'':'es'}`}>{matches.map(r=>{const title=(r.values[displayIdx]||r.values[0]||r.id).trim();const meta=[r.values[0],...r.values.slice(displayIdx+1,displayIdx+3)].filter(v=>v&&v.trim()).join(' · ');return <Command.Item key={r.id} value={r.id} onSelect={()=>pick(title)}><span className="search-avatar" aria-hidden>{(title[0]||'?').toUpperCase()}</span><span className="search-item-main"><span className="search-item-title">{title}</span><small>{meta}</small></span><span className="search-item-hint" aria-hidden>↵</span></Command.Item>})}</Command.Group>
      :<div className="search-empty">No matching rows - try different words, or clear the search to see everything.</div>}
     {matches.length>0&&<div className="search-note">Enter or click a result to reveal its table row</div>}
    </>}
    <div className="search-footer">↑ ↓ Navigate · Enter Select · Esc Close</div>
   </Command.List>}
  </Command>
 </div>
 {globalPalette}
 </>
}
