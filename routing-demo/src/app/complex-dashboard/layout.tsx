// Parallel Routes:
// parallel routing is an advanced routing mechanism that lets us render multiple pages simultaneously within the same layout

// parallel routes in Next.js are defined using a feature known as "slots".
// slots help organize content in a modular way
// to create a slot, we use `@folder` naming convention
// each defined slot automatically becomes a prop in its corresponding `layout.tsx` file

export default function ComplexDashboardLayout({
  children,
  login,
  users,
  revenue,
  notifications,
}: // the layout will also render the component from adjacent page.tsx as children prop

// children is the content from complex-dashboard/page.tsx
// login is the content from complex-dashboard/@login/page.tsx
// users is the content from complex-dashboard/@notifcations/page.tsx
// revenue is the content from complex-dashboard/@revenue/page.tsx
// notifications is the content from complex-dashboard/@notifications/page.tsx

// NEXT JS automatically injects those props based on folder names.
{
  login: React.ReactNode;
  children: React.ReactNode;
  users: React.ReactNode;
  revenue: React.ReactNode;
  notifications: React.ReactNode;
}) {
  const isLoggedIn = false; // in real-application we will use useAuth to get the authentication status
  return isLoggedIn ? (
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
  ) : (
    login
  );
}
