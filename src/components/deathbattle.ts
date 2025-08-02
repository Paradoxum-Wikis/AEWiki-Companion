import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../styles/main.css";
import "../styles/theme.css";
import "../styles/recap.css";
import "../styles/deathbattle.css";

import { DeathBattleRenderer } from "./deathBattleRenderer.js";
import { DeathBattleService } from "./deathBattleService.js";
import { ThemeManager } from "./themeManager.js";

class DeathBattleApp {
  private renderer: DeathBattleRenderer;

  constructor() {
    this.renderer = new DeathBattleRenderer();
    this.init();
  }

  private async init(): Promise<void> {
    this.loadBattleStats();
    this.loadBattleRecords();
  }

  private async loadBattleStats(): Promise<void> {
    this.renderer.showCasualLoading();
    this.renderer.showRankedLoading();

    try {
      const stats = await DeathBattleService.fetchBattleStats();
      this.renderer.renderCasualStats(stats);
      this.renderer.renderRankedStats(stats);
    } catch (error) {
      console.error("Failed to load battle stats:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load battle statistics.";
      this.renderer.showCasualError(errorMessage);
      this.renderer.showRankedError(errorMessage);
    }
  }

  private async loadBattleRecords(): Promise<void> {
    this.renderer.showRecordsLoading();

    try {
      const records = await DeathBattleService.fetchBattleRecords();
      this.renderer.renderBattleRecords(records);
    } catch (error) {
      console.error("Failed to load battle records:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load battle records.";
      this.renderer.showRecordsError(errorMessage);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  ThemeManager.init();
  new DeathBattleApp();
});