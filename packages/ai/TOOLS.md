# AI Tools Documentation

Complete reference for all available tools in the AI package.

## 📋 Table of Contents

1. [User Management](#user-management)
2. [Project Management](#project-management)
3. [Task Management](#task-management)
4. [Organization Management](#organization-management)
5. [Quick Tasks](#quick-tasks)
6. [Analytics](#analytics)

---

## 👥 User Management

### View Operations

#### `listUsers`
List all users with filters
- **Params**: limit, offset, search, role, status
- **Returns**: Array of users with pagination
- **Example**: "Show me all admin users"

#### `getUserById`
Get a specific user by ID
- **Params**: userId
- **Returns**: Single user object
- **Example**: "Get details for user abc123"

#### `getUserStats`
Get statistics for a user
- **Params**: userId (optional)
- **Returns**: User stats (projects, tasks, organizations)
- **Example**: "Show me my user statistics"

### Create Operations

#### `createUser`
Create a new user
- **Params**: name, email, role, image
- **Returns**: Created user object
- **Example**: "Create a new user named John Doe with email john@example.com"

### Update Operations

#### `updateUser`
Update user details
- **Params**: userId, name, email, image, role
- **Returns**: Updated user object
- **Example**: "Update user abc123 to be an admin"

#### `updateUserRole`
Change a user's role
- **Params**: userId, role
- **Returns**: Updated user
- **Example**: "Make user abc123 a moderator"

#### `banUser`
Ban a user
- **Params**: userId, reason, expiresAt
- **Returns**: Success status
- **Example**: "Ban user abc123 for spam"

#### `unbanUser`
Unban a user
- **Params**: userId
- **Returns**: Success status
- **Example**: "Unban user abc123"

### Delete Operations

#### `deleteUser`
Delete a user
- **Params**: userId, permanent
- **Returns**: Success status
- **Example**: "Delete user abc123 permanently"

---

## 📊 Project Management

### View Operations

#### `listProjects`
List all projects with filters
- **Params**: limit, offset, search, status, ownerId, isPublic
- **Returns**: Array of projects
- **Example**: "Show me all active projects"

#### `getProjectById`
Get a specific project
- **Params**: projectId
- **Returns**: Single project object
- **Example**: "Get project with ID abc-123"

#### `getProjectBySlug`
Get a project by its slug
- **Params**: slug
- **Returns**: Single project object
- **Example**: "Get the project 'my-awesome-project'"

#### `getProjectStats`
Get project statistics
- **Params**: projectId
- **Returns**: Project stats (tasks, completion rate)
- **Example**: "Show me statistics for project abc-123"

#### `getProjectTasks`
Get all tasks in a project
- **Params**: projectId, status, limit
- **Returns**: Array of tasks
- **Example**: "Show me all in-progress tasks for project abc-123"

### Create Operations

#### `createProject`
Create a new project
- **Params**: name, description, slug, imageUrl, status, isPublic
- **Returns**: Created project object
- **Example**: "Create a new project called 'Website Redesign'"

### Update Operations

#### `updateProject`
Update project details
- **Params**: projectId, name, description, slug, imageUrl, status, isPublic
- **Returns**: Updated project
- **Example**: "Update project abc-123 name to 'New Name'"

#### `archiveProject`
Archive a project
- **Params**: projectId
- **Returns**: Success status
- **Example**: "Archive project abc-123"

#### `restoreProject`
Restore an archived/deleted project
- **Params**: projectId
- **Returns**: Success status
- **Example**: "Restore project abc-123"

### Delete Operations

#### `deleteProject`
Delete a project
- **Params**: projectId, permanent
- **Returns**: Success status
- **Example**: "Delete project abc-123 permanently"

---

## ✅ Task Management

### View Operations

#### `listTasks`
List all tasks with filters
- **Params**: limit, offset, projectId, assigneeId, status, priority, search, overdue
- **Returns**: Array of tasks
- **Example**: "Show me all high-priority tasks"

#### `getTaskById`
Get a specific task
- **Params**: taskId
- **Returns**: Single task object
- **Example**: "Get task def-456"

#### `getMyTasks`
Get current user's tasks
- **Params**: status, limit
- **Returns**: Array of tasks
- **Example**: "Show me my in-progress tasks"

### Create Operations

#### `createTask`
Create a new task
- **Params**: title, description, projectId, assigneeId, status, priority, dueDate
- **Returns**: Created task object
- **Example**: "Create a task 'Fix login bug' in project abc-123"

### Update Operations

#### `updateTask`
Update task details
- **Params**: taskId, title, description, assigneeId, status, priority, dueDate
- **Returns**: Updated task
- **Example**: "Update task def-456 to high priority"

#### `assignTask`
Assign a task to a user
- **Params**: taskId, assigneeId
- **Returns**: Updated task
- **Example**: "Assign task def-456 to user john-123"

#### `unassignTask`
Remove task assignee
- **Params**: taskId
- **Returns**: Updated task
- **Example**: "Unassign task def-456"

#### `completeTask`
Mark task as complete
- **Params**: taskId
- **Returns**: Updated task
- **Example**: "Complete task def-456"

#### `reopenTask`
Reopen a completed task
- **Params**: taskId
- **Returns**: Updated task
- **Example**: "Reopen task def-456"

#### `changeTaskStatus`
Change task status
- **Params**: taskId, status
- **Returns**: Updated task
- **Example**: "Change task def-456 status to in_progress"

#### `changeTaskPriority`
Change task priority
- **Params**: taskId, priority (0=low, 1=medium, 2=high)
- **Returns**: Updated task
- **Example**: "Set task def-456 priority to high"

### Delete Operations

#### `deleteTask`
Delete a task
- **Params**: taskId
- **Returns**: Success status
- **Example**: "Delete task def-456"

---

## 🏢 Organization Management

### View Operations

#### `listOrganizations`
List all organizations
- **Params**: limit, offset, search
- **Returns**: Array of organizations
- **Example**: "Show me all organizations"

#### `getOrganizationById`
Get a specific organization
- **Params**: organizationId
- **Returns**: Single organization object
- **Example**: "Get organization org-789"

#### `getOrganizationBySlug`
Get organization by slug
- **Params**: slug
- **Returns**: Single organization object
- **Example**: "Get organization 'acme-corp'"

#### `getOrganizationMembers`
List organization members
- **Params**: organizationId, role, limit
- **Returns**: Array of members
- **Example**: "Show me all members of organization org-789"

#### `getOrganizationStats`
Get organization statistics
- **Params**: organizationId
- **Returns**: Organization stats
- **Example**: "Show statistics for organization org-789"

#### `getMyOrganizations`
Get current user's organizations
- **Params**: limit
- **Returns**: Array of organizations
- **Example**: "Show me my organizations"

### Create Operations

#### `createOrganization`
Create a new organization
- **Params**: name, slug, logo, metadata
- **Returns**: Created organization
- **Example**: "Create an organization called 'Tech Startup'"

### Update Operations

#### `updateOrganization`
Update organization details
- **Params**: organizationId, name, slug, logo, metadata
- **Returns**: Updated organization
- **Example**: "Update organization org-789 logo"

### Member Management

#### `addMember`
Add a member to organization
- **Params**: organizationId, userId, role
- **Returns**: Created membership
- **Example**: "Add user john-123 to organization org-789 as admin"

#### `updateMemberRole`
Update member's role
- **Params**: organizationId, userId, role
- **Returns**: Updated membership
- **Example**: "Change john-123's role to owner in org-789"

#### `removeMember`
Remove a member from organization
- **Params**: organizationId, userId
- **Returns**: Success status
- **Example**: "Remove user john-123 from organization org-789"

### Invitations

#### `inviteMember`
Invite someone to organization
- **Params**: organizationId, email, role
- **Returns**: Created invitation
- **Example**: "Invite john@example.com to organization org-789"

#### `listInvitations`
List organization invitations
- **Params**: organizationId, status
- **Returns**: Array of invitations
- **Example**: "Show all pending invitations for org-789"

#### `cancelInvitation`
Cancel an invitation
- **Params**: invitationId
- **Returns**: Success status
- **Example**: "Cancel invitation inv-456"

### Delete Operations

#### `deleteOrganization`
Delete an organization
- **Params**: organizationId
- **Returns**: Success status
- **Example**: "Delete organization org-789"

#### `leaveOrganization`
Leave an organization
- **Params**: organizationId
- **Returns**: Success status
- **Example**: "Leave organization org-789"

---

## 📝 Quick Tasks

Personal tasks without project association.

### View Operations

#### `listQuickTasks`
List quick tasks
- **Params**: limit, offset, completed
- **Returns**: Array of quick tasks
- **Example**: "Show me all my incomplete quick tasks"

#### `getQuickTaskById`
Get a specific quick task
- **Params**: quickTaskId
- **Returns**: Single quick task object
- **Example**: "Get quick task qt-123"

### Create Operations

#### `createQuickTask`
Create a new quick task
- **Params**: text, completed
- **Returns**: Created quick task
- **Example**: "Add quick task 'Buy milk'"

### Update Operations

#### `updateQuickTask`
Update quick task
- **Params**: quickTaskId, text, completed
- **Returns**: Updated quick task
- **Example**: "Update quick task qt-123 text"

#### `toggleQuickTask`
Toggle completion status
- **Params**: quickTaskId
- **Returns**: Updated quick task
- **Example**: "Toggle quick task qt-123"

#### `completeQuickTask`
Mark as complete
- **Params**: quickTaskId
- **Returns**: Updated quick task
- **Example**: "Complete quick task qt-123"

#### `uncompleteQuickTask`
Mark as incomplete
- **Params**: quickTaskId
- **Returns**: Updated quick task
- **Example**: "Uncomplete quick task qt-123"

### Delete Operations

#### `deleteQuickTask`
Delete a quick task
- **Params**: quickTaskId
- **Returns**: Success status
- **Example**: "Delete quick task qt-123"

#### `deleteCompletedQuickTasks`
Delete all completed quick tasks
- **Params**: confirm (must be true)
- **Returns**: Success status
- **Example**: "Delete all completed quick tasks"

---

## 📈 Analytics

Advanced analytics and reporting tools.

### Dashboard Analytics

#### `getDashboardOverview`
Get overall dashboard statistics
- **Params**: period (today, 7d, 30d, 90d, 1y, all)
- **Returns**: Dashboard overview with trends
- **Example**: "Show me dashboard overview for last 30 days"

### User Analytics

#### `getUserAnalytics`
Get user activity analytics
- **Params**: userId (optional), period
- **Returns**: User analytics data
- **Example**: "Show my analytics for last 30 days"

#### `getUserActivityTimeline`
Get user activity timeline
- **Params**: userId (optional), limit
- **Returns**: Array of recent activities
- **Example**: "Show my recent activity"

### Project Analytics

#### `getProjectAnalytics`
Get project performance analytics
- **Params**: projectId, period
- **Returns**: Project analytics data
- **Example**: "Show analytics for project abc-123"

#### `getProjectProgress`
Get project completion progress
- **Params**: projectId
- **Returns**: Progress statistics
- **Example**: "What's the progress on project abc-123?"

#### `getProjectVelocity`
Calculate project velocity
- **Params**: projectId, period
- **Returns**: Velocity metrics
- **Example**: "What's the velocity of project abc-123?"

### Team Analytics

#### `getTeamPerformance`
Get team performance metrics
- **Params**: organizationId (optional), period
- **Returns**: Team performance data
- **Example**: "Show team performance for last 30 days"

#### `getMemberProductivity`
Get individual member productivity
- **Params**: userId, period
- **Returns**: Member productivity stats
- **Example**: "Show productivity for user john-123"

### Task Analytics

#### `getTaskDistribution`
Get task distribution statistics
- **Params**: projectId (optional), organizationId (optional)
- **Returns**: Task distribution data
- **Example**: "Show task distribution across all projects"

#### `getOverdueTasks`
List overdue tasks
- **Params**: projectId (optional), assigneeId (optional), limit
- **Returns**: Array of overdue tasks
- **Example**: "Show all overdue tasks"

#### `getTaskCompletionTrends`
Get task completion trends
- **Params**: projectId (optional), period
- **Returns**: Trend data
- **Example**: "Show task completion trends for last 30 days"

### Organization Analytics

#### `getOrganizationAnalytics`
Get organization analytics
- **Params**: organizationId, period
- **Returns**: Organization analytics
- **Example**: "Show analytics for organization org-789"

#### `getOrganizationGrowth`
Track organization growth
- **Params**: organizationId, period
- **Returns**: Growth metrics
- **Example**: "Show growth for organization org-789"

### Comparative Analytics

#### `compareProjects`
Compare multiple projects
- **Params**: projectIds (array), metric
- **Returns**: Comparison data
- **Example**: "Compare completion rates for projects abc and def"

#### `compareTeamMembers`
Compare team member performance
- **Params**: userIds (array), period
- **Returns**: Comparison data
- **Example**: "Compare performance of john-123 and jane-456"

### Custom Reports

#### `generateCustomReport`
Generate a custom analytics report
- **Params**: reportType, filters, format
- **Returns**: Custom report data
- **Example**: "Generate a project summary report for the last quarter"

---

## 🎯 Usage Tips

1. **Be Specific**: The more specific your question, the better the AI can help
2. **Use Natural Language**: You don't need to memorize tool names
3. **Combine Operations**: Ask for multiple things in one query
4. **Filter Results**: Use filters to narrow down results

### Example Queries

- "Show me all high-priority tasks assigned to John in the Website project"
- "Create a new project called 'Mobile App' and add 3 tasks to it"
- "What's my team's productivity this month?"
- "Archive all completed projects from last year"
- "Who are the top performers in my organization?"

---

## 🔒 Permissions

Tools respect user permissions:
- **Admin**: Full access to all operations
- **Moderator**: Can manage users and view analytics
- **Editor**: Can create/edit projects and tasks
- **User**: Can view and manage own items