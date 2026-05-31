import { useCallback, useEffect, useRef, useState } from "react";

const HOME_SCROLL_POSITION_KEY = "home_page_scroll_y";

export const useScrollRestoration = () => {
  const currentScrollYRef = useRef<number>(0);

  useEffect(() => {
    const onScroll = () => {
      currentScrollYRef.current = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    return () => {
      try {
        sessionStorage.setItem(
          HOME_SCROLL_POSITION_KEY,
          String(currentScrollYRef.current),
        );
      } catch {
        // noop
      }
    };
  }, []);

  useEffect(() => {
    try {
      const persisted = sessionStorage.getItem(HOME_SCROLL_POSITION_KEY);
      if (!persisted) return;
      const targetY = Number(persisted);
      if (targetY > 0) {
        requestAnimationFrame(() => {
          window.scrollTo({ top: targetY, behavior: "instant" });
        });
      }
      sessionStorage.removeItem(HOME_SCROLL_POSITION_KEY);
    } catch {
      // noop
    }
  }, []);
};

export const useGreetingKey = () => {
  const [greetingKey, setGreetingKey] = useState(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return "home.greeting.morning";
    if (hour >= 12 && hour < 18) return "home.greeting.afternoon";
    return "home.greeting.evening";
  });

  useEffect(() => {
    const refresh = () => {
      const hour = new Date().getHours();
      if (hour >= 6 && hour < 12) return setGreetingKey("home.greeting.morning");
      if (hour >= 12 && hour < 18) return setGreetingKey("home.greeting.afternoon");
      return setGreetingKey("home.greeting.evening");
    };
    const intervalId = window.setInterval(refresh, 60_000);
    return () => window.clearInterval(intervalId);
  }, []);

  return greetingKey;
};

export const useSectionScrollIntoView = (
  sectionRef: React.RefObject<HTMLElement | null>,
) =>
  useCallback(() => {
    if (typeof window === "undefined") return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const SCROLL_OFFSET = 96;
    const MAX_RETRIES = 8;
    let attempts = 0;

    const tryScroll = () => {
      const section = sectionRef.current;
      if (section) {
        const rect = section.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        const withinViewport =
          rect.top >= SCROLL_OFFSET && rect.bottom <= viewportHeight - SCROLL_OFFSET;

        if (!withinViewport) {
          window.scrollTo({
            top: Math.max(0, rect.top + window.scrollY - SCROLL_OFFSET),
            behavior: prefersReducedMotion ? "auto" : "smooth",
          });
        }
        return;
      }

      attempts += 1;
      if (attempts < MAX_RETRIES) window.requestAnimationFrame(tryScroll);
    };

    window.requestAnimationFrame(tryScroll);
  }, [sectionRef]);

export const useScrollKeyTracker = (dependency: string) => {
  const prevRef = useRef<string>(dependency);
  const [scrollKey, setScrollKey] = useState(0);

  useEffect(() => {
    if (dependency !== prevRef.current) {
      prevRef.current = dependency;
      setScrollKey((k) => k + 1);
    }
  }, [dependency]);

  return scrollKey;
};
