import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import Signal from "./Signal";
import { useSlidingIndicator } from "../hooks/useSlidingIndicator";
import "./Navbar.css";

const links = [
    { to: "/Home", label: "Home" },
    { to: "/About", label: "About" },
    { to: "/Research", label: "Research" },
    { to: "/Contact", label: "Contact" },
];

export default function Navbar() {
    const { pathname } = useLocation();
    const [scrolled, setScrolled] = useState(false);
    // The menu remembers *which page* it was opened on, so navigating closes it for free.
    const [openOn, setOpenOn] = useState<string | null>(null);
    const open = openOn === pathname;

    const navRef = useRef<HTMLElement>(null);
    const toggleRef = useRef<HTMLButtonElement>(null);

    const activeTo = links.find(l => l.to.toLowerCase() === pathname.toLowerCase())?.to ?? null;
    useSlidingIndicator(navRef, activeTo);

    // Compress the masthead once the page has moved.
    useEffect(() => {
        let raf = 0;
        const onScroll = () => {
            if (raf) return;
            raf = requestAnimationFrame(() => { raf = 0; setScrolled(window.scrollY > 16); });
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
    }, []);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") { setOpenOn(null); toggleRef.current?.focus(); }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open]);

    return (
        <>
            <header className="masthead" data-scrolled={scrolled} data-open={open}>
                <div className="masthead__inner page-container">
                    <Link to="/Home" className="brand">
                        <span className="brand__inst">
                            <span className="brand__inst-inner">
                                <Signal size={13} animate="tune" />
                                <span>Tezpur University</span>
                            </span>
                        </span>
                        <span className="brand__name">Dr. Abhijit Bora</span>
                    </Link>

                    <nav ref={navRef} className="nav" aria-label="Primary">
                        {links.map(link => {
                            const active = link.to === activeTo;
                            return (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className="nav__link"
                                    data-active={active}
                                    aria-current={active ? "page" : undefined}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                        <span className="nav__indicator" aria-hidden="true" />
                    </nav>

                    <button
                        ref={toggleRef}
                        type="button"
                        className="menu-toggle"
                        aria-expanded={open}
                        aria-controls="mobile-nav"
                        onClick={() => setOpenOn(open ? null : pathname)}
                    >
                        <span>{open ? "Close" : "Menu"}</span>
                        <span className="menu-toggle__icon" aria-hidden="true"><i /><i /></span>
                    </button>
                </div>

                <div id="mobile-nav" className="masthead__panel" data-open={open}>
                    <nav aria-label="Mobile primary" className="page-container">
                        {links.map(link => {
                            const active = link.to === activeTo;
                            return (
                                <Link key={link.to} to={link.to} className="panel__link" aria-current={active ? "page" : undefined}>
                                    <Signal size={16} />
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* A hairline that draws itself across the masthead on every route change */}
                <span key={pathname} className="masthead__sweep" aria-hidden="true" />
            </header>
            <div className="masthead-spacer" aria-hidden="true" />
        </>
    );
}
