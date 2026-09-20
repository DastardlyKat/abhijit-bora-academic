import { useEffect, useRef } from "react";

type Options = { rootMargin?: string; threshold?: number };

/**
 * Marks an element with data-inview="true" the first time it scrolls into view.
 * The attribute is written straight to the DOM (no React state), so revealing
 * never triggers a re-render. All visual behaviour lives in CSS.
 */
export function useReveal<T extends HTMLElement>({ rootMargin = "0px 0px -12% 0px", threshold = 0.01 }: Options = {}) {
    const ref = useRef<T>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (typeof IntersectionObserver === "undefined") {
            el.dataset.inview = "true";
            return;
        }
        const io = new IntersectionObserver(entries => {
            if (entries.some(e => e.isIntersecting)) {
                el.dataset.inview = "true";
                io.disconnect();
            }
        }, { rootMargin, threshold });
        io.observe(el);
        return () => io.disconnect();
    }, [rootMargin, threshold]);

    return ref;
}
