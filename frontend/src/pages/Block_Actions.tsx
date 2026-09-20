import { useEffect } from "react";

export default function useBlockActions () {
    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => e.preventDefault();

        const handleKeyDown = (e: KeyboardEvent) => {
            if(
                (e.ctrlKey && ["c", "s", "u"].includes(e.key.toLowerCase())) || e.key === "F12"
            ) {
                e.preventDefault();
            }
        };

        document.addEventListener("contextmenu", handleContextMenu);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("contextmenu", handleContextMenu);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);
}