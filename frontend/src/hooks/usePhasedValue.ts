import { useEffect, useRef, useState } from "react";

type Options<T> = {
    /** How long the outgoing content is given to leave before it is swapped. */
    exitMs: number;
    /** When false the swap is immediate (reduced motion, redirects…). */
    enabled?: boolean;
    isSame?: (a: T, b: T) => boolean;
    /** Runs right after the new value is put on screen. */
    onSwap?: () => void;
};

/**
 * Lets the old value play an exit animation before the new one replaces it.
 * Returns the value to *render* and the phase ("in" | "out") to hang CSS on.
 * Used for both route changes and publication-filter changes.
 */
export function usePhasedValue<T>(value: T, { exitMs, enabled = true, isSame = Object.is, onSwap }: Options<T>) {
    const [shown, setShown] = useState(value);
    const [phase, setPhase] = useState<"in" | "out">("in");
    const swapRef = useRef(onSwap);
    swapRef.current = onSwap;

    useEffect(() => {
        if (isSame(value, shown)) {
            // Back on the value we already show (or only a non-visible part changed).
            setPhase("in");
            if (!Object.is(value, shown)) setShown(value);
            return;
        }
        if (!enabled) {
            setShown(value);
            setPhase("in");
            swapRef.current?.();
            return;
        }
        setPhase("out");
        const t = window.setTimeout(() => {
            setShown(value);
            setPhase("in");
            swapRef.current?.();
        }, exitMs);
        return () => window.clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, shown, exitMs, enabled]);

    return [shown, phase] as const;
}
