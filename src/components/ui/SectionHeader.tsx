import React from "react";
import { cn } from "@/lib/cn";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  highlightedTitle?: string;
  description?: string;
  align?: "left" | "center";
  theme?: "light" | "dark";
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  highlightedTitle,
  description,
  align = "left",
  theme = "light",
  className,
}: SectionHeaderProps) {
  const isDark = theme === "dark";
  const isCenter = align === "center";

  return (
    <div
      className={cn(
        "flex flex-col",
        isCenter
          ? "items-center text-center mx-auto max-w-3xl"
          : "items-start text-left max-w-2xl",
        className
      )}
    >
      {eyebrow && (
        <div className="mb-3.5 inline-flex items-center gap-3">
          <span
            aria-hidden="true"
            className={cn(
              "h-[1.5px] w-7",
              isDark ? "bg-brand-crimson" : "bg-brand-crimson"
            )}
          />
          <span
            className={cn(
              "font-sans text-xs font-medium tracking-[0.14em] uppercase",
              isDark ? "text-brand-beige/85" : "text-brand-crimson"
            )}
          >
            {eyebrow}
          </span>
        </div>
      )}

      <h2
        className={cn(
          "font-serif text-3xl sm:text-4xl lg:text-[44px] font-light leading-[1.14] tracking-[-0.01em] break-words",
          isDark ? "text-brand-offwhite" : "text-brand-charcoal"
        )}
      >
        {title}
        {highlightedTitle ? ` ${highlightedTitle}` : ""}
      </h2>

      {description && (
        <p
          className={cn(
            "mt-4 text-sm sm:text-base leading-relaxed max-w-[68ch]",
            isDark ? "text-brand-beige/80" : "text-stone-600"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
