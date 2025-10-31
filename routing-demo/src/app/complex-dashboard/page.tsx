export default function ComplexDashboardPage() {
  return <h1>Complex Dashboard</h1>
}


// parallel routes use-cases
// 1. dashboards with multiple sections
// 2. split-view interfaces
// 3. multi-pane layouts
// 4. complex-admin interfaces

// parallel routes benefits
// 1. parallel routes are great for splitting a layout into manageable slots (especially when different teams work on different parts)
// 2. independent route handling
// 3. Sub-navigation

// by-default the content rendered within a slot matches the current URL
// our content-dashboard has 4 slots: children, revenue, notifications and users.