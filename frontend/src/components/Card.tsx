import { createElement } from "react";
import type { CSSProperties, ReactNode } from "react";
import "./Card.css";

type CardProps = {
    children: ReactNode;
    style?: CSSProperties;
    className?: string;
    as?: "div" | "article" | "section";
    /**
     * static      – informational; does not react to the pointer
     * interactive – the whole card is a target; lifts 2px and firms its border
     */
    variant?: "static" | "interactive";
}

export default function Card({ children, style, className, as = "div", variant = "static" }: CardProps) {
    return createElement(
        as,
        { className: ["card", variant === "interactive" && "card--interactive", className].filter(Boolean).join(" "), style },
        children,
    );
}
