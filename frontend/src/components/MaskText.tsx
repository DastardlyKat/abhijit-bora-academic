import type { CSSProperties, ReactNode } from "react";

/**
 * One line of type that slides up out of a clipped box. It plays when an
 * ancestor is [data-seq] (first-screen) or [data-inview] (scroll reveal).
 */
export default function MaskText({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
    return (
        <span className={["mask", className].filter(Boolean).join(" ")}>
            <span className="mask__inner" style={{ "--d": `${delay}ms` } as CSSProperties}>{children}</span>
        </span>
    );
}
