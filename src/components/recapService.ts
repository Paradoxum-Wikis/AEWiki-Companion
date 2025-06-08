import { RecapData, DateInfo } from "../types.js";

export class RecapService {
  private static readonly GITHUB_RAW_BASE =
    "https://raw.githubusercontent.com/Paradoxum-Wikis/AEWiki-Recap/main/data";

  static formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  static parseDate(dateString: string): DateInfo {
    const [year, month, day] = dateString.split("-").map(Number);
    return {
      year,
      month,
      day,
      dateString,
    };
  }

  static formatDisplayDate(dateString: string): string {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  static addDays(dateString: string, days: number): string {
    const date = new Date(dateString + "T00:00:00");
    date.setDate(date.getDate() + days);
    return this.formatDate(date);
  }

  static subtractDays(dateString: string, days: number): string {
    return this.addDays(dateString, -days);
  }

  static async fetchRecapData(dateString: string): Promise<RecapData> {
    const { year } = this.parseDate(dateString);
    const filename = `recap-${dateString}.json`;
    const url = `${this.GITHUB_RAW_BASE}/${year}/${filename}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch data: ${response.status} ${response.statusText}`,
        );
      }

      const data: RecapData = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching recap data:", error);
      throw error;
    }
  }

  static extractAvatarUrl(avatarHtml: string): string {
    const imgMatch = avatarHtml.match(/src="([^"]+)"/);
    if (imgMatch && imgMatch[1]) {
      return imgMatch[1];
    }
    return "https://static.wikia.nocookie.net/alter-ego/images/f/f7/Place.png";
  }

  static getCurrentWeekDate(): string {
    const urlParams = new URLSearchParams(window.location.search);
    const dateParam = urlParams.get("date");

    if (dateParam) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (dateRegex.test(dateParam)) {
        return dateParam;
      }
    }

    return this.formatDate(new Date());
  }

  static updateUrlWithDate(dateString: string): void {
    const url = new URL(window.location.href);
    url.searchParams.set("date", dateString);
    window.history.pushState({}, "", url.toString());
  }
}
