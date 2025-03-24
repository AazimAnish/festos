"use client"

import { useMousePosition } from "@/hooks/use-mouse-position"
import { useEffect, useState, useRef, useMemo, useCallback } from "react"

export function TriangleCursor() {
  const [isClient, setIsClient] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const position = useMousePosition(undefined, {
    throttleMs: 16, // Optimized for 60fps
    enableOnHover: true
  })
  const cursorRef = useRef(null)

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
  )

  const handleMouseOver = useCallback(
    (e: MouseEvent) => {
      // No longer changing hover state
    },
    [interactiveSelectors]
  )

  const handleMouseOut = useCallback(
    (e: MouseEvent) => {
      // No longer changing hover state
    },
    [interactiveSelectors]
  )

  useEffect(() => {
    setIsClient(true)
    document.documentElement.classList.add("custom-cursor")
    document.body.classList.add("custom-cursor")
    document.addEventListener("mouseover", handleMouseOver, { passive: true })
    document.addEventListener("mouseout", handleMouseOut, { passive: true })

    const style = document.createElement("style")
    style.textContent = `
      /* Only apply custom cursor to non-interactive elements */
      .custom-cursor {
        cursor: none !important;
      }
      
      /* Allow default cursors for interactive elements */
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
      
      /* Additional specific cursor styles */
      .custom-cursor a {
        cursor: pointer !important;
      }
      
      .custom-cursor [data-grab] {
        cursor: grab !important;
      }
      
      input, textarea {
        caret-color: #ff3232 !important;
      }
    `
    document.head.appendChild(style)

    return () => {
      document.documentElement.classList.remove("custom-cursor")
      document.body.classList.remove("custom-cursor")
      document.removeEventListener("mouseover", handleMouseOver)
      document.removeEventListener("mouseout", handleMouseOut)
      if (style.parentNode) {
        document.head.removeChild(style)
      }
    }
  }, [handleMouseOver, handleMouseOut])

  if (!isClient) return null

  const { x, y } = position
  const cursorStyle = {
    transform: `translate3d(${x - 8}px, ${y - 8}px, 0)`,
    willChange: "transform, filter",
    opacity: x === 0 && y === 0 ? 0 : 1,
  }

  return (
    <div
      ref={cursorRef}
      className="triangle-cursor"
      style={cursorStyle}
    />
  )
}