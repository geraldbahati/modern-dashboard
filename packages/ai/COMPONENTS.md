# UI Components Guide

This document details all the React components needed to display AI tool results in the dashboard.

## 📋 Overview

The AI package uses **30 tools** that return structured data. Each tool needs corresponding UI components to display results beautifully. Components should be created in:

```
packages/ui/src/components/ai-generated/
```

## 🎨 Component Architecture

### Component Structure

```typescript
// packages/ui/src/components/ai-generated/[component-name].tsx

interface [Component]Props {
  data: [DataType];
  onAction?: (action: string, id: string) => void;
}

export function [Component]({ data, onAction }: [Component]Props) {
  // Render beautiful UI
}
```

### Export Pattern

```typescript
// packages/ui/src/components/ai-generated/index.ts
export * from "./users-list";
export * from "./user-details";
// ... etc
```

---

## 👥 User Management Components

### 1. UsersList

**File**: `users-list.tsx`

**Used by**: `listUsers` tool

**Props**:
```typescript
interface UsersListProps {
  users: Array<{
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    role: string | null;
    banned: boolean | null;
    twoFactorEnabled: boolean | null;
    createdAt: Date;
  }>;
  total?: number;
  onUserClick?: (userId: string) => void;
}
```

**Features**:
- Table view with sortable columns
- User avatar with fallback initials
- Status badges (verified, banned, 2FA enabled)
- Role tags with colors
- Click to view details
- Pagination controls

**Design Inspiration**:
```
┌─────────────────────────────────────────────────────────┐
│ Users                                     [50 users]     │
├─────────────────────────────────────────────────────────┤
│ Avatar | Name          | Email           | Role | Status│
├─────────────────────────────────────────────────────────┤
│   JD   │ John Doe      │ john@ex.com     │ ●    │ ✓ ✓ │
│   JS   │ Jane Smith    │ jane@ex.com     │ ●    │ ✓   │
│   BD   │ Bob Davis     │ bob@ex.com      │ ●    │ ✗   │
└─────────────────────────────────────────────────────────┘
Legend: ● = Role badge, ✓ = Verified/2FA, ✗ = Banned
```

---

### 2. UserDetails

**File**: `user-details.tsx`

**Used by**: `getUserById` tool

**Props**:
```typescript
interface UserDetailsProps {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    role: string | null;
    banned: boolean | null;
    banReason: string | null;
    twoFactorEnabled: boolean | null;
    createdAt: Date;
    updatedAt: Date;
  };
  stats?: {
    totalProjects: number;
    totalTasks: number;
    completedTasks: number;
    organizations: number;
  };
}
```

**Features**:
- Large avatar/profile picture
- Detailed user information
- Status indicators
- Activity stats
- Member since date
- Quick actions (Edit, Ban, Delete)

---

### 3. UserCreated

**File**: `user-created.tsx`

**Used by**: `createUser` tool

**Props**:
```typescript
interface UserCreatedProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
  success: boolean;
}
```

**Features**:
- Success message with checkmark
- User details summary
- Next steps suggestions
- Link to view user profile

---

### 4. UserUpdated

**File**: `user-updated.tsx`

**Used by**: `updateUser`, `updateUserRole` tools

**Props**:
```typescript
interface UserUpdatedProps {
  userId: string;
  changes: Record<string, any>;
  success: boolean;
}
```

**Features**:
- Success confirmation
- Changed fields highlight
- Before/after comparison
- Undo option (optional)

---

### 5. UserDeleted

**File**: `user-deleted.tsx`

**Used by**: `deleteUser` tool

**Props**:
```typescript
interface UserDeletedProps {
  userId: string;
  permanent: boolean;
  success: boolean;
}
```

**Features**:
- Deletion confirmation
- Permanent vs soft delete indicator
- Restore option (if soft delete)

---

## 📊 Project Management Components

### 6. ProjectsGrid

**File**: `projects-grid.tsx`

**Used by**: `listProjects` tool

**Props**:
```typescript
interface ProjectsGridProps {
  projects: Array<{
    id: string;
    name: string;
    description: string | null;
    slug: string;
    imageUrl: string | null;
    status: "active" | "archived" | "deleted";
    isPublic: boolean;
    createdAt: Date;
  }>;
  total?: number;
  onProjectClick?: (projectId: string) => void;
}
```

