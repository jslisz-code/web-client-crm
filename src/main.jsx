import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";

const stages = ["New Lead","Contacted","Discovery","Quote Sent","Client Accepted","Waiting on Content","Building Website","Client Review","Revisions","Ready to Launch","Live","Maintenance","Lost"];
const checklistItems = ["Contract signed","Deposit paid","Domain confirmed","Logo received","Business photos received","Website copy received","Initial design completed","Client review completed","Revisions completed","Mobile tested","SEO basics completed","Domain connected","Website launched"];

const starterClients = [
  {id:1,business:"Stone & Oak Landscaping",contact:"Maya Torres",email:"maya@example.com",phone:"(210) 555-0148",status:"Building Website",priority:"High",quoted:2400,paid:1200,followUp:"2026-09-14",notes:"Homepage approved. Waiting on final service photos.",checklist:[1,1,1,1,0,1,1,0,0,0,0,0,0]},
  {id:2,business:"Alamo Mobile Detail",contact:"Chris Vega",email:"chris@example.com",phone:"(210) 555-0192",status:"Waiting on Content",priority:"Medium",quoted:1500,paid:500,followUp:"2026-09-13",notes:"Needs to send logo, before/after photos, and pricing.",checklist:[1,1,1,0,0,0,0,0,0,0,0,0,0]},
  {id:3,business:"Hill Country Tax Group",contact:"Nina Brooks",email:"nina@example.com",phone:"(830) 555-0104",status:"Live",priority:"Low",quoted:3200,paid:3200,followUp:"2026-10-08",notes:"Launched. Check in next month about maintenance.",checklist:Array(13).fill(1)},
  {id:4,business:"Bluebonnet Roofing",contact:"Derek Hale",email:"derek@example.com",phone:"(210) 555-0117",status:"Quote Sent",priority:"High",quoted:2800,paid:0,followUp:"2026-09-12",notes:"Sent proposal. Follow up Friday.",checklist:Array(13).fill(0)}
];

const starterTasks = [
  {id:1,title:"Follow up on roofing proposal",clientId:4,due:"2026-09-12",done:false},
  {id:2,title:"Request final service photos",clientId:1,due:"2026-09-14",done:false},
  {id:3,title:"Send content reminder",clientId:2,due:"2026-09-13",done:false}
];

function money(v){return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(Number(v||0));}
function tone(stage){ if(["New Lead","Contacted","Discovery","Quote Sent"].includes(stage)) return 'pink'; if(["Live","Maintenance"].includes(stage)) return 'blue'; if(stage==='Lost') return 'muted'; return 'purple'; }
function blankClient(){return {id:null,business:"",contact:"",email:"",phone:"",status:"New Lead",priority:"Medium",quoted:0,paid:0,followUp:"",notes:"",checklist:Array(13).fill(0)};}

