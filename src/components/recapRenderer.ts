import { RecapData, Contributor } from "../types.js";
import { RecapService } from "./recapService.js";

export class RecapRenderer {
  private loadingElement: HTMLElement;
  private errorElement: HTMLElement;
  private errorMessageElement: HTMLElement;
  private leaderboardElement: HTMLElement;
  private totalContributorsElement: HTMLElement;
  private currentDateElement: HTMLElement;

  constructor() {
    this.loadingElement = document.getElementById("loading")!;
    this.errorElement = document.getElementById("error")!;
    this.errorMessageElement = document.getElementById("errorMessage")!;
    this.leaderboardElement = document.getElementById("leaderboard")!;
    this.totalContributorsElement =
      document.getElementById("totalContributors")!;
    this.currentDateElement = document.getElementById("currentDate")!;
  }

  showLoading(): void {
    this.loadingElement.style.display = "block";
    this.errorElement.style.display = "none";
    this.leaderboardElement.innerHTML = "";
  }

  showError(message: string, dateString?: string): void {
    this.loadingElement.style.display = "none";
    this.errorElement.style.display = "block";
    this.errorMessageElement.textContent = message;
    this.leaderboardElement.innerHTML = "";

    if (dateString) {
      this.currentDateElement.textContent =
        RecapService.formatDisplayDate(dateString);
    }

    this.totalContributorsElement.textContent = "-";
  }

  renderLeaderboard(data: RecapData, dateString: string): void {
    this.loadingElement.style.display = "none";
    this.errorElement.style.display = "none";

    // summary
    this.totalContributorsElement.textContent =
      data.totalContributors.toString();
    this.currentDateElement.textContent =
      RecapService.formatDisplayDate(dateString);
    this.leaderboardElement.innerHTML = "";

    if (data.contributors.length === 0) {
      this.showNoData();
      return;
    }

    // contribs
    data.contributors.forEach((contributor, index) => {
      const item = this.createLeaderboardItem(contributor, index + 1);
      this.leaderboardElement.appendChild(item);
    });
  }

  private showNoData(): void {
    const noDataElement = document.createElement("div");
    noDataElement.className = "text-center p-4";
    noDataElement.innerHTML = `
            <i class="bi bi-inbox display-4 text-muted mb-3"></i>
            <h5 class="text-muted">No contributors found</h5>
            <p class="text-muted mb-0">No contribution data available for this week.</p>
        `;
    this.leaderboardElement.appendChild(noDataElement);
  }

  private createLeaderboardItem(
    contributor: Contributor,
    rank: number,
  ): HTMLElement {
    const item = document.createElement("div");
    item.className =
      "list-group-item leaderboard-item d-flex align-items-center";

    const rankClass = rank <= 3 ? `rank-${rank}` : "";
    const avatarUrl = RecapService.extractAvatarUrl(contributor.avatar);
    const adminBadge = contributor.isAdmin
      ? '<span class="admin-badge ms-2">Administrator</span>'
      : "";
    const userUrl = `https://alter-ego.fandom.com/wiki/User:${encodeURIComponent(contributor.userName)}`;

    item.innerHTML = `
          <div class="leaderboard-rank ${rankClass} me-3">
              ${rank <= 3 ? this.getRankIcon(rank) : rank}
          </div>
          <img src="${avatarUrl}" alt="${contributor.userName}" class="contributor-avatar me-3" 
               onerror="this.src='https://static.wikia.nocookie.net/alter-ego/images/f/f7/Place.png'">
          <div class="contributor-info flex-grow-1 me-3">
              <h6 class="mb-1">
                  ${contributor.userName}
                  ${adminBadge}
              </h6>
              <small class="text-muted">
                  <i class="bi bi-person me-1"></i>
                  User ID: ${contributor.userId}
              </small>
          </div>
          <div class="text-end">
              <div class="contributions-count">
                  ${contributor.contributions}
              </div>
              <small class="text-muted contributions-text">${contributor.contributionsText}</small>
          </div>
      `;

    item.style.cursor = "pointer";
    item.addEventListener("click", () => {
      window.open(userUrl, "_blank", "noopener,noreferrer");
    });

    return item;
  }

  private getRankIcon(rank: number): string {
    switch (rank) {
      case 1:
        return '<i class="bi bi-trophy-fill"></i>';
      case 2:
        return '<i class="bi bi-award-fill"></i>';
      case 3:
        return '<i class="bi bi-star-fill"></i>';
      default:
        return rank.toString();
    }
  }
}
