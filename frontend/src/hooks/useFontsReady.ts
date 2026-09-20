import { useEffect } from "react";

/**
 * Sets <html data-fonts="ready"> once the web fonts have loaded (or after a
 * short timeout). The staged hero entrance waits for it, so headline lines are
 * never animated with fallback metrics and then jump when the real font lands.
 */
export function useFontsReady() {
    useEffect(() => {
        const root = document.documentElement;
        if (root.dataset.fonts === "ready") return;

        const mark = () => { root.dataset.fonts = "ready"; };
        const timer = window.setTimeout(mark, 1400);

        if (!document.fonts) { mark(); return () => window.clearTimeout(timer); }

        Promise.all([
            document.fonts.load('500 1em "Source Serif 4"'),
            document.fonts.load('400 1em "Source Sans 3"'),
            document.fonts.load('500 1em "JetBrains Mono"'),
        ])
            .then(() => document.fonts.ready)
            .catch(() => undefined)
            .then(() => { window.clearTimeout(timer); mark(); });

        return () => window.clearTimeout(timer);
    }, []);
}
