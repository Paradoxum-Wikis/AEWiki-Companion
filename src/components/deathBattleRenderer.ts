import { BattleStats, BattleRecord } from "../types.js";
import { DeathBattleService } from "./deathBattleService.js";

export class DeathBattleRenderer {
  private casualLoadingElement: HTMLElement;
  private casualErrorElement: HTMLElement;
  private casualErrorMessageElement: HTMLElement;
  private casualLeaderboardElement: HTMLElement;
  private casualTotalPlayersElement: HTMLElement;
  private casualTotalBattlesElement: HTMLElement;
  private casualLastBattleElement: HTMLElement;

  private rankedLoadingElement: HTMLElement;
  private rankedErrorElement: HTMLElement;
  private rankedErrorMessageElement: HTMLElement;
  private rankedLeaderboardElement: HTMLElement;
  private rankedTotalPlayersElement: HTMLElement;
  private rankedTotalBattlesElement: HTMLElement;
  private rankedLastBattleElement: HTMLElement;

  private recordsLoadingElement: HTMLElement;
  private recordsErrorElement: HTMLElement;
  private recordsErrorMessageElement: HTMLElement;
  private battleRecordsElement: HTMLElement;

  private recordsPaginationElement: HTMLElement;
  private recordsPerPageElement: HTMLSelectElement;
  private recordsInfoElement: HTMLElement;
  private recordsFirstPageElement: HTMLButtonElement;
  private recordsPrevPageElement: HTMLButtonElement;
  private recordsNextPageElement: HTMLButtonElement;
  private recordsLastPageElement: HTMLButtonElement;
  private recordsPageNumbersElement: HTMLElement;

  private currentPage: number = 1;
  private recordsPerPage: number = 25;
  private totalRecords: number = 0;
  private filteredRecords: BattleRecord[] = [];

  constructor() {
    // Casual elements
    this.casualLoadingElement = document.getElementById("casualLoading")!;
    this.casualErrorElement = document.getElementById("casualError")!;
    this.casualErrorMessageElement = document.getElementById("casualErrorMessage")!;
    this.casualLeaderboardElement = document.getElementById("casualLeaderboard")!;
    this.casualTotalPlayersElement = document.getElementById("casualTotalPlayers")!;
    this.casualTotalBattlesElement = document.getElementById("casualTotalBattles")!;
    this.casualLastBattleElement = document.getElementById("casualLastBattle")!;

    // Ranked elements
    this.rankedLoadingElement = document.getElementById("rankedLoading")!;
    this.rankedErrorElement = document.getElementById("rankedError")!;
    this.rankedErrorMessageElement = document.getElementById("rankedErrorMessage")!;
    this.rankedLeaderboardElement = document.getElementById("rankedLeaderboard")!;
    this.rankedTotalPlayersElement = document.getElementById("rankedTotalPlayers")!;
    this.rankedTotalBattlesElement = document.getElementById("rankedTotalBattles")!;
    this.rankedLastBattleElement = document.getElementById("rankedLastBattle")!;

    // Records elements
    this.recordsLoadingElement = document.getElementById("recordsLoading")!;
    this.recordsErrorElement = document.getElementById("recordsError")!;
    this.recordsErrorMessageElement = document.getElementById("recordsErrorMessage")!;
    this.battleRecordsElement = document.getElementById("battleRecords")!;

    // Pagination elements
    this.recordsPaginationElement = document.getElementById("recordsPagination")!;
    this.recordsPerPageElement = document.getElementById("recordsPerPage")! as HTMLSelectElement;
    this.recordsInfoElement = document.getElementById("recordsInfo")!;
    this.recordsFirstPageElement = document.getElementById("recordsFirstPage")! as HTMLButtonElement;
    this.recordsPrevPageElement = document.getElementById("recordsPrevPage")! as HTMLButtonElement;
    this.recordsNextPageElement = document.getElementById("recordsNextPage")! as HTMLButtonElement;
    this.recordsLastPageElement = document.getElementById("recordsLastPage")! as HTMLButtonElement;
    this.recordsPageNumbersElement = document.getElementById("recordsPageNumbers")!;

    this.setupPaginationEvents();
  }

