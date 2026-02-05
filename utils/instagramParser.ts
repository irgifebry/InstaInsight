import { InstagramUser, RawInstagramItem, StandardExportFormat } from '../types';

/**
 * Parses a generic JSON object trying to find Instagram user lists.
 * Supports the official "Download Your Data" JSON format.
 */
export const parseInstagramJSON = (json: any): InstagramUser[] => {
  const users: InstagramUser[] = [];

  // Helper to extract from string_list_data
  const extractUsers = (items: RawInstagramItem[]) => {
    items.forEach(item => {
      if (item.string_list_data && Array.isArray(item.string_list_data)) {
        item.string_list_data.forEach(data => {
          users.push({
            username: data.value,
            href: data.href,
            timestamp: data.timestamp
          });
        });
      }
    });
  };

  // Check structure types
  if (Array.isArray(json)) {
    // Sometimes the file is just a direct array of objects
    extractUsers(json);
  } else if (typeof json === 'object') {
    // Check for "relationships_following" or similar keys
    if (json.relationships_following && Array.isArray(json.relationships_following)) {
      extractUsers(json.relationships_following);
    } else if (json.relationships_followers && Array.isArray(json.relationships_followers)) {
      extractUsers(json.relationships_followers);
    } else {
       // Try to find any array property that looks like it has users
       Object.values(json).forEach((val: any) => {
         if (Array.isArray(val) && val.length > 0 && val[0].string_list_data) {
           extractUsers(val);
         }
       });
    }
  }

  return users;
};

export const analyzeData = (following: InstagramUser[], followers: InstagramUser[]) => {
  const followingMap = new Set(following.map(u => u.username));
  const followersMap = new Set(followers.map(u => u.username));

  const dontFollowBack = following.filter(u => !followersMap.has(u.username));
  const fans = followers.filter(u => !followingMap.has(u.username));
  const mutuals = following.filter(u => followersMap.has(u.username));

  return {
    following,
    followers,
    dontFollowBack,
    fans,
    mutuals
  };
};