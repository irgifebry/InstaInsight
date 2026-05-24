export interface InstagramUser {
  username: string;
  href?: string;
  timestamp?: number;
}

export interface AnalysisResult {
  following: InstagramUser[];
  followers: InstagramUser[];
  dontFollowBack: InstagramUser[];
  fans: InstagramUser[];
  mutuals: InstagramUser[];
  lostFollowers?: InstagramUser[];
}

export interface RawInstagramStringListData {
  value: string;
  href: string;
  timestamp: number;
}

export interface RawInstagramItem {
  string_list_data: RawInstagramStringListData[];
  title?: string;
}

export interface StandardExportFormat {
  relationships_following?: RawInstagramItem[];
  relationships_followers?: RawInstagramItem[];
  [key: string]: any;
}