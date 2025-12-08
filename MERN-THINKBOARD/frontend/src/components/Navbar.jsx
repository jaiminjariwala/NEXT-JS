import React from "react";
import { Link } from "react-router";
import { PlusIcon } from "lucide-react";

const Navbar = () => {
  return (
    <header className="bg-primary/10 border-b border-base-content/10">
      <div className="mx-auto max-w-6xl p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-medium text-black tracking-tight">
            Thinkboard
          </h1>
          <div className="flex items-center gap-4">
            <Link to={"/create"} className="btn btn-neutral">
              <PlusIcon className="size-5"/>
              <span className="font-medium text-[16px]">New note</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
