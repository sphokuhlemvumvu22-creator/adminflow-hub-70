import type {
  AuditEntry,
  Contact,
  DocRecord,
  LeaveRequest,
  Meeting,
  Supply,
  Task,
  Visitor,
} from "./types";

export const DEPARTMENTS = [
  "Administration",
  "Finance",
  "Human Resources",
  "Operations",
  "Facilities",
  "IT",
];

const pad = (n: number) => String(n).padStart(2, "0");

export function iso(offsetDays: number, base = new Date()): string {
  const d = new Date(base);
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function seedTasks(): Task[] {
  return [
    {
      id: "t1",
      title: "Submit VAT return to SARS",
      description: "Compile July invoices and file the VAT201 on eFiling.",
      assignee: "Naledi Khumalo",
      department: "Finance",
      dueDate: iso(0),
      priority: "Urgent",
      status: "In Progress",
      attachment: "VAT201-July.pdf",
    },
    {
      id: "t2",
      title: "Prepare board pack for Thursday",
      description: "Collate financials, HR report and facilities update.",
      assignee: "Sphokuhle Mvumvu",
      department: "Administration",
      dueDate: iso(0),
      priority: "High",
      status: "Not Started",
    },
    {
      id: "t3",
      title: "Renew fire compliance certificate",
      description: "Book inspection with the municipality.",
      assignee: "Thabo Dlamini",
      department: "Facilities",
      dueDate: iso(-3),
      priority: "High",
      status: "Overdue",
    },
    {
      id: "t4",
      title: "Onboard new receptionist",
      description: "Workstation, access card, email account and induction pack.",
      assignee: "Ayesha Patel",
      department: "Human Resources",
      dueDate: iso(2),
      priority: "Medium",
      status: "In Progress",
    },
    {
      id: "t5",
      title: "Order printer toner (Ricoh MP C307)",
      description: "Two black, one cyan. Use approved supplier.",
      assignee: "Sphokuhle Mvumvu",
      department: "Administration",
      dueDate: iso(1),
      priority: "Medium",
      status: "Not Started",
    },
    {
      id: "t6",
      title: "Update POPIA privacy notice",
      description: "Align with new data retention schedule.",
      assignee: "Lerato Mokoena",
      department: "Administration",
      dueDate: iso(6),
      priority: "Low",
      status: "Not Started",
    },
    {
      id: "t7",
      title: "Archive 2025 supplier contracts",
      description: "Scan, index and file in the document tracker.",
      assignee: "Naledi Khumalo",
      department: "Finance",
      dueDate: iso(-8),
      priority: "Low",
      status: "Completed",
    },
    {
      id: "t8",
      title: "Quarterly staff survey results",
      description: "Summarise responses and share with managers.",
      assignee: "Ayesha Patel",
      department: "Human Resources",
      dueDate: iso(-2),
      priority: "Medium",
      status: "Completed",
    },
    {
      id: "t9",
      title: "Test generator and UPS backup",
      description: "Load-shedding readiness check for Stage 4.",
      assignee: "Thabo Dlamini",
      department: "Facilities",
      dueDate: iso(4),
      priority: "High",
      status: "Not Started",
    },
  ];
}

export function seedMeetings(): Meeting[] {
  return [
    {
      id: "m1",
      title: "Weekly operations stand-up",
      date: iso(0),
      time: "09:30",
      location: "Boardroom A",
      attendees: ["Sphokuhle Mvumvu", "Thabo Dlamini", "Naledi Khumalo"],
      agenda: "1. Open items\n2. Facilities update\n3. Budget spend",
      notes: "",
      minutes: "",
      actionItems: [],
    },
    {
      id: "m2",
      title: "Payroll review with Finance",
      date: iso(1),
      time: "14:00",
      location: "Microsoft Teams",
      attendees: ["Naledi Khumalo", "Ayesha Patel"],
      agenda: "Confirm August payroll and overtime claims.",
      notes: "",
      minutes: "",
      actionItems: [],
    },
    {
      id: "m3",
      title: "Board meeting",
      date: iso(3),
      time: "10:00",
      location: "Boardroom B, 4th floor",
      attendees: ["Sphokuhle Mvumvu", "Lerato Mokoena", "Naledi Khumalo", "Ayesha Patel"],
      agenda: "Quarterly performance, compliance register, capex requests.",
      notes: "Board pack must be circulated 48 hours in advance.",
      minutes: "",
      actionItems: [],
      followUp: iso(10),
    },
    {
      id: "m4",
      title: "Supplier negotiation – Waltons",
      date: iso(-4),
      time: "11:00",
      location: "Boardroom A",
      attendees: ["Sphokuhle Mvumvu", "Naledi Khumalo"],
      agenda: "Stationery pricing for the new financial year.",
      notes: "",
      minutes:
        "Agreed 8% discount on bulk paper orders. Contract addendum to be signed before month end.",
      actionItems: [
        { id: "a1", what: "Sign contract addendum", owner: "Naledi Khumalo", dueDate: iso(2), done: false },
        { id: "a2", what: "Update supplier record", owner: "Sphokuhle Mvumvu", dueDate: iso(-1), done: true },
      ],
      followUp: iso(20),
    },
  ];
}

export function seedDocuments(): DocRecord[] {
  return [
    {
      id: "d1",
      name: "Fire compliance certificate",
      category: "Compliance documents",
      department: "Facilities",
      owner: "Thabo Dlamini",
      created: iso(-350),
      expiry: iso(5),
      status: "Active",
      notes: "Municipal inspection required before renewal.",
      file: "fire-compliance-2025.pdf",
    },
    {
      id: "d2",
      name: "Cleaning services contract – Sparkle Co",
      category: "Contracts",
      department: "Facilities",
      owner: "Sphokuhle Mvumvu",
      created: iso(-300),
      expiry: iso(24),
      status: "Active",
      notes: "Auto-renews unless cancelled 30 days prior.",
    },
    {
      id: "d3",
      name: "Tax clearance certificate",
      category: "Certificates",
      department: "Finance",
      owner: "Naledi Khumalo",
      created: iso(-200),
      expiry: iso(-6),
      status: "Under review",
      notes: "Expired – reapply on SARS eFiling.",
    },
    {
      id: "d4",
      name: "POPIA data protection policy",
      category: "Policies",
      department: "Administration",
      owner: "Lerato Mokoena",
      created: iso(-120),
      expiry: iso(220),
      status: "Active",
      notes: "Annual review scheduled.",
    },
    {
      id: "d5",
      name: "Employment contract – A. Patel",
      category: "Employee documents",
      department: "Human Resources",
      owner: "Ayesha Patel",
      created: iso(-420),
      expiry: iso(300),
      status: "Active",
      notes: "",
    },
    {
      id: "d6",
      name: "Business licence renewal",
      category: "Licences",
      department: "Administration",
      owner: "Sphokuhle Mvumvu",
      created: iso(-330),
      expiry: iso(28),
      status: "Active",
      notes: "Submit renewal to the city 14 days before expiry.",
    },
    {
      id: "d7",
      name: "Waltons supplier agreement",
      category: "Supplier documents",
      department: "Finance",
      owner: "Naledi Khumalo",
      created: iso(-90),
      expiry: iso(180),
      status: "Active",
      notes: "8% bulk discount addendum pending signature.",
    },
    {
      id: "d8",
      name: "Annual financial statements 2025",
      category: "Financial documents",
      department: "Finance",
      owner: "Naledi Khumalo",
      created: iso(-150),
      expiry: iso(600),
      status: "Archived",
      notes: "",
    },
  ];
}

export function seedVisitors(): Visitor[] {
  return [
    {
      id: "v1",
      name: "Sizwe Ndlovu",
      company: "Ndlovu IT Solutions",
      phone: "082 445 1123",
      host: "Thabo Dlamini",
      purpose: "Network cabinet maintenance",
      arrival: `${iso(0)}T08:45`,
      status: "On site",
    },
    {
      id: "v2",
      name: "Michelle van Wyk",
      company: "Waltons",
      phone: "071 220 8890",
      host: "Sphokuhle Mvumvu",
      purpose: "Stationery quotation",
      arrival: `${iso(0)}T11:15`,
      status: "Expected",
    },
    {
      id: "v3",
      name: "Kagiso Molefe",
      company: "Sparkle Co",
      phone: "063 998 4410",
      host: "Thabo Dlamini",
      purpose: "Monthly cleaning inspection",
      arrival: `${iso(-1)}T09:00`,
      departure: `${iso(-1)}T10:20`,
      status: "Checked out",
    },
    {
      id: "v4",
      name: "Rethabile Sithole",
      company: "Standard Bank",
      phone: "084 112 7788",
      host: "Naledi Khumalo",
      purpose: "Business account review",
      arrival: `${iso(-2)}T13:30`,
      departure: `${iso(-2)}T14:45`,
      status: "Checked out",
    },
  ];
}

export function seedLeave(): LeaveRequest[] {
  return [
    {
      id: "l1",
      employee: "Thabo Dlamini",
      department: "Facilities",
      type: "Annual leave",
      start: iso(9),
      end: iso(16),
      reason: "Family holiday in Durban.",
      status: "Pending",
    },
    {
      id: "l2",
      employee: "Ayesha Patel",
      department: "Human Resources",
      type: "Sick leave",
      start: iso(-1),
      end: iso(0),
      reason: "Flu – medical certificate attached.",
      document: "medical-certificate.pdf",
      status: "Pending",
    },
    {
      id: "l3",
      employee: "Naledi Khumalo",
      department: "Finance",
      type: "Family responsibility leave",
      start: iso(-12),
      end: iso(-11),
      reason: "Child hospitalised.",
      status: "Approved",
    },
    {
      id: "l4",
      employee: "Lerato Mokoena",
      department: "Administration",
      type: "Unpaid leave",
      start: iso(-30),
      end: iso(-25),
      reason: "Personal matters.",
      status: "Rejected",
      note: "Peak audit period – reapply for September.",
    },
  ];
}

export function seedSupplies(): Supply[] {
  return [
    { id: "s1", name: "Printer paper A4 (80gsm)", category: "Paper", quantity: 6, minimum: 15, supplier: "Waltons", lastOrder: iso(-38), unit: "reams" },
    { id: "s2", name: "Ballpoint pens (blue)", category: "Stationery", quantity: 120, minimum: 50, supplier: "Waltons", lastOrder: iso(-20), unit: "units" },
    { id: "s3", name: "A5 notebooks", category: "Stationery", quantity: 18, minimum: 20, supplier: "PNA", lastOrder: iso(-60), unit: "units" },
    { id: "s4", name: "Toner Ricoh MP C307 (black)", category: "Printing", quantity: 1, minimum: 3, supplier: "Ricoh SA", lastOrder: iso(-75), unit: "cartridges" },
    { id: "s5", name: "Lever arch folders", category: "Filing", quantity: 34, minimum: 15, supplier: "Waltons", lastOrder: iso(-45), unit: "units" },
    { id: "s6", name: "DL envelopes", category: "Filing", quantity: 400, minimum: 200, supplier: "PNA", lastOrder: iso(-30), unit: "units" },
    { id: "s7", name: "USB-C docking cables", category: "Computer accessories", quantity: 4, minimum: 5, supplier: "Ndlovu IT Solutions", lastOrder: iso(-90), unit: "units" },
    { id: "s8", name: "Handwash refills", category: "Cleaning supplies", quantity: 12, minimum: 6, supplier: "Sparkle Co", lastOrder: iso(-15), unit: "bottles" },
  ];
}

export function seedContacts(): Contact[] {
  return [
    { id: "c1", name: "Sphokuhle Mvumvu", kind: "Employee", department: "Administration", position: "Office Administrator", email: "sphokuhle@adminflow.co.za", phone: "011 555 0101", extension: "101", location: "3rd floor, Desk 12" },
    { id: "c2", name: "Naledi Khumalo", kind: "Employee", department: "Finance", position: "Finance Manager", email: "naledi@adminflow.co.za", phone: "011 555 0110", extension: "110", location: "4th floor" },
    { id: "c3", name: "Ayesha Patel", kind: "Employee", department: "Human Resources", position: "HR Officer", email: "ayesha@adminflow.co.za", phone: "011 555 0125", extension: "125", location: "2nd floor" },
    { id: "c4", name: "Thabo Dlamini", kind: "Employee", department: "Facilities", position: "Facilities Supervisor", email: "thabo@adminflow.co.za", phone: "011 555 0133", extension: "133", location: "Ground floor" },
    { id: "c5", name: "Lerato Mokoena", kind: "Employee", department: "Administration", position: "Compliance Officer", email: "lerato@adminflow.co.za", phone: "011 555 0142", extension: "142", location: "3rd floor" },
    { id: "c6", name: "Michelle van Wyk", kind: "Supplier", department: "Stationery", position: "Account Manager – Waltons", email: "michelle@waltons.co.za", phone: "071 220 8890", location: "Midrand" },
    { id: "c7", name: "Sizwe Ndlovu", kind: "Supplier", department: "IT", position: "Owner – Ndlovu IT Solutions", email: "sizwe@ndlovuit.co.za", phone: "082 445 1123", location: "Sandton" },
    { id: "c8", name: "Rethabile Sithole", kind: "External", department: "Banking", position: "Business Banker – Standard Bank", email: "r.sithole@standardbank.co.za", phone: "084 112 7788", location: "Rosebank" },
  ];
}

export function seedAudit(): AuditEntry[] {
  return [
    { id: "au1", at: `${iso(0)}T08:12`, actor: "Sphokuhle Mvumvu", action: "Signed in", target: "AdminFlow" },
    { id: "au2", at: `${iso(0)}T08:20`, actor: "Sphokuhle Mvumvu", action: "Updated task status", target: "Submit VAT return to SARS" },
    { id: "au3", at: `${iso(-1)}T16:04`, actor: "Ayesha Patel", action: "Submitted leave request", target: "Sick leave" },
    { id: "au4", at: `${iso(-1)}T10:22`, actor: "Thabo Dlamini", action: "Checked out visitor", target: "Kagiso Molefe" },
  ];
}
