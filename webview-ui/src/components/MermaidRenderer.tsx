import { useEffect, useRef, useState } from "react";
import { vscode } from "../utils/vscode";

// Mermaid theme configuration moved from MermaidBlock
const MERMAID_THEME = {
    background: "#1e1e1e", // VS Code dark theme background
    textColor: "#ffffff", // Main text color
    mainBkg: "#2d2d2d", // Background for nodes
    nodeBorder: "#888888", // Border color for nodes
    lineColor: "#cccccc", // Lines connecting nodes
    primaryColor: "#3c3c3c", // Primary color for highlights
    primaryTextColor: "#ffffff", // Text in primary colored elements
    primaryBorderColor: "#888888",
    secondaryColor: "#2d2d2d", // Secondary color for alternate elements
    tertiaryColor: "#454545", // Third color for special elements

    // Class diagram specific
    classText: "#ffffff",

    // State diagram specific
    labelColor: "#ffffff",

    // Sequence diagram specific
    actorLineColor: "#cccccc",
    actorBkg: "#2d2d2d",
    actorBorder: "#888888",
    actorTextColor: "#ffffff",

    // Flow diagram specific
    fillType0: "#2d2d2d",
    fillType1: "#3c3c3c",
    fillType2: "#454545",
};

interface MermaidRendererProps {
    code: string;
}

export default function MermaidRenderer({ code }: MermaidRendererProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        // Dynamic import of mermaid
        import('mermaid').then(mermaidModule => {
            const mermaid = mermaidModule.default;

            // Initialize mermaid with our theme settings
            mermaid.initialize({
                startOnLoad: false,
                securityLevel: "loose",
                theme: "dark",
                themeVariables: {
                    ...MERMAID_THEME,
                    fontSize: "16px",
                    fontFamily: "var(--vscode-font-family, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif)",

                    // Additional styling
                    noteTextColor: "#ffffff",
                    noteBkgColor: "#454545",
                    noteBorderColor: "#888888",

                    // Improve contrast for special elements
                    critBorderColor: "#ff9580",
                    critBkgColor: "#803d36",

                    // Task diagram specific
                    taskTextColor: "#ffffff",
                    taskTextOutsideColor: "#ffffff",
                    taskTextLightColor: "#ffffff",

                    // Numbers/sections
                    sectionBkgColor: "#2d2d2d",
                    sectionBkgColor2: "#3c3c3c",

                    // Alt sections in sequence diagrams
                    altBackground: "#2d2d2d",

                    // Links
                    linkColor: "#6cb6ff",

                    // Borders and lines
                    compositeBackground: "#2d2d2d",
                    compositeBorder: "#888888",
                    titleColor: "#ffffff",
                }
            });

            if (isMounted && containerRef.current) {
                containerRef.current.innerHTML = "";

                mermaid
                    .parse(code, { suppressErrors: true })
                    .then((isValid) => {
                        if (!isValid) {
                            throw new Error("Invalid or incomplete Mermaid code");
                        }
                        const id = `mermaid-${Math.random().toString(36).substring(2)}`;
                        return mermaid.render(id, code);
                    })
                    .then(({ svg }) => {
                        if (isMounted && containerRef.current) {
                            containerRef.current.innerHTML = svg;
                        }
                    })
                    .catch((err) => {
                        console.warn("Mermaid parse/render failed:", err);
                        if (isMounted && containerRef.current) {
                            containerRef.current.innerHTML = code.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                        }
                    })
                    .finally(() => {
                        if (isMounted) {
                            setIsLoading(false);
                        }
                    });
            }
        });

        return () => {
            isMounted = false;
        };
    }, [code]);

    /**
     * SVG to PNG conversion function
     */
    const svgToPng = async (svgEl: SVGElement): Promise<string> => {
        // Clone the SVG to avoid modifying the original
        const svgClone = svgEl.cloneNode(true) as SVGElement;

        // Get the original viewBox
        const viewBox = svgClone.getAttribute("viewBox")?.split(" ").map(Number) || [];
        const originalWidth = viewBox[2] || svgClone.clientWidth;
        const originalHeight = viewBox[3] || svgClone.clientHeight;

        // Calculate the scale factor to fit editor width while maintaining aspect ratio
        const editorWidth = 3_600;
        const scale = editorWidth / originalWidth;
        const scaledHeight = originalHeight * scale;

        // Update SVG dimensions
        svgClone.setAttribute("width", `${editorWidth}`);
        svgClone.setAttribute("height", `${scaledHeight}`);

        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgClone);
        const svgDataUrl = "data:image/svg+xml;base64," + btoa(decodeURIComponent(encodeURIComponent(svgString)));

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = editorWidth;
                canvas.height = scaledHeight;

                const ctx = canvas.getContext("2d");
                if (!ctx) return reject("Canvas context not available");

                // Fill background with Mermaid's dark theme background color
                ctx.fillStyle = MERMAID_THEME.background;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = "high";

                ctx.drawImage(img, 0, 0, editorWidth, scaledHeight);
                resolve(canvas.toDataURL("image/png", 1.0));
            };
            img.onerror = reject;
            img.src = svgDataUrl;
        });
    };

    /**
     * Handle click on the diagram to convert SVG to PNG
     */
    const handleClick = async () => {
        if (!containerRef.current) return;
        const svgEl = containerRef.current.querySelector("svg");
        if (!svgEl) return;

        try {
            const pngDataUrl = await svgToPng(svgEl);
            vscode.postMessage({
                type: "openImage",
                text: pngDataUrl,
            });
        } catch (err) {
            console.error("Error converting SVG to PNG:", err);
        }
    };
    return (
        <div
            ref={containerRef}
            onClick={handleClick}
            style={{
                opacity: isLoading ? 0.3 : 1,
                transition: "opacity 0.2s ease",
                cursor: "pointer",
                display: "flex",
                justifyContent: "center",
                minHeight: "20px",
            }}
        ></div>
    );
}
