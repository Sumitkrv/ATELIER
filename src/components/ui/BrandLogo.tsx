import React from "react";
import Image from "next/image";
import { ATELIER_BRAND } from "@/lib/brand";
import { cn } from "@/lib/cn";

export type BrandLogoVariant = "primary" | "white" | "black";
export type BrandLogoSize = "sm" | "md" | "lg" | "xl";

interface BrandLogoProps {
  /**
   * "primary": Charcoal + Crimson transparent logo for light backgrounds (#E8E2D9 / #FAF9F6)
   * "white": Inverse white transparent logo for dark/maroon/video backgrounds (#1A1A1A / #9B1C1C)
   * "black": Monochrome black transparent logo
   */
  variant?: BrandLogoVariant;
  size?: BrandLogoSize;
  priority?: boolean;
  className?: string;
}

const sizeClasses: Record<BrandLogoSize, string> = {
  sm: "h-7 sm:h-8 w-auto",
  md: "h-8 sm:h-10 w-auto",
  lg: "h-10 sm:h-12 w-auto",
  xl: "h-12 sm:h-14 lg:h-16 w-auto",
};

const variantSrcMap: Record<BrandLogoVariant, string> = {
  primary: ATELIER_BRAND.assets.logoPrimary,
  white: ATELIER_BRAND.assets.logoWhite,
  black: ATELIER_BRAND.assets.logoBlack,
};

/**
 * Official ATELIER — WALL STORY Brand Logo Component.
 * Uses the supplied original transparent PNG assets (1750x408) rather than
 * recreating the mark with CSS/text or relying on the unembedded FuturaBT-Light SVG font.
 */
export function BrandLogo({
  variant = "primary",
  size = "md",
  priority = false,
  className,
}: BrandLogoProps) {
  return (
    <Image
      src={variantSrcMap[variant]}
      alt={`${ATELIER_BRAND.name} official logo`}
      width={ATELIER_BRAND.assets.logoWidth}
      height={ATELIER_BRAND.assets.logoHeight}
      priority={priority}
      unoptimized
      className={cn(
        "select-none object-contain",
        sizeClasses[size],
        className
      )}
    />
  );
}

