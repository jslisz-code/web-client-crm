import React, { useEffect, useMemo, useState } from "react";
import { ACTIVE_STAGES, DEFAULT_CHECKLIST, SEED_CLIENTS, SEED_TASKS, STAGES } from "./data.js";

const NAV_ITEMS = ["Dashboard", "Clients", "Pipeline", "Tasks"];

const money = (value) => new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
}).format(Number(value || 0));

const todayISO = () => new Date().toISOString().slice(0, 10);

function stageClass(stage) {
  if (["New Lead", "Contacted", "Discovery", "Quote Sent"].includes(stage)) return "pink";
  if (["Live", "Maintenance"].includes(stage)) return "blue";
  if (stage === "Lost") return "muted";
  return "purple";
}

function priorityClass(priority) {
  if (priority === "High") return "pink";
  if (priority === "Low") return "blue";
  return "purple";
}

function initials(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function blankClient() {
  return {
    id: "",
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    website: "",
    services: "",
    quotedPrice: "",
    amountPaid: "",
    deadline: "",
    status: "New Lead",
    priority: "Medium",
    nextFollowUp: "",
    domainProvider: "",
    hostingProvider: "",
    repoUrl: "",
    liveUrl: "",
    notes: "",
    checklist: Array(DEFAULT_CHECKLIST.length).fill(false),
    createdAt: todayISO()
  };
}

export default function App() {
  const [activeView, setActiveView] = useState("Dashboard");
  const [clients, setClients] = useState(() => {
    const saved = localStorage.getItem("web-client-crm-clients");
    return saved ? JSON.parse(saved) : SEED_CLIENTS;
  });
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("web-client-crm-tasks");
    return saved ? JSON.parse(saved) : SEED_TASKS;
  });
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [detailClientId, setDetailClientId] = useState(null);
  const [editingClient, setEditingClient] = useState(blankClient());
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("All");
  const [taskDraft, setTaskDraft] = useState({ title: "", clientId: "", dueDate: "", priority: "Medium" });

  useEffect(() => {
    localStorage.setItem("web-client-crm-clients", JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem("web-client-crm-tasks", JSON.stringify(tasks));
  }, [tasks]);

  const selectedClient = clients.find((client) => client.id === detailClientId);

  const filteredClients = useMemo(() => {
    const term = search.toLowerCase().trim();
    return clients.filter((client) => {
      const matchesStage = stageFilter === "All" || client.status === stageFilter;
      const matchesSearch = !term ||
        client.businessName.toLowerCase().includes(term) ||
        client.contactName.toLowerCase().includes(term) ||
        client.email.toLowerCase().includes(term);
      return matchesStage && matchesSearch;
    });
  }, [clients, search, stageFilter]);

  const activeClients = clients.filter((client) => ACTIVE_STAGES.includes(client.status));
  const pipelineValue = clients
    .filter((client) => !["Lost", "Live", "Maintenance"].includes(client.status))
    .reduce((sum, client) => sum + Number(client.quotedPrice || 0), 0);
  const collected = clients.reduce((sum, client) => sum + Number(client.amountPaid || 0), 0);
  const outstanding = clients.reduce((sum, client) => sum + Math.max(Number(client.quotedPrice || 0) - Number(client.amountPaid || 0), 0), 0);

  function openNewClient() {
    setEditingClient(blankClient());
    setClientModalOpen(true);
  }

  function openEditClient(client) {
    setEditingClient({
      ...client,
      checklist: client.checklist?.length === DEFAULT_CHECKLIST.length
        ? [...client.checklist]
        : Array(DEFAULT_CHECKLIST.length).fill(false)
    });
    setClientModalOpen(true);
  }

  function saveClient(event) {
    event.preventDefault();
    if (!editingClient.businessName.trim()) return;

    if (editingClient.id) {
      setClients((current) => current.map((client) => client.id === editingClient.id ? {
        ...editingClient,
        quotedPrice: Number(editingClient.quotedPrice || 0),
        amountPaid: Number(editingClient.amountPaid || 0)
      } : client));
    } else {
      setClients((current) => [{
        ...editingClient,
        id: `client-${Date.now()}`,
        quotedPrice: Number(editingClient.quotedPrice || 0),
        amountPaid: Number(editingClient.amountPaid || 0)
      }, ...current]);
    }

    setClientModalOpen(false);
  }

  function deleteClient(clientId) {
    const client = clients.find((item) => item.id === clientId);
    if (!client) return;
    if (!window.confirm(`Delete ${client.businessName}?`)) return;

    setClients((current) => current.filter((item) => item.id !== clientId));
    setTasks((current) => current.filter((task) => task.clientId !== clientId));
    if (detailClientId === clientId) setDetailClientId(null);
  }

  function updateStage(clientId, newStage) {
    setClients((current) => current.map((client) => client.id === clientId ? { ...client, status: newStage } : client));
  }

  function toggleChecklist(clientId, index) {
    setClients((current) => current.map((client) => {
      if (client.id !== clientId) return client;
      const checklist = [...client.checklist];
      checklist[index] = !checklist[index];
      return { ...client, checklist };
    }));
  }

  function toggleTask(taskId) {
    setTasks((current) => current.map((task) => task.id === taskId ? { ...task, completed: !task.completed } : task));
  }

  function deleteTask(taskId) {
    setTasks((current) => current.filter((task) => task.id !== taskId));
  }

  function addTask(event) {
    event.preventDefault();
    if (!taskDraft.title.trim()) return;
    setTasks((current) => [{ id: `task-${Date.now()}`, ...taskDraft, completed: false }, ...current]);
    setTaskDraft({ title: "", clientId: "", dueDate: "", priority: "Medium" });
  }

  function resetDemo() {
    if (!window.confirm("Reset back to the original demo data?")) return;
    setClients(SEED_CLIENTS);
    setTasks(SEED_TASKS);
    setSearch("");
    setStageFilter("All");
    setActiveView("Dashboard");
    setDetailClientId(null);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="logo-block">
            <div className="logo-mark">WC</div>
            <div>
              <strong>Web Client CRM</strong>
              <span>Website design studio</span>
            </div>
          </div>

          <nav className="nav-list" aria-label="CRM navigation">
            {NAV_ITEMS.map((item) => (
              <button key={item} className={`nav-button ${activeView === item ? "active" : ""}`} onClick={() => setActiveView(item)}>
                <span className={`nav-dot ${item === "Clients" ? "pink-bg" : item === "Tasks" ? "blue-bg" : "purple-bg"}`}></span>
                {item}
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <button className="ghost-button" onClick={resetDemo}>Reset demo data</button>
          <p>Saved automatically in this browser.</p>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div>
            <p className="eyebrow">Website design business</p>
            <h1>{activeView}</h1>
          </div>
          <button className="primary-button pink-button" onClick={openNewClient}>+ Add client</button>
        </header>

        {activeView === "Dashboard" && (
          <Dashboard
            clients={clients}
            tasks={tasks}
            activeClients={activeClients}
            pipelineValue={pipelineValue}
            collected={collected}
            outstanding={outstanding}
            openClient={setDetailClientId}
            toggleTask={toggleTask}
          />
        )}

        {activeView === "Clients" && (
          <ClientsView
            clients={filteredClients}
            search={search}
            setSearch={setSearch}
            stageFilter={stageFilter}
            setStageFilter={setStageFilter}
            openClient={setDetailClientId}
            editClient={openEditClient}
            deleteClient={deleteClient}
          />
        )}

        {activeView === "Pipeline" && (
          <PipelineView clients={clients} updateStage={updateStage} openClient={setDetailClientId} />
        )}

        {activeView === "Tasks" && (
          <TasksView
            tasks={tasks}
            clients={clients}
            taskDraft={taskDraft}
            setTaskDraft={setTaskDraft}
            addTask={addTask}
            toggleTask={toggleTask}
            deleteTask={deleteTask}
          />
        )}
      </main>

      {clientModalOpen && (
        <ClientFormModal
          client={editingClient}
          setClient={setEditingClient}
          saveClient={saveClient}
          close={() => setClientModalOpen(false)}
        />
      )}

      {selectedClient && (
        <ClientDetailDrawer
          client={selectedClient}
          tasks={tasks.filter((task) => task.clientId === selectedClient.id)}
          close={() => setDetailClientId(null)}
          edit={() => openEditClient(selectedClient)}
          deleteClient={() => deleteClient(selectedClient.id)}
          toggleChecklist={(index) => toggleChecklist(selectedClient.id, index)}
          toggleTask={toggleTask}
        />
      )}
    </div>
  );
}

function Dashboard({ clients, tasks, activeClients, pipelineValue, collected, outstanding, openClient, toggleTask }) {
  const upcoming = tasks.filter((task) => !task.completed)
    .sort((a, b) => (a.dueDate || "9999").localeCompare(b.dueDate || "9999"))
    .slice(0, 5);

  return (
    <section className="page-section">
      <div className="stat-grid">
        <StatCard label="Total clients" value={clients.length} tone="pink" />
        <StatCard label="Active projects" value={activeClients.length} tone="purple" />
        <StatCard label="Pipeline value" value={money(pipelineValue)} tone="pink" />
        <StatCard label="Collected" value={money(collected)} tone="blue" />
        <StatCard label="Outstanding" value={money(outstanding)} tone="purple" />
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-heading">
            <div><p className="eyebrow purple-text">Active projects</p><h2>Currently in production</h2></div>
          </div>
          <div className="project-list">
            {activeClients.length === 0 && <EmptyState text="No active projects yet." />}
            {activeClients.slice(0, 6).map((client) => (
              <button key={client.id} className="project-row" onClick={() => openClient(client.id)}>
                <div className={`avatar ${stageClass(client.status)}-surface`}>{initials(client.businessName)}</div>
                <div className="project-copy"><strong>{client.businessName}</strong><span>{client.contactName}</span></div>
                <span className={`status-pill ${stageClass(client.status)}`}>{client.status}</span>
                <span className="project-money">{money(client.quotedPrice)}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div><p className="eyebrow blue-text">Follow-ups</p><h2>Upcoming tasks</h2></div>
          </div>
          <div className="task-list">
            {upcoming.length === 0 && <EmptyState text="You're all caught up." />}
            {upcoming.map((task) => (
              <TaskRow key={task.id} task={task} client={clients.find((client) => client.id === task.clientId)} toggle={() => toggleTask(task.id)} />
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

function StatCard({ label, value, tone }) {
  return (
    <article className={`stat-card ${tone}-border`}>
      <span className={`stat-accent ${tone}-bg`}></span>
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  );
}

function ClientsView({ clients, search, setSearch, stageFilter, setStageFilter, openClient, editClient, deleteClient }) {
  return (
    <section className="page-section">
      <div className="client-toolbar">
        <div className="search-shell">
          <span className="search-icon">⌕</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search business, contact, or email..." aria-label="Search clients" />
        </div>
        <select className="filter-select" value={stageFilter} onChange={(event) => setStageFilter(event.target.value)}>
          <option value="All">All stages</option>
          {STAGES.map((stage) => <option value={stage} key={stage}>{stage}</option>)}
        </select>
      </div>

      <div className="panel table-panel">
        <div className="client-table-head">
          <span>Client</span><span>Status</span><span>Project value</span><span>Balance</span><span>Next follow-up</span><span></span>
        </div>
        <div className="client-table-body">
          {clients.length === 0 && <EmptyState text="No clients match your filters." />}
          {clients.map((client) => (
            <div className="client-table-row" key={client.id}>
              <button className="client-identity" onClick={() => openClient(client.id)}>
                <div className={`avatar ${stageClass(client.status)}-surface`}>{initials(client.businessName)}</div>
                <div><strong>{client.businessName}</strong><span>{client.contactName}</span></div>
              </button>
              <span className={`status-pill ${stageClass(client.status)}`}>{client.status}</span>
              <strong>{money(client.quotedPrice)}</strong>
              <span>{money(Math.max(Number(client.quotedPrice || 0) - Number(client.amountPaid || 0), 0))}</span>
              <span>{client.nextFollowUp || "—"}</span>
              <div className="row-actions">
                <button className="small-button" onClick={() => editClient(client)}>Edit</button>
                <button className="small-button danger-button" onClick={() => deleteClient(client.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PipelineView({ clients, updateStage, openClient }) {
  const pipelineStages = STAGES.filter((stage) => stage !== "Lost");

  function handleDrop(event, stage) {
    event.preventDefault();
    const clientId = event.dataTransfer.getData("text/plain");
    if (clientId) updateStage(clientId, stage);
  }

  return (
    <section className="page-section">
      <div className="pipeline-note">Drag client cards between columns to update project status.</div>
      <div className="pipeline-board">
        {pipelineStages.map((stage) => {
          const stageClients = clients.filter((client) => client.status === stage);
          return (
            <section className={`pipeline-column ${stageClass(stage)}-column`} key={stage} onDragOver={(event) => event.preventDefault()} onDrop={(event) => handleDrop(event, stage)}>
              <div className="pipeline-heading">
                <span className={`nav-dot ${stageClass(stage)}-bg`}></span>
                <strong>{stage}</strong><span>{stageClients.length}</span>
              </div>
              <div className="pipeline-stack">
                {stageClients.map((client) => (
                  <article className="pipeline-card" key={client.id} draggable onDragStart={(event) => event.dataTransfer.setData("text/plain", client.id)} onClick={() => openClient(client.id)}>
                    <strong>{client.businessName}</strong>
                    <span>{client.contactName}</span>
                    <div className="pipeline-card-bottom">
                      <span className={`priority-pill ${priorityClass(client.priority)}`}>{client.priority}</span>
                      <span>{money(client.quotedPrice)}</span>
                    </div>
                  </article>
                ))}
                {stageClients.length === 0 && <div className="pipeline-empty">Drop client here</div>}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}

function TasksView({ tasks, clients, taskDraft, setTaskDraft, addTask, toggleTask, deleteTask }) {
  const ordered = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return (a.dueDate || "9999").localeCompare(b.dueDate || "9999");
  });

  return (
    <section className="page-section tasks-layout">
      <section className="panel">
        <div className="panel-heading"><div><p className="eyebrow blue-text">To-do list</p><h2>Client follow-ups & tasks</h2></div></div>
        <div className="task-list">
          {ordered.length === 0 && <EmptyState text="No tasks yet." />}
          {ordered.map((task) => (
            <div className={`task-row ${task.completed ? "completed" : ""}`} key={task.id}>
              <TaskRow task={task} client={clients.find((client) => client.id === task.clientId)} toggle={() => toggleTask(task.id)} />
              <button className="task-delete" onClick={() => deleteTask(task.id)} aria-label={`Delete ${task.title}`}>×</button>
            </div>
          ))}
        </div>
      </section>

      <section className="panel task-form-panel">
        <div className="panel-heading"><div><p className="eyebrow pink-text">Quick add</p><h2>New task</h2></div></div>
        <form className="stack-form" onSubmit={addTask}>
          <label>Task<input value={taskDraft.title} onChange={(event) => setTaskDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Follow up on proposal" required /></label>
          <label>Client<select value={taskDraft.clientId} onChange={(event) => setTaskDraft((current) => ({ ...current, clientId: event.target.value }))}>
            <option value="">No client</option>
            {clients.map((client) => <option key={client.id} value={client.id}>{client.businessName}</option>)}
          </select></label>
          <label>Due date<input type="date" value={taskDraft.dueDate} onChange={(event) => setTaskDraft((current) => ({ ...current, dueDate: event.target.value }))} /></label>
          <label>Priority<select value={taskDraft.priority} onChange={(event) => setTaskDraft((current) => ({ ...current, priority: event.target.value }))}><option>Low</option><option>Medium</option><option>High</option></select></label>
          <button className="primary-button blue-button" type="submit">Add task</button>
        </form>
      </section>
    </section>
  );
}

function TaskRow({ task, client, toggle }) {
  return (
    <label className="task-item">
      <input type="checkbox" checked={task.completed} onChange={toggle} />
      <span className="custom-check"></span>
      <span className="task-copy"><strong>{task.title}</strong><span>{client?.businessName || "General task"}{task.dueDate ? ` • Due ${task.dueDate}` : ""}</span></span>
      <span className={`priority-pill ${priorityClass(task.priority)}`}>{task.priority}</span>
    </label>
  );
}

function ClientFormModal({ client, setClient, saveClient, close }) {
  const change = (field, value) => setClient((current) => ({ ...current, [field]: value }));

  return (
    <div className="modal-backdrop" onMouseDown={close}>
      <section className="modal-card" onMouseDown={(event) => event.stopPropagation()} aria-modal="true" role="dialog">
        <div className="modal-heading">
          <div><p className="eyebrow pink-text">{client.id ? "Edit client" : "New client"}</p><h2>{client.id ? client.businessName : "Add website client"}</h2></div>
          <button className="icon-button" onClick={close} aria-label="Close">×</button>
        </div>

        <form className="client-form-grid" onSubmit={saveClient}>
          <label>Business name *<input value={client.businessName} onChange={(event) => change("businessName", event.target.value)} required /></label>
          <label>Contact name<input value={client.contactName} onChange={(event) => change("contactName", event.target.value)} /></label>
          <label>Email<input type="email" value={client.email} onChange={(event) => change("email", event.target.value)} /></label>
          <label>Phone<input value={client.phone} onChange={(event) => change("phone", event.target.value)} /></label>
          <label className="wide-field">Services / scope<input value={client.services} onChange={(event) => change("services", event.target.value)} placeholder="5-page website, booking form, SEO basics..." /></label>
          <label>Status<select value={client.status} onChange={(event) => change("status", event.target.value)}>{STAGES.map((stage) => <option key={stage}>{stage}</option>)}</select></label>
          <label>Priority<select value={client.priority} onChange={(event) => change("priority", event.target.value)}><option>Low</option><option>Medium</option><option>High</option></select></label>
          <label>Quoted price<input type="number" min="0" value={client.quotedPrice} onChange={(event) => change("quotedPrice", event.target.value)} /></label>
          <label>Amount paid<input type="number" min="0" value={client.amountPaid} onChange={(event) => change("amountPaid", event.target.value)} /></label>
          <label>Project deadline<input type="date" value={client.deadline} onChange={(event) => change("deadline", event.target.value)} /></label>
          <label>Next follow-up<input type="date" value={client.nextFollowUp} onChange={(event) => change("nextFollowUp", event.target.value)} /></label>
          <label>Domain provider<input value={client.domainProvider} onChange={(event) => change("domainProvider", event.target.value)} placeholder="GoDaddy" /></label>
          <label>Hosting provider<input value={client.hostingProvider} onChange={(event) => change("hostingProvider", event.target.value)} placeholder="GitHub Pages" /></label>
          <label className="wide-field">GitHub repository<input type="url" value={client.repoUrl} onChange={(event) => change("repoUrl", event.target.value)} placeholder="https://github.com/..." /></label>
          <label className="wide-field">Live website<input type="url" value={client.liveUrl} onChange={(event) => change("liveUrl", event.target.value)} placeholder="https://..." /></label>
          <label className="wide-field">Notes<textarea value={client.notes} onChange={(event) => change("notes", event.target.value)} rows="4" /></label>
          <div className="form-actions wide-field">
            <button type="button" className="ghost-button" onClick={close}>Cancel</button>
            <button className="primary-button purple-button" type="submit">{client.id ? "Save changes" : "Add client"}</button>
          </div>
        </form>
      </section>
    </div>
  );
}

function ClientDetailDrawer({ client, tasks, close, edit, deleteClient, toggleChecklist, toggleTask }) {
  const completedChecklist = client.checklist.filter(Boolean).length;
  const percentage = Math.round((completedChecklist / DEFAULT_CHECKLIST.length) * 100);

  return (
    <div className="drawer-backdrop" onMouseDown={close}>
      <aside className="client-drawer" onMouseDown={(event) => event.stopPropagation()}>
        <div className="drawer-heading">
          <div><p className={`eyebrow ${stageClass(client.status)}-text`}>{client.status}</p><h2>{client.businessName}</h2><span>{client.contactName}</span></div>
          <button className="icon-button" onClick={close}>×</button>
        </div>
        <div className="drawer-actions"><button className="small-button" onClick={edit}>Edit</button><button className="small-button danger-button" onClick={deleteClient}>Delete</button></div>

        <section className="drawer-section">
          <h3>Project overview</h3>
          <div className="detail-grid">
            <Detail label="Email" value={client.email || "—"} />
            <Detail label="Phone" value={client.phone || "—"} />
            <Detail label="Quoted" value={money(client.quotedPrice)} />
            <Detail label="Paid" value={money(client.amountPaid)} />
            <Detail label="Balance" value={money(Math.max(Number(client.quotedPrice || 0) - Number(client.amountPaid || 0), 0))} />
            <Detail label="Deadline" value={client.deadline || "—"} />
            <Detail label="Domain" value={client.domainProvider || "—"} />
            <Detail label="Hosting" value={client.hostingProvider || "—"} />
          </div>
        </section>

        <section className="drawer-section">
          <div className="section-heading-inline"><h3>Launch checklist</h3><span>{percentage}%</span></div>
          <div className="progress-track"><span style={{ width: `${percentage}%` }}></span></div>
          <div className="checklist">
            {DEFAULT_CHECKLIST.map((item, index) => (
              <label key={item}>
                <input type="checkbox" checked={Boolean(client.checklist[index])} onChange={() => toggleChecklist(index)} />
                <span className="custom-check"></span><span>{item}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="drawer-section"><h3>Notes</h3><p className="notes-box">{client.notes || "No notes yet."}</p></section>

        <section className="drawer-section">
          <h3>Open tasks</h3>
          <div className="task-list">
            {tasks.filter((task) => !task.completed).length === 0 && <EmptyState text="No open tasks for this client." />}
            {tasks.filter((task) => !task.completed).map((task) => <TaskRow key={task.id} task={task} client={client} toggle={() => toggleTask(task.id)} />)}
          </div>
        </section>

        {(client.repoUrl || client.liveUrl || client.website) && (
          <section className="drawer-section">
            <h3>Links</h3>
            <div className="link-list">
              {client.repoUrl && <a href={client.repoUrl} target="_blank" rel="noreferrer">GitHub repository ↗</a>}
              {client.liveUrl && <a href={client.liveUrl} target="_blank" rel="noreferrer">Live website ↗</a>}
              {client.website && <a href={client.website} target="_blank" rel="noreferrer">Existing website ↗</a>}
            </div>
          </section>
        )}
      </aside>
    </div>
  );
}

function Detail({ label, value }) {
  return <div className="detail-item"><span>{label}</span><strong>{value}</strong></div>;
}

function EmptyState({ text }) {
  return <div className="empty-state">{text}</div>;
}
