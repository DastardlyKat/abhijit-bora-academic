import Signal from "./Signal";
import Reveal from "./Reveal";
import "./Footer.css";

// Give a network an `href` and it becomes a real link; without one it stays
// plain text (as before, when these were inert pills).
const socials: { label: string; href?: string }[] = [
    { label: "Google Scholar",  href: "https://scholar.google.com/citations?user=3g0k1xEAAAAJ&hl=en" },
    { label: "Research Gate", href: "https://www.researchgate.net/profile/Abhijit-Bora" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/abhijit-bora-60649333a/" },
];

export default function Footer() {
    return (
        <footer className="footer">
            <Reveal variant="none" className="footer__inner page-container">
                <div className="footer__rule" aria-hidden="true">
                    <span className="footer__rule-line" />
                    <Signal size={16} style={{ color: "var(--accent)" }} />
                    <span className="footer__rule-line" />
                </div>

                <div className="footer__row">
                    <div className="footer__id">
                        <p className="footer__name">Dr. Abhijit Bora</p>
                        <p className="footer__contact">
                            <span>Tezpur University</span>
                            <a className="link" href="mailto:abhijit71bora@gmail.com">abhijit71bora@gmail.com</a>
                        </p>
                    </div>

                    <ul className="footer__socials">
                        {socials.map(s => (
                            <li key={s.label}>
                                {s.href
                                    ? <a className="link" href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a>
                                    : <span>{s.label}</span>}
                            </li>
                        ))}
                    </ul>
                </div>
            </Reveal>
        </footer>
    );
}
