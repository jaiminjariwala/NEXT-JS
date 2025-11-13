import { ReactNode } from "react";  // "ReactNode" a typescript type which means anything react can render
import clsx from "clsx";  // A helper library that makes it easier to combine class names conditionally.

type BoundedProps = {
  // all are optional prop
  as?: "section" | "footer"; // as prop can either be a "section" or a "footer"
  fullWidth?: boolean;
  className?: string;
  innerClassName?: string;
  children?: ReactNode;
};

export function Bounded({
  as: Comp = "section",
  fullWidth = false,
  className,
  innerClassName,
  children,
}: BoundedProps) {
  return (
    <Comp
      className={clsx(
        "px-6 py-10 md:py-20 [.header+&]:pt-44 [.header+&]:md:pt-32",
        className,
      )}
    >
      <div
        className={clsx(
          "mx-auto w-full",
          !fullWidth && "max-w-7xl",
          innerClassName,
        )}
      >
        {children}
      </div>
    </Comp>
  );
}

