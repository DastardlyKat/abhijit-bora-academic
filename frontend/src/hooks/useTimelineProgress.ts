import { useEffect } from "react";
import type { RefObject } from "react";

// Vertical centre of a node inside its item — must match .tl__node in Timeline.css
const NODE_Y = 14;

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/**
 * Drives the timeline: a reading line sits low in the viewport; the rail fills
 * down to it, each node lights as the line passes it, and each entry's text is
 * revealed (once) as it approaches. Only CSS custom properties / data
 * attributes are written, so nothing re-renders.
 */
export function useTimelineProgress(list: RefObject<HTMLElement | null>) {
    useEffect(() => {
        const el = list.current;
        if (!el) return;
        const items = Array.from(el.querySelectorAll<HTMLElement>(".tl__item"));

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            items.forEach(it => { it.dataset.on = "true"; it.dataset.seen = "true"; it.style.setProperty("--f", "1"); });
            return;
        }

        let raf = 0;
        const paint = () => {
            raf = 0;
            const vh = window.innerHeight;
            const line = vh * 0.85;
            const seenLine = vh * 0.9;
            for (const it of items) {
                const r = it.getBoundingClientRect();
                const nodeY = r.top + NODE_Y;
                const f = clamp((line - nodeY) / Math.max(r.height, 1), 0, 1);
                it.style.setProperty("--f", f.toFixed(3));
                const on = line >= nodeY ? "true" : "false";
                if (it.dataset.on !== on) it.dataset.on = on;
                if (r.top < seenLine && it.dataset.seen !== "true") it.dataset.seen = "true";
            }
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
    }, [list]);
}
