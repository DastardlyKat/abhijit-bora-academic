import { useRef } from "react";
import { useTimelineProgress } from "../hooks/useTimelineProgress";
import "./Timeline.css";

export type TimelineEntry = {
    period: string;
    title: string;
    /** Small label above the title, e.g. the degree. */
    kicker?: string;
    /** Institution — the strongest supporting line. */
    primary?: string;
    /** Department or other qualifier. */
    secondary?: string;
};

/**
 * Vertical career timeline. The rail fills toward a reading line as you scroll,
 * nodes light as it passes them, and each entry's text settles in once.
 * An entry whose period reads "… Present" gets the stamp-red "on air" node.
 */
export default function Timeline({ items, label }: { items: TimelineEntry[]; label: string }) {
    const ref = useRef<HTMLOListElement>(null);
    useTimelineProgress(ref);

    return (
        <ol className="tl" ref={ref} aria-label={label}>
            {items.map((item, i) => (
                <li
                    key={`${item.period}-${i}`}
                    className="tl__item"
                    data-current={/present/i.test(item.period) ? "true" : undefined}
                    data-last={i === items.length - 1 ? "true" : undefined}
                >
                    <p className="tl__period">{item.period}</p>
                    <div className="tl__rail" aria-hidden="true">
                        <span className="tl__seg" />
                        <span className="tl__node" />
                    </div>
                    <div className="tl__body">
                        {item.kicker && <p className="tl__kicker">{item.kicker}</p>}
                        <h3 className="tl__title">{item.title}</h3>
                        {item.primary && <p className="tl__primary">{item.primary}</p>}
                        {item.secondary && <p className="tl__secondary">{item.secondary}</p>}
                    </div>
                </li>
            ))}
        </ol>
    );
}
