// BuLLM Admin: workspace administration tables in the same Refine.dev table style as the
// BuLLM Masters web. Six sections, one table each, matching the Admin tab of the Masters
// wireframes. Column sets follow the approved Masters build; rows are realistic mock data
// (no backend is connected, edits save in this browser only).
export type AdminRow={id:string;values:string[]};
export type AdminSheet={name:string;noun:string;summary:string;headers:string[];descriptions:string[];rows:AdminRow[];readOnly?:boolean};
export const ADMIN_SHEETS:AdminSheet[]=[
 {name:'System Settings',noun:'settings',summary:'Platform-wide configuration for the BuLLM web.',
  headers:['Setting ID','Setting','Value','Scope','Owner','Updated','Status'],
  descriptions:[
   'Unique identifier for the workspace setting.',
   'Name of the configuration option.',
   'Current value applied across the workspace.',
   'Where the setting applies: tenant, hosting, security, compliance or UI.',
   'Role responsible for the setting.',
   'Date the setting was last changed (dd-mm-yyyy).',
   'Whether the setting is active.'],
  rows:[
   {id:'seed-set-01',values:['SET-01','Instance name','BuLLM','Tenant','Admin','28-10-2026','Active']},
   {id:'seed-set-02',values:['SET-02','Environment','Production','Tenant','Admin','28-10-2026','Active']},
   {id:'seed-set-03',values:['SET-03','Region','ap-south-1 · Mumbai','Hosting','Admin','28-10-2026','Active']},
   {id:'seed-set-04',values:['SET-04','Timezone','Asia/Calcutta','Tenant','Admin','28-10-2026','Active']},
   {id:'seed-set-05',values:['SET-05','Session timeout','30 min','Security','Admin','28-10-2026','Active']},
   {id:'seed-set-06',values:['SET-06','Data residency','India','Compliance','Admin','28-10-2026','Active']},
   {id:'seed-set-07',values:['SET-07','Default theme','System','UI','Per user','28-10-2026','Active']},
   {id:'seed-set-08',values:['SET-08','Maintenance mode','Off','Tenant','Admin','28-10-2026','Off']}]},
 {name:'User Management',noun:'users',summary:'Who can sign in and what they can touch.',
  headers:['User ID','Name','Email','Role','Workspace','Last active','Status','Model access','Token usage'],
  descriptions:[
   'Unique identifier for the user.',
   'Full name of the user.',
   'Work email used to sign in.',
   'Workspace role, such as Admin or FDE.',
   'Workspace or team the user belongs to.',
   'When the user last signed in.',
   'Whether the user can sign in.',
   'Which models the user may call, inherited from their role unless overridden.',
   'Tokens used today against the rate limit inherited from their role.'],
  rows:[
   {id:'seed-usr-01',values:['USR-01','Parvitha C','parvitha.c@digibull.ai','Admin','BuLLM','04-11-2026','Active','All models','41.2k / 1.0M today']},
   {id:'seed-usr-02',values:['USR-02','Srinath R','srinath.r@digibull.ai','Admin','BuLLM','03-11-2026','Active','All models','12.8k / 1.0M today']},
   {id:'seed-usr-03',values:['USR-03','Likith','likith@digibull.ai','FDE','BuLLM','02-11-2026','Active','Standard + frontier','96.4k / 500k today']},
   {id:'seed-usr-04',values:['USR-04','Nagabhushana','nagabhushana@digibull.ai','FDE','BuLLM','01-11-2026','Active','Standard + frontier','22.1k / 500k today']},
   {id:'seed-usr-05',values:['USR-05','Sriniketh','sriniketh@digibull.ai','Viewer','BuLLM','28-10-2026','Invited','Small models only','1.3k / 50k today']}]},
 {name:'Model Switching',noun:'models',summary:'Which model serves which slot, routed through the Bifrost gateway.',
  headers:['Model ID','Model','Provider','Tier','Use case','Default','Status'],
  descriptions:[
   'Unique identifier for the model entry.',
   'Model name shown when switching.',
   'Provider serving the model.',
   'Cost or capability tier.',
   'Workflow the model is used for.',
   'Whether this is the default model.',
   'Whether the model is available.'],
  rows:[
   {id:'seed-mdl-01',values:['MDL-01','Claude Sonnet 4.5','Anthropic','Premium','Agentic workflows','Yes','Active']},
   {id:'seed-mdl-02',values:['MDL-02','GPT-4o','OpenAI','Premium','Document parsing','No','Active']},
   {id:'seed-mdl-03',values:['MDL-03','Gemini 2.5 Pro','Google','Standard','Extraction fallback','No','Active']},
   {id:'seed-mdl-04',values:['MDL-04','Whisper','OpenAI','Standard','Dictation','No','Active']},
   {id:'seed-mdl-05',values:['MDL-05','Llama 4 Maverick','Meta · self-hosted','Free','Offline testing','No','Disabled']}]},
 {name:'License & Payments',noun:'records',summary:'Plans, seats and renewals in one place.',
  headers:['License ID','Plan','Seats','Renewal','Amount','Billing contact','Status'],
  descriptions:[
   'Unique identifier for the license.',
   'Subscription plan name.',
   'Number of seats on the plan.',
   'Next renewal date (dd-mm-yyyy).',
   'Amount billed each cycle.',
   'Who receives billing emails.',
   'Whether the license is current.'],
  rows:[
   {id:'seed-lic-01',values:['LIC-01','Anthropic Team','5','01-12-2026','$125 / month','finance@digibull.ai','Paid']},
   {id:'seed-lic-02',values:['LIC-02','OpenAI Business','5','15-12-2026','$150 / month','finance@digibull.ai','Paid']},
   {id:'seed-lic-03',values:['LIC-03','GitHub Team','4','09-01-2027','$16 / month','finance@digibull.ai','Current']},
   {id:'seed-lic-04',values:['LIC-04','Vercel Pro','2','21-11-2026','$40 / month','finance@digibull.ai','Current']},
   {id:'seed-lic-05',values:['LIC-05','Figma Professional','3','05-03-2027','$45 / month','finance@digibull.ai','Current']}]},
 {name:'Tool Setup & Integrations',noun:'integrations',summary:'Turning Tool Factory entries into configured, checked integrations.',
  headers:['Integration ID','Tool','Category','Connection','Owner','Updated','Status'],
  descriptions:[
   'Unique identifier for the integration.',
   'Tool or service connected.',
   'Kind of tool, such as storage or AI.',
   'How the tool connects, such as API key or OAuth.',
   'Role responsible for the integration.',
   'Date the integration was last changed (dd-mm-yyyy).',
   'Whether the integration is connected.'],
  rows:[
   {id:'seed-int-01',values:['INT-01','Cognee','Knowledge graph','API key','Admin','02-11-2026','Connected']},
   {id:'seed-int-02',values:['INT-02','Bifrost','Model gateway','API key','Admin','02-11-2026','Connected']},
   {id:'seed-int-03',values:['INT-03','GitHub','Codebase','OAuth','Admin','27-10-2026','Connected']},
   {id:'seed-int-04',values:['INT-04','SharePoint','Storage','OAuth','Admin','28-10-2026','Not connected']},
   {id:'seed-int-05',values:['INT-05','Google Drive','Storage','OAuth','FDE','28-10-2026','Not connected']},
   {id:'seed-int-06',values:['INT-06','Onyx','Document search','Self-hosted','Admin','02-11-2026','Pending']}]},
 {name:'File Type & Standardization',noun:'file types',summary:'Accepted file types and the standards they must meet.',
  headers:['Type ID','File type','Extension','Standard','Ingestion','Owner','Status'],
  descriptions:[
   'Unique identifier for the file type.',
   'Name of the file type.',
   'File extension, such as .pdf.',
   'Standardization rule applied on upload.',
   'How the file type is ingested for RAG.',
   'Role responsible for the file type.',
   'Whether the file type is accepted.'],
  rows:[
   {id:'seed-ft-01',values:['FT-01','PDF document','.pdf','Text and tables preserved','Cognee RAG','FDE','Active']},
   {id:'seed-ft-02',values:['FT-02','Word document','.docx','Styles mapped to headings','Cognee RAG','FDE','Active']},
   {id:'seed-ft-03',values:['FT-03','Excel workbook','.xlsx','Sheets mapped to master tabs','Table parser','FDE','Active']},
   {id:'seed-ft-04',values:['FT-04','PowerPoint deck','.pptx','Slide text and speaker notes','Cognee RAG','FDE','Active']},
   {id:'seed-ft-05',values:['FT-05','Plain text','.txt','UTF-8 only','Cognee RAG','FDE','Active']},
   {id:'seed-ft-06',values:['FT-06','Image','.png','OCR for embedded text','Vision model','Admin','Active']},
   {id:'seed-ft-07',values:['FT-07','Zip archive','.zip','Expanded, then per-file rules','Archive handler','Admin','Active']}]},
 {name:'Observability',noun:'signals',summary:'Signals, alerts and retention for the BuLLM web platform.',
  headers:['ID','Signal','Configuration','Scope','Owner','Updated','Status'],
  descriptions:[
   'Unique identifier for the observability signal.',
   'Name of the signal or alert rule.',
   'How the signal is collected, or when the alert fires.',
   'Where the signal applies: platform-wide, all workspaces, the BuLLM web or the edge gateway.',
   'Person responsible for the signal.',
   'Date the signal configuration was last changed.',
   'Whether the signal is enabled or paused.'],
  rows:[
   {id:'seed-obs-01',values:['OBS-01','Distributed tracing','OpenTelemetry collector · OTLP export','Platform-wide','Srinath R','Nov 2, 2026','Enabled']},
   {id:'seed-obs-02',values:['OBS-02','Log retention','30 days hot · 13 months archive','Platform-wide','Nagabhushana','Oct 30, 2026','Enabled']},
   {id:'seed-obs-03',values:['OBS-03','Token usage tracking','Per model + per workspace','All workspaces','Likith','Nov 3, 2026','Enabled']},
   {id:'seed-obs-04',values:['OBS-04','Latency alerts','p95 > 2s pages on-call','BuLLM web','Srinath R','Oct 28, 2026','Enabled']},
   {id:'seed-obs-05',values:['OBS-05','Error rate alert','>1% over 5 min window','BuLLM web','Likith','Oct 27, 2026','Paused']},
   {id:'seed-obs-06',values:['OBS-06','Uptime monitoring','60s interval · Mumbai region','Edge / Gateway','Nagabhushana','Nov 1, 2026','Enabled']}]},
 {name:'Evals',noun:'suites',summary:'Evaluation suites and quality gates for BuLLM models and agents.',
  headers:['ID','Suite','Model / Dataset','Trigger','Score / Last Result','Owner','Updated','Status'],
  descriptions:[
   'Unique identifier for the eval suite.',
   'Name of the evaluation suite.',
   'Model or dataset the suite runs against.',
   'When the suite runs: nightly, weekly, or on deploy as a gate.',
   'Latest score or result from the last run.',
   'Person responsible for the suite.',
   'Date the suite configuration was last changed.',
   'Whether the suite is active, scheduled or paused.'],
  rows:[
   {id:'seed-eval-01',values:['EVAL-01','Regression suite','Sonnet 4.5 · 512 prompts','Nightly 02:00 IST','94.2% pass','Likith','Nov 4, 2026','Active']},
   {id:'seed-eval-02',values:['EVAL-02','Hallucination check','Groundedness dataset v3','On deploy','97.8% grounded','Parvitha C','Nov 3, 2026','Active']},
   {id:'seed-eval-03',values:['EVAL-03','Tool-call accuracy','214 cases · MCP tools','On deploy','91.6% pass','Srinath R','Nov 2, 2026','Scheduled']},
   {id:'seed-eval-04',values:['EVAL-04','Response quality','LLM-as-judge pairwise','Weekly · Mon','+6.3% vs baseline','Likith','Oct 31, 2026','Active']},
   {id:'seed-eval-05',values:['EVAL-05','PII leakage scan','PII corpus v2 · 1.1k probes','On deploy · gate','0 leaks · 100% block','Parvitha C','Nov 3, 2026','Active']},
   {id:'seed-eval-06',values:['EVAL-06','Latency benchmark','p50 + p95 targets','Nightly','p50 412ms · p95 1.8s','Nagabhushana','Nov 4, 2026','Paused']}]},
];
// Activity stays OUT of ADMIN_SHEETS on purpose: the browser-storage key in provider.ts is
// hashed from ADMIN_SHEETS, so adding a sheet there would orphan every saved row.
export const ACTIVITY_SHEET:AdminSheet={name:'Activity',noun:'events',summary:'Demo audit trail: every save, add, delete and undo made in this browser, newest first. Not a server-side audit log.',readOnly:true,
 headers:['Time','Section','Action','Record','Field','Old value','New value'],
 descriptions:[
  'When the change happened (dd-mm-yyyy hh:mm).',
  'Admin section the change was made in.',
  'What happened: Edit, Add, Delete or Undo delete.',
  'ID of the record that changed.',
  'Column that changed, or (row) for whole-row actions.',
  'Value before the change.',
  'Value after the change.'],
 rows:[]};
