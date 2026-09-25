"use client";

import { useEffect, useRef } from "react";

/*
 * Custom animated cursor: a lerped main ball plus a slower-lagging trail
 * dot, both driven by requestAnimationFrame. Plain JS/CSS, no animation
 * library — the colors live in CSS custom properties in globals.css
 * (--cursor-color / --cursor-color-active, wired to the theme's
 * --brand / --accent tokens) so re-skinning never touches this file.
 *
 * Elements it treats as "interactive" (grows + recolors the ball) are
 * matched via event delegation on `document` (mouseover/mouseout +
 * `closest()`), not per-node listeners attached once on mount. This site
 * renders product/category cards, cart contents, etc. after the initial
 * mount (data fetches, client navigation), so a static
 * querySelectorAll-at-mount-time list would silently miss anything added
 * later. Delegation stays correct for elements that don't exist yet.
 */

const INTERACTIVE_SELECTOR =
  'a, button, input, textarea, select, label, [role="button"], [data-cursor-hover]';

const BALL_EASE = 0.35;
const DOT_EASE = 0.14;

export function CustomCursor() {
  const ballRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    // Skip entirely on touch/coarse pointers or when reduced motion is
    // requested — no DOM class added, no listeners bound, native cursor
    // behaves exactly as it would without this component.
    if (reducedMotion || !finePointer) return;

    const ball = ballRef.current;
    const dot = dotRef.current;
    if (!ball || !dot) return;

    const root = document.documentElement;
    root.classList.add("custom-cursor-active");

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ballX = mouseX;
    let ballY = mouseY;
    let dotX = mouseX;
    let dotY = mouseY;
    let hasMoved = false;
    let rafId = 0;

    function handleMouseMove(e: MouseEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!hasMoved) {
        // Snap to the first real position instead of gliding in from the
        // center of the screen on load.
        ballX = mouseX;
        ballY = mouseY;
        dotX = mouseX;
        dotY = mouseY;
        hasMoved = true;
      }
    }

    function handleMouseOver(e: MouseEvent) {
      const target = e.target;
      if (target instanceof Element && target.closest(INTERACTIVE_SELECTOR)) {
        ball?.classList.add("custom-cursor-ball--active");
      }
    }

    function handleMouseOut(e: MouseEvent) {
      // Only deactivate once the pointer has actually left the interactive
      // ancestor (not just moved between its children), otherwise the
      // grow/shrink transition flickers on every nested element boundary.
      const related = e.relatedTarget;
      const stillInside = related instanceof Element && related.closest(INTERACTIVE_SELECTOR);
      if (!stillInside) {
        ball?.classList.remove("custom-cursor-ball--active");
      }
    }

    function tick() {
      ballX += (mouseX - ballX) * BALL_EASE;
      ballY += (mouseY - ballY) * BALL_EASE;
      dotX += (mouseX - dotX) * DOT_EASE;
      dotY += (mouseY - dotY) * DOT_EASE;

      if (ball) ball.style.transform = `translate(${ballX}px, ${ballY}px) translate(-50%, -50%)`;
      if (dot) dot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;

      rafId = requestAnimationFrame(tick);
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      root.classList.remove("custom-cursor-active");
    };
  }, []);

  return (
    <>
      <div ref={ballRef} className="custom-cursor-ball" aria-hidden="true" />
      <div ref={dotRef} className="custom-cursor-dot" aria-hidden="true" />
    </>
  );
}
