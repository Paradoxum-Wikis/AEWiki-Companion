export class ThemeManager {
  private static readonly THEME_KEY = "aewiki-theme";
  private static themeToggle: HTMLButtonElement;
  private static themeIcon: HTMLElement;

  static init(): void {
    this.themeToggle = document.getElementById(
      "themeToggle",
    ) as HTMLButtonElement;
    this.themeIcon = document.getElementById("themeIcon") as HTMLElement;

    const savedTheme = localStorage.getItem(this.THEME_KEY) || "dark";
    this.setTheme(savedTheme);
    this.themeToggle?.addEventListener("click", () => {
      this.toggleTheme();
    });
  }

  static setTheme(theme: string): void {
    const body = document.body;

    if (theme === "light") {
      body.classList.add("light");
    } else {
      body.classList.remove("light");
    }

    localStorage.setItem(this.THEME_KEY, theme);
    this.updateIcon(theme);
  }

  static toggleTheme(): void {
    const currentTheme = document.body.classList.contains("light")
      ? "light"
      : "dark";
    const newTheme = currentTheme === "light" ? "dark" : "light";
    this.setTheme(newTheme);
  }

  private static updateIcon(theme: string): void {
    if (!this.themeIcon) return;

    if (theme === "light") {
      this.themeIcon.className = "bi bi-sun-fill";
    } else {
      this.themeIcon.className = "bi bi-moon-fill";
    }
  }

  static getCurrentTheme(): string {
    return document.body.classList.contains("light") ? "light" : "dark";
  }
}
