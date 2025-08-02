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

  renderBattleRecords(records: BattleRecord[]): void {
    this.recordsLoadingElement.style.display = "none";
    this.recordsErrorElement.style.display = "none";

    this.battleRecordsElement.innerHTML = "";

    if (records.length === 0) {
      this.showNoData(this.battleRecordsElement, "No battle records available.");
      return;
    }

    const recentRecords = records.slice(0, 50);
    
    recentRecords.forEach(record => {
      const item = this.createBattleRecordItem(record);
      this.battleRecordsElement.appendChild(item);
    });
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

    item.innerHTML = `
      <div class="d-flex justify-content-between align-items-start mb-2">
        <div>
          <h6 class="mb-1">
            <span class="text-success fw-bold">${this.escapeHtml(record.winnerTag)}</span>
            <small class="text-muted mx-2">defeated</small>
            <span class="text-danger">${this.escapeHtml(record.loserTag)}</span>
          </h6>
          <small class="text-muted">
            <i class="bi bi-calendar3 me-1"></i>
            ${DeathBattleService.formatDate(record.battleDate)}
          </small>
        </div>
        <span class="badge ${record.isRanked ? 'bg-warning text-dark' : 'bg-info'}">${battleType}</span>
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