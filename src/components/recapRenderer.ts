import { RecapData, Contributor } from "../types.js";
import { RecapService } from "./recapService.js";

export class RecapRenderer {
  private loadingElement: HTMLElement;
  private errorElement: HTMLElement;
  private errorMessageElement: HTMLElement;
  private leaderboardElement: HTMLElement;
  private totalContributorsElement: HTMLElement;
  private currentDateElement: HTMLElement;
  private totalContributionsElement: HTMLElement;
  private averagePerUserElement: HTMLElement;
  private globalBarElement: HTMLElement;
  private legendElement: HTMLElement;

  constructor() {
    this.loadingElement = document.getElementById("loading")!;
    this.errorElement = document.getElementById("error")!;
    this.errorMessageElement = document.getElementById("errorMessage")!;
    this.leaderboardElement = document.getElementById("leaderboard")!;
    this.totalContributorsElement =
      document.getElementById("totalContributors")!;
    this.currentDateElement = document.getElementById("currentDate")!;
    this.totalContributionsElement =
      document.getElementById("totalContributions")!;
    this.averagePerUserElement = document.getElementById("averagePerUser")!;
    this.globalBarElement = document.getElementById("globalContributionsBar")!;
    this.legendElement = document.getElementById("contributionsLegend")!;
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

    this.totalContributorsElement.textContent =
      data.totalContributors.toString();
    this.currentDateElement.textContent =
      RecapService.formatDisplayDate(dateString);

    const total = data.contributors.reduce(
      (sum, c) => sum + Number(c.contributions),
      0,
    );
    const avg = data.contributors.length
      ? Math.round(total / data.contributors.length)
      : 0;
    this.totalContributionsElement.textContent = total.toString();
    this.averagePerUserElement.textContent = avg.toString();

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

    this.renderGlobalContributionsBar(data);
  }

  private showNoData(): void {
    this.errorElement.style.display = "none";

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
        <div class="contributions-count" data-target="${contributor.contributions}">0</div>
        <small class="text-muted contributions-text">${contributor.contributionsText}</small>
      </div>
    `;

    setTimeout(() => {
      const countElem = item.querySelector(
        ".contributions-count",
      ) as HTMLElement;
      if (countElem)
        this.animateCounter(countElem, Number(contributor.contributions));
    }, 0);

    item.style.cursor = "pointer";
    item.addEventListener("click", () => {
      window.open(userUrl, "_blank", "noopener, noreferrer");
    });

    return item;
  }

  private animateCounter(element: HTMLElement, targetValue: number): void {
    let current = 0;
    const increment = Math.max(1, Math.ceil(targetValue / 30));
    const timer = setInterval(() => {
      current += increment;
      if (current >= targetValue) {
        element.textContent = targetValue.toString();
        clearInterval(timer);
      } else {
        element.textContent = current.toString();
      }
    }, 20);
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

  private renderGlobalContributionsBar(data: RecapData): void {
    const palette = [
      "#FF1744",
      "#00E676",
      "#2979FF",
      "#FFD600",
      "#F50057",
      "#00B8D4",
      "#FF9100",
      "#C51162",
      "#76FF03",
      "#D500F9",
      "#FF3D00",
      "#64DD17",
      "#304FFE",
      "#FFEA00",
      "#00BFAE",
      "#AA00FF",
    ];
    const total = data.contributors.reduce(
      (sum, c) => sum + Number(c.contributions),
      0,
    );

    const colors = data.contributors.map(
      (_, i) =>
        palette[i % palette.length] ||
        `hsl(${Math.floor(Math.random() * 360)}, 95%, 55%)`,
    );

    const bars = data.contributors
      .map((c, i) => {
        const percent = total ? (Number(c.contributions) / total) * 100 : 0;
        return `
        <div
          class="progress-bar"
          role="progressbar"
          style="width: ${percent}%; background: ${colors[i]}"
          title="${c.userName} (${c.contributions})"
        ></div>`;
      })
      .join("");

    const legendItems = data.contributors
      .map((c, i) => {
        return `
        <span class="d-flex align-items-center" style="font-size: .95em;">
          <span
            class="d-inline-block me-2"
            style="width: 16px; height: 16px; background: ${colors[i]}; border-radius: 3px;"
          ></span>
          ${c.userName}
        </span>`;
      })
      .join("");

    const barHtml = `
      <div class="progress" style="height: 24px; border-radius: 3px; overflow: hidden; border: 1px solid var(--border-color);">
        ${bars}
      </div>`;

    const legendHtml = `
      <div class="d-flex flex-wrap align-items-center gap-2">
        ${legendItems}
      </div>`;

    this.globalBarElement.innerHTML = barHtml;
    this.legendElement.innerHTML = legendHtml;
  }
}
