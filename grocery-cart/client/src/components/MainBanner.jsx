import React from "react";
import { assets } from "../assets/assets";
import { Link } from "react-router-dom";

const MainBanner = () => {
  return (
    <div className="relative">
      {/* different banner size for mobile and md+ screens */}
      <img
        src={assets.main_banner_bg}
        alt="banner"
        className="w-full hidden md:block"
      />
      <img
        src={assets.main_banner_bg_sm}
        alt="mobile-banner"
        className="w-full md:hidden"
      />

      <div className="absolute inset-0 flex flex-col items-center md:items-start justify-end md:justify-center pb-24 md:pb-0 px-4 md:pl-18 lg:pl-24">

        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center md:text-left max-w-72 md:max-w-80 lg:max-w-105 leading-tight lg:leading-15 text-black">
          Freshness You Can Trust, Savings You Will Love!
        </h1>
        <div className="flex items-center mt-6 text-base md:text-lg gap-2 text-black">
          <Link
            to={"/products"}
            className="group flex items-center gap-2 px-8 md:px-9 py-3 bg-primary hover:bg-primary-hover transition rounded-full cursor-pointer hover:font-medium"
          >
            Shop Now
            <img
              src={assets.black_arrow_icon}
              alt="arrow"
              className="md:hidden transition group-focus:translate-x-1"
            />
          </Link>
          <Link
            to={"/products"}
            className="group hidden md:flex items-center gap-2 px-2 md:px-3 py-3 cursor-pointer rounded-full font-medium"
          >
            Explore Deals
            <img
              src={assets.black_arrow_icon}
              alt="arrow"
              className="transition group-hover:translate-x-1"
            />
          </Link>

        </div>
      </div>
    </div>
  );
};

export default MainBanner;
