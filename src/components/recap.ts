import "../styles/main.css";
import "../styles/recap.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import { RecapRenderer } from "./recapRenderer.js";
import { RecapService } from "./recapService.js";

class RecapApp {
  private renderer: RecapRenderer;
  private currentDate: string;
  private prevWeekButton: HTMLButtonElement;
  private nextWeekButton: HTMLButtonElement;

  constructor() {
    this.renderer = new RecapRenderer();
    this.currentDate = RecapService.getCurrentWeekDate();

    this.prevWeekButton = document.getElementById(
      "prevWeek",
    ) as HTMLButtonElement;
    this.nextWeekButton = document.getElementById(
      "nextWeek",
    ) as HTMLButtonElement;

    this.initializeEventListeners();
    this.loadRecapData();
  }

  private initializeEventListeners(): void {
    this.prevWeekButton.addEventListener("click", () => {
      this.navigateWeek(-7);
    });

    this.nextWeekButton.addEventListener("click", () => {
      this.navigateWeek(7);
    });

    window.addEventListener("popstate", () => {
      this.currentDate = RecapService.getCurrentWeekDate();
      this.loadRecapData();
    });
  }

  private navigateWeek(days: number): void {
    if (days < 0) {
      this.currentDate = RecapService.subtractDays(
        this.currentDate,
        Math.abs(days),
      );
    } else {
      this.currentDate = RecapService.addDays(this.currentDate, days);
    }

    RecapService.updateUrlWithDate(this.currentDate);
    this.loadRecapData();
  }

  private async loadRecapData(): Promise<void> {
    this.renderer.showLoading();
    this.updateNavigationButtons();

    try {
      const data = await RecapService.fetchRecapData(this.currentDate);
      this.renderer.renderLeaderboard(data, this.currentDate);
    } catch (error) {
      console.error("Failed to load recap data:", error);
      let errorMessage = "Failed to load recap data.";

      if (error instanceof Error) {
        if (error.message.includes("404")) {
          errorMessage = "No recap data available for this date.";
        } else {
          errorMessage = error.message;
        }
      }

      this.renderer.showError(errorMessage);
    }
  }

  private updateNavigationButtons(): void {
    const today = RecapService.formatDate(new Date());
    const currentDateObj = new Date(this.currentDate + "T00:00:00");
    const todayObj = new Date(today + "T00:00:00");

    this.nextWeekButton.disabled = currentDateObj >= todayObj;
    this.prevWeekButton.disabled = false;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new RecapApp();
});