**Features**:
- Grid layout (3 columns on desktop, 1 on mobile)
- Project card with image/icon
- Status badge (active, archived)
- Public/private indicator
- Progress bar (optional, if stats available)
- Click to view details

**Design Inspiration**:
```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ [Image]      │ │ [Image]      │ │ [Image]      │
│ Project Name │ │ Project Name │ │ Project Name │
│ Description  │ │ Description  │ │ Description  │
│ ■■■■■□□□□□   │ │ ■■■■■■■■□□   │ │ ■■■■■■■■■■   │
│ 50% Complete │ │ 80% Complete │ │ 100% Done    │
│ [●Active] 🔓 │ │ [●Active] 🔒 │ │ [✓Done]  🔓  │
└──────────────┘ └──────────────┘ └──────────────┘
```

---

### 7. ProjectDetails

**File**: `project-details.tsx`

**Used by**: `getProjectById` tool

**Props**:
```typescript
interface ProjectDetailsProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    slug: string;
    imageUrl: string | null;
    ownerId: string;
    status: string;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  tasks?: Array<any>; // Optional related tasks
}
```

**Features**:
- Hero section with large image
- Project metadata
- Owner information
- Related tasks list
- Quick actions (Edit, Archive, Delete)

---

### 8. ProjectStats

**File**: `project-stats.tsx`

**Used by**: `getProjectStats` tool

**Props**:
```typescript
interface ProjectStatsProps {
  stats: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    todoTasks: number;
    completionRate: number;
    overdueTasks: number;
  };
  projectName?: string;
}
```

**Features**:
- Large stat cards (4-column grid)
- Completion rate progress circle
- Task breakdown chart (pie or donut)
- Overdue tasks alert (if any)
- Trend indicators (up/down arrows)

**Design Inspiration**:
```
┌─────────────────────────────────────────────────┐
│ Project: Website Redesign                       │
├──────────────┬──────────────┬──────────────────┤
│ Total Tasks  │ Completed    │ In Progress      │
│    45        │    30        │     10           │
├──────────────┴──────────────┴──────────────────┤
│ Completion Rate:  66% ◐                         │
│ Overdue Tasks:     5  ⚠️                         │
└─────────────────────────────────────────────────┘
```

---

### 9. ProjectCreated

**File**: `project-created.tsx`

**Used by**: `createProject` tool

---

### 10. ProjectUpdated

**File**: `project-updated.tsx`

**Used by**: `updateProject` tool

---

### 11. ProjectArchived

**File**: `project-archived.tsx`

**Used by**: `archiveProject` tool

---

### 12. ProjectDeleted

**File**: `project-deleted.tsx`

**Used by**: `deleteProject` tool

---

## ✅ Task Management Components

### 13. TasksList

**File**: `tasks-list.tsx`

**Used by**: `listTasks` tool

**Props**:
```typescript
interface TasksListProps {
  tasks: Array<{
    id: string;
    title: string;
    description: string | null;
    projectId: string;
    assigneeId: string | null;
    status: "todo" | "in_progress" | "done";
    priority: number; // 0=low, 1=medium, 2=high
    dueDate: Date | null;
    createdAt: Date;
  }>;
  groupBy?: "status" | "priority" | "project" | "assignee";
  onTaskClick?: (taskId: string) => void;
}
```

**Features**:
- Kanban board view OR list view (toggle)
- Status columns (Todo, In Progress, Done)
- Priority indicators (colored flags/dots)
- Assignee avatars
- Due date with overdue warning
- Drag-and-drop reordering (optional)
- Filter and sort options

