export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    return (
        <div>
            <h2>Inner layout</h2>
            {children}
        </div>
    )
}

// the routes outside of the group for instance, "forgot-password" folder, do not share the layout, only the "login" and "register" within the ("with-auth-layout" -> route group, which basically ignores the name while routing to the specific URL in website) shares the layout!

// this is particularly useful in large projects!
