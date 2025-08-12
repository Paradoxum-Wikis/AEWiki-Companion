export interface Contributor {
  userName: string;
  userId: string;
  avatar: string;
  profileUrl: string;
  userContactPage: string;
  isAdmin: boolean;
  isCurrent: boolean;
  contributions: string;
  latestRevision: string | null;
  contributionsText: string;
  index: number;
}

export interface RecapData {
  timestamp: string;
  totalContributors: number;
  contributors: Contributor[];
}

export interface DateInfo {
  year: number;
  month: number;
  day: number;
  dateString: string;
}

export interface BattleStats {
  userId: string;
  userTag: string;
  wins: number;
  losses: number;
  totalBattles: number;
  winRate: number;
  lastCasualBattleAt?: string;
  rankedWins: number;
  rankedLosses: number;
  rankedTotalBattles: number;
  rankedWinRate: number;
  lastRankedBattleAt?: string;
}

export interface BattleRecord {
  battleId: string;
  winnerId: string;
  winnerTag: string;
  loserId: string;
  loserTag: string;
  battleDate: string;
  turns: number;
  winnerHpRemaining: number;
  winnerMaxHp: number;
  isRanked: boolean;
  guildId?: string;
}
