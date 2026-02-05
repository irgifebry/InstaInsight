export interface InstagramUser {
  username: string;
  href?: string;
  timestamp?: number;
}

export interface AnalysisResult {
  following: InstagramUser[];
  followers: InstagramUser[];
  dontFollowBack: InstagramUser[]; // People I follow, but they don't follow me
  fans: InstagramUser[]; // People who follow me, but I don't follow them
  mutuals: InstagramUser[]; // Follow each other
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

// Support for standard "Download Your Data" format from Instagram
export interface StandardExportFormat {
  relationships_following?: RawInstagramItem[];
  relationships_followers?: RawInstagramItem[]; // Sometimes it's just an array of items
  [key: string]: any;
}