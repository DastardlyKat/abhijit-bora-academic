import { useEffect, useLayoutEffect } from "react";
import type { RefObject } from "react";

/**
 * Positions a single underline under whichever child has data-active="true".
 * Writes --ind-x / --ind-w / --ind-o on the container; CSS turns those into a
 * transform, so the slide is compositor-only. The first placement is instant.
 */
export function useSlidingIndicator(container: RefObject<HTMLElement | null>, activeKey: string | null) {
    useLayoutEffect(() => {
        const c = container.current;
        if (!c) return;

        const measure = () => {
            const active = c.querySelector<HTMLElement>('[data-active="true"]');
            if (!active) { c.style.setProperty("--ind-o", "0"); return; }
            c.style.setProperty("--ind-x", `${active.offsetLeft}px`);
            c.style.setProperty("--ind-w", String(active.offsetWidth));
            c.style.setProperty("--ind-o", "1");
        };

        measure();
        // Enable the slide only after the first placement has been painted.
        const raf = requestAnimationFrame(() => { c.dataset.indicator = "ready"; });
        return () => cancelAnimationFrame(raf);
    }, [container, activeKey]);

    // Re-measure when widths change (viewport resize, web fonts arriving).
    useEffect(() => {
        const c = container.current;
        if (!c) return;
        const measure = () => {
            const active = c.querySelector<HTMLElement>('[data-active="true"]');
            if (!active) return;
            c.style.setProperty("--ind-x", `${active.offsetLeft}px`);
            c.style.setProperty("--ind-w", String(active.offsetWidth));
        };
        const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
        ro?.observe(c);
        c.querySelectorAll("[data-active]").forEach(el => ro?.observe(el));
        document.fonts?.ready.then(measure);
        return () => ro?.disconnect();
    }, [container, activeKey]);
}
