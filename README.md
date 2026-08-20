# AdminFlow

> **Simplify Work. Stay Organised.**

AdminFlow is a professional workplace administration management application designed for offices, small businesses, NGOs, schools and corporate departments. It brings everyday administrative tasks — tasks, meetings, documents, visitors, leave, supplies and contacts — into one clean, modern dashboard.

![AdminFlow](https://adminflow-hub-70.lovable.app)

## Features

- **Dashboard** — Personalised greeting, summary cards, today's priorities, upcoming activities and urgent alerts.
- **Task Management** — Create, assign, prioritise and track tasks with statuses: *Not Started → In Progress → Completed → Overdue*.
- **Meeting Management** — Schedule meetings, build agendas, record minutes and assign action items with a calendar view.
- **Document Tracker** — Track contracts, policies, certificates, licences and more with automatic expiry warnings.
- **Visitor Management** — Digital visitor register with check-in / check-out and searchable history.
- **Leave Requests** — Employees submit leave; managers and administrators approve, reject or request more information.
- **Office Supplies Inventory** — Track stock levels with automatic low-stock alerts.
- **Contact Directory** — Searchable employee, supplier and external contact records.
- **Reports** — Filterable reports with CSV/Excel export and print-to-PDF support.
- **Analytics** — Visual dashboards showing task completion, departmental workload, supply levels and meeting trends.
- **AI Assistant** — Smart email generator, meeting-notes summariser and AI task planner/scheduler.
- **Role-Based Access** — Administrator, Manager and Employee roles with scoped permissions.
- **Audit Trail** — Track important changes across the system.
- **Responsive Design** — Works beautifully on desktop and mobile, including a mobile bottom navigation bar.

## Tech Stack

- [TanStack Start](https://tanstack.com/start) — Full-stack React framework
- [React 19](https://react.dev) — UI library
- [TypeScript](https://www.typescriptlang.org) — Type-safe development
- [Tailwind CSS v4](https://tailwindcss.com) — Utility-first styling
- [shadcn/ui](https://ui.shadcn.com) — Accessible UI components
- [Recharts](https://recharts.org) — Charts and data visualisation
- [TanStack Query](https://tanstack.com/query) — Server-state management
- [Lovable AI Gateway](https://docs.lovable.dev/features/cloud) — AI-powered assistant features

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) (v20 or later recommended)
- [Bun](https://bun.sh) or npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd adminflow

# Install dependencies
bun install
# or
npm install
```

### Development

```bash
bun run dev
# or
npm run dev
```

The app will be available at `http://localhost:8080`.

### Build

```bash
bun run build
# or
npm run build
```

## Project Structure

```text
src/
  components/adminflow/   # Shared AdminFlow UI components
  lib/adminflow/          # State management, types and seed data
  lib/ai*.ts              # AI assistant server functions and gateway config
  routes/                 # TanStack Start file-based routes
  styles.css              # Global theme and design tokens
```

## AI Features

The AI assistant uses the Lovable AI Gateway with `google/gemini-3.7-flash`. Three tools are included:

1. **Smart Email Generator** — Draft workplace emails from a purpose, recipient and tone.
2. **Meeting Notes Summariser** — Turn raw notes into structured minutes with decisions and action items.
3. **AI Task Planner** — Convert a goal and deadline into scheduled tasks that can be added directly to task management.

> **Responsible AI disclaimer:** AI-generated content should always be reviewed for accuracy, tone and confidentiality before being shared or acted upon. Do not enter sensitive personal or workplace information into the AI assistant.

## Deployment

This project is built with Lovable and can be deployed directly from the Lovable editor, or synced to GitHub for CI/CD with your preferred hosting platform.

## License

This project is proprietary software created for workplace administration use.

---

Built with ❤️ using [Lovable](https://lovable.dev).
