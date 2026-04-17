import { act, fireEvent, render, screen } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import { I18nProvider } from "./I18nProvider";
import { useI18n } from "./useI18n";
import { I18N_STORAGE_KEY } from "./translations";

const I18nConsumer = () => {
  const { language, direction, toggleLanguage, setLanguage, t, formatNumber } =
    useI18n();

  return (
    <div>
      <div data-testid="language">{language}</div>
      <div data-testid="direction">{direction}</div>
      <div data-testid="translated-home">{t("nav.home")}</div>
      <div data-testid="interpolated">
        {t("language.current", { language: "English" })}
      </div>
      <div data-testid="fallback">
        {t("missing.key", undefined, "fallback")}
      </div>
      <div data-testid="formatted-number">{formatNumber(123456)}</div>
      <button type="button" onClick={() => toggleLanguage()}>
        toggle-language
      </button>
      <button type="button" onClick={() => setLanguage("en")}>
        set-en
      </button>
      <button type="button" onClick={() => setLanguage("ar")}>
        set-ar
      </button>
    </div>
  );
};

describe("I18nProvider and useI18n", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = "";
    document.documentElement.dir = "";
    delete document.documentElement.dataset.language;
    delete document.documentElement.dataset.direction;
  });

  it("throws when useI18n is used outside I18nProvider", () => {
    expect(() => renderHook(() => useI18n())).toThrow(
      "useI18n must be used within an I18nProvider",
    );
  });

  it("hydrates language from localStorage and updates document direction", () => {
    localStorage.setItem(I18N_STORAGE_KEY, "ar");

    render(
      <I18nProvider>
        <I18nConsumer />
      </I18nProvider>,
    );

    expect(screen.getByTestId("language")).toHaveTextContent("ar");
    expect(screen.getByTestId("direction")).toHaveTextContent("rtl");
    expect(document.documentElement.lang).toBe("ar");
    expect(document.documentElement.dir).toBe("rtl");
    expect(document.documentElement.dataset.language).toBe("ar");
    expect(document.documentElement.dataset.direction).toBe("rtl");
  });

  it("translates keys, formats templates, and falls back when key is missing", () => {
    render(
      <I18nProvider>
        <I18nConsumer />
      </I18nProvider>,
    );

    expect(screen.getByTestId("translated-home")).toHaveTextContent("Home");
    expect(screen.getByTestId("interpolated")).toHaveTextContent(
      "Current language: English",
    );
    expect(screen.getByTestId("fallback")).toHaveTextContent("fallback");
    expect(screen.getByTestId("formatted-number").textContent).toBeTruthy();
  });

  it("toggles and persists language", () => {
    render(
      <I18nProvider>
        <I18nConsumer />
      </I18nProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "toggle-language" }));

    expect(screen.getByTestId("language")).toHaveTextContent("ar");
    expect(localStorage.getItem(I18N_STORAGE_KEY)).toBe("ar");

    fireEvent.click(screen.getByRole("button", { name: "set-en" }));
    expect(screen.getByTestId("language")).toHaveTextContent("en");
    expect(localStorage.getItem(I18N_STORAGE_KEY)).toBe("en");
  });

  it("syncs language changes from storage events", () => {
    render(
      <I18nProvider>
        <I18nConsumer />
      </I18nProvider>,
    );

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: I18N_STORAGE_KEY,
          newValue: "ar",
        }),
      );
    });

    expect(screen.getByTestId("language")).toHaveTextContent("ar");
    expect(screen.getByTestId("direction")).toHaveTextContent("rtl");
  });
});
