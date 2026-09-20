import type { CSSProperties } from "react"

import "./About.css"

import Tag from "../components/Tag"
import Portrait from "../components/Portrait"
import Signal from "../components/Signal"
import Reveal from "../components/Reveal"
import MaskText from "../components/MaskText"
import SectionHeader from "../components/SectionHeader"
import Timeline from "../components/Timeline"
import type { TimelineEntry } from "../components/Timeline"
import VideoTile from "../components/VideoTile"

import img from "../assets/photo.jpg"
import radioCover from "../assets/radio.jpg"

const stats = [
  { number: "24+", label: "Peer-Reviewed Journal Papers" },
  { number: "33+", label: "Non Peer-Reviewed Journal Papers" },
  { number: "30+", label: "Book Chapters" },
  { number: "2", label: "Books Authored" },
  { number: "15+", label: "ODL Study Materials" },
];

const bio = [
  {
    label: "Who I am",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam ut turpis ac nunc elementum mattis. Vivamus eget congue tellus. Curabitur mattis fermentum est. Nullam pellentesque odio elit, et consequat dui faucibus ac. Curabitur interdum ex at lobortis pretium. Nulla facilisi. Morbi est metus, commodo eu nulla ut, volutpat tincidunt ex.",
  },
  {
    label: "Research focus",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam ut turpis ac nunc elementum mattis. Vivamus eget congue tellus. Curabitur mattis fermentum est. Nullam pellentesque odio elit, et consequat dui faucibus ac. Curabitur interdum ex at lobortis pretium. Nulla facilisi.",
  },
  {
    label: "Teaching philosophy",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam ut turpis ac nunc elementum mattis. Vivamus eget congue tellus. Curabitur mattis fermentum est. Nullam pellentesque odio elit, et consequat dui faucibus ac.",
  },
];

// Placeholder blurbs are kept word-for-word; they are the owner's to fill in.
const overview = [
  { title: "Research", text: "2 – 3 lines summary" },
  { title: "Teaching", text: "Courses you teach" },
  { title: "Media", text: "TV appearances, newspaper columns, radio, interviews" },
];

const education = [
  { period: "2004 – 2009 (March)", title: "Radio And Its Revival In The 1990s: An Analytical Study", detail: "Ph.D. | Gauhati University, Assam" },
  { period: "1993 – 1995", title: "Mass Communication", detail: "M.Sc. | Kurukshetra University, Haryana" },
  { period: "1990 – 1993", title: "Political Science", detail: "B.A. (Honours) | Hindu College, Delhi University" },
];

const experience = [
  { period: "2016 to Present", title: "Professor", detail: "Department of Mass Communication & Journalism | Tezpur University" },
  { period: "Nov 24, 2009 – Sep 4, 2016", title: "Associate Professor", detail: "Department of Mass Communication & Journalism | Tezpur University" },
  { period: "Dec 4, 2003 – Nov 23, 2009", title: "Assistant Professor", detail: "Department of Communication & Journalism | Gauhati University" },
  { period: "Feb 4, 2002 – Dec 3, 2003", title: "Assistant News Editor", detail: "News Services Division | All India Radio, Dibrugarh, Assam" },
  { period: "Feb 10, 1998 – Jan 31, 2002", title: "Staff Reporter", detail: "The Assam Tribune, Guwahati, Assam" },
  { period: "Dec 1, 1997 – Feb 9, 1998", title: "Sub Editor", detail: "The Sentinel, Guwahati, Assam" },
];

// "Qualifier | Institution" strings are split on the pipe so the institution can lead.
const parts = (detail: string) => detail.split(" | ");

const educationEntries: TimelineEntry[] = education.map(e => {
  const [degree, institution] = parts(e.detail);
  return institution
    ? { period: e.period, title: e.title, kicker: degree, primary: institution }
    : { period: e.period, title: e.title, primary: degree };
});

const experienceEntries: TimelineEntry[] = experience.map(e => {
  const [first, second] = parts(e.detail);
  return second
    ? { period: e.period, title: e.title, primary: second, secondary: first }
    : { period: e.period, title: e.title, primary: first };
});

