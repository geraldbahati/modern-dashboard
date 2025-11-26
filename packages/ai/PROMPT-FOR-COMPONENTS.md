# LLM Prompt: Create AI-Generated UI Components

Use this prompt with an LLM (like Claude or GPT-4) to generate all the UI components needed for the AI assistant.

---

## 📋 MAIN PROMPT

```
You are an expert React/TypeScript developer specializing in shadcn/ui components. I need you to create beautiful, production-ready UI components for an AI-powered analytics dashboard.

## CONTEXT

I have an AI assistant that performs CRUD operations on a dashboard (users, projects, tasks, organizations, analytics). The AI tools return structured data that needs to be displayed as React components.

The project uses:
- **Next.js 16** with React 19
- **shadcn/ui** (New York style) with Tailwind CSS
- **TypeScript** (strict mode)
- **Lucide icons**
- **pnpm** as package manager

## SETUP INFORMATION

Project structure:
- Components location: `packages/ui/src/components/ai-generated/`
- shadcn/ui config: `packages/ui/components.json`
- Style: "new-york" with cssVariables
- Base color: neutral

To install missing shadcn components:
```bash
cd packages/ui
pnpm dlx shadcn@latest add [component-name]
```

Available registries:
- @shadcn-map: http://shadcn-map.vercel.app/r/{name}.json
- @magicui: https://magicui.design/r/{name}.json
- @ai-elements: https://registry.ai-sdk.dev/{name}.json

## YOUR TASK

Create the following components based on the specifications in `COMPONENTS.md`. I'll provide the component name and you should create a complete, production-ready implementation.

## REQUIREMENTS

### Code Quality
1. Use TypeScript with strict typing
2. Follow shadcn/ui patterns and conventions
3. Use Tailwind CSS for styling (no custom CSS)
4. Implement proper error boundaries
5. Add loading states where appropriate
6. Make components fully responsive (mobile-first)
7. Add JSDoc comments for props and functions

### Component Structure
```typescript
/**
 * [ComponentName] - Brief description
 *
 * @example
 * <ComponentName data={data} onAction={handleAction} />
 */

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
// ... other shadcn imports

interface [ComponentName]Props {
  /** Prop description */
  data: DataType;
  /** Optional callback */
  onAction?: (action: string, id: string) => void;
  className?: string;
}

