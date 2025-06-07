var d = Object.defineProperty;
var c = (o, e, t) =>
  e in o
    ? d(o, e, { enumerable: !0, configurable: !0, writable: !0, value: t })
    : (o[e] = t);
var r = (o, e, t) => c(o, typeof e != "symbol" ? e + "" : e, t);
import "./main-Dfjuop0D.js";
class s {
  static formatDate(e) {
    const t = e.getFullYear(),
      a = String(e.getMonth() + 1).padStart(2, "0"),
      i = String(e.getDate()).padStart(2, "0");
    return `${t}-${a}-${i}`;
  }
  static parseDate(e) {
    const [t, a, i] = e.split("-").map(Number);
    return { year: t, month: a, day: i, dateString: e };
  }
  static formatDisplayDate(e) {
    return new Date(e + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  static addDays(e, t) {
    const a = new Date(e + "T00:00:00");
    return a.setDate(a.getDate() + t), this.formatDate(a);
  }
  static subtractDays(e, t) {
    return this.addDays(e, -t);
  }
  static async fetchRecapData(e) {
    const { year: t } = this.parseDate(e),
      a = `recap-${e}.json`,
      i = `${this.GITHUB_RAW_BASE}/${t}/${a}`;
    try {
      const n = await fetch(i);
      if (!n.ok)
        throw new Error(`Failed to fetch data: ${n.status} ${n.statusText}`);
      return await n.json();
    } catch (n) {
      throw (console.error("Error fetching recap data:", n), n);
    }
  }
  static extractAvatarUrl(e) {
    const t = e.match(/src="([^"]+)"/);
    return t && t[1]
      ? t[1]
      : "https://static.wikia.nocookie.net/alter-ego/images/f/f7/Place.png";
  }
  static getCurrentWeekDate() {
    const t = new URLSearchParams(window.location.search).get("date");
    return t && /^\d{4}-\d{2}-\d{2}$/.test(t) ? t : this.formatDate(new Date());
  }
  static updateUrlWithDate(e) {
    const t = new URL(window.location.href);
    t.searchParams.set("date", e),
      window.history.pushState({}, "", t.toString());
  }
}
r(
  s,
  "GITHUB_RAW_BASE",
  "https://raw.githubusercontent.com/Paradoxum-Wikis/AEWiki-Recap/main/data",
);
class m {
  constructor() {
    r(this, "container");
    r(this, "loadingElement");
    r(this, "errorElement");
    r(this, "errorMessageElement");
    r(this, "leaderboardElement");
    r(this, "totalContributorsElement");
    r(this, "currentDateElement");
    (this.container = document.getElementById("leaderboard")),
      (this.loadingElement = document.getElementById("loading")),
      (this.errorElement = document.getElementById("error")),
      (this.errorMessageElement = document.getElementById("errorMessage")),
      (this.leaderboardElement = document.getElementById("leaderboard")),
      (this.totalContributorsElement =
        document.getElementById("totalContributors")),
      (this.currentDateElement = document.getElementById("currentDate"));
  }
  showLoading() {
    (this.loadingElement.style.display = "block"),
      (this.errorElement.style.display = "none"),
      (this.leaderboardElement.innerHTML = "");
  }
  showError(e) {
    (this.loadingElement.style.display = "none"),
      (this.errorElement.style.display = "block"),
      (this.errorMessageElement.textContent = e),
      (this.leaderboardElement.innerHTML = "");
  }
  renderLeaderboard(e, t) {
    if (
      ((this.loadingElement.style.display = "none"),
      (this.errorElement.style.display = "none"),
      (this.totalContributorsElement.textContent =
        e.totalContributors.toString()),
      (this.currentDateElement.textContent = s.formatDisplayDate(t)),
      (this.leaderboardElement.innerHTML = ""),
      e.contributors.length === 0)
    ) {
      this.showNoData();
      return;
    }
    e.contributors.forEach((a, i) => {
      const n = this.createLeaderboardItem(a, i + 1);
      this.leaderboardElement.appendChild(n);
    });
  }
  showNoData() {
    const e = document.createElement("div");
    (e.className = "text-center p-4"),
      (e.innerHTML = `
            <i class="bi bi-inbox display-4 text-muted mb-3"></i>
            <h5 class="text-muted">No contributors found</h5>
            <p class="text-muted mb-0">No contribution data available for this week.</p>
        `),
      this.leaderboardElement.appendChild(e);
  }
  createLeaderboardItem(e, t) {
    const a = document.createElement("div");
    a.className = "list-group-item leaderboard-item d-flex align-items-center";
    const i = t <= 3 ? `rank-${t}` : "",
      n = s.extractAvatarUrl(e.avatar),
      l = e.isAdmin ? '<span class="admin-badge ms-2">Admin</span>' : "";
    return (
      (a.innerHTML = `
            <div class="leaderboard-rank ${i} me-3">
                ${t <= 3 ? this.getRankIcon(t) : t}
            </div>
            <img src="${n}" alt="${e.userName}" class="contributor-avatar me-3" 
                 onerror="this.src='/api/placeholder/48/48'">
            <div class="contributor-info flex-grow-1">
                <h6 class="mb-1">
                    ${e.userName}
                    ${l}
                </h6>
                <small class="text-muted">
                    <i class="bi bi-person me-1"></i>
                    User ID: ${e.userId}
                </small>
            </div>
            <div class="text-end">
                <div class="contributions-count">
                    ${e.contributions}
                </div>
                <small class="text-muted">${e.contributionsText}</small>
            </div>
        `),
      (a.style.cursor = "pointer"),
      a.addEventListener("click", () => {
        alert(`Would navigate to: ${e.profileUrl}`);
      }),
      a
    );
  }
  getRankIcon(e) {
    switch (e) {
      case 1:
        return '<i class="bi bi-trophy-fill"></i>';
      case 2:
        return '<i class="bi bi-award-fill"></i>';
      case 3:
        return '<i class="bi bi-star-fill"></i>';
      default:
        return e.toString();
    }
  }
}
class h {
  constructor() {
    r(this, "renderer");
    r(this, "currentDate");
    r(this, "prevWeekButton");
    r(this, "nextWeekButton");
    (this.renderer = new m()),
      (this.currentDate = s.getCurrentWeekDate()),
      (this.prevWeekButton = document.getElementById("prevWeek")),
      (this.nextWeekButton = document.getElementById("nextWeek")),
      this.initializeEventListeners(),
      this.loadRecapData();
  }
  initializeEventListeners() {
    this.prevWeekButton.addEventListener("click", () => {
      this.navigateWeek(-7);
    }),
      this.nextWeekButton.addEventListener("click", () => {
        this.navigateWeek(7);
      }),
      window.addEventListener("popstate", () => {
        (this.currentDate = s.getCurrentWeekDate()), this.loadRecapData();
      });
  }
  navigateWeek(e) {
    e < 0
      ? (this.currentDate = s.subtractDays(this.currentDate, Math.abs(e)))
      : (this.currentDate = s.addDays(this.currentDate, e)),
      s.updateUrlWithDate(this.currentDate),
      this.loadRecapData();
  }
  async loadRecapData() {
    this.renderer.showLoading(), this.updateNavigationButtons();
    try {
      const e = await s.fetchRecapData(this.currentDate);
      this.renderer.renderLeaderboard(e, this.currentDate);
    } catch (e) {
      console.error("Failed to load recap data:", e);
      let t = "Failed to load recap data.";
      e instanceof Error &&
        (e.message.includes("404")
          ? (t = "No recap data available for this date.")
          : (t = e.message)),
        this.renderer.showError(t);
    }
  }
  updateNavigationButtons() {
    const e = s.formatDate(new Date()),
      t = new Date(this.currentDate + "T00:00:00"),
      a = new Date(e + "T00:00:00");
    (this.nextWeekButton.disabled = t >= a),
      (this.prevWeekButton.disabled = !1);
  }
}
document.addEventListener("DOMContentLoaded", () => {
  new h();
});
