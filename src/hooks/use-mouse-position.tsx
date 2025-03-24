import { RefObject, useEffect, useState, useRef } from "react";

// Throttle helper function 
function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  let lastArgs: Parameters<T> | null = null;

  return function(this: any, ...args: Parameters<T>): void {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
        if (lastArgs) {
          const currentArgs = lastArgs;
          lastArgs = null;
          func.apply(this, currentArgs);
        }
      }, limit);
    } else {
      lastArgs = args;
    }
  };
}

export const useMousePosition = (
  containerRef?: RefObject<HTMLElement | SVGElement>,
  options = { throttleMs: 8, enableOnHover: true }
) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const positionRef = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);
  const isHoveringRef = useRef(false);
  
  useEffect(() => {
    const updatePositionRef = (x: number, y: number) => {
      if (containerRef && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        positionRef.current = {
          x: x - rect.left,
          y: y - rect.top
        };
      } else {
        positionRef.current = { x, y };
      }
    };

    const updatePositionState = () => {
      // Update React state only if position has significantly changed
      const dx = Math.abs(position.x - positionRef.current.x);
      const dy = Math.abs(position.y - positionRef.current.y);
      
      if (dx > 1 || dy > 1 || isHoveringRef.current) {
        setPosition(positionRef.current);
      }
      
      rafId.current = null;
    };

    const scheduleUpdate = () => {
      if (rafId.current === null) {
        rafId.current = requestAnimationFrame(updatePositionState);
      }
    };

    // Handle mouse hover state - use higher precision when hovering
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactiveSelectors = 'a, button, input, select, [role="button"], .cursor-pointer';
      if (options.enableOnHover && (target.matches(interactiveSelectors) || target.closest(interactiveSelectors))) {
        isHoveringRef.current = true;
      }
    };
    
    const handleMouseOut = () => {
      isHoveringRef.current = false;
    };

    // Create throttled handlers
    const throttledMouseMove = throttle((ev: MouseEvent) => {
      updatePositionRef(ev.clientX, ev.clientY);
      scheduleUpdate();
    }, options.throttleMs);

    const throttledTouchMove = throttle((ev: TouchEvent) => {
      const touch = ev.touches[0];
      updatePositionRef(touch.clientX, touch.clientY);
      scheduleUpdate();
    }, options.throttleMs);

    // Use passive: true for better performance on touch devices
    window.addEventListener("mousemove", throttledMouseMove, { passive: true });
    window.addEventListener("touchmove", throttledTouchMove, { passive: true });
    
    // Add hover detection for improved precision
    if (options.enableOnHover) {
      document.addEventListener("mouseover", handleMouseOver, { passive: true });
      document.addEventListener("mouseout", handleMouseOut, { passive: true });
    }

    return () => {
      window.removeEventListener("mousemove", throttledMouseMove);
      window.removeEventListener("touchmove", throttledTouchMove);
      
      if (options.enableOnHover) {
        document.removeEventListener("mouseover", handleMouseOver);
        document.removeEventListener("mouseout", handleMouseOut);
      }
      
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [containerRef, position.x, position.y, options.throttleMs, options.enableOnHover]);

  return position;
};
