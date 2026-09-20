import { useLayoutEffect, useRef, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";

/**
 * When `watch` changes (a different dataset is put on screen), animate the
 * wrapper's height from the old content height to the new one instead of
 * letting everything below snap. `overflow: clip` is applied only while the
 * transition runs, so sticky descendants keep working the rest of the time.
 *
 * `innerRef` is a callback ref on purpose: the list is rendered only after the
 * data has loaded, and the observer has to attach whenever it appears.
 */
export function useSmoothHeight(watch: unknown, ms = 460) {
    const outer = useRef<HTMLDivElement>(null);
    const [innerEl, setInnerEl] = useState<HTMLDivElement | null>(null);
    const last = useRef<number | null>(null);
    const reduced = useReducedMotion();

    // Keep track of the natural (un-animated) height of the content.
    useLayoutEffect(() => {
        if (!innerEl || typeof ResizeObserver === "undefined") return;
        last.current = innerEl.offsetHeight;
        const ro = new ResizeObserver(() => {
            if (!outer.current?.style.height) last.current = innerEl.offsetHeight;
        });
        ro.observe(innerEl);
        return () => ro.disconnect();
    }, [innerEl]);

    // Runs right after the DOM swap, before paint: `last` still holds the old height.
    useLayoutEffect(() => {
        const o = outer.current;
        if (!o || !innerEl || last.current == null) return;

        const from = last.current;
        const to = innerEl.offsetHeight;
        last.current = to;
        if (reduced || Math.abs(from - to) < 2) return;

        o.style.transition = "none";
        o.style.overflow = "clip";
        o.style.height = `${from}px`;
        void o.offsetHeight; // commit the starting height
        o.style.transition = `height ${ms}ms var(--ease-out)`;
        o.style.height = `${to}px`;

        const finish = () => {
            o.style.transition = o.style.height = o.style.overflow = "";
            o.removeEventListener("transitionend", onEnd);
        };
        // transitionend bubbles: only react to this wrapper's own height transition
        const onEnd = (e: TransitionEvent) => { if (e.target === o && e.propertyName === "height") finish(); };
        o.addEventListener("transitionend", onEnd);
        const safety = window.setTimeout(finish, ms + 120);
        return () => { window.clearTimeout(safety); o.removeEventListener("transitionend", onEnd); };
        // Only a change of `watch` should start a transition.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watch]);

    return { outer, inner: setInnerEl };
}