// Step 9 (doc Q6): User Management grows into "what each person can do, with which models, at
// what cost, under which rules". Role-first: roles define the defaults, users inherit, and a
// per-user exception is always visible as an override. Rate limits (throughput) and budgets
// (spend) are different knobs and are shown separately. DEMO DATA ONLY - nothing here is
// enforced; in production the allowlist and limits live on Bifrost virtual keys at the gateway.
export type UserSkill={name:string;subs:string[];override?:boolean};
export type UserModel={name:string;override?:boolean};
export type UserLimit={label:string;value:string;override?:boolean};
export type UserGuardrails={layer:string;items:string[]};
export type UserDetail={inherits:string;skills:UserSkill[];models:UserModel[];rateLimits:UserLimit[];budgets:UserLimit[];guardrails:UserGuardrails[]};
const ADMIN_DETAIL:Omit<UserDetail,'inherits'>={
 skills:[{name:'Chat',subs:['General Q&A','Summaries']},{name:'Document QA',subs:['Upload & parse','Citation answers']},{name:'Code Assistant',subs:['Completion','Review']},{name:'Data Analyst',subs:['SQL runner','Charts']}],
 models:[{name:'Claude Sonnet 4.5'},{name:'GPT-4o'},{name:'Gemini 2.5 Pro'},{name:'Whisper'},{name:'Llama 4 Maverick'}],
 rateLimits:[{label:'Max tokens',value:'1.0M / day'},{label:'Max requests',value:'10,000 / day'},{label:'Resets',value:'Daily at midnight IST'}],
 budgets:[{label:'Spend cap',value:'$500 / month'},{label:'Resets',value:'Monthly, calendar-aligned'}],
 guardrails:[{layer:'Gateway (Bifrost key)',items:['PII redaction','Prompt-injection filter','Toxicity filter']},{layer:'Product',items:['Blocked topics list','Citation-required answers']}]};
