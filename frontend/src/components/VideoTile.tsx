import { useState } from "react";
import "./VideoTile.css";

type VideoTileProps = { title: string; part?: string; href: string };

// youtu.be/<id> → thumbnail. hqdefault is 4:3 with letterbox bars; cropping it
// to 16:9 with object-fit removes them exactly.
const videoId = (href: string) => href.split("/").pop()?.split("?")[0] ?? "";

/**
 * A lecture is a place you go, not a sentence you read: a thumbnail with a
 * play mark, opening YouTube in a new tab. If the thumbnail can't load
 * (offline, blocked, removed) a quiet typographic tile stands in.
 */
export default function VideoTile({ title, part, href }: VideoTileProps) {
    const [failed, setFailed] = useState(false);
    const id = videoId(href);

    return (
        <a className="vid" href={href} target="_blank" rel="noopener noreferrer">
            <span className="vid__thumb">
                {!failed && id && (
                    <img
                        src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`}
                        alt=""
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={() => setFailed(true)}
                    />
                )}
                <span className="vid__play" aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3.5 1.8v10.4L12 7 3.5 1.8Z" fill="currentColor" /></svg>
                </span>
            </span>
            <span className="vid__text">
                <span className="vid__title">{title}</span>
                <span className="vid__meta meta">
                    {part && <span>{part}</span>}
                    <span>Watch on YouTube<span className="visually-hidden"> (opens in a new tab)</span></span>
                </span>
            </span>
        </a>
    );
}
