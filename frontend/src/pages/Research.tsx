import { useEffect, useRef, useState } from "react"
import type { CSSProperties } from "react"

import "./Research.css"

import Button from "../components/Button"
import Signal from "../components/Signal"
import Reveal from "../components/Reveal"
import PageHeader from "../components/PageHeader"
import SectionHeader from "../components/SectionHeader"
import PublicationItem from "../components/PublicationItem"
import { API_BASE_URL } from "../lib/api"
import { openPaperPdf } from "../lib/papers"
import type { Paper } from "../lib/papers"
import { usePhasedValue } from "../hooks/usePhasedValue"
import { useReducedMotion } from "../hooks/useReducedMotion"
import { useSlidingIndicator } from "../hooks/useSlidingIndicator"
import { useSmoothHeight } from "../hooks/useSmoothHeight"

const filters = ["All", "International", "National", "Peer-Reviewed", "Reviewed", "Conference Papers", "Books"];
// Visual grouping only: [All] | scope | category
const SEPARATE_BEFORE = new Set(["International", "Peer-Reviewed"]);

// A paper matches a filter if its category OR its scope equals the filter.
function paperTypes(paper: Paper): string[] {
    return [paper.category, paper.scope].filter(Boolean) as string[];
}

// "January–June, 2023" → "2023". Anything without a 4-digit year keeps its own text as the heading.
function yearOf(year: string): string {
    return year.match(/\b(?:19|20)\d{2}\b/)?.[0] ?? (year.trim() || "Undated");
}

// Newest year first; within a year the API's own order is preserved.
function groupByYear(papers: Paper[]): { label: string; papers: Paper[] }[] {
    const map = new Map<string, Paper[]>();
    for (const p of papers) {
        const k = yearOf(p.year);
        const list = map.get(k);
        if (list) list.push(p); else map.set(k, [p]);
    }
    const entries = [...map.entries()];
    const numeric = entries.filter(([k]) => /^\d{4}$/.test(k)).sort((a, b) => Number(b[0]) - Number(a[0]));
    const other = entries.filter(([k]) => !/^\d{4}$/.test(k));
    return [...numeric, ...other].map(([label, list]) => ({ label, papers: list }));
}