**Design Inspiration (Kanban)**:
```
┌──────────────┬──────────────┬──────────────┐
│ 📋 Todo (10) │ 🔄 Progress  │ ✅ Done (20) │
│              │      (5)     │              │
├──────────────┼──────────────┼──────────────┤
│ ┌──────────┐ │ ┌──────────┐ │ ┌──────────┐ │
│ │🔴 Task 1 │ │ │🟡 Task 4 │ │ │Task 7    │ │
│ │[@user]   │ │ │[@user]   │ │ │[@user]   │ │
│ │📅 Today  │ │ │📅 Tomorrow│ │ │✓Complete │ │
│ └──────────┘ │ └──────────┘ │ └──────────┘ │
│ ┌──────────┐ │ ┌──────────┐ │ ┌──────────┐ │
│ │🟢 Task 2 │ │ │🔴 Task 5 │ │ │Task 8    │ │
│ └──────────┘ │ └──────────┘ │ └──────────┘ │
└──────────────┴──────────────┴──────────────┘
```

---

### 14. TaskDetails

**File**: `task-details.tsx`

**Used by**: `getTaskById` tool

**Props**:
```typescript
interface TaskDetailsProps {
  task: {
    id: string;
    title: string;
    description: string | null;
    projectId: string;
    assigneeId: string | null;
    status: string;
    priority: number;
    dueDate: Date | null;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  };
  project?: { name: string; slug: string };
  assignee?: { name: string; image: string | null };
}
```

**Features**:
- Task header with status
- Full description
- Priority indicator
- Assignee card
- Project link
- Due date countdown
- Activity timeline
- Quick actions (Edit, Complete, Delete)

---

### 15. TaskCreated

**File**: `task-created.tsx`

**Used by**: `createTask` tool

---

### 16. TaskUpdated

**File**: `task-updated.tsx`

**Used by**: `updateTask` tool

---

### 17. TaskAssigned

**File**: `task-assigned.tsx`

**Used by**: `assignTask` tool

---

### 18. TaskCompleted

**File**: `task-completed.tsx`

**Used by**: `completeTask` tool

**Features**:
- Celebration animation/confetti (optional)
- Completion timestamp
- Time to complete
- Next task suggestion

---

### 19. TaskStatusChanged

**File**: `task-status-changed.tsx`

**Used by**: `changeTaskStatus` tool

---

### 20. TaskDeleted

**File**: `task-deleted.tsx`

**Used by**: `deleteTask` tool

---

## 🏢 Organization Management Components

### 21. OrganizationsList

**File**: `organizations-list.tsx`

**Used by**: `listOrganizations` tool

**Props**:
```typescript
interface OrganizationsListProps {
  organizations: Array<{
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    memberCount?: number;
    projectCount?: number;
    createdAt: Date;
  }>;
  onOrgClick?: (orgId: string) => void;
}
```

**Features**:
- Grid or list view
- Organization logo/avatar
- Member count badge
- Project count badge
- Created date
- Click to view details

---

### 22. OrganizationDetails

**File**: `organization-details.tsx`

**Used by**: `getOrganizationById` tool

---

### 23. OrganizationCreated

**File**: `organization-created.tsx`

**Used by**: `createOrganization` tool

---

### 24. OrganizationUpdated

**File**: `organization-updated.tsx`

**Used by**: `updateOrganization` tool

---

### 25. MemberAdded

**File**: `member-added.tsx`

**Used by**: `addMember` tool

---

### 26. MemberRemoved

**File**: `member-removed.tsx`

**Used by**: `removeMember` tool

---

### 27. MemberInvited

**File**: `member-invited.tsx`

**Used by**: `inviteMember` tool

**Features**:
- Success confirmation
- Invitation details (email, role)
- Invitation link (copy button)
- Expiration date
- Resend option

---

### 28. OrganizationDeleted

**File**: `organization-deleted.tsx`

**Used by**: `deleteOrganization` tool

---

## 📝 Quick Tasks Components

### 29. QuickTasksList

**File**: `quick-tasks-list.tsx`

**Used by**: `listQuickTasks` tool

**Props**:
```typescript
interface QuickTasksListProps {
  tasks: Array<{
    id: string;
    text: string;
    completed: boolean;
    createdAt: Date;
  }>;
  onToggle?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
}
```

**Features**:
- Simple checklist style
- Checkbox to toggle completion
- Strikethrough for completed
- Delete button (hover)
- Add new quick task inline

**Design Inspiration**:
```
┌──────────────────────────────────────┐
│ Quick Tasks                    [+ New]│
├──────────────────────────────────────┤
│ ☐ Buy milk                        [×]│
│ ☑ Call dentist                    [×]│
│ ☐ Review pull request             [×]│
│ ☐ Update documentation            [×]│
└──────────────────────────────────────┘
```

