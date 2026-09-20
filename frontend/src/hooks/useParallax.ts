import { useEffect } from "react";
import type { RefObject } from "react";

/**
 * Very restrained scroll parallax: writes --py (px) on the element, moving
 * between -maxPx and +maxPx as it crosses the viewport. Desktop + motion only.
 */
export function useParallax(ref: RefObject<HTMLElement | null>, maxPx = 10) {
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const mq = window.matchMedia("(min-width: 861px) and (prefers-reduced-motion: no-preference)");
        if (!mq.matches) return;

        let raf = 0;
        const paint = () => {
            raf = 0;
            const r = el.getBoundingClientRect();
            const vh = window.innerHeight;
            if (r.bottom < 0 || r.top > vh) return;
            const p = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / vh));
            el.style.setProperty("--py", `${(-p * maxPx).toFixed(2)}px`);
        };
        const schedule = () => { if (!raf) raf = requestAnimationFrame(paint); };
        paint();
        window.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", schedule);
        return () => {
            window.removeEventListener("scroll", schedule);
            window.removeEventListener("resize", schedule);
            cancelAnimationFrame(raf);
        };
    }, [ref, maxPx]);
}
