import { RecapData, DateInfo } from "../types.js";

export class RecapService {
  private static readonly GITHUB_RAW_BASE =
    "https://raw.githubusercontent.com/Paradoxum-Wikis/AEWiki-Recap/main/data";
  private static readonly CACHE_KEY_PREFIX = "aewiki-recap-";

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
      
      console.log(`Cleared ${entriesToRemove} oldest cache entries to free up space`);
    } catch (error) {
      console.warn("Error clearing old cache:", error);
    }
  }

  static async fetchRecapData(dateString: string): Promise<RecapData> {
    const cachedData = this.getCachedData(dateString);
    if (cachedData) {
      return cachedData;
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

  // maintenance
  static clearAllCache(): void {
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.CACHE_KEY_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      console.log(`Cleared ${keysToRemove.length} cache entries`);
    } catch (error) {
      console.warn("Error clearing cache:", error);
    }
  }

  static getCacheStats(): { totalEntries: number; totalSize: number; oldestEntry: string | null; newestEntry: string | null } {
    let totalEntries = 0;
    let totalSize = 0;
    let oldestEntry: string | null = null;
    let newestEntry: string | null = null;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.CACHE_KEY_PREFIX)) {
        const value = localStorage.getItem(key);
        if (value) {
          totalEntries++;
          totalSize += value.length;
          
          const dateString = key.replace(this.CACHE_KEY_PREFIX, "");
          if (!oldestEntry || dateString < oldestEntry) {
            oldestEntry = dateString;
          }
          if (!newestEntry || dateString > newestEntry) {
            newestEntry = dateString;
          }
        }
      }
    }

    return {
      totalEntries,
      totalSize,
      oldestEntry,
      newestEntry
    };
  }
}
