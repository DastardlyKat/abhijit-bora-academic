import { useRef } from "react";
import type { ReactNode } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import type { Location } from "react-router-dom";

import { usePhasedValue } from "../hooks/usePhasedValue";
import { useReducedMotion } from "../hooks/useReducedMotion";

const EXIT_MS = 150;
const samePage = (a: Location, b: Location) => a.pathname.toLowerCase() === b.pathname.toLowerCase();

/**
 * Route transition: the current page quietly leaves (150ms), the next one is
 * mounted, the window returns to the top, and the page enters. The new
 * page's own headings then stage themselves. Nothing waits on the animation
 * for longer than a blink; redirects and reduced-motion swap instantly.
 */
export default function PageTransition({ children }: { children: (location: Location) => ReactNode }) {
    const location = useLocation();
    const navType = useNavigationType();
    const reduced = useReducedMotion();
    const mainRef = useRef<HTMLElement>(null);
    const navTypeRef = useRef(navType);
    navTypeRef.current = navType;

    const [shown, phase] = usePhasedValue(location, {
        exitMs: EXIT_MS,
        enabled: !reduced && navType !== "REPLACE",
        isSame: samePage,
        onSwap: () => {
            if (navTypeRef.current === "REPLACE") return;   // the "/" → "/Home" redirect
            window.scrollTo(0, 0);
            mainRef.current?.focus({ preventScroll: true }); // announce the new page to assistive tech
        },
    });

    return (
        <main id="main" ref={mainRef} tabIndex={-1} className="main page-container" data-phase={phase}>
            {children(shown)}
        </main>
    );
}
