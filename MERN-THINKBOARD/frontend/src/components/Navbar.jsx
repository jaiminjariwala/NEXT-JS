import React from "react";
import { Link } from "react-router";
import { PlusIcon } from "lucide-react";

const Navbar = () => {
  return (
    <header className="bg-[#d8eff9]">
      <div className="mx-auto max-w-350 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-light text-black hover:text-shadow-base-100-">dot—note</h1>
          <div className="flex items-center gap-4">
            <Link
              to={"/create"}
              className="flex px-4 items-center gap-1 py-2 bg-white text-black rounded-lg"
            >
              <PlusIcon className="size-5 font-medium" />
              <span className="font-medium hover:font-semibold hover:text-xl text-[18px] transition-all">New note</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