const achievements = [
  { title: "International Fellowship — United States", body: "Selected for the US State Department's SUSI (Study of the US Institutes) 2010 program at Ohio University, a fully funded international academic fellowship." },
  { title: "Global Academic Fellowships", body: "Fellowships at McGill University, Canada, and Nanyang Technological University, Singapore, focused on comparative journalism and communication research." },
  { title: "International Conference Contributions", body: "Presented and published research at international conferences in Thailand, Singapore, and India in media ethics, broadcasting and communication." },
  { title: "Research Publications", body: "Authored 30+ research publications across international, national and regional journals in journalism and communication studies." },
];

const phd = { awarded: 8, ongoing: 7 };

const exposure = [
  "Study of US Institutes of Journalism, Ohio University, USA (2010)",
  "Faculty Enrichment Programme, McGill University, Canada (2008)",
  "Fellowship, Nanyang Technical University, Singapore (2007)",
];

// "Programme, Institution, Country (Year)" → a dateline. Falls back to the raw
// string if a future edit doesn't follow the pattern.
function parseExposure(s: string) {
  const m = s.match(/^(.*), ([^,]+), ([^,]+) \((\d{4})\)$/);
  return m ? { program: m[1], institution: m[2], country: m[3], year: m[4] } : null;
}

const books: { title: string; detail: string; cover?: string }[] = [
  { title: "Radio - A True Medium of the Masses", detail: "VDM Verlag, Germany", cover: radioCover },
  { title: "Asomor Chalachitrat Asomor Bastavata", detail: "Tezpur University, 2025" },
];

const resources = [
  { title: "Background Research in Journalism | Part 1", link: "https://youtu.be/YP-1yrVDA4c" },
  { title: "Background Research in Journalism | Part 2", link: "https://youtu.be/yCGN5AZBpk8" },
  { title: "Writing Reviews and Features | Part 1", link: "https://youtu.be/3h-OCcN1lHA" },
  { title: "Writing Reviews and Features | Part 2", link: "https://youtu.be/JZrHc-4DBZY" },
  { title: "Fake News, Misinformation in Crisis Times", link: "https://youtu.be/f0lR96JHLg8" },
  { title: "Editorial Writing and Opinion in Journalism | Part 1", link: "https://youtu.be/plXCASTLByQ" },
];

const seq = (ms: number) => ({ "--d": `${ms}ms` } as CSSProperties);

