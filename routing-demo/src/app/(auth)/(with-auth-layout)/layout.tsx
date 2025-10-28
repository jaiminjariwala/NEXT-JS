"use client";

import "./styles.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react"; // introduction to "templates" using useState hook

// A layout stays the same between pages (does not re-render).
// A template looks similar, but it re-renders every time you navigate to a new child route.
// Like layouts, templates need to accept a children prop to render the nested route segments
// whenever a user navigates between routes sharing a template, you get a completely fresh start!
// - a new template component instance is mounted
// - DOM elements are recreated
// - state is cleared
// - effects are re-synchronized

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
  const [input, setInput] = useState("")
  const pathname = usePathname();
  return (
    <div>
      <div>
        {/* the input value will stay and not reset because the layout does not re-render when switching between its child pages.*/}
        {/* but if you rename this layout.tsx file to template.tsx then after navigating to different child routes, everything will be cleared and reset! */}
        <input value={input} onChange={(e) => setInput(e.target.value)}/> 
      </div>
      {navLinks.map((link) => {
        const isActive =
          pathname === link.href ||
          (pathname.startsWith(link.href) && link.href !== "/");
        return (
          <Link
            className={isActive ? "font-bold mr-4" : "text-blue-500 mr-4"}
            href={link.href}
            key={link.name}
          >
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
