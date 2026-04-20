import { act, fireEvent, render, screen } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import { ThemeProvider } from "./ThemeProvider";
import { useTheme } from "./useTheme";
import { THEME_STORAGE_KEY } from "./theme.context";

const ThemeConsumer = () => {
  const { themePreference, resolvedTheme, setThemePreference, toggleTheme } =
    useTheme();

  return (
    <div>
      <div data-testid="preference">{themePreference}</div>
      <div data-testid="resolved">{resolvedTheme}</div>
      <button type="button" onClick={() => setThemePreference("light")}>
        set-light
      </button>
      <button type="button" onClick={() => setThemePreference("dark")}>
        set-dark
      </button>
      <button type="button" onClick={() => toggleTheme()}>
        toggle
      </button>
    </div>
  );
};

const createMatchMedia = (initialMatches: boolean) => {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const legacyListeners = new Map<
    (this: MediaQueryList, ev: MediaQueryListEvent) => unknown,
    (event: MediaQueryListEvent) => void
  >();
  let matches = initialMatches;

  const mediaQueryList: MediaQueryList = {
    get matches() {
      return matches;
    },
    media: "(prefers-color-scheme: dark)",
    onchange: null,
    addEventListener: (
      _type: string,
      listener: EventListenerOrEventListenerObject,
    ) => {
      if (typeof listener === "function") {
        listeners.add(listener as (event: MediaQueryListEvent) => void);
      }
    },
    removeEventListener: (
      _type: string,
      listener: EventListenerOrEventListenerObject,
    ) => {
      if (typeof listener === "function") {
        listeners.delete(listener as (event: MediaQueryListEvent) => void);
      }
    },
    addListener: (
      listener:
        | ((this: MediaQueryList, ev: MediaQueryListEvent) => unknown)
        | null,
    ) => {
      if (!listener) return;

      const normalized = (event: MediaQueryListEvent) => {
        listener.call(mediaQueryList, event);
      };

      legacyListeners.set(listener, normalized);
      listeners.add(normalized);
    },
    removeListener: (
      listener:
        | ((this: MediaQueryList, ev: MediaQueryListEvent) => unknown)
        | null,
    ) => {
      if (!listener) return;

      const normalized = legacyListeners.get(listener);
      if (!normalized) return;

      listeners.delete(normalized);
      legacyListeners.delete(listener);
    },
    dispatchEvent: () => true,
  };

  const emit = (next: boolean) => {
    matches = next;
    const event = {
      matches: next,
      media: mediaQueryList.media,
    } as MediaQueryListEvent;
    listeners.forEach((listener) => listener(event));
  };

  return {
    mock: jest.fn().mockImplementation(() => mediaQueryList),
    emit,
  };
};

describe("ThemeProvider and useTheme", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
    document.documentElement.style.colorScheme = "";
    delete document.documentElement.dataset.theme;
    delete document.documentElement.dataset.themePreference;
  });

  it("throws when useTheme is used outside ThemeProvider", () => {
    expect(() => renderHook(() => useTheme())).toThrow(
      "useTheme must be used within ThemeProvider",
    );
  });

  it("resolves system preference from matchMedia and syncs DOM dataset", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "system");

    const media = createMatchMedia(true);
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: media.mock,
    });

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("preference")).toHaveTextContent("system");
    expect(screen.getByTestId("resolved")).toHaveTextContent("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.dataset.themePreference).toBe("system");
    expect(document.documentElement.dataset.theme).toBe("dark");

    act(() => {
      media.emit(false);
    });
    expect(screen.getByTestId("resolved")).toHaveTextContent("light");
  });

  it("updates preference, persists it, and toggles theme", () => {
    const media = createMatchMedia(false);
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: media.mock,
    });

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "set-dark" }));

    expect(screen.getByTestId("preference")).toHaveTextContent("dark");
    expect(screen.getByTestId("resolved")).toHaveTextContent("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");

    fireEvent.click(screen.getByRole("button", { name: "toggle" }));
    expect(screen.getByTestId("resolved")).toHaveTextContent("light");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
  });

  it("reacts to theme preference changes from storage events", () => {
    const media = createMatchMedia(false);
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: media.mock,
    });

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: THEME_STORAGE_KEY,
          newValue: "dark",
        }),
      );
    });

    expect(screen.getByTestId("preference")).toHaveTextContent("dark");
    expect(screen.getByTestId("resolved")).toHaveTextContent("dark");
  });

  it("ignores invalid stored preference values and falls back to system", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "unknown");

    const media = createMatchMedia(false);
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: media.mock,
    });

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("preference")).toHaveTextContent("system");
    expect(screen.getByTestId("resolved")).toHaveTextContent("light");
  });
});
