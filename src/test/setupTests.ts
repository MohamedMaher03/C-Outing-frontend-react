import "@testing-library/jest-dom";
import { TextDecoder, TextEncoder } from "util";

if (typeof global.TextEncoder === "undefined") {
  global.TextEncoder = TextEncoder as unknown as typeof global.TextEncoder;
}

if (typeof global.TextDecoder === "undefined") {
  global.TextDecoder = TextDecoder as unknown as typeof global.TextDecoder;
}

const matchMediaMock = jest.fn().mockImplementation((query: string) => {
  return {
    matches: false,
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatchEvent: jest.fn(),
  } as unknown as MediaQueryList;
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: matchMediaMock,
});

Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: jest.fn(),
});

class ResizeObserverMock {
  observe() {
    return undefined;
  }

  unobserve() {
    return undefined;
  }

  disconnect() {
    return undefined;
  }
}

Object.defineProperty(window, "ResizeObserver", {
  writable: true,
  value: ResizeObserverMock,
});