export default function About() {
  return (
    <div>
      {/* Profile header */}
      <section className="profile" data-seq>
        <div className="profile__text">
          <h1 className="profile__name">
            <MaskText delay={100}>Dr. Abhijit</MaskText>{" "}
            <MaskText delay={200}>Bora</MaskText>
          </h1>
          <div className="profile__role seq" style={seq(440)}>
            <p className="profile__title">Professor</p>
            <p className="profile__dept">Department of Mass Communication & Journalism, Tezpur University, Assam</p>
          </div>
          <div className="profile__tags seq" style={seq(600)}>
            <Tag variant="outline">Journalism</Tag>
            <Tag variant="outline">Science Communication</Tag>
            <Tag variant="outline">Development Communication</Tag>
            <Tag variant="outline">Media Literacy</Tag>
          </div>
        </div>
        <Portrait className="profile__figure" src={img} alt="Dr. Abhijit Bora" />
      </section>

      {/* Bio — a ledger: margin label, reading column */}
      <SectionHeader title="Bio" />
      <Reveal as="ul" className="ledger">
        {bio.map((section, i) => (
          <li key={section.label} className="ledger__row" data-lead={i === 0 ? "true" : undefined}>
            <h3 className="ledger__label">{section.label}</h3>
            <p className="ledger__text">{section.text}</p>
          </li>
        ))}
      </Reveal>

      <Reveal as="ul" className="trio">
        {overview.map(o => (
          <li key={o.title} className="trio__col">
            <h2 className="trio__title">{o.title}</h2>
            <p className="trio__text">{o.text}</p>
          </li>
        ))}
      </Reveal>

      <SectionHeader title="Education" />
      <Timeline items={educationEntries} label="Education" />

      <SectionHeader title="Experience" />
      <Timeline items={experienceEntries} label="Professional experience" />

      {/* Achievements — top-ruled columns */}
      <SectionHeader title="Achievements" />
      <Reveal as="ul" stagger className="achv">
        {achievements.map(a => (
          <li key={a.title} className="achv__item">
            <h3 className="achv__title">{a.title}</h3>
            <p className="achv__body">{a.body}</p>
          </li>
        ))}
      </Reveal>

      {/* PhD supervision — the numbers, and one mark per scholar */}
      <SectionHeader title="PhD Supervision" />
      <Reveal variant="none" className="phd">
        <div className="phd__figures">
          <div className="phd__fig phd__fig--awarded">
            <p className="phd__num"><MaskText>{phd.awarded}</MaskText></p>
            <p className="phd__label">Awarded</p>
          </div>
          <div className="phd__fig">
            <p className="phd__num"><MaskText delay={120}>{phd.ongoing}</MaskText></p>
            <p className="phd__label">Ongoing</p>
          </div>
        </div>
        <div className="phd__marks" role="img" aria-label={`${phd.awarded} awarded, ${phd.ongoing} ongoing`}>
          {Array.from({ length: phd.awarded + phd.ongoing }, (_, i) => (
            <span key={i} className="phd__mark" data-state={i < phd.awarded ? "awarded" : "ongoing"} style={{ "--i": i } as CSSProperties} />
          ))}
        </div>
      </Reveal>

      {/* Publication stats — one band, set in type */}
      <SectionHeader title="Publication Stats" />
      <Reveal as="dl" variant="none" className="stats">
        {stats.map((stat, i) => (
          <div key={stat.label} className="stat">
            <dt className="stat__label">{stat.label}</dt>
            <dd className="stat__num"><MaskText delay={i * 80}>{stat.number}</MaskText></dd>
          </div>
        ))}
      </Reveal>

      {/* International exposure — datelines */}
      <SectionHeader title="International Exposure" />
      <Reveal as="ul" className="expo">
        {exposure.map(item => {
          const p = parseExposure(item);
          return p ? (
            <li key={item} className="expo__row">
              <p className="expo__year">{p.year}</p>
              <p className="expo__country">{p.country}</p>
              <div className="expo__what">
                <h3 className="expo__inst">{p.institution}</h3>
                <p className="expo__prog">{p.program}</p>
              </div>
            </li>
          ) : (
            <li key={item} className="expo__row expo__row--raw"><p className="expo__prog">{item}</p></li>
          );
        })}
      </Reveal>

      {/* Books */}
      <SectionHeader title="Books" />
      <Reveal as="ul" stagger className="books">
        {books.map(book => (
          <li key={book.title} className="book">
            {book.cover ? (
              <div className="book__cover"><img src={book.cover} alt={`Cover of “${book.title}”`} width={680} height={1000} loading="lazy" /></div>
            ) : (
              /* No cover image on file for this title: a typographic stand-in, not a fake cover.
                 Set `cover` in the `books` array above to replace it. */
              <div className="book__cover book__cover--type" aria-hidden="true"><Signal size={20} /></div>
            )}
            <div className="book__text">
              <h3 className="book__title">{book.title}</h3>
              <p className="meta book__detail">{book.detail}</p>
            </div>
          </li>
        ))}
      </Reveal>

      {/* E-Resources */}
      <SectionHeader title="E-Resources" description="Video lectures for students and anyone with an interest in mass communication and media issues." />
      <Reveal as="ul" stagger className="vids">
        {resources.map(r => {
          const [title, part] = r.title.split(" | ");
          return <li key={r.link}><VideoTile title={title} part={part} href={r.link} /></li>;
        })}
      </Reveal>
    </div>
  );
}
