import React, { useState, useEffect, lazy, Suspense } from "react";
import styled from "styled-components";

// Usunięty import mermaid i inicjalizacja - to jest teraz tylko w MermaidRenderer
const MermaidRenderer = lazy(() => import("../MermaidRenderer"));

interface MermaidBlockProps {
    code: string;
}

export default function MermaidBlock({ code }: MermaidBlockProps) {
    const [shouldRender, setShouldRender] = useState(false);

    // Activate renderer only when needed
    useEffect(() => {
        setShouldRender(true);
    }, []);

    // Optional: Add a function to render on demand
    const handleRenderRequest = () => {
        setShouldRender(true);
    };

    return (
        <MermaidBlockContainer>
            {shouldRender ? (
                <Suspense fallback={<LoadingMessage>Generating mermaid diagram...</LoadingMessage>}>
                    <MermaidRenderer code={code} />
                </Suspense>
            ) : (
                <RenderTrigger onClick={handleRenderRequest}>
                    Click to generate diagram
                </RenderTrigger>
            )}
        </MermaidBlockContainer>
    );
}

const MermaidBlockContainer = styled.div`
    position: relative;
    margin: 8px 0;
`;

// Reszta styli pozostaje bez zmian

const LoadingMessage = styled.div`
    padding: 8px 0;
    color: var(--vscode-descriptionForeground);
    font-style: italic;
    font-size: 0.9em;
`;

const RenderTrigger = styled.div`
    padding: 16px;
    border: 1px dashed var(--vscode-widget-border);
    border-radius: 4px;
    text-align: center;
    cursor: pointer;
    color: var(--vscode-descriptionForeground);

    &:hover {
        background-color: var(--vscode-list-hoverBackground);
    }
`;
