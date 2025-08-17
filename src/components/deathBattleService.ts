import { BattleStats, BattleRecord } from "../types.js";

export class DeathBattleService {
  private static readonly STATS_API =
    "https://altershaper.t7ru.link/battle_stats.json";
  private static readonly RECORDS_API =
    "https://altershaper.t7ru.link/battle_records.json";
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private static getCacheKey(type: "stats" | "records"): string {
    return `deathbattle-${type}`;
  }

  private static getCachedData<T>(type: "stats" | "records"): T | null {
    try {
      const cached = localStorage.getItem(this.getCacheKey(type));
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();

      if (now - timestamp < this.CACHE_DURATION) {
        console.log(`Using cached ${type} data`);
        return data;
      }

      localStorage.removeItem(this.getCacheKey(type));
      return null;
    } catch (error) {
      console.warn(`Error reading ${type} from cache:`, error);
      return null;
    }
  }

  private static setCachedData<T>(type: "stats" | "records", data: T): void {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(this.getCacheKey(type), JSON.stringify(cacheData));
      console.log(`Cached ${type} data`);
    } catch (error) {
      console.warn(`Error caching ${type} data:`, error);
    }
  }

  static async fetchBattleStats(): Promise<BattleStats[]> {
    const cached = this.getCachedData<BattleStats[]>("stats");
    if (cached) return cached;

    try {
      console.log("Fetching battle stats from API");
      const response = await fetch(this.STATS_API);

      if (!response.ok) {
        throw new Error(`Failed to fetch battle stats: ${response.status}`);
      }

      const data: BattleStats[] = await response.json();
      this.setCachedData("stats", data);
      return data;
    } catch (error) {
      console.error("Error fetching battle stats:", error);
      throw error;
    }
  }

  static async fetchBattleRecords(): Promise<BattleRecord[]> {
    const cached = this.getCachedData<BattleRecord[]>("records");
    if (cached) return cached;

    try {
      console.log("Fetching battle records from API");
      const response = await fetch(this.RECORDS_API);

      if (!response.ok) {
        throw new Error(`Failed to fetch battle records: ${response.status}`);
      }

      const data: BattleRecord[] = await response.json();
      // Sort by battle date (newest first)
      data.sort(
        (a, b) =>
          new Date(b.battleDate).getTime() - new Date(a.battleDate).getTime(),
      );

      this.setCachedData("records", data);
      return data;
    } catch (error) {
      console.error("Error fetching battle records:", error);
      throw error;
    }
  }

  static formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  static formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
    } else {
      return "Just now";
    }
  }
}
