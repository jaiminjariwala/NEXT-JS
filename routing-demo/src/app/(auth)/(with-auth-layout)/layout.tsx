"use client";

import "./styles.css"
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { name: "Register", href: "/register" },
  { name: "Login", href: "/login" },
  { name: "Forgot Password", href: "/forgot-password" },
];

// every layout component needs a "children" prop, this is where your page content will go!
// In this case, the "children" will be either "login/page.tsx" or "register/page.tsx"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <div>
      {navLinks.map((link) => {
        const isActive =
          pathname === link.href ||
          (pathname.startsWith(link.href) && link.href !== "/");
        return (
          <Link
            className = {isActive ? "font-bold mr-4" : "text-blue-500 mr-4"}
            href={link.href} key={link.name}>
            {link.name}
          </Link>
        );
      })}
      <h2>Inner layout</h2>
      {children}
    </div>
  );
}

// the routes outside of the group for instance, "forgot-password" folder, do not share the layout, only the "login" and "register" within the ("with-auth-layout" -> route group, which basically ignores the name while routing to the specific URL in website) shares the layout!

// this is particularly useful in large projects!