---

### 30. QuickTaskCreated

**File**: `quick-task-created.tsx`

**Used by**: `createQuickTask` tool

---

### 31. QuickTaskUpdated

**File**: `quick-task-updated.tsx`

**Used by**: `updateQuickTask` tool

---

### 32. QuickTaskToggled

**File**: `quick-task-toggled.tsx`

**Used by**: `toggleQuickTask` tool

---

### 33. QuickTaskDeleted

**File**: `quick-task-deleted.tsx`

**Used by**: `deleteQuickTask` tool

---

## 📈 Analytics Components

### 34. DashboardOverview

**File**: `dashboard-overview.tsx`

**Used by**: `getDashboardOverview` tool

**Props**:
```typescript
interface DashboardOverviewProps {
  stats: {
    totalUsers: number;
    totalProjects: number;
    totalTasks: number;
    completedTasks: number;
    activeMembers: number;
    completionRate: number;
    trends: {
      users: number; // % change
      projects: number;
      tasks: number;
    };
  };
  period: string;
}
```

**Features**:
- 4-6 large stat cards
- Trend indicators (↑↓ with percentages)
- Sparkline charts (mini line charts)
- Color coding (green for positive, red for negative)
- Period selector

**Design Inspiration**:
```
┌────────────────────────────────────────────────────┐
│ Dashboard Overview (Last 30 days)                  │
├──────────────┬──────────────┬──────────────────────┤
│ Users        │ Projects     │ Tasks                │
│ 1,234  ↑15% │ 45    ↑8%   │ 567   ↓3%           │
│ [sparkline]  │ [sparkline]  │ [sparkline]          │
├──────────────┼──────────────┼──────────────────────┤
│ Completed    │ Active       │ Completion           │
│ 423    ↑25% │ 89    ↑12%  │ 75%   ↑5%           │
│ [sparkline]  │ [sparkline]  │ [progress bar]       │
└──────────────┴──────────────┴──────────────────────┘
```

---

### 35. UserAnalytics

**File**: `user-analytics.tsx`

**Used by**: `getUserAnalytics` tool

**Props**:
```typescript
interface UserAnalyticsProps {
  analytics: {
    tasksCreated: number;
    tasksCompleted: number;
    projectsOwned: number;
    organizationsMember: number;
    activityScore: number;
    completionRate: number;
  };
  userName?: string;
  period: string;
}
```

**Features**:
- User profile header
- Key metrics grid
- Activity score gauge
- Completion rate chart
- Recent activity timeline

---

### 36. ProjectAnalytics

**File**: `project-analytics.tsx`

**Used by**: `getProjectAnalytics` tool

**Props**:
```typescript
interface ProjectAnalyticsProps {
  analytics: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    todoTasks: number;
    completionRate: number;
    velocity: number; // tasks/week
    averageCompletionTime: number; // hours
    overduePercentage: number;
  };
  projectName?: string;
  period: string;
}
```

**Features**:
- Task distribution pie chart
- Velocity trend line chart
- Completion time stats
- Overdue tasks alert
- Team contribution breakdown

---

### 37. TaskDistribution

**File**: `task-distribution.tsx`

**Used by**: `getTaskDistribution` tool

**Props**:
```typescript
interface TaskDistributionProps {
  distribution: {
    byStatus: { status: string; count: number }[];
    byPriority: { priority: string; count: number }[];
    byAssignee?: { assignee: string; count: number }[];
    byProject?: { project: string; count: number }[];
  };
}
```

**Features**:
- Multiple chart types (pie, bar, donut)
- Tabbed view for different distributions
- Interactive tooltips
- Legend with percentages

---

### 38. OverdueTasks

**File**: `overdue-tasks.tsx`

**Used by**: `getOverdueTasks` tool

**Props**:
```typescript
interface OverdueTasksProps {
  tasks: Array<{
    id: string;
    title: string;
    projectId: string;
    projectName?: string;
    assigneeId: string | null;
    assigneeName?: string;
    dueDate: Date;
    daysOverdue: number;
  }>;
}
```

