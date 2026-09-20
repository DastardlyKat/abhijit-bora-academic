import type { CSSProperties } from "react";
import "./Signal.css";

type SignalProps = {
    size?: number;
    style?: CSSProperties;
    /** "tune": the arcs come in once, dot first. "loading": arcs pulse while waiting. */
    animate?: "tune" | "loading";
}

// A small broadcast-wave mark — a nod to a career that began in radio.
// Used sparingly: in the masthead, the hero eyebrow, the loading state and the footer.
export default function Signal({ size = 14, style, animate }: SignalProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className={animate ? `signal signal--${animate}` : "signal"}
            style={{ flexShrink: 0, ...style }}
        >
            <circle className="sig-dot" cx="12" cy="18" r="2" fill="currentColor" />
            <path className="sig-a" d="M7 14a7 7 0 0 1 10 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path className="sig-b" d="M3.5 10.5a12 12 0 0 1 17 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        </svg>
    );
}
