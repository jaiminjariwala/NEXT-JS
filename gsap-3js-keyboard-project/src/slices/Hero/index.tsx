import { FC } from "react";
import { Content } from "@prismicio/client";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";

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
      className="relative h-dvh text-white text-shadow-black/30 text-shadow-lg"
    >
      <div className="hero-scene pointer-events-none sticky top-0 h-dvh w-full">
        {/* Canvas goes here */}
      </div>

      <div className="hero-content absolute inset-x-0 top-0 h-dvh">
        <PrismicRichText field={slice.primary.heading} />
        <PrismicRichText field={slice.primary.body} />
        <button className="font-bold-slanted group flex w-fit cursor-pointer items-center gap-1 rounded bg-[#01A7E1] px-3 py-1 text-2xl uppercase transition disabled:grayscale">
          {slice.primary.buy_button_text}
          <span className="transition group-hover:translate-x-1">{">"}</span>
        </button>
      </div>
    </section>
  );
};

export default Hero;
