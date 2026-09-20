import type { CSSProperties } from "react"
import { Link } from "react-router-dom"

import "./Home.css"

import Card from "../components/Card"
import Tag from "../components/Tag"
import Signal from "../components/Signal"
import Portrait from "../components/Portrait"
import Reveal from "../components/Reveal"
import MaskText from "../components/MaskText"
import SectionHeader from "../components/SectionHeader"
import PublicationItem from "../components/PublicationItem"
import { findPaper, hasReadableFiles, isConferencePaper, isJournalPaper, latestPapers, openPaperPdf, paperPdfUrl, usePapers } from "../lib/papers"
import type { Paper } from "../lib/papers"

import img from "../assets/photo.jpg"
import img1 from "../assets/radio.jpg"

const heroCard = {
  id: 1,
  category: "Book",
  date: "2010",
  title: "Radio - A True Medium of the Masses",
  excerpt: "An in-depth study of radio as a mass medium, tracing its role in public communication, community outreach, and its enduring relevance in the age of digital convergence.",
  publisher: "VDM Verlag, Germany",
  isbn: "ISBN-13: 978-3639264487",
};

const sidebarCards = [
  {
    id: 2,
    category: "Conference Paper",
    date: "September, 2023",
    title: "Science and Health Communication in Higher Education: A case study of Assam",
    venue: "AMIC Annual Meet, Bandung, Indonesia",
  },
  {
    id: 3,
    category: "Conference Paper",
    date: "June, 2013",
    title: "Ethics in Advertising: How to balance mass expectations and business interests",
    venue: "SIBR Conference, Bangkok, Thailand",
  },
  {
    id: 4,
    category: "Conference Paper",
    date: "June, 2007",
    title: "Public service broadcasting in India: Not an encouraging scenario",
    venue: "RadioAsia 2007, Singapore",
  },
];

const recentPapers = [
  {
    id: 5,
    title: "Jakarta Mahanagarit Satsari Ghatotkach",
    journal: "Satsari (Monthly Assamese Magazine)",
    date: "June, 2024",
  },
  {
    id: 6,
    title: "Coverage of India-related scientific news in western media: An analysis of the news portals of the New York Times and The Guardian",
    journal: "Communicator, IIMC Delhi",
    date: "January–June, 2023",
  },
  {
    id: 7,
    title: "Integrating Bharatiya Knowledge system in higher education for transmission of our culture and tradition",
    journal: "University News, Association of Indian Universities, Delhi",
    date: "November, 2023",
  },
];

// The featured book is written out below (its cover is a local image), so it is
// matched to its database record by title. If that ever fails, pin it to the
// record's id instead:  "Radio - A True Medium of the Masses": 12
// The conference-paper list and the recent-papers list come straight from the
// database; the text below is only what is shown while the API is unreachable.
const PINNED_IDS: Record<string, number> = {};

const PdfMark = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4 1.75h5.2L12.25 4.8V14.25H4V1.75Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    <path d="M9 1.75V5h3.25" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
  </svg>
);

