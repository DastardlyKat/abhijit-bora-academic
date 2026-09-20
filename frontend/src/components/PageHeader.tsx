import type { CSSProperties } from "react";
import MaskText from "./MaskText";
import "./PageHeader.css";

// Opening block for inner pages (Research, Contact): first-screen sequence.
export default function PageHeader({ title, description }: { title: string; description: string }) {
    return (
        <header className="ph" data-seq>
            <h1 className="ph__title"><MaskText delay={60}>{title}</MaskText></h1>
            <p className="ph__desc seq" style={{ "--d": "300ms" } as CSSProperties}>{description}</p>
            <div className="ph__rule" aria-hidden="true" />
        </header>
    );
}