**Features**:
- Urgent list with red highlights
- Days overdue counter
- Sort by most overdue first
- Project grouping
- Quick assign/reschedule actions

---

## 🎨 Design Guidelines

### Colors

```css
/* Status Colors */
--success: #10b981;  /* Green */
--warning: #f59e0b;  /* Amber */
--error: #ef4444;    /* Red */
--info: #3b82f6;     /* Blue */

/* Priority Colors */
--low: #6b7280;      /* Gray */
--medium: #f59e0b;   /* Amber */
--high: #ef4444;     /* Red */

/* Role Colors */
--admin: #8b5cf6;    /* Purple */
--moderator: #3b82f6;/* Blue */
--editor: #10b981;   /* Green */
--user: #6b7280;     /* Gray */
```

### Typography

```css
/* Headings */
h1: 2xl font-bold
h2: xl font-semibold
h3: lg font-medium

/* Body */
body: sm regular
caption: xs text-muted-foreground
```

### Spacing

- Use consistent padding: `p-4` for cards, `p-6` for sections
- Gap between elements: `gap-2` for tight, `gap-4` for normal
- Use shadcn/ui spacing tokens

### Animations

- Fade in for new content
- Slide in for modals/sheets
- Pulse for loading states
- Bounce for success confirmations

---

## 🔧 Implementation Steps

### 1. Create Component Files

```bash
cd packages/ui/src/components
mkdir ai-generated
cd ai-generated
touch users-list.tsx user-details.tsx # ... etc
```

### 2. Install Dependencies (if needed)

```bash
pnpm add recharts # For charts
pnpm add framer-motion # For animations
pnpm add react-confetti # For celebrations
```

### 3. Use shadcn/ui Components

```bash
pnpm dlx shadcn@latest add card table badge avatar progress
pnpm dlx shadcn@latest add chart # For analytics
```

### 4. Import in chat.tsx

```typescript
// packages/ai/src/actions/chat.tsx
import { UsersList } from "@workspace/ui/components/ai-generated/users-list";
import { ProjectsGrid } from "@workspace/ui/components/ai-generated/projects-grid";
// ... etc

// Replace ToolResult with actual components
return <UsersList users={users} />;
```

### 5. Export from ui package

```typescript
// packages/ui/src/components/ai-generated/index.ts
export * from "./users-list";
export * from "./projects-grid";
// ... all 38 components
```

---

## 📦 Component Priority

### Phase 1: Core Display (High Priority)
1. ✅ UsersList
2. ✅ ProjectsGrid
3. ✅ TasksList
4. ✅ DashboardOverview
5. ✅ QuickTasksList

### Phase 2: Details & Stats (Medium Priority)
6. UserDetails
7. ProjectDetails
8. ProjectStats
9. TaskDetails
10. UserAnalytics

### Phase 3: CRUD Confirmations (Medium Priority)
11-20. All "Created/Updated/Deleted" components

### Phase 4: Advanced Analytics (Lower Priority)
21-28. Remaining analytics components

---

## 🎯 Testing Components

Create a test page to preview all components:

```typescript
// apps/web/app/test-components/page.tsx
import { UsersList, ProjectsGrid, TasksList } from "@workspace/ui/components/ai-generated";

export default function ComponentsTest() {
  const mockUsers = [/* mock data */];
  const mockProjects = [/* mock data */];

  return (
    <div className="space-y-8 p-8">
      <UsersList users={mockUsers} />
      <ProjectsGrid projects={mockProjects} />
      <TasksList tasks={mockTasks} />
    </div>
  );
}
```

---

## 🤝 Contributing

When creating components:
1. Follow shadcn/ui patterns
2. Use TypeScript strictly
3. Add JSDoc comments
4. Make components responsive
5. Include loading states
6. Add error boundaries
7. Test with mock data first

---

## 📚 Resources

- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Recharts Documentation](https://recharts.org)
- [Framer Motion](https://www.framer.com/motion)
- [Figma Design Files](#) (link to your designs)

---

**Total Components Needed**: 38
**Estimated Time**: 2-3 days for all phases
**Priority**: Start with Phase 1 (5 components) to get basic functionality working