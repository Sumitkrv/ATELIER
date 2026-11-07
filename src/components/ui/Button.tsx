import React from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "outline" | "outlineDark" | "glass";
type ButtonSize = "sm" | "md" | "lg";

interface BaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
}

type ButtonAsButton = BaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    href?: undefined;
  };

type ButtonAsLink = BaseProps &
  Omit<React.ComponentProps<typeof Link>, keyof BaseProps> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-crimson text-brand-offwhite border border-brand-crimson hover:bg-brand-crimson-dark shadow-[0_10px_28px_-10px_rgba(155,28,28,0.55)]",
  secondary:
    "bg-brand-charcoal text-brand-offwhite border border-brand-charcoal hover:bg-obsidian-800",
  outline:
    "bg-transparent text-brand-charcoal border border-brand-charcoal/25 hover:border-brand-crimson hover:text-brand-crimson hover:bg-brand-crimson/5",
  outlineDark:
    "bg-transparent text-brand-offwhite border border-brand-beige/40 hover:border-brand-offwhite hover:bg-brand-offwhite/10",
  glass:
    "bg-brand-charcoal/70 text-brand-offwhite border border-brand-beige/20 backdrop-blur-md hover:bg-brand-charcoal/90 hover:border-brand-crimson",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-[11px] tracking-[0.16em]",
  md: "px-6 py-3 text-xs tracking-[0.18em]",
  lg: "px-7 py-3.5 text-xs sm:text-[13px] tracking-[0.2em]",
};

export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    className,
    children,
    ...rest
  } = props;

  const sharedClasses = cn(
    "inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-sm font-sans font-medium uppercase transition-[color,background-color,border-color,box-shadow,transform] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-crimson disabled:pointer-events-none disabled:opacity-50",
    variantStyles[variant],
    sizeStyles[size],
    className
  );

  if ("href" in rest && typeof rest.href === "string") {
    const { href, ...linkProps } = rest;
    return (
      <Link href={href} className={sharedClasses} {...linkProps}>
        {children}
      </Link>
    );
  }

  const buttonProps = rest as React.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button
      type={buttonProps.type ?? "button"}
      className={sharedClasses}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
