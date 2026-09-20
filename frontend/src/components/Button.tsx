import type { CSSProperties, ReactNode } from "react";
import "./Button.css";

type ButtonProps = {
    children: ReactNode;
    style?: CSSProperties;
    onClick?: () => void;
    variant?: "primary" | "ghost";
    type?: "button" | "submit";
}

export default function Button({ children, style, onClick, variant = "primary", type = "button" }: ButtonProps) {
    return (
        <button type={type} className={`btn btn--${variant}`} style={style} onClick={onClick}>
            <span className="btn__label">{children}</span>
        </button>
    );
}
