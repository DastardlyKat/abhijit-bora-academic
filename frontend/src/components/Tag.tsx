import type { CSSProperties, ReactNode } from "react";
import "./Tag.css";

type TagProps = {
    children: ReactNode;
    variant?: "outline" | "solid" | "accent";
    style?: CSSProperties;
    onClick?: () => void;
    disabled?: boolean;
}

export default function Tag({ children, variant = "outline", style, onClick, disabled }: TagProps) {
    const cls = `tag tag--${variant}${onClick ? " tag--button" : ""}`;

    // Renders as a real <button> when clickable, so it's keyboard-accessible
    // and doesn't fire onClick when disabled.
    if (onClick) {
        return (
            <button type="button" className={cls} onClick={disabled ? undefined : onClick} disabled={disabled} style={style}>
                {children}
            </button>
        );
    }

    return <span className={cls} style={style}>{children}</span>;
}
