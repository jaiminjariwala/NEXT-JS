"use client";
import { useGSAP } from "@gsap/react"; // useGSAP is a react hook that lets you run GSAP animations in a react-friendly way.
// the animation runs after the DOM element is mounted.
// cleanup happens automatically when the component unmounts
import clsx from "clsx";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);
type FadeInProps = {
  children: React.ReactNode;
  vars?: gsap.TweenVars;
  start?: string;
  className?: string;
  targetChildren?: boolean;
};

export function FadeIn({
  children,
  className,
  start = "top 50%",
  targetChildren = false,
  vars = {},
}: FadeInProps) {
  const containerRef = useRef<HTMLDivElement>(null); // stores the reference to a DOM element - in this case, a <div>
  // <HTMLDivElement> this is a typescript typing. It tells typescript that this ref will eventually point to areal <div> element. Until React assigns it, its default value is null.

  useGSAP(() => {
    const target = targetChildren
      ? containerRef.current?.children
      : containerRef.current;

    if (!target) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.set(target, {
        opacity: 0,
        y: 60,
      });
      gsap.to(target, {
        duration: 0.8,
        opacity: 1,
        ease: "power3.out",
        y: 0,
        stagger: 0.2, // time between each element animating
        ...vars,
        scrollTrigger: {
          trigger: containerRef.current,
          start,
        },
      });
    });
  });
  return (
    <div ref={containerRef} className={clsx(className)}>
      {children}
    </div>
  );
}
