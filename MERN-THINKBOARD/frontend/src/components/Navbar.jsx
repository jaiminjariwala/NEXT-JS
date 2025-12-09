import React from "react";
import { Link } from "react-router";
import { PlusIcon } from "lucide-react";

const Navbar = () => {
  return (
    <header className="bg-[#272343] border-base-content/7">
      <div className="mx-auto max-w-6xl p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-medium text-white">
            .notes
          </h1>
          <div className="flex items-center gap-4">
            <Link to={"/create"} className="flex px-4 items-center gap-2 py-2 bg-white text-black rounded-lg hover:bg-[#f4f4f4]">
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
