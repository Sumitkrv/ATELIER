"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/cn";

export interface HomeFaqEntry {
  id: string;
  question: string;
  answer: string;
}

const DEFAULT_ATELIER_FAQS: ReadonlyArray<HomeFaqEntry> = [
  {
    id: "faq-1",
    question: "What surfaces can ATELIER — WALL STORY print on?",
    answer:
      "Our direct-to-substrate 3D wall printing technology in Mumbai prints murals and conceptual art directly onto interior Walls, Tiles, Plywood, Office Blinds, Metals, and Glass—without vinyl seams or wallpaper joints.",
  },
  {
    id: "faq-2",
    question: "How can I preview a design on my own wall before commissioning?",
    answer:
      "Every design in our Explore Designs catalog includes a 'Preview on My Wall' action. Selecting it transfers the artwork into our WebGL Wall Visualizer, where you can use your smartphone camera or a room photo, mark the four corners of your wall, and inspect the perspective-mapped mural in real time.",
  },
  {
    id: "faq-3",
    question: "How are the 13 design categories organized?",
    answer:
      "All 13 design categories are unified on a single Explore Designs page (/explore-designs) with instant category filter tabs, search, and multi-image modal previews. Category titles and designs are managed directly through our Admin CMS.",
  },
  {
    id: "faq-4",
    question: "How do I book a consultation or site assessment in Mumbai?",
    answer:
      "You can submit an enquiry through our Contact Us page (/contact), call our team directly (+91 85919 71675 / +91 80174 63132 / +91 86971 70746), or message us on WhatsApp with your wall dimensions and surface type.",
  },
];

export function HomeFaqAccordion() {
  const [openId, setOpenId] = useState<string | null>("faq-1");

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {DEFAULT_ATELIER_FAQS.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div
            key={item.id}
            className={cn(
              "rounded-sm border transition-colors",
              isOpen
                ? "border-brand-crimson bg-brand-offwhite shadow-xs"
                : "border-brand-charcoal/12 bg-brand-offwhite/80 hover:border-brand-crimson/50"
            )}
          >
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="font-serif text-lg font-normal text-brand-charcoal sm:text-xl">
                {item.question}
              </span>
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border border-brand-crimson/35 text-brand-crimson transition-transform duration-200",
                  isOpen && "rotate-45 bg-brand-crimson text-brand-offwhite"
                )}
              >
                <Plus className="h-4 w-4" />
              </span>
            </button>
            {isOpen && (
              <div className="border-t border-brand-charcoal/10 px-5 pt-3 pb-5 text-sm leading-relaxed text-stone-600">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