const FDE_DETAIL:Omit<UserDetail,'inherits'>={
 skills:[{name:'Chat',subs:['General Q&A','Summaries']},{name:'Document QA',subs:['Upload & parse','Citation answers']},{name:'Code Assistant',subs:['Completion']}],
 models:[{name:'Gemini 2.5 Pro'},{name:'Whisper'},{name:'Llama 4 Maverick'}],
 rateLimits:[{label:'Max tokens',value:'500k / day'},{label:'Max requests',value:'5,000 / day'},{label:'Resets',value:'Daily at midnight IST'}],
 budgets:[{label:'Spend cap',value:'$200 / month'},{label:'Resets',value:'Monthly, calendar-aligned'}],
 guardrails:[{layer:'Gateway (Bifrost key)',items:['PII redaction','Prompt-injection filter']},{layer:'Product',items:['Blocked topics list']}]};
const VIEWER_DETAIL:Omit<UserDetail,'inherits'>={
 skills:[{name:'Chat',subs:['General Q&A']}],
 models:[{name:'Llama 4 Maverick'}],
 rateLimits:[{label:'Max tokens',value:'50k / day'},{label:'Max requests',value:'500 / day'},{label:'Resets',value:'Daily at midnight IST'}],
 budgets:[{label:'Spend cap',value:'$20 / month'},{label:'Resets',value:'Monthly, calendar-aligned'}],
 guardrails:[{layer:'Gateway (Bifrost key)',items:['PII redaction','Prompt-injection filter','Toxicity filter','Topic allowlist']},{layer:'Product',items:['Blocked topics list','Citation-required answers','Read-only actions']}]};
