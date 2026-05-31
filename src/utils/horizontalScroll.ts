const SCROLL_EDGE_THRESHOLD = 8;

const isRtlElement = (element: HTMLElement) =>
  getComputedStyle(element).direction === "rtl";

export const getScrollOffsetFromStart = (element: HTMLElement): number => {
  const maxScroll = Math.max(0, element.scrollWidth - element.clientWidth);
  if (maxScroll <= 0) {
    return 0;
  }

  const { scrollLeft } = element;
  if (!isRtlElement(element)) {
    return scrollLeft;
  }

  if (scrollLeft <= 0) {
    return -scrollLeft;
  }

  return maxScroll - scrollLeft;
};

export const getHorizontalScrollState = (element: HTMLElement) => {
  const maxScroll = Math.max(0, element.scrollWidth - element.clientWidth);
  if (maxScroll <= SCROLL_EDGE_THRESHOLD) {
    return { canScrollBack: false, canScrollForward: false, maxScroll };
  }

  const fromStart = getScrollOffsetFromStart(element);
  return {
    canScrollBack: fromStart > SCROLL_EDGE_THRESHOLD,
    canScrollForward: fromStart < maxScroll - SCROLL_EDGE_THRESHOLD,
    maxScroll,
  };
};

export const scrollToHorizontalStart = (element: HTMLElement) => {
  element.scrollTo({ left: 0, behavior: "instant" });

  if (!isRtlElement(element)) {
    return;
  }

  requestAnimationFrame(() => {
    if (getScrollOffsetFromStart(element) <= SCROLL_EDGE_THRESHOLD) {
      return;
    }
    const maxScroll = Math.max(0, element.scrollWidth - element.clientWidth);
    element.scrollTo({ left: maxScroll, behavior: "instant" });
  });
};

export const scrollHorizontally = (
  element: HTMLElement,
  direction: "back" | "forward",
  amount: number,
  behavior: ScrollBehavior,
) => {
  const rtl = isRtlElement(element);
  let delta: number;
  if (!rtl) {
    delta = direction === "back" ? -amount : amount;
  } else {
    delta = direction === "back" ? amount : -amount;
  }

  element.scrollBy({ left: delta, behavior });
};
