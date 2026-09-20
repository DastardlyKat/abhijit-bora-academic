import { useRef } from "react";
import type { CSSProperties } from "react";
import { useParallax } from "../hooks/useParallax";
import "./Portrait.css";

type PortraitProps = {
    src: string;
    alt: string;
    caption?: string;
    className?: string;
    style?: CSSProperties;
};

/**
 * The professor's photograph: a plain rectangle with an offset registration
 * frame, a curtain reveal and a 14px parallax. The source image is a 360px
 * square, so the box is square too (no cropping) and capped at ~340px wide
 * to avoid upscaling.
 */
export default function Portrait({ src, alt, caption, className, style }: PortraitProps) {
    const parRef = useRef<HTMLDivElement>(null);
    useParallax(parRef, 10);

    return (
        <figure className={["portrait-fig", className].filter(Boolean).join(" ")} style={style}>
            <div className="portrait-frame">
                <div className="portrait">
                    <div className="portrait__par" ref={parRef}>
                        <img className="portrait__img" src={src} alt={alt} width={360} height={360} />
                    </div>
                </div>
            </div>
            {caption && (
                <figcaption className="meta portrait__caption seq" style={{ "--d": "900ms" } as CSSProperties}>{caption}</figcaption>
            )}
        </figure>
    );
}
