import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import {
  seedAudit,
  seedContacts,
  seedDocuments,
  seedLeave,
  seedMeetings,
  seedSupplies,
  seedTasks,
  seedVisitors,
} from "./data";
import type {
  AuditEntry,
  Contact,
  DocRecord,
  LeaveRequest,
  Meeting,
  NotificationPrefs,
  Role,
  Supply,
  Task,
  Visitor,
} from "./types";

export interface CurrentUser {
  name: string;
  role: Role;
  department: string;
  initials: string;
}

const USERS: Record<Role, CurrentUser> = {
  Administrator: {
    name: "Sphokuhle Mvumvu",
    role: "Administrator",
    department: "Administration",
    initials: "SM",
  },
  Manager: {
    name: "Naledi Khumalo",
    role: "Manager",
    department: "Finance",
    initials: "NK",
  },
  Employee: {
    name: "Thabo Dlamini",
    role: "Employee",
    department: "Facilities",
    initials: "TD",
  },
};

interface State {
  tasks: Task[];
  meetings: Meeting[];
  documents: DocRecord[];
  visitors: Visitor[];
  leave: LeaveRequest[];
  supplies: Supply[];
  contacts: Contact[];
  audit: AuditEntry[];
  prefs: NotificationPrefs;
  role: Role;
}

interface Store extends State {
  user: CurrentUser;
  can: (capability: Capability) => boolean;
  setRole: (role: Role) => void;
  setPrefs: (prefs: NotificationPrefs) => void;
  saveTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  saveMeeting: (meeting: Meeting) => void;
  deleteMeeting: (id: string) => void;
  saveDocument: (doc: DocRecord) => void;
  deleteDocument: (id: string) => void;
  saveVisitor: (visitor: Visitor) => void;
  checkIn: (id: string) => void;
  checkOut: (id: string) => void;
  saveLeave: (request: LeaveRequest) => void;
  setLeaveStatus: (id: string, status: LeaveRequest["status"], note?: string) => void;
  saveSupply: (supply: Supply) => void;
  deleteSupply: (id: string) => void;
  adjustSupply: (id: string, delta: number) => void;
  saveContact: (contact: Contact) => void;
  deleteContact: (id: string) => void;
}

export type Capability =
  | "manage.tasks"
  | "manage.meetings"
  | "manage.documents"
  | "manage.visitors"
  | "approve.leave"
  | "manage.supplies"
  | "manage.contacts"
  | "view.reports"
  | "view.audit";

const MATRIX: Record<Role, Capability[]> = {
  Administrator: [
    "manage.tasks",
    "manage.meetings",
    "manage.documents",
    "manage.visitors",
    "approve.leave",
    "manage.supplies",
    "manage.contacts",
    "view.reports",
    "view.audit",
  ],
  Manager: [
    "manage.tasks",
    "manage.meetings",
    "approve.leave",
    "manage.supplies",
    "view.reports",
  ],
  Employee: [],
};

const StoreContext = createContext<Store | null>(null);

const STORAGE_KEY = "adminflow.state.v1";

function initialState(): State {
  return {
    tasks: seedTasks(),
    meetings: seedMeetings(),
    documents: seedDocuments(),
    visitors: seedVisitors(),
    leave: seedLeave(),
    supplies: seedSupplies(),
    contacts: seedContacts(),
    audit: seedAudit(),
    prefs: {
      meetings: true,
      overdueTasks: true,
      documents: true,
      leave: true,
      supplies: true,
      deadlines: false,
    },
    role: "Administrator",
  };
}

