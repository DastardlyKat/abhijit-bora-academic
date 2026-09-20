import { createElement } from "react";
import type { CSSProperties, ReactNode } from "react";
import { useReveal } from "../hooks/useReveal";

type RevealProps = {
    children: ReactNode;
    as?: "div" | "section" | "article" | "ul" | "ol" | "dl" | "header" | "figure" | "li" | "p";
    /** ms before the reveal starts */
    delay?: number;
    /** Children rise 60ms apart instead of the block rising as one. Keep groups small. */
    stagger?: boolean;
    /** "none": only marks data-inview so descendants (masks, rules…) can react; the block itself doesn't move. */
    variant?: "rise" | "none";
    className?: string;
    style?: CSSProperties;
    rootMargin?: string;
};

/**
 * The single scroll-reveal primitive. One calm rise per block — reveal
 * sections and groups, not every individual card.
 */
export default function Reveal({ children, as = "div", delay = 0, stagger, variant = "rise", className, style, rootMargin }: RevealProps) {
    const ref = useReveal<HTMLElement>({ rootMargin });
    const cls = [variant === "rise" ? "reveal" : "reveal-trigger", className].filter(Boolean).join(" ");
    return createElement(
        as,
        {
            ref,
            className: cls,
            "data-stagger": stagger ? "" : undefined,
            style: { ...style, "--d": `${delay}ms` } as CSSProperties,
        },
        children,
    );
}
