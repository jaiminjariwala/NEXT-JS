// Parallel Routes:
// parallel routing is an advanced routing mechanism that lets us render multiple pages simultaneously within the same layout

// parallel routes in Next.js are defined using a feature known as "slots".
// slots help organize content in a modular way
// to create a slot, we use `@folder` naming convention
// each defined slot automatically becomes a prop in its corresponding `layout.tsx` file

export default function ComplexDashboardLayout({
  // the layout will also render the component from adjacent page.tsx as children prop
  children, // children is the content from complex-dashboard/page.tsx
  users,  // users is the content from complex-dashboard/@notifcations/page.tsx
  revenue,  // revenue is the content from complex-dashboard/@revenue/page.tsx
  notifications,  // notifications is the content from complex-dashboard/@notifications/page.tsx
  // NEXT JS automatically injects those props based on folder names.
}: {
  children: React.ReactNode;
  users: React.ReactNode;
  revenue: React.ReactNode;
  notifications: React.ReactNode;
}) {
  return (
    <div>
      <div>{children}</div>
      <div style={{ display: "flex" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div>{users}</div>
          <div>{revenue}</div>
        </div>
        <div style={{ display: "flex", flex: 1 }}>{notifications}</div>
      </div>
    </div>
  );
}
