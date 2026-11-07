import React from "react";
import { cn } from "@/lib/cn";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "default" | "narrow" | "wide";
  as?: "div" | "section" | "article";
}

export function Container({
  children,
  className,
  size = "default",
  as: Component = "div",
  ...props
}: ContainerProps) {
  const maxWidthClass =
    size === "narrow"
      ? "max-w-4xl"
      : size === "wide"
        ? "max-w-[1440px]"
        : "max-w-[1320px]";

  return (
    <Component
      className={cn(
        "mx-auto w-full px-5 sm:px-8 lg:px-10",
        maxWidthClass,
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

