import { RecapData, DateInfo } from "../types.js";

export class RecapService {
  private static readonly GITHUB_RAW_BASE =
    "https://raw.githubusercontent.com/Paradoxum-Wikis/AEWiki-Recap/main/data";
  private static readonly CACHE_KEY_PREFIX = "aewiki-recap-";
  private static readonly INDEX_CACHE_KEY = "aewiki-available-files";
  private static readonly INDEX_CACHE_DURATION = 1 * 24 * 60 * 60 * 1000; // 1 day

  private static availableFiles: Set<string> | null = null;

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

  private static getCacheKey(dateString: string): string {
    return `${this.CACHE_KEY_PREFIX}${dateString}`;
  }

  private static getCachedData(dateString: string): RecapData | null {
    try {
      const cacheKey = this.getCacheKey(dateString);
      const cached = localStorage.getItem(cacheKey);

      if (!cached) {
        return null;
      }

      const data = JSON.parse(cached);
      console.log(`Using cached data for ${dateString}`);
      return data;
    } catch (error) {
      console.warn("Error reading from cache:", error);
      return null;
    }
  }

  private static setCachedData(dateString: string, data: RecapData): void {
    try {
      const cacheKey = this.getCacheKey(dateString);
      localStorage.setItem(cacheKey, JSON.stringify(data));
      console.log(`Cached data for ${dateString}`);
    } catch (error) {
      console.warn("Error writing to cache:", error);
      this.clearOldestEntries();
    }
  }

  private static clearOldestEntries(): void {
    try {
      const cacheEntries: { key: string; date: string }[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.CACHE_KEY_PREFIX)) {
          const dateString = key.replace(this.CACHE_KEY_PREFIX, "");
          cacheEntries.push({ key, date: dateString });
        }
      }

      // Sort by date (oldest first) and remove the oldest 25%
      cacheEntries.sort((a, b) => a.date.localeCompare(b.date));
      const entriesToRemove = Math.ceil(cacheEntries.length * 0.25);

      for (let i = 0; i < entriesToRemove && i < cacheEntries.length; i++) {
        localStorage.removeItem(cacheEntries[i].key);
      }

      console.log(
        `Cleared ${entriesToRemove} oldest cache entries to free up space`,
      );
    } catch (error) {
      console.warn("Error clearing old cache:", error);
    }
  }

  private static async fetchAvailableFiles(): Promise<Set<string>> {
    try {
      const cached = localStorage.getItem(this.INDEX_CACHE_KEY);
      if (cached) {
        const { timestamp, files } = JSON.parse(cached);
        const now = Date.now();

        if (now - timestamp < this.INDEX_CACHE_DURATION) {
          console.log("Using cached available files index");
          return new Set(files);
        }
      }

      console.log("Fetching available files from GitHub API");
      const response = await fetch(
        "https://api.github.com/repos/Paradoxum-Wikis/AEWiki-Recap/git/trees/main?recursive=1",
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch directory: ${response.status}`);
      }

      const data = await response.json();
      const availableFiles = new Set<string>();

      data.tree
        .filter(
          (item: any) =>
            item.type === "blob" &&
            item.path.startsWith("data/") &&
            item.path.endsWith(".json") &&
            item.path.includes("recap-"),
        )
        .forEach((item: any) => {
          // get date from filename: data/2025/recap-2025-01-01.json -> 2025-01-01
          const match = item.path.match(/recap-(\d{4}-\d{2}-\d{2})\.json$/);
          if (match) {
            availableFiles.add(match[1]);
          }
        });

      const cacheData = {
        timestamp: Date.now(),
        files: Array.from(availableFiles),
      };

      try {
        localStorage.setItem(this.INDEX_CACHE_KEY, JSON.stringify(cacheData));
        console.log(`Cached ${availableFiles.size} available files`);
      } catch (error) {
        console.warn("Failed to cache available files:", error);
      }

      return availableFiles;
    } catch (error) {
      console.error("Error fetching available files:", error);
      return new Set<string>();
    }
  }

  private static async ensureAvailableFiles(): Promise<void> {
    if (!this.availableFiles) {
      this.availableFiles = await this.fetchAvailableFiles();
    }
  }

  private static async isFileAvailable(dateString: string): Promise<boolean> {
    await this.ensureAvailableFiles();
    return this.availableFiles!.has(dateString);
  }

  static async fetchRecapData(dateString: string): Promise<RecapData> {
    const cachedData = this.getCachedData(dateString);
    if (cachedData) {
      return cachedData;
    }

    const fileExists = await this.isFileAvailable(dateString);
    if (!fileExists) {
      throw new Error("No recap data available for this date.");
    }

    const { year } = this.parseDate(dateString);
    const filename = `recap-${dateString}.json`;
    const url = `${this.GITHUB_RAW_BASE}/${year}/${filename}`;

    try {
      console.log(`Fetching data for ${dateString} from API`);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch data: ${response.status} ${response.statusText}`,
        );
      }

      const data: RecapData = await response.json();
      this.setCachedData(dateString, data);

      return data;
    } catch (error) {
      console.error("Error fetching recap data:", error);
      throw error;
    }
  }

  static extractAvatarUrl(avatarHtml: string): string {
    const imgMatch = avatarHtml.match(/src="([^"]+)"/);
    if (imgMatch && imgMatch[1]) {
      let avatarUrl = imgMatch[1];
      avatarUrl = avatarUrl.replace(/width\/36\/height\/36/, "width/128/height/128");

      return avatarUrl;
    }
    return "https://static.wikia.nocookie.net/alter-ego/images/f/f7/Place.png";
  }

  static async getCurrentWeekDate(): Promise<string> {
    const urlParams = new URLSearchParams(window.location.search);
    const dateParam = urlParams.get("date");

    if (dateParam) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (dateRegex.test(dateParam)) {
        return dateParam;
      }
    }

    await this.ensureAvailableFiles();
    if (this.availableFiles && this.availableFiles.size > 0) {
      const sortedDates = Array.from(this.availableFiles).sort().reverse();
      return sortedDates[0];
    }

    return this.formatDate(new Date());
  }

  static updateUrlWithDate(dateString: string): void {
    const url = new URL(window.location.href);
    url.searchParams.set("date", dateString);
    window.history.pushState({}, "", url.toString());
  }
}