export function [ComponentName]({ data, onAction, className }: [ComponentName]Props) {
  // Implementation
  return (
    <Card className={cn("w-full", className)}>
      {/* Component UI */}
    </Card>
  );
}
```

### Styling Guidelines
- Use shadcn/ui components: Card, Table, Badge, Avatar, Button, Progress, etc.
- Color system:
  - Success: `bg-green-50 text-green-700` (badges), `bg-green-500` (charts)
  - Warning: `bg-yellow-50 text-yellow-700`
  - Error: `bg-red-50 text-red-700`
  - Info: `bg-blue-50 text-blue-700`
  - Neutral: `bg-muted text-muted-foreground`
- Spacing: Use `p-4`, `p-6` for cards, `gap-4` for grids
- Border radius: Use default (rounded-lg)
- Shadows: Use shadcn defaults (shadow-sm, shadow-md)

### Accessibility
- Add proper ARIA labels
- Use semantic HTML
- Ensure keyboard navigation works
- Add alt text for images
- Use proper heading hierarchy

### Interactive Elements
- Hover states for clickable items
- Focus states for keyboard navigation
- Disabled states when appropriate
- Loading states with spinners
- Empty states with helpful messages

## COMPONENT PRIORITY

**Phase 1 (Create These First):**
1. UsersList
2. ProjectsGrid
3. TasksList
4. DashboardOverview
5. QuickTasksList

**Phase 2:**
6. UserDetails
7. ProjectDetails
8. ProjectStats
9. TaskDetails
10. UserAnalytics

**Phase 3:**
11-28. Remaining CRUD confirmation components
29-38. Advanced analytics components

## EXAMPLE OUTPUT FORMAT

When I ask you to create a component, respond with:

1. **Component Code**: Full TypeScript/React component
2. **Required shadcn Components**: List what to install
3. **Installation Command**: Exact command to run
4. **Usage Example**: How to use the component
5. **Mock Data**: Sample data for testing

## DESIGN PATTERNS TO FOLLOW

### Tables (for lists)
```typescript
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Column</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map((item) => (
      <TableRow key={item.id}>
        <TableCell>{item.name}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Grids (for cards)
```typescript
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  {items.map((item) => (
    <Card key={item.id}>
      <CardHeader>
        <CardTitle>{item.name}</CardTitle>
      </CardHeader>
      <CardContent>{item.description}</CardContent>
    </Card>
  ))}
</div>
```

### Stats Cards
```typescript
<Card>
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">Label</CardTitle>
    <Icon className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">{value}</div>
    <p className="text-xs text-muted-foreground">
      +{change}% from last month
    </p>
  </CardContent>
</Card>
```

### Badges for Status
```typescript
<Badge variant={
  status === "active" ? "default" :
  status === "completed" ? "secondary" :
  "outline"
}>
  {status}
</Badge>
```

### Avatar with Fallback
```typescript
<Avatar>
  <AvatarImage src={user.image} alt={user.name} />
  <AvatarFallback>
    {user.name.split(' ').map(n => n[0]).join('')}
  </AvatarFallback>
</Avatar>
```

## ADDITIONAL LIBRARIES (Use if needed)

For charts/analytics components:
```bash
cd packages/ui
pnpm add recharts
```

For animations:
```bash
cd packages/ui
pnpm add framer-motion
```

For date formatting:
```bash
cd packages/ui
pnpm add date-fns
```

## IMPORTANT NOTES

1. **Do NOT** create custom CSS files - use Tailwind classes only
2. **Do NOT** use inline styles - use className with cn() utility
3. **DO** use the `cn()` utility from `@workspace/ui/lib/utils` for conditional classes
4. **DO** make components reusable and flexible
5. **DO** handle edge cases (empty data, long text, missing fields)
6. **DO** add proper TypeScript types for all props and data

## RESPONSE FORMAT

When I request a component, structure your response like this:

### 1. Component Implementation
```typescript
// Full component code here
```

### 2. Required shadcn Components
```bash
cd packages/ui
pnpm dlx shadcn@latest add card table badge avatar
```

### 3. Additional Dependencies (if any)
```bash
cd packages/ui
pnpm add recharts
```

### 4. Usage Example
```typescript
import { ComponentName } from "@workspace/ui/components/ai-generated/component-name";

<ComponentName
  data={mockData}
  onAction={(action, id) => console.log(action, id)}
/>
```

### 5. Mock Data for Testing
```typescript
const mockData = {
  // Sample data structure
};
```

## READY TO START

I'm ready to create components! Tell me which component from the list you want me to build first, and I'll provide a complete, production-ready implementation following all the guidelines above.

Example request: "Create the UsersList component"
```

---

## 🎯 HOW TO USE THIS PROMPT

### Step 1: Copy the Main Prompt
Copy everything in the "MAIN PROMPT" section above and paste it into your LLM conversation.

### Step 2: Reference the Specs
Make sure to also share the `COMPONENTS.md` file content so the LLM knows the exact specifications.

### Step 3: Request Components One by One

**Example requests:**

```
Create the UsersList component
```

```
Create the ProjectsGrid component
```

```
Create the TasksList component with Kanban board view
```

```
Create the DashboardOverview component with all the stat cards
```

### Step 4: Iterate and Refine

After the LLM creates a component, you can refine it:

```
Make the UsersList component more compact
```

```
Add sorting functionality to the table columns
```

```
Add a search bar at the top of the list
```

```
Make it responsive - collapse to cards on mobile
```

---

## 📦 COMPONENT CREATION ORDER

### Recommended Order (by priority):

#### Week 1: Core Display Components
1. **UsersList** - Most frequently used
2. **ProjectsGrid** - Second most common
3. **TasksList** - Critical for task management
4. **DashboardOverview** - Shows overall stats
5. **QuickTasksList** - Simple but useful

#### Week 2: Detail Views
6. **UserDetails**
7. **ProjectDetails**
8. **TaskDetails**
9. **ProjectStats**
10. **OrganizationsList**

#### Week 3: CRUD Confirmations
11-20. All "Created/Updated/Deleted" confirmation components

#### Week 4: Advanced Analytics
21-38. Remaining analytics and specialty components

---

## 💡 TIPS FOR BEST RESULTS

### When Requesting Components:

1. **Be Specific**: "Create UsersList with sortable columns and pagination"
2. **Reference Examples**: "Make it look like the Vercel dashboard users table"
3. **Mention Constraints**: "Keep it under 200 lines of code"
4. **Ask for Variants**: "Create both compact and detailed views"

### Quality Checks:

After receiving a component, verify:
- [ ] TypeScript types are correct
- [ ] shadcn components are used properly
- [ ] Responsive design works
- [ ] Loading/error states exist
- [ ] Accessibility is handled
- [ ] Code is well-commented

### Common Refinements:

```
Add empty state handling with a nice illustration
```

```
Make the table sortable by clicking column headers
```

```
Add a filter dropdown for status
```

```
Show loading skeletons while data loads
```

```
Add hover effects to make rows interactive
```

---

## 🔧 TROUBLESHOOTING

### If LLM uses components not in shadcn:

```
Please only use official shadcn/ui components. Replace [component] with shadcn equivalent.
```

### If code is too complex:

```
Simplify this component and break it into smaller sub-components
```

### If styling doesn't match:

```
Use the New York style from shadcn/ui, not the Default style
```

### If missing TypeScript types:

```
Add strict TypeScript types for all props and data structures
```

---

## 📚 REFERENCE FILES

Make sure the LLM has access to:
1. **COMPONENTS.md** - Component specifications
2. **packages/ui/components.json** - shadcn config
3. **TOOLS.md** - Tool documentation (for understanding data structures)

---

## ✅ VALIDATION CHECKLIST

For each component created, verify:

```markdown
- [ ] Uses TypeScript with proper types
- [ ] Uses only shadcn/ui components
- [ ] Follows Tailwind CSS for styling
- [ ] Includes JSDoc comments
- [ ] Handles loading states
- [ ] Handles empty states
- [ ] Handles error states
- [ ] Is responsive (mobile-first)
- [ ] Has accessibility features
- [ ] Includes usage example
- [ ] Includes mock data
- [ ] No console errors
- [ ] Works with provided data structure
```

---

## 🎨 EXAMPLE INTERACTION

**You**: "Create the UsersList component"

**LLM**:
```typescript
/**
 * UsersList - Display users in a table with sorting and filtering
 * ... (provides complete component code)
 */
```

**You**: "Great! Now add a search bar and make the table sortable"

**LLM**:
```typescript
// Updated component with search and sorting
```

**You**: "Perfect! Now create the ProjectsGrid component"

---

This prompt gives the LLM everything it needs to create production-ready components that integrate perfectly with your dashboard! 🚀
