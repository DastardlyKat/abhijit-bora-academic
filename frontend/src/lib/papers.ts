import { useEffect, useState } from "react";
import { API_BASE_URL } from "./api";

// Shape returned by GET /papers/ (see backend PaperResponse schema)
export type Paper = {
    id: number;
    title: string;
    journal: string;
    institute?: string | null;
    co_author?: string | null;
    volume?: string | null;
    issn?: string | null;
    isbn?: string | null;
    venue?: string | null;
    year: string;
    category: string;   // "Books" | "Peer-Reviewed" | "Reviewed" | "Conference Papers" | "Book Chapters"
    scope?: string | null; // "International" | "National" | "Regional" | null (Books have none)
    abstract?: string | null;
    pdf_url?: string | null;
};

/** The (watermarked) PDF the backend serves for a paper. */
export const paperPdfUrl = (paperId: number) => `${API_BASE_URL}/papers/${paperId}/pdf`;

export function openPaperPdf(paperId: number) {
    window.open(paperPdfUrl(paperId), "_blank", "noopener,noreferrer");
}

const words = (s: string) => new Set(s.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 2));
const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/**
 * Finds the API record for a piece of content written directly into a page.
 * An explicit `paperId` wins. Otherwise titles are compared ignoring case and
 * punctuation ("Radio – A True…" equals "Radio - A True…"), then by how many
 * significant words they share, so small wording differences still match.
 * Returns undefined when nothing is close enough, so callers can fall back
 * to a non-interactive display instead of guessing.
 */
export function findPaper(papers: Paper[], title: string, paperId?: number): Paper | undefined {
    if (paperId !== undefined) return papers.find(p => p.id === paperId);

    const t = normalise(title);
    const exact = papers.find(p => normalise(p.title) === t);
    if (exact) return exact;

    const tw = words(title);
    let best: Paper | undefined;
    let bestScore = 0;
    for (const p of papers) {
        const n = normalise(p.title);
        const [short, long] = n.length < t.length ? [n, t] : [t, n];
        let score = short.length >= 20 && long.includes(short) ? 0.9 : 0;
        const pw = words(p.title);
        const shared = [...tw].filter(w => pw.has(w)).length;
        score = Math.max(score, shared / Math.max(tw.size, pw.size, 1));
        if (score > bestScore) { best = p; bestScore = score; }
    }
    return bestScore >= 0.6 ? best : undefined;
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** Sortable recency of a free-text year such as "January–June, 2023" (later month wins). */
export function recency(year: string): number {
    const y = year.match(/\b(?:19|20)\d{2}\b/)?.[0];
    if (!y) return 0;
    const month = Math.max(0, ...year.toLowerCase().split(/[^a-z]+/).map(w => MONTHS.indexOf(w.slice(0, 3)) + 1));
    return Number(y) * 100 + month;
}

/** The `n` most recent papers passing `keep`; ties keep the API's own order. */
export function latestPapers(papers: Paper[], keep: (p: Paper) => boolean, n: number): Paper[] {
    return papers.filter(keep).sort((a, b) => recency(b.year) - recency(a.year)).slice(0, n);
}

/** True when there is something to open: a PDF file or an abstract. */
export const hasReadableFiles = (p: Paper) => Boolean(p.pdf_url) || Boolean(p.abstract?.trim());

const cat = (p: Paper) => p.category.toLowerCase();
export const isConferencePaper = (p: Paper) => cat(p).includes("conference");
/** Journal-style research papers: everything that is not a book, chapter or conference paper. */
export const isJournalPaper = (p: Paper) => !cat(p).includes("book") && !cat(p).includes("conference");

/** Loads all papers once when the component mounts. Failure just yields an empty list. */
export function usePapers() {
    const [papers, setPapers] = useState<Paper[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/papers/`);
                if (!res.ok) throw new Error(String(res.status));
                const data: Paper[] = await res.json();
                if (!cancelled) setPapers(data);
            } catch {
                /* Home still renders its own content; items just stay non-interactive */
            } finally {
                if (!cancelled) setLoaded(true);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    return { papers, loaded };
}