function App(){
  const [view,setView]=useState('Dashboard');
  const [clients,setClients]=useState(()=>JSON.parse(localStorage.getItem('crmClients')||'null')||starterClients);
  const [tasks,setTasks]=useState(()=>JSON.parse(localStorage.getItem('crmTasks')||'null')||starterTasks);
  const [query,setQuery]=useState('');
  const [filter,setFilter]=useState('All');
  const [editing,setEditing]=useState(null);
  const [detail,setDetail]=useState(null);
  const [taskDraft,setTaskDraft]=useState({title:'',clientId:'',due:''});

  useEffect(()=>localStorage.setItem('crmClients',JSON.stringify(clients)),[clients]);
  useEffect(()=>localStorage.setItem('crmTasks',JSON.stringify(tasks)),[tasks]);

  const filtered=useMemo(()=>clients.filter(c=>{
    const q=query.toLowerCase();
    return (filter==='All'||c.status===filter) && (!q||c.business.toLowerCase().includes(q)||c.contact.toLowerCase().includes(q)||c.email.toLowerCase().includes(q));
  }),[clients,query,filter]);

  const pipeline=clients.filter(c=>!['Live','Maintenance','Lost'].includes(c.status)).reduce((s,c)=>s+Number(c.quoted||0),0);
  const collected=clients.reduce((s,c)=>s+Number(c.paid||0),0);
  const outstanding=clients.reduce((s,c)=>s+Math.max(Number(c.quoted||0)-Number(c.paid||0),0),0);

  function saveClient(e){
    e.preventDefault();
    if(!editing.business.trim()) return;
    if(editing.id){setClients(cs=>cs.map(c=>c.id===editing.id?editing:c));}
    else{setClients(cs=>[{...editing,id:Date.now()},...cs]);}
    setEditing(null);
  }
  function removeClient(id){if(confirm('Delete this client?')){setClients(cs=>cs.filter(c=>c.id!==id));setTasks(ts=>ts.filter(t=>t.clientId!==id));if(detail?.id===id)setDetail(null);}}
  function toggleChecklist(clientId,i){setClients(cs=>cs.map(c=>{if(c.id!==clientId)return c;const list=[...c.checklist];list[i]=list[i]?0:1;return {...c,checklist:list};}));setDetail(d=>d&&d.id===clientId?{...d,checklist:d.checklist.map((v,idx)=>idx===i?(v?0:1):v)}:d);}
  function moveClient(id,status){setClients(cs=>cs.map(c=>c.id===id?{...c,status}:c));}
  function addTask(e){e.preventDefault();if(!taskDraft.title.trim())return;setTasks(ts=>[{id:Date.now(),title:taskDraft.title,clientId:Number(taskDraft.clientId)||null,due:taskDraft.due,done:false},...ts]);setTaskDraft({title:'',clientId:'',due:''});}

  return <div className="app">
    <aside className="sidebar">
      <div>
        <div className="brand"><div className="brandMark">WC</div><div><strong>Web Client CRM</strong><span>Website design studio</span></div></div>
        <nav>{['Dashboard','Clients','Pipeline','Tasks'].map(v=><button key={v} className={view===v?'active':''} onClick={()=>setView(v)}>{v}</button>)}</nav>
      </div>
      <p className="saveNote">Saved automatically in this browser.</p>
    </aside>

    <main>
      <header className="topbar"><div><p className="eyebrow">Website design business</p><h1>{view}</h1></div><button className="primary pink" onClick={()=>setEditing(blankClient())}>+ Add client</button></header>

      {view==='Dashboard' && <>
        <section className="stats">
          <Stat label="Clients" value={clients.length} color="pink"/><Stat label="Pipeline" value={money(pipeline)} color="purple"/><Stat label="Collected" value={money(collected)} color="blue"/><Stat label="Outstanding" value={money(outstanding)} color="purple"/>
        </section>
        <section className="twoCol">
          <Panel title="Active projects" color="purple">
            {clients.filter(c=>!['Live','Maintenance','Lost'].includes(c.status)).slice(0,6).map(c=><button className="clientRow" key={c.id} onClick={()=>setDetail(c)}><div><strong>{c.business}</strong><span>{c.contact}</span></div><span className={`pill ${tone(c.status)}`}>{c.status}</span><b>{money(c.quoted)}</b></button>)}
          </Panel>
          <Panel title="Upcoming tasks" color="blue">
            {tasks.filter(t=>!t.done).sort((a,b)=>(a.due||'9999').localeCompare(b.due||'9999')).map(t=><label className="task" key={t.id}><input type="checkbox" checked={t.done} onChange={()=>setTasks(ts=>ts.map(x=>x.id===t.id?{...x,done:!x.done}:x))}/><span><strong>{t.title}</strong><small>{clients.find(c=>c.id===t.clientId)?.business||'General'} {t.due?`• ${t.due}`:''}</small></span></label>)}
          </Panel>
        </section>
      </>}

      {view==='Clients' && <>
        <div className="toolbar"><div className="search"><input placeholder="Search business, contact, or email..." value={query} onChange={e=>setQuery(e.target.value)}/></div><select value={filter} onChange={e=>setFilter(e.target.value)}><option>All</option>{stages.map(s=><option key={s}>{s}</option>)}</select></div>
        <section className="panel tablePanel">
          <div className="tableHead"><span>Client</span><span>Status</span><span>Quoted</span><span>Balance</span><span>Follow-up</span><span></span></div>
          {filtered.map(c=><div className="tableRow" key={c.id}><button className="clientName" onClick={()=>setDetail(c)}><strong>{c.business}</strong><span>{c.contact}</span></button><span className={`pill ${tone(c.status)}`}>{c.status}</span><b>{money(c.quoted)}</b><span>{money(Math.max(c.quoted-c.paid,0))}</span><span>{c.followUp||'—'}</span><div className="actions"><button onClick={()=>setEditing({...c})}>Edit</button><button onClick={()=>removeClient(c.id)}>Delete</button></div></div>)}
        </section>
      </>}

      {view==='Pipeline' && <section className="pipeline">{stages.filter(s=>s!=='Lost').map(s=><div className={`column ${tone(s)}`} key={s} onDragOver={e=>e.preventDefault()} onDrop={e=>moveClient(Number(e.dataTransfer.getData('id')),s)}><header><strong>{s}</strong><span>{clients.filter(c=>c.status===s).length}</span></header>{clients.filter(c=>c.status===s).map(c=><article key={c.id} draggable onDragStart={e=>e.dataTransfer.setData('id',c.id)} onClick={()=>setDetail(c)}><strong>{c.business}</strong><span>{c.contact}</span><b>{money(c.quoted)}</b></article>)}</div>)}</section>}

      {view==='Tasks' && <section className="twoCol"><Panel title="Tasks" color="blue">{tasks.map(t=><div className={`taskLine ${t.done?'done':''}`} key={t.id}><label className="task"><input type="checkbox" checked={t.done} onChange={()=>setTasks(ts=>ts.map(x=>x.id===t.id?{...x,done:!x.done}:x))}/><span><strong>{t.title}</strong><small>{clients.find(c=>c.id===t.clientId)?.business||'General'} {t.due?`• ${t.due}`:''}</small></span></label><button onClick={()=>setTasks(ts=>ts.filter(x=>x.id!==t.id))}>×</button></div>)}</Panel><Panel title="Add task" color="pink"><form className="form" onSubmit={addTask}><label>Task<input value={taskDraft.title} onChange={e=>setTaskDraft({...taskDraft,title:e.target.value})} required/></label><label>Client<select value={taskDraft.clientId} onChange={e=>setTaskDraft({...taskDraft,clientId:e.target.value})}><option value="">General</option>{clients.map(c=><option value={c.id} key={c.id}>{c.business}</option>)}</select></label><label>Due date<input type="date" value={taskDraft.due} onChange={e=>setTaskDraft({...taskDraft,due:e.target.value})}/></label><button className="primary blue">Add task</button></form></Panel></section>}
    </main>

    {editing && <div className="overlay" onMouseDown={()=>setEditing(null)}><section className="modal" onMouseDown={e=>e.stopPropagation()}><header><div><p className="eyebrow pinkText">{editing.id?'Edit client':'New client'}</p><h2>{editing.id?editing.business:'Add website client'}</h2></div><button onClick={()=>setEditing(null)}>×</button></header><form className="clientForm" onSubmit={saveClient}>{[['business','Business name'],['contact','Contact name'],['email','Email'],['phone','Phone'],['quoted','Quoted price'],['paid','Amount paid'],['followUp','Next follow-up']].map(([k,l])=><label key={k}>{l}<input type={['quoted','paid'].includes(k)?'number':k==='email'?'email':k==='followUp'?'date':'text'} value={editing[k]} onChange={e=>setEditing({...editing,[k]:e.target.value})} required={k==='business'}/></label>)}<label>Status<select value={editing.status} onChange={e=>setEditing({...editing,status:e.target.value})}>{stages.map(s=><option key={s}>{s}</option>)}</select></label><label>Priority<select value={editing.priority} onChange={e=>setEditing({...editing,priority:e.target.value})}><option>Low</option><option>Medium</option><option>High</option></select></label><label className="wide">Notes<textarea rows="4" value={editing.notes} onChange={e=>setEditing({...editing,notes:e.target.value})}/></label><div className="wide formActions"><button type="button" onClick={()=>setEditing(null)}>Cancel</button><button className="primary purple">Save</button></div></form></section></div>}

    {detail && <div className="drawerOverlay" onMouseDown={()=>setDetail(null)}><aside className="drawer" onMouseDown={e=>e.stopPropagation()}><header><div><p className={`eyebrow ${tone(detail.status)}Text`}>{detail.status}</p><h2>{detail.business}</h2><span>{detail.contact}</span></div><button onClick={()=>setDetail(null)}>×</button></header><div className="drawerSection"><div className="miniGrid"><Mini label="Email" value={detail.email}/><Mini label="Phone" value={detail.phone}/><Mini label="Quoted" value={money(detail.quoted)}/><Mini label="Paid" value={money(detail.paid)}/><Mini label="Balance" value={money(Math.max(detail.quoted-detail.paid,0))}/><Mini label="Follow-up" value={detail.followUp||'—'}/></div></div><div className="drawerSection"><h3>Launch checklist</h3>{checklistItems.map((item,i)=><label className="check" key={item}><input type="checkbox" checked={!!detail.checklist[i]} onChange={()=>toggleChecklist(detail.id,i)}/><span>{item}</span></label>)}</div><div className="drawerSection"><h3>Notes</h3><p className="notes">{detail.notes||'No notes yet.'}</p></div></aside></div>}
  </div>
}

function Stat({label,value,color}){return <article className={`stat ${color}`}><span></span><p>{label}</p><strong>{value}</strong></article>}
function Panel({title,color,children}){return <section className="panel"><header className="panelTitle"><p className={`eyebrow ${color}Text`}>{title}</p></header>{children}</section>}
function Mini({label,value}){return <div className="mini"><span>{label}</span><strong>{value||'—'}</strong></div>}

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
