"use client";

import { useMousePosition } from "@/hooks/use-mouse-position";
import { useEffect, useRef, useMemo } from "react";

export function TriangleCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const position = useMousePosition(undefined, {
    throttleMs: 32, // Matches the hook's optimization
    enableOnHover: true,
  });
  const isMounted = useRef(false);

  const interactiveSelectors = useMemo(
    () =>
      [
        "a",
        "button",
        "input",
        "select",
        "textarea",
        "[role='button']",
        ".cursor-pointer",
        "[data-clickable]",
        "label",
        "summary",
        ".interactive",
        ".btn",
      ].join(", "),
    []
  );

  useEffect(() => {
    isMounted.current = true;
    document.documentElement.classList.add("custom-cursor");
    document.body.classList.add("custom-cursor");

    const style = document.createElement("style");
    style.textContent = `
      .custom-cursor {
        cursor: none !important;
      }
      .custom-cursor a,
      .custom-cursor button,
      .custom-cursor input,
      .custom-cursor select,
      .custom-cursor textarea,
      .custom-cursor [role='button'],
      .custom-cursor .cursor-pointer,
      .custom-cursor [data-clickable],
      .custom-cursor label,
      .custom-cursor summary,
      .custom-cursor .interactive,
      .custom-cursor .btn {
        cursor: auto !important;
      }
    `;
    document.head.appendChild(style);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.matches(interactiveSelectors) ||
        target.closest(interactiveSelectors)
      ) {
        if (cursorRef.current) {
          cursorRef.current.style.display = "none"; // Hide custom cursor
        }
      }
    };

    const handleMouseOut = () => {
      if (cursorRef.current) {
        cursorRef.current.style.display = "block"; // Show custom cursor
      }
    };

    document.addEventListener("mouseover", handleMouseOver, { passive: true });
    document.addEventListener("mouseout", handleMouseOut, { passive: true });

    return () => {
      isMounted.current = false;
      document.documentElement.classList.remove("custom-cursor");
      document.body.classList.remove("custom-cursor");
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      if (style.parentNode) {
        document.head.removeChild(style);
      }
    };
  }, [interactiveSelectors]);

  if (!isMounted.current) return null;

  const { x, y } = position;
  const cursorStyle = {
    transform: `translate3d(${x - 8}px, ${y - 8}px, 0)`,
    willChange: "transform",
    opacity: x === 0 && y === 0 ? 0 : 1,
  };

  return (
    <div ref={cursorRef} className="triangle-cursor" style={cursorStyle} />
  );
}