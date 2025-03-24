"use client"

import { useMousePosition } from "@/hooks/use-mouse-position"
import { useEffect, useState, useRef, useMemo, useCallback } from "react"

export function TriangleCursor() {
  const [isClient, setIsClient] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const position = useMousePosition()
  const cursorRef = useRef<HTMLDivElement>(null)
  
  // Define all interactive elements that should trigger hover state
  const interactiveSelectors = useMemo(() => [
    'a', 'button', 'input', 'select', 'textarea',
    '[role="button"]', '.cursor-pointer', '[data-clickable]',
    'label', 'summary', '.interactive'
  ].join(', '), [])
  
  // Enhanced hover detection using element matching
  const handleMouseOver = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement
    
    // Check if the element or any of its parents match our selectors
    if (target.matches(interactiveSelectors) || 
        target.closest(interactiveSelectors)) {
      setIsHovering(true)
    }
  }, [interactiveSelectors])
  
  const handleMouseOut = useCallback((e: MouseEvent) => {
    const relatedTarget = e.relatedTarget as HTMLElement
    
    // Only reset hover state if we're not moving to another interactive element
    if (!relatedTarget || 
        !(relatedTarget.matches(interactiveSelectors) || 
        relatedTarget.closest(interactiveSelectors))) {
      setIsHovering(false)
    }
  }, [interactiveSelectors])
  
  useEffect(() => {
    setIsClient(true)
    
    // Add cursor hiding class to body
    document.body.classList.add('custom-cursor')
    
    // Use more precise event delegation
    document.addEventListener('mouseover', handleMouseOver, { passive: true })
    document.addEventListener('mouseout', handleMouseOut, { passive: true })
    
    return () => {
      document.body.classList.remove('custom-cursor')
      document.removeEventListener('mouseover', handleMouseOver)
      document.removeEventListener('mouseout', handleMouseOut)
    }
  }, [handleMouseOver, handleMouseOut])

  if (!isClient) return null

  // Use hardware-accelerated transforms
  const cursorStyle = {
    transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
    willChange: 'transform, filter'
  }

  return (
    <div 
      ref={cursorRef}
      className={`triangle-cursor ${isHovering ? 'triangle-cursor-hover' : ''}`}
      style={cursorStyle}
      aria-hidden="true"
    />
  )
} 