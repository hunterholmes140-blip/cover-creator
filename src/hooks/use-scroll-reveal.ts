import { useEffect } from "react";

/**
 * Global scroll-reveal: auto-tags direct children of every <section>
 * (and top-level headings inside <main>) with `data-reveal`, then
 * animates them in when they enter the viewport.
 */
export function useScrollReveal() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const observed = new WeakSet<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" },
    );

    let scheduled = false;
    const scan = () => {
      scheduled = false;
      const root = document.querySelector("main") ?? document.body;

      root.querySelectorAll("section").forEach((section) => {
        Array.from(section.children).forEach((child, i) => {
          const el = child as HTMLElement;
          if (observed.has(el)) return;
          observed.add(el);
          if (!el.hasAttribute("data-reveal")) el.setAttribute("data-reveal", "");
          el.style.animationDelay = `${Math.min(i * 90, 450)}ms`;
          io.observe(el);
        });
      });
    };

    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(scan);
    };

    schedule();

    const mo = new MutationObserver((mutations) => {
      // Ignore our own attribute/class writes
      const relevant = mutations.some((m) => m.type === "childList" && m.addedNodes.length > 0);
      if (relevant) schedule();
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io.disconnect();
    };
  }, []);
}
