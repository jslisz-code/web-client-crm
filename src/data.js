export const STAGES = [
  "New Lead",
  "Contacted",
  "Discovery",
  "Quote Sent",
  "Client Accepted",
  "Waiting on Content",
  "Building Website",
  "Client Review",
  "Revisions",
  "Ready to Launch",
  "Live",
  "Maintenance",
  "Lost"
];

export const ACTIVE_STAGES = [
  "Client Accepted",
  "Waiting on Content",
  "Building Website",
  "Client Review",
  "Revisions",
  "Ready to Launch"
];

export const DEFAULT_CHECKLIST = [
  "Contract signed",
  "Deposit paid",
  "Domain confirmed",
  "Logo received",
  "Business photos received",
  "Website copy received",
  "Initial design completed",
  "Client review completed",
  "Revisions completed",
  "Mobile tested",
  "SEO basics completed",
  "Domain connected",
  "Website launched"
];

export const SEED_CLIENTS = [
  {
    id: "client-1",
    businessName: "Stone & Oak Landscaping",
    contactName: "Maya Torres",
    email: "maya@example.com",
    phone: "(210) 555-0148",
    website: "",
    services: "5-page website, contact form, local SEO basics",
    quotedPrice: 2400,
    amountPaid: 1200,
    deadline: "2026-10-02",
    status: "Building Website",
    priority: "High",
    nextFollowUp: "2026-09-14",
    domainProvider: "GoDaddy",
    hostingProvider: "GitHub Pages",
    repoUrl: "",
    liveUrl: "",
    notes: "Homepage approved. Waiting on final service photos.",
    checklist: [true,true,true,true,false,true,true,false,false,false,false,false,false],
    createdAt: "2026-09-01"
  },
  {
    id: "client-2",
    businessName: "Alamo Mobile Detail",
    contactName: "Chris Vega",
    email: "chris@example.com",
    phone: "(210) 555-0192",
    website: "",
    services: "Landing page, quote form, gallery",
    quotedPrice: 1500,
    amountPaid: 500,
    deadline: "2026-09-26",
    status: "Waiting on Content",
    priority: "Medium",
    nextFollowUp: "2026-09-13",
    domainProvider: "Namecheap",
    hostingProvider: "GitHub Pages",
    repoUrl: "",
    liveUrl: "",
    notes: "Needs to send logo, before/after photos, and pricing.",
    checklist: [true,true,true,false,false,false,false,false,false,false,false,false,false],
    createdAt: "2026-09-04"
  },
  {
    id: "client-3",
    businessName: "Hill Country Tax Group",
    contactName: "Nina Brooks",
    email: "nina@example.com",
    phone: "(830) 555-0104",
    website: "https://example.com",
    services: "Website redesign, booking integration",
    quotedPrice: 3200,
    amountPaid: 3200,
    deadline: "2026-09-08",
    status: "Live",
    priority: "Low",
    nextFollowUp: "2026-10-08",
    domainProvider: "GoDaddy",
    hostingProvider: "Netlify",
    repoUrl: "",
    liveUrl: "https://example.com",
    notes: "Launched. Check in next month about maintenance plan.",
    checklist: Array(13).fill(true),
    createdAt: "2026-08-12"
  },
  {
    id: "client-4",
    businessName: "Bluebonnet Roofing",
    contactName: "Derek Hale",
    email: "derek@example.com",
    phone: "(210) 555-0117",
    website: "",
    services: "Lead-generation website",
    quotedPrice: 2800,
    amountPaid: 0,
    deadline: "",
    status: "Quote Sent",
    priority: "High",
    nextFollowUp: "2026-09-12",
    domainProvider: "",
    hostingProvider: "",
    repoUrl: "",
    liveUrl: "",
    notes: "Sent proposal. Follow up Friday.",
    checklist: Array(13).fill(false),
    createdAt: "2026-09-09"
  }
];

export const SEED_TASKS = [
  { id: "task-1", title: "Follow up on roofing proposal", clientId: "client-4", dueDate: "2026-09-12", priority: "High", completed: false },
  { id: "task-2", title: "Request final service photos", clientId: "client-1", dueDate: "2026-09-14", priority: "Medium", completed: false },
  { id: "task-3", title: "Send content reminder", clientId: "client-2", dueDate: "2026-09-13", priority: "Medium", completed: false }
];
