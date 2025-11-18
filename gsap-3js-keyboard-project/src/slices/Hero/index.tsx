"use client";

import { FC } from "react";
import { Content } from "@prismicio/client";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";
import { Bounded } from "@/components/Bounded";
import { Canvas } from "@react-three/fiber";
import { Scene } from "./Scene";

/**
 * Props for `Hero`.
 */
export type HeroProps = SliceComponentProps<Content.HeroSlice>;

/**
 * Component for "Hero" Slices.
 */
const Hero: FC<HeroProps> = ({ slice }) => {
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      // for mobile-friendliness make sure to use "dvh" rather than "vh" (viewport height)
      className="relative h-dvh text-shadow-black/30 text-shadow-lg"
    >
      <div className="hero-scene pointer-events-none sticky top-0 h-dvh w-full">
        <Canvas shadows="soft">
          <Scene />
        </Canvas>
      </div>

      <div className="hero-content absolute inset-x-0 top-0 h-dvh">
        <Bounded
          fullWidth
          className="absolute inset-x-0 top-18 md:top-24 md:left-[8vw]"
        >
          <PrismicRichText
            field={slice.primary.heading}
            components={{
              heading2: ({ children }) => (
                <h2
                  style={{ fontVariationSettings: `"wght" 900` }}
                  className="hero-heading text-6xl leading-[0.8] uppercase sm:text-7xl lg:text-8xl"
                >
                  {children}
                </h2>
              ),
            }}
          />
        </Bounded>

        <Bounded
          fullWidth
          className="hero-body absolute inset-x-0 bottom-0 md:right-[8vw] md:left-auto"
          innerClassName="flex flex-col gap-3"
        >
          <div className="max-w-md">
            <PrismicRichText
              field={slice.primary.body}
              components={{
                heading2: ({ children }) => (
                  <h2
                    style={{ fontVariationSettings: `"wght" 900` }}
                    className="mb-1 text-4xl uppercase lg:mb-2 lg:text-6xl"
                  >
                    {children}
                  </h2>
                ),
              }}
            />
          </div>
          <button style={{fontVariationSettings: `"wght" 800`}} className="rounded group flex w-fit cursor-pointer items-center gap-1 bg-[#01A7E1] px-3 py-1 text-2xl uppercase transition disabled:grayscale">
            {slice.primary.buy_button_text}
            <span className="transition group-hover:translate-x-1">{">"}</span>
            {/* group-hover is going to look for a parent group*/}
          </button>
        </Bounded>
      </div>
    </section>
  );
};

export default Hero;
