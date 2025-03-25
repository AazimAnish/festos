import { RefObject, useEffect, useState, useRef } from "react";

// Throttle function (unchanged, efficient as is)
function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let lastTime = 0;
  let lastArgs: Parameters<T> | null = null;

  return function (this: any, ...args: Parameters<T>): void {
    const now = performance.now();
    if (now - lastTime >= limit) {
      func.apply(this, args);
      lastTime = now;
    } else {
      lastArgs = args;
    }
  };
}

export const useMousePosition = (
  containerRef?: RefObject<HTMLElement | SVGElement>,
  options = { throttleMs: 32, enableOnHover: true } // Increased to 32ms (~30fps)
) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const positionRef = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);
  const isHoveringRef = useRef(false);

  useEffect(() => {
    const updatePositionRef = (x: number, y: number) => {
      if (containerRef?.current) {
        const rect = containerRef.current.getBoundingClientRect();
        positionRef.current = {
          x: Math.round(x - rect.left),
          y: Math.round(y - rect.top),
        };
      } else {
        positionRef.current = { x: Math.round(x), y: Math.round(y) };
      }
    };

    const updatePositionState = () => {
      const dx = Math.abs(position.x - positionRef.current.x);
      const dy = Math.abs(position.y - positionRef.current.y);
      // Increased threshold to 5 pixels to reduce updates
      if (dx > 5 || dy > 5 || isHoveringRef.current) {
        setPosition(positionRef.current);
      }
      rafId.current = null;
    };

    const scheduleUpdate = () => {
      if (rafId.current === null) {
        rafId.current = requestAnimationFrame(updatePositionState);
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactiveSelectors =
        "a, button, input, select, textarea, [role='button'], .cursor-pointer";
      isHoveringRef.current = options.enableOnHover && !!target.closest(interactiveSelectors);
    };

    const handleMouseOut = () => {
      isHoveringRef.current = false;
    };

    const throttledMouseMove = throttle((ev: MouseEvent) => {
      updatePositionRef(ev.clientX, ev.clientY);
      scheduleUpdate();
    }, options.throttleMs);

    const throttledTouchMove = throttle((ev: TouchEvent) => {
      const touch = ev.touches[0];
      updatePositionRef(touch.clientX, touch.clientY);
      scheduleUpdate();
    }, options.throttleMs);

    window.addEventListener("mousemove", throttledMouseMove, { passive: true });
    window.addEventListener("touchmove", throttledTouchMove, { passive: true });
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
  }, [containerRef, options.throttleMs, options.enableOnHover]);

  return position;
};