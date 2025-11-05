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
      className="text-white"
    >
      <PrismicRichText field={slice.primary.heading} />
      <PrismicRichText field={slice.primary.body} />
      <button className="font-bold-slanted group flex w-fit cursor-pointer items-center gap-1 rounded bg-[#01A7E1] px-3 py-1 text-2xl uppercase transition disabled:grayscale">
        {slice.primary.buy_button_text}
        <span className="group-hover:translate-x-1">{">"}</span>
      </button>
    </section>
  );
};

export default Hero;