export function id(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function nowStamp() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(() => initialState());

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState((prev) => ({ ...prev, ...(JSON.parse(raw) as State) }));
    } catch {
      /* ignore corrupt state */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable */
    }
  }, [state]);

  const user = USERS[state.role];

  const log = useCallback(
    (action: string, target: string) =>
      setState((prev) => ({
        ...prev,
        audit: [
          { id: id("au"), at: nowStamp(), actor: USERS[prev.role].name, action, target },
          ...prev.audit,
        ].slice(0, 60),
      })),
    [],
  );

  const upsert = useCallback(
    <K extends keyof State>(key: K, item: { id: string }, label: string) => {
      setState((prev) => {
        const list = prev[key] as unknown as { id: string }[];
        const exists = list.some((x) => x.id === item.id);
        return {
          ...prev,
          [key]: exists ? list.map((x) => (x.id === item.id ? item : x)) : [item, ...list],
        } as State;
      });
      toast.success(`${label} saved`);
    },
    [],
  );

  const remove = useCallback(<K extends keyof State>(key: K, itemId: string, label: string) => {
    setState((prev) => ({
      ...prev,
      [key]: (prev[key] as unknown as { id: string }[]).filter((x) => x.id !== itemId),
    }) as State);
    toast.success(`${label} deleted`);
  }, []);

  const value = useMemo<Store>(
    () => ({
      ...state,
      user,
      can: (capability) => MATRIX[state.role].includes(capability),
      setRole: (role) => setState((prev) => ({ ...prev, role })),
      setPrefs: (prefs) => setState((prev) => ({ ...prev, prefs })),
      saveTask: (task) => {
        upsert("tasks", task, "Task");
        log("Saved task", task.title);
      },
      deleteTask: (taskId) => remove("tasks", taskId, "Task"),
      saveMeeting: (meeting) => {
        upsert("meetings", meeting, "Meeting");
        log("Saved meeting", meeting.title);
      },
      deleteMeeting: (meetingId) => remove("meetings", meetingId, "Meeting"),
      saveDocument: (doc) => {
        upsert("documents", doc, "Document");
        log("Saved document", doc.name);
      },
      deleteDocument: (docId) => remove("documents", docId, "Document"),
      saveVisitor: (visitor) => {
        upsert("visitors", visitor, "Visitor");
        log("Registered visitor", visitor.name);
      },
      checkIn: (visitorId) => {
        setState((prev) => ({
          ...prev,
          visitors: prev.visitors.map((v) =>
            v.id === visitorId ? { ...v, status: "On site", arrival: nowStamp() } : v,
          ),
        }));
        toast.success("Visitor checked in");
      },
      checkOut: (visitorId) => {
        setState((prev) => ({
          ...prev,
          visitors: prev.visitors.map((v) =>
            v.id === visitorId ? { ...v, status: "Checked out", departure: nowStamp() } : v,
          ),
        }));
        toast.success("Visitor checked out");
      },
      saveLeave: (request) => {
        upsert("leave", request, "Leave request");
        log("Submitted leave request", `${request.employee} – ${request.type}`);
      },
      setLeaveStatus: (leaveId, status, note) => {
        setState((prev) => ({
          ...prev,
          leave: prev.leave.map((l) => (l.id === leaveId ? { ...l, status, note } : l)),
        }));
        toast.success(`Leave request ${status.toLowerCase()}`, {
          description: "The employee has been notified by email.",
        });
        log("Changed leave status", status);
      },
      saveSupply: (supply) => {
        upsert("supplies", supply, "Supply item");
        log("Saved supply item", supply.name);
      },
      deleteSupply: (supplyId) => remove("supplies", supplyId, "Supply item"),
      adjustSupply: (supplyId, delta) =>
        setState((prev) => ({
          ...prev,
          supplies: prev.supplies.map((s) =>
            s.id === supplyId ? { ...s, quantity: Math.max(0, s.quantity + delta) } : s,
          ),
        })),
      saveContact: (contact) => {
        upsert("contacts", contact, "Contact");
        log("Saved contact", contact.name);
      },
      deleteContact: (contactId) => remove("contacts", contactId, "Contact"),
    }),
    [state, user, upsert, remove, log],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export function daysUntil(date: string) {
  const target = new Date(`${date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export function expiryLabel(date: string) {
  const d = daysUntil(date);
  if (d < 0) return { label: "Expired", tone: "danger" as const };
  if (d <= 7) return { label: `Expires in ${d} day${d === 1 ? "" : "s"}`, tone: "danger" as const };
  if (d <= 30) return { label: `Expires in ${d} days`, tone: "warning" as const };
  return { label: `Valid until ${date}`, tone: "ok" as const };
}

export function effectiveStatus(task: Task): Task["status"] {
  if (task.status === "Completed") return "Completed";
  return daysUntil(task.dueDate) < 0 ? "Overdue" : task.status;
}