export default function Research() {

    const [activeFilter, setActiveFilter] = useState("All");
    const [papers, setPapers] = useState<Paper[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [attempt, setAttempt] = useState(0);
    const reduced = useReducedMotion();

    useEffect(() => {
        let cancelled = false;

        async function loadPapers() {
            try {
                const res = await fetch(`${API_BASE_URL}/papers/`);
                if (!res.ok) throw new Error(`Failed to load papers (${res.status})`);
                const data: Paper[] = await res.json();
                if (!cancelled) setPapers(data);
            } catch (err) {
                if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load papers");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadPapers();
        return () => { cancelled = true; };
    }, [attempt]);

    function retry() {
        setError(null);
        setLoading(true);
        setAttempt(a => a + 1);
    }

    // The buttons follow the click instantly; the list waits for its old content to leave.
    const [shownFilter, phase] = usePhasedValue(activeFilter, { exitMs: 130, enabled: !reduced });
    const { outer, inner } = useSmoothHeight(shownFilter);

    const filterPapers = (f: string) => f === "All" ? papers : papers.filter(p => paperTypes(p).includes(f));
    const filteredPapers = filterPapers(shownFilter);
    const groups = groupByYear(filteredPapers);
    const countFor = (f: string) => filterPapers(f).length;

    // Sliding underline under the active filter; keep it in view on narrow screens
    const trackRef = useRef<HTMLDivElement>(null);
    useSlidingIndicator(trackRef, activeFilter);
    const firstRun = useRef(true);
    useEffect(() => {
        if (firstRun.current) { firstRun.current = false; return; }
        trackRef.current?.querySelector<HTMLElement>('[data-active="true"]')
            ?.scrollIntoView({ block: "nearest", inline: "center", behavior: reduced ? "auto" : "smooth" });
    }, [activeFilter, reduced]);

    const loaded = !loading && !error;
    let runningIndex = 0;

    return (
        <div>
            <PageHeader title="Research" description="Academic publications, conference papers and ongoing work" />

            {/* Filters */}
            <div className="filters seq" style={{ "--d": "460ms" } as CSSProperties}>
                <div className="filters__track" ref={trackRef} role="group" aria-label="Filter publications">
                    {filters.map(filter => (
                        <span key={filter} className="filters__cell" data-gap={SEPARATE_BEFORE.has(filter) ? "true" : undefined}>
                            <button
                                type="button"
                                className="filter"
                                aria-pressed={activeFilter === filter}
                                data-active={activeFilter === filter}
                                onClick={() => setActiveFilter(filter)}
                            >
                                {filter}
                                {loaded && <span className="filter__count">{countFor(filter)}</span>}
                            </button>
                        </span>
                    ))}
                    <span className="filters__indicator" aria-hidden="true" />
                </div>
                <p className="filters__status meta" aria-live="polite">
                    {loaded && (activeFilter === "All"
                        ? `${papers.length} ${papers.length === 1 ? "publication" : "publications"}`
                        : `${filterPapers(activeFilter).length} of ${papers.length}`)}
                </p>
            </div>

            {/* Papers */}
            {loading && (
                <div className="state" role="status">
                    <div className="state__row">
                        <Signal size={22} animate="loading" style={{ color: "var(--accent)" }} />
                        <p>Loading papers…</p>
                    </div>
                    <div className="skeleton" aria-hidden="true"><span /><span /><span /></div>
                </div>
            )}

            {!loading && error && (
                <div className="state state--error" role="alert">
                    <p>Couldn't load papers right now ({error}).</p>
                    <Button variant="ghost" onClick={retry} style={{ marginTop: "18px" }}>Try again</Button>
                </div>
            )}

            {loaded && (
                <div ref={outer} className="pubs-shell">
                    <div ref={inner} className="pubs" data-phase={phase}>
                        <div key={shownFilter} className="pubs__groups">
                            {groups.map(group => {
                                const start = runningIndex;
                                return (
                                    <section key={group.label} className="year" style={{ "--i": Math.min(start, 9) } as CSSProperties}>
                                        <h2 className="year__label">{group.label}</h2>
                                        <ol className="year__list">
                                            {group.papers.map(paper => {
                                                const idx = runningIndex++;
                                                const dateLine = paper.year !== group.label ? paper.year : undefined;
                                                return (
                                                    <PublicationItem
                                                        key={paper.id}
                                                        index={idx}
                                                        title={paper.title}
                                                        source={paper.journal}
                                                        date={dateLine}
                                                        kinds={paperTypes(paper)}
                                                        activeKind={shownFilter === "All" ? undefined : shownFilter}
                                                        byline={[paper.institute, paper.venue].filter(Boolean) as string[]}
                                                        identifiers={[paper.volume, paper.issn, paper.isbn].filter(Boolean) as string[]}
                                                        coAuthor={paper.co_author}
                                                        abstract={paper.abstract}
                                                        hasPdf={Boolean(paper.pdf_url)}
                                                        onOpenPdf={() => openPaperPdf(paper.id)}
                                                    />
                                                );
                                            })}
                                        </ol>
                                    </section>
                                );
                            })}

                            {filteredPapers.length === 0 && (
                                <div className="state state--empty">
                                    <p>{shownFilter === "All" ? "No papers have been added yet." : "No papers match this filter yet."}</p>
                                    {shownFilter !== "All" && (
                                        <Button variant="ghost" onClick={() => setActiveFilter("All")} style={{ marginTop: "18px" }}>Show all papers</Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Ongoing/Current Research */}
            <SectionHeader title="Ongoing Research" description="Work in progress, upcoming publications, or research themes." />

            <Reveal as="ul" stagger className="ongoing">
                <li className="ongoing__item">
                    <h3 className="ongoing__title">Work Title</h3>
                    <p className="ongoing__text">Work Description</p>
                </li>
                <li className="ongoing__item">
                    <h3 className="ongoing__title">Work Title</h3>
                    <p className="ongoing__text">Work Description</p>
                </li>
            </Reveal>
        </div>
    );
}
