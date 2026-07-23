import { useEffect } from "react";

/**
 * Automatically applies scroll-reveal animations to eligible sections
 * on the page. Adds `data-reveal` to direct children of every <section>
 * (and to h1/h2/h3 inside <main>) if not already set, then observes them
 * with IntersectionObserver, staggering the reveal for a nice cascade.
 */
export function useScrollReveal() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const auto = () => {
      const root = document.querySelector("main") ?? document.body;

      // Auto-tag: direct children of sections + top-level headings
      root.querySelectorAll("section").forEach((section) => {
        Array.from(section.children).forEach((child, i) => {
          const el = child as HTMLElement;
          if (!el.hasAttribute("data-reveal")) el.setAttribute("data-reveal", "");
          if (!el.style.animationDelay) {
            el.style.animationDelay = `${Math.min(i * 90, 450)}ms`;
          }
        });
      });

      const targets = root.querySelectorAll<HTMLElement>("[data-reveal]");
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
      );
      targets.forEach((t) => io.observe(t));
      return () => io.disconnect();
    };

    // Run after initial paint + on route content changes
    const t1 = setTimeout(auto, 60);
    let cleanup: (() => void) | void;
    const t2 = setTimeout(() => (cleanup = auto()), 400);

    // Re-scan when DOM mutates (route changes, lazy content)
    const mo = new MutationObserver(() => {
      cleanup?.();
      cleanup = auto();
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      mo.disconnect();
      cleanup?.();
    };
  }, []);
}
