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
