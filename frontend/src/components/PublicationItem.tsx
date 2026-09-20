import { useId, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import "./PublicationItem.css";

type PublicationItemProps = {
    title: string;
    /** Journal / magazine / publisher — set in italic, the bibliographic convention. */
    source?: string;
    /** Date line. Omit when the year is already carried by a group heading. */
    date?: string;
    /** Category then scope, e.g. ["Peer-Reviewed", "National"]. */
    kinds?: string[];
    /** Which of `kinds` the reader is currently filtering by (gets emphasis). */
    activeKind?: string;
    /** Institute / venue */
    byline?: string[];
    /** Volume, ISSN, ISBN */
    identifiers?: string[];
    coAuthor?: string | null;
    abstract?: string | null;
    onOpenPdf?: () => void;
    hasPdf?: boolean;
    /** Always show the Abstract pill, disabled when there is no abstract, so every row has the same pair. */
    alwaysShowAbstract?: boolean;
    /** Show PDF / Abstract as static pills (only when the data could not be loaded). */
    staticPills?: boolean;
    /** Home: date sits in a left column. */
    variant?: "index" | "compact";
    /** Position in the list, for the entrance stagger (capped). */
    index?: number;
    children?: ReactNode;
};

const PdfIcon = () => (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M4 1.75h5.2L12.25 4.8V14.25H4V1.75Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M9 1.75V5h3.25" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
);

/**
 * One line of a publication index. Rules, not boxes: the hierarchy comes from
 * type — category (mono) → title (serif) → source (italic) → who/where → catalogue numbers.
 */
export default function PublicationItem({
    title, source, date, kinds = [], activeKind, byline = [], identifiers = [], coAuthor,
    abstract, onOpenPdf, hasPdf = false, alwaysShowAbstract = false, staticPills = false, variant = "index", index = 0,
}: PublicationItemProps) {
    const [open, setOpen] = useState(false);
    const panelId = useId();

    return (
        <li className={`pub pub--${variant}`} style={{ "--i": Math.min(index, 9) } as CSSProperties}>
            <div className="pub__main">
                {variant === "compact" && date && <p className="pub__date meta">{date}</p>}

                <div className="pub__text">
                    {kinds.length > 0 && (
                        <p className="pub__kinds">
                            {kinds.map(k => (
                                <span key={k} className="pub__kind" data-active={activeKind === k ? "true" : undefined}>{k}</span>
                            ))}
                        </p>
                    )}
                    <h3 className="pub__title">{title}</h3>
                    {source && <p className="pub__source">{source}</p>}
                    {byline.length > 0 && (
                        <p className="pub__byline">{byline.map(b => <span key={b}>{b}</span>)}</p>
                    )}
                    {coAuthor && <p className="pub__byline"><span>Co-author: {coAuthor}</span></p>}
                    {identifiers.length > 0 && (
                        <p className="pub__ids meta">{identifiers.map(b => <span key={b}>{b}</span>)}</p>
                    )}
                    {variant === "index" && date && <p className="pub__dateline meta">{date}</p>}
                </div>

                <div className="pub__actions">
                    {staticPills ? (
                        <>
                            <span className="pub__pill">PDF</span>
                            <span className="pub__pill">Abstract</span>
                        </>
                    ) : (
                        <>
                            <button
                                type="button"
                                className="pub__btn"
                                onClick={onOpenPdf}
                                disabled={!hasPdf}
                                title={hasPdf ? "Open PDF in a new tab" : "No PDF available for this item"}
                            >
                                <PdfIcon />
                                PDF
                            </button>
                            {!abstract && alwaysShowAbstract && (
                                <button type="button" className="pub__btn" disabled title="No abstract available for this item">
                                    Abstract
                                </button>
                            )}
                            {abstract && (
                                <button
                                    type="button"
                                    className="pub__btn"
                                    aria-expanded={open}
                                    aria-controls={panelId}
                                    onClick={() => setOpen(o => !o)}
                                >
                                    Abstract
                                    <svg className="pub__chev" width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                                        <path d="M1.5 3.5 5 7l3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {abstract && !staticPills && (
                <div id={panelId} className="pub__abstract" data-open={open} role="region" aria-label={`Abstract: ${title}`}>
                    <div className="pub__abstract-clip">
                        <p className="pub__abstract-text">{abstract}</p>
                    </div>
                </div>
            )}
        </li>
    );
}