const Arrow = () => (
  <svg className="arrow" width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
    <path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

type SideItem = { key: string; category: string; date?: string; title: string; venue?: string; pdf: string | null };
type RecentItem = { key: string; title: string; journal: string; date: string; paper?: Paper };

const seq = (ms: number) => ({ "--d": `${ms}ms` } as CSSProperties);

export default function Home() {
  const { papers } = usePapers();

  const leadPaper = findPaper(papers, heroCard.title, PINNED_IDS[heroCard.title]);
  const leadPdf = leadPaper?.pdf_url ? paperPdfUrl(leadPaper.id) : null;

  // Live data when the API has it, the written-out text otherwise
  const conference = latestPapers(papers, isConferencePaper, 3);
  const sideItems: SideItem[] = conference.length
    ? conference.map(p => ({
        key: `p${p.id}`,
        category: p.category.replace(/s$/i, ""),
        date: p.year,
        title: p.title,
        venue: p.venue || p.journal,
        pdf: p.pdf_url ? paperPdfUrl(p.id) : null,
      }))
    : sidebarCards.map(c => ({ key: `c${c.id}`, category: c.category, date: c.date, title: c.title, venue: c.venue, pdf: null }));

  // Newest first, but papers that have a PDF or an abstract come before ones that
  // have neither, so the pills on this list always have something to open.
  const journalNewest = latestPapers(papers, isJournalPaper, papers.length);
  const journal = [...journalNewest.filter(hasReadableFiles), ...journalNewest.filter(p => !hasReadableFiles(p))].slice(0, 3);
  const recentItems: RecentItem[] = journal.length
    ? journal.map(p => ({ key: `p${p.id}`, title: p.title, journal: p.journal, date: p.year, paper: p }))
    : recentPapers.map(c => ({ key: `c${c.id}`, title: c.title, journal: c.journal, date: c.date }));

  return (
    <div>
      {/* Hero — one staged sequence: institution → name → designation → bio → tags; portrait enters on its own */}
      <section className="hero" data-seq>
        <div className="hero__text">
          <p className="eyebrow hero__eyebrow seq" style={seq(0)}>
            <Signal size={14} animate="tune" />
            Tezpur, Assam — Faculty Profile
          </p>

          <h1 className="hero__name">
            <MaskText delay={140}>Dr. Abhijit</MaskText>{" "}
            <MaskText delay={260}>Bora</MaskText>
          </h1>

          <div className="hero__designation seq" style={seq(520)}>
            <p className="hero__role">Professor, Department of Mass Communication & Journalism</p>
            <p className="hero__place">Tezpur University, Assam</p>
          </div>

          <p className="hero__bio seq" style={seq(680)}>
            Short bio — 2-3 lines. Research interests, current focus, institutional affiliations. Should read like a byline.
          </p>

          <div className="hero__tags seq" style={seq(840)}>
            <Tag variant="outline">Journalism</Tag>
            <Tag variant="outline">Science Communication</Tag>
            <Tag variant="outline">Development Communication</Tag>
            <Tag variant="outline">Media Literacy</Tag>
          </div>
        </div>

        <Portrait className="hero__figure" src={img} alt="Dr. Abhijit Bora" caption="DR. ABHIJIT BORA · TEZPUR, ASSAM" />
      </section>

      <SectionHeader title="Featured Writing" />

      <div className="featured">
        <Reveal>
          <Card as="article" variant="interactive" className="lead">
            <div className="lead__cover">
              <img src={img1} alt={`Cover of “${heroCard.title}”`} width={680} height={1000} />
            </div>
            <div className="lead__body">
              <Tag variant="outline" style={{ marginBottom: "14px" }}>{heroCard.category}</Tag>
              <h3 className="lead__title">
                {/* Stretched link: the whole card is the target, the title is its accessible name.
                    Opens the PDF when there is one; otherwise falls back to the publications index. */}
                {leadPdf ? (
                  <a href={leadPdf} target="_blank" rel="noopener noreferrer" className="lead__link">
                    {heroCard.title}
                    <span className="visually-hidden"> (opens PDF in a new tab)</span>
                  </a>
                ) : (
                  <Link to="/Research" className="lead__link">{heroCard.title}</Link>
                )}
              </h3>
              <p className="lead__excerpt">{heroCard.excerpt}</p>
              <div className="lead__meta">
                <p className="meta">{[heroCard.publisher, heroCard.date].filter(Boolean).join(" — ")}</p>
                <p className="meta">{heroCard.isbn}</p>
              </div>
              <span className="lead__cta" aria-hidden="true">{leadPdf ? "Read PDF" : "Browse publications"} <Arrow /></span>
            </div>
          </Card>
        </Reveal>

        <Reveal as="ul" delay={120} className="side">
          {sideItems.map(item => (
            <li key={item.key} className="side__item" data-linked="true">
              <p className="side__kind">
                <span className="side__cat">{item.category}</span>
                {item.date && <span className="meta">{item.date}</span>}
                <span className="side__pdf" aria-hidden="true">
                  {item.pdf ? <><PdfMark />PDF</> : <Arrow />}
                </span>
              </p>
              <h3 className="side__title">
                {/* Whole row is the target: the paper's PDF, or the publications index when there is no PDF */}
                {item.pdf ? (
                  <a href={item.pdf} target="_blank" rel="noopener noreferrer" className="side__link">
                    {item.title}
                    <span className="visually-hidden"> (opens PDF in a new tab)</span>
                  </a>
                ) : (
                  <Link to="/Research" className="side__link">{item.title}</Link>
                )}
              </h3>
              {item.venue && <p className="side__venue">{item.venue}</p>}
            </li>
          ))}
        </Reveal>
      </div>

      <SectionHeader
        title="Recent Research Papers"
        action={<Link to="/Research" className="text-link">All publications <Arrow /></Link>}
      />

      <Reveal as="ul" className="recent">
        {recentItems.map(item => (
          <PublicationItem
            key={item.key}
            variant="compact"
            title={item.title}
            source={item.journal}
            date={item.date}
            /* Only when the API is unreachable: keep the original non-interactive pills */
            staticPills={!item.paper}
            alwaysShowAbstract
            hasPdf={Boolean(item.paper?.pdf_url)}
            onOpenPdf={item.paper ? () => openPaperPdf(item.paper!.id) : undefined}
            abstract={item.paper?.abstract}
          />
        ))}
      </Reveal>
    </div>
  );
}