  private setupPaginationEvents(): void {
    this.recordsPerPageElement.addEventListener('change', () => {
      this.recordsPerPage = parseInt(this.recordsPerPageElement.value);
      this.currentPage = 1;
      this.renderCurrentPage();
    });

    this.recordsFirstPageElement.addEventListener('click', () => {
      this.currentPage = 1;
      this.renderCurrentPage();
    });

    this.recordsPrevPageElement.addEventListener('click', () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.renderCurrentPage();
      }
    });

    this.recordsNextPageElement.addEventListener('click', () => {
      const totalPages = Math.ceil(this.totalRecords / this.recordsPerPage);
      if (this.currentPage < totalPages) {
        this.currentPage++;
        this.renderCurrentPage();
      }
    });

    this.recordsLastPageElement.addEventListener('click', () => {
      const totalPages = Math.ceil(this.totalRecords / this.recordsPerPage);
      this.currentPage = totalPages;
      this.renderCurrentPage();
    });
  }

  showCasualLoading(): void {
    this.casualLoadingElement.style.display = "block";
    this.casualErrorElement.style.display = "none";
    this.casualLeaderboardElement.innerHTML = "";
  }

  showRankedLoading(): void {
    this.rankedLoadingElement.style.display = "block";
    this.rankedErrorElement.style.display = "none";
    this.rankedLeaderboardElement.innerHTML = "";
  }

  showRecordsLoading(): void {
    this.recordsLoadingElement.style.display = "block";
    this.recordsErrorElement.style.display = "none";
    this.battleRecordsElement.innerHTML = "";
  }

  showCasualError(message: string): void {
    this.casualLoadingElement.style.display = "none";
    this.casualErrorElement.style.display = "block";
    this.casualErrorMessageElement.textContent = message;
    this.casualLeaderboardElement.innerHTML = "";
  }

  showRankedError(message: string): void {
    this.rankedLoadingElement.style.display = "none";
    this.rankedErrorElement.style.display = "block";
    this.rankedErrorMessageElement.textContent = message;
    this.rankedLeaderboardElement.innerHTML = "";
  }

  showRecordsError(message: string): void {
    this.recordsLoadingElement.style.display = "none";
    this.recordsErrorElement.style.display = "block";
    this.recordsErrorMessageElement.textContent = message;
    this.battleRecordsElement.innerHTML = "";
  }

  renderCasualStats(stats: BattleStats[]): void {
    this.casualLoadingElement.style.display = "none";
    this.casualErrorElement.style.display = "none";

    const casualPlayers = stats.filter(player => player.totalBattles > 0);
    
    // Sort
    casualPlayers.sort((a, b) => {
      const aHasMinMatches = a.totalBattles >= 3;
      const bHasMinMatches = b.totalBattles >= 3;

      if (aHasMinMatches && !bHasMinMatches) return -1;
      if (!aHasMinMatches && bHasMinMatches) return 1;

      if (b.winRate !== a.winRate) return b.winRate - a.winRate;
      return b.totalBattles - a.totalBattles;
    });

    // Calculate totals
    const totalPlayers = casualPlayers.length;
    const totalBattles = casualPlayers.reduce((sum, p) => sum + p.totalBattles, 0);
    const lastBattle = this.getLastBattle(casualPlayers.map(p => p.lastCasualBattleAt).filter((d): d is string => typeof d === "string"));

    this.casualTotalPlayersElement.textContent = totalPlayers.toString();
    this.casualTotalBattlesElement.textContent = totalBattles.toString();
    this.casualLastBattleElement.textContent = lastBattle;

    this.casualLeaderboardElement.innerHTML = "";

    if (casualPlayers.length === 0) {
      this.showNoData(this.casualLeaderboardElement, "No casual battle data available.");
      return;
    }

    casualPlayers.forEach((player, index) => {
      const item = this.createPlayerItem(player, index + 1, 'casual');
      this.casualLeaderboardElement.appendChild(item);
    });
  }

  renderRankedStats(stats: BattleStats[]): void {
    this.rankedLoadingElement.style.display = "none";
    this.rankedErrorElement.style.display = "none";

    // Filter
    const rankedPlayers = stats.filter(player => player.rankedTotalBattles > 0);
    
    // Sort
    rankedPlayers.sort((a, b) => {
      const aHasMinMatches = a.rankedTotalBattles >= 5;
      const bHasMinMatches = b.rankedTotalBattles >= 5;

      if (aHasMinMatches && !bHasMinMatches) return -1;
      if (!aHasMinMatches && bHasMinMatches) return 1;

      if (b.rankedWinRate !== a.rankedWinRate) return b.rankedWinRate - a.rankedWinRate;
      return b.rankedTotalBattles - a.rankedTotalBattles;
    });

    const totalPlayers = rankedPlayers.length;
    const totalBattles = rankedPlayers.reduce((sum, p) => sum + p.rankedTotalBattles, 0);
    const lastBattle = this.getLastBattle(rankedPlayers.map(p => p.lastRankedBattleAt).filter((d): d is string => typeof d === "string"));

    this.rankedTotalPlayersElement.textContent = totalPlayers.toString();
    this.rankedTotalBattlesElement.textContent = totalBattles.toString();
    this.rankedLastBattleElement.textContent = lastBattle;

    this.rankedLeaderboardElement.innerHTML = "";

    if (rankedPlayers.length === 0) {
      this.showNoData(this.rankedLeaderboardElement, "No ranked battle data available.");
      return;
    }

    rankedPlayers.forEach((player, index) => {
      const item = this.createPlayerItem(player, index + 1, 'ranked');
      this.rankedLeaderboardElement.appendChild(item);
    });
  }

  renderBattleRecords(records: BattleRecord[], venueFilter: string = 'all'): void {
    this.recordsLoadingElement.style.display = "none";
    this.recordsErrorElement.style.display = "none";

    if (records.length === 0) {
      this.recordsPaginationElement.style.display = "none";
      this.showNoData(this.battleRecordsElement, "No battle records available.");
      return;
    }

    this.filteredRecords = records;
    if (venueFilter !== 'all') {
      this.filteredRecords = records.filter(record => {
        if (venueFilter === 'alter-ego') {
          return record.guildId === "1362084781134708907" || !record.guildId;
        }
        return record.guildId === venueFilter;
      });
    }

    this.totalRecords = this.filteredRecords.length;
    this.currentPage = 1;

    if (this.totalRecords === 0) {
      this.recordsPaginationElement.style.display = "none";
      this.showNoData(this.battleRecordsElement, "No battle records found for the selected venue.");
      return;
    }

    this.recordsPaginationElement.style.display = "flex";
    this.renderCurrentPage();
  }

  private renderCurrentPage(): void {
    this.battleRecordsElement.innerHTML = "";

    const startIndex = (this.currentPage - 1) * this.recordsPerPage;
    const endIndex = Math.min(startIndex + this.recordsPerPage, this.totalRecords);
    const pageRecords = this.filteredRecords.slice(startIndex, endIndex);

    pageRecords.forEach(record => {
      const item = this.createBattleRecordItem(record);
      this.battleRecordsElement.appendChild(item);
    });

    this.updatePaginationControls();
  }

  private updatePaginationControls(): void {
    const totalPages = Math.ceil(this.totalRecords / this.recordsPerPage);
    const startItem = (this.currentPage - 1) * this.recordsPerPage + 1;
    const endItem = Math.min(this.currentPage * this.recordsPerPage, this.totalRecords);

    this.recordsInfoElement.textContent = `${startItem}-${endItem} of ${this.totalRecords} records`;
    this.recordsFirstPageElement.disabled = this.currentPage === 1;
    this.recordsPrevPageElement.disabled = this.currentPage === 1;
    this.recordsNextPageElement.disabled = this.currentPage === totalPages;
    this.recordsLastPageElement.disabled = this.currentPage === totalPages;

    this.renderPageNumbers(totalPages);
  }

  private renderPageNumbers(totalPages: number): void {
    this.recordsPageNumbersElement.innerHTML = "";

    if (totalPages <= 1) return;

    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      this.addPageButton(1);
      if (startPage > 2) {
        this.addEllipsis();
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      this.addPageButton(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        this.addEllipsis();
      }
      this.addPageButton(totalPages);
    }
  }

  private addPageButton(pageNumber: number): void {
    const button = document.createElement("button");
    button.className = `btn btn-sm ${this.currentPage === pageNumber ? 'btn-primary' : 'btn-outline-secondary'}`;
    button.textContent = pageNumber.toString();
    button.addEventListener('click', () => {
      this.currentPage = pageNumber;
      this.renderCurrentPage();
    });
    this.recordsPageNumbersElement.appendChild(button);
  }

  private addEllipsis(): void {
    const span = document.createElement("span");
    span.className = "btn btn-sm btn-outline-secondary disabled";
    span.textContent = "...";
    this.recordsPageNumbersElement.appendChild(span);
  }

  private createPlayerItem(player: BattleStats, rank: number, type: 'casual' | 'ranked'): HTMLElement {
    const item = document.createElement("div");
    item.className = "list-group-item leaderboard-item d-flex align-items-center"; // Use existing class

    const wins = type === 'casual' ? player.wins : player.rankedWins;
    const losses = type === 'casual' ? player.losses : player.rankedLosses;
    const totalBattles = type === 'casual' ? player.totalBattles : player.rankedTotalBattles;
    const winRate = type === 'casual' ? player.winRate : player.rankedWinRate;
    const lastBattle = type === 'casual' ? player.lastCasualBattleAt : player.lastRankedBattleAt;

    const rankClass = rank <= 3 ? `rank-${rank}` : "";
    const winRateColor = winRate >= 70 ? 'text-success' : winRate >= 50 ? 'text-warning' : 'text-danger';

    item.innerHTML = `
      <div class="leaderboard-rank ${rankClass} me-3">
        ${rank <= 3 ? this.getRankIcon(rank) : rank}
      </div>
      <div class="contributor-info flex-grow-1 me-3">
        <h6 class="mb-1 fw-bold">
          ${this.escapeHtml(player.userTag)}
        </h6>
        <small class="text-muted">
          <i class="bi bi-person me-1"></i>
          ID: ${player.userId}
        </small>
        ${lastBattle ? `<br><small class="text-muted">Last battle: ${DeathBattleService.formatRelativeTime(lastBattle)}</small>` : ''}
      </div>
      <div class="text-end">
        <div class="d-flex gap-3 mb-1">
          <span class="text-success">
            <i class="bi bi-trophy-fill me-1"></i>
            ${wins}W
          </span>
          <span class="text-danger">
            <i class="bi bi-x-circle-fill me-1"></i>
            ${losses}L
          </span>
        </div>
        <div class="fw-bold ${winRateColor}">${winRate}% WR</div>
        <small class="text-muted">${totalBattles} battles</small>
      </div>
    `;

    return item;
  }

  private createBattleRecordItem(record: BattleRecord): HTMLElement {
    const item = document.createElement("div");
    item.className = "list-group-item leaderboard-item";

    const hpPercentage = (record.winnerHpRemaining / record.winnerMaxHp) * 100;
    const battleType = record.isRanked ? 'Ranked' : 'Normal';
    
    const getVenue = (guildId?: string): { name: string; color: string } => {
      if (guildId === "735394249863987241") {
        return { name: "Tower Defense Simulator Wiki", color: "bg-primary" };
      } else if (guildId === "1362084781134708907" || !guildId) {
        return { name: "ALTER EGO Wiki", color: "bg-secondary" };
      } else {
        return { name: "Unknown Venue", color: "bg-dark" };
      }
    };
    
    const venue = getVenue(record.guildId);

    item.innerHTML = `
      <div class="d-flex justify-content-between align-items-start mb-2">
        <div class="flex-grow-1">
          <h6 class="mb-1">
            <span class="text-success fw-bold">${this.escapeHtml(record.winnerTag)}</span>
            <small class="text-muted mx-2">defeated</small>
            <span class="text-danger">${this.escapeHtml(record.loserTag)}</span>
          </h6>
          <small class="text-muted">
            <i class="bi bi-calendar3 me-1"></i>
            ${DeathBattleService.formatDate(record.battleDate)}
          </small>
          <br>
          <small class="text-muted">
            <i class="bi bi-building me-1"></i>
            <span class="badge ${venue.color} me-1">${venue.name}</span>
          </small>
        </div>
        <div class="text-end">
          <span class="badge ${record.isRanked ? 'bg-warning text-dark' : 'bg-info'} mb-1">${battleType}</span>
        </div>
      </div>
      <div class="d-flex justify-content-between align-items-center">
        <div class="d-flex gap-3">
          <small class="text-muted">
            <i class="bi bi-arrow-repeat me-1"></i>
            ${record.turns} turns
          </small>
          <small class="text-muted">
            <i class="bi bi-heart-fill me-1"></i>
            ${record.winnerHpRemaining}/${record.winnerMaxHp} HP (${hpPercentage.toFixed(0)}%)
          </small>
        </div>
        <small class="text-muted">${DeathBattleService.formatRelativeTime(record.battleDate)}</small>
      </div>
    `;

    return item;
  }

  private getRankIcon(rank: number): string {
    switch (rank) {
      case 1:
        return '<i class="bi bi-trophy-fill text-warning"></i>';
      case 2:
        return '<i class="bi bi-award-fill" style="color: #c0c0c0;"></i>';
      case 3:
        return '<i class="bi bi-star-fill" style="color: #cd7f32;"></i>';
      default:
        return rank.toString();
    }
  }

  private getLastBattle(dates: string[]): string {
    if (dates.length === 0) return '-';
    
    const latestDate = dates.reduce((latest, current) => {
      return new Date(current) > new Date(latest) ? current : latest;
    });

    return DeathBattleService.formatRelativeTime(latestDate);
  }

  private showNoData(container: HTMLElement, message: string): void {
    const noDataElement = document.createElement("div");
    noDataElement.className = "text-center p-4";
    noDataElement.innerHTML = `
      <i class="bi bi-inbox display-4 text-muted mb-3"></i>
      <h5 class="text-muted">No Data Available</h5>
      <p class="text-muted mb-0">${message}</p>
    `;
    container.appendChild(noDataElement);
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}