// Effective settings are derived from the user's CURRENT Role cell, so editing a user's role
// in the grid changes what this panel shows. Per-user exceptions are applied on top and
// badged as overrides; an override that the new role already grants simply disappears.
export function userDetail(row:{id:string;values:string[]}):UserDetail{
 const role=row.values[3]||'FDE';
 const base=role==='Admin'?ADMIN_DETAIL:role==='Viewer'?VIEWER_DETAIL:FDE_DETAIL;
 const d:UserDetail={inherits:role,skills:[...base.skills],models:[...base.models],rateLimits:[...base.rateLimits],budgets:[...base.budgets],guardrails:[...base.guardrails]};
 if(row.id==='seed-usr-03'){ // Likith: frontier model access and a raised token ceiling
  if(!d.models.some(m=>m.name==='Claude Sonnet 4.5'))d.models=[...d.models,{name:'Claude Sonnet 4.5',override:true}];
  if(role!=='Admin')d.rateLimits=d.rateLimits.map(l=>l.label==='Max tokens'?{...l,value:'750k / day',override:true}:l);
 }
 if(row.id==='seed-usr-05'){ // Sriniketh: Document QA (citation answers) on top of a Viewer role
  if(!d.skills.some(sk=>sk.name==='Document QA'))d.skills=[...d.skills,{name:'Document QA',subs:['Citation answers'],override:true}];
 }
 return d;
}
export function adminSheet(name:string){return ADMIN_SHEETS.concat([ACTIVITY_SHEET]).find(s=>s.name===name);}
