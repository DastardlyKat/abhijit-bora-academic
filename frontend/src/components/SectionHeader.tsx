import type { ReactNode } from "react";
import Reveal from "./Reveal";
import MaskText from "./MaskText";
import "./SectionHeader.css";

type SectionHeaderProps = {
    title: string;
    description?: string;
    /** Optional quiet link on the right, e.g. "All publications". */
    action?: ReactNode;
}

// The recurring section opener: title rises out of a mask, the rule draws
// left-to-right, the description follows a beat later.
export default function SectionHeader({ title, description, action }: SectionHeaderProps) {
    return (
        <Reveal variant="none" className="sh">
            <div className="sh__row">
                <h2 className="sh__title"><MaskText>{title}</MaskText></h2>
                {description && <p className="sh__desc">{description}</p>}
                {action && <div className="sh__action">{action}</div>}
            </div>
            <div className="sh__rule" aria-hidden="true" />
        </Reveal>
    );
}
