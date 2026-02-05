import { InstagramUser } from '../types';

const DEFAULT_APP_IDS = [
  "936619543551",       // Standard Web
  "1217981644879628",   // Old Web
  "142278499824638"     // Mobile Web
];

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// Helper to dynamically get config (rollout_hash and app_id)
const getDynamicConfig = async (): Promise<{ ajaxToken: string, appId: string | null }> => {
  let ajaxToken = "1";
  let appId = null;

  try {
    // Attempt to fetch homepage
    const res = await fetch("https://www.instagram.com/", {
      mode: 'cors',
      credentials: 'include'
    });
    const text = await res.text();

    // Find Ajax Token
    const rolloutMatch = text.match(/"rollout_hash":"([a-zA-Z0-9]+)"/);
    if (rolloutMatch) ajaxToken = rolloutMatch[1];
    else {
      const revMatch = text.match(/"server_revision":(\d+)/);
      if (revMatch) ajaxToken = revMatch[1];
    }

    // Find App ID
    const appIdMatch = text.match(/"app_id":"(\d+)"/) || text.match(/"appId":"(\d+)"/);
    if (appIdMatch) appId = appIdMatch[1];

  } catch (e) {
    console.warn("Could not fetch dynamic instagram config.");
  }
  return { ajaxToken, appId };
};

export const fetchInstagramList = async (
  type: 'followers' | 'following',
  userId: string,
  onProgress: (count: number) => void,
  onRateLimit?: (seconds: number) => void,
  signal?: AbortSignal,
  csrfToken?: string
): Promise<InstagramUser[]> => {
  let users: InstagramUser[] = [];
  let nextMaxId = "";
  let hasNext = true;
  let page = 1;
  const BATCH_SIZE = 50;

  // Initialize Config
  const { ajaxToken, appId: detectedAppId } = await getDynamicConfig();
  console.log(`Initialized with Ajax Token: ${ajaxToken}, Detected App ID: ${detectedAppId || 'None'}`);

  // Build ID List with detected ID first
  let APP_IDS = detectedAppId ? [detectedAppId, ...DEFAULT_APP_IDS] : DEFAULT_APP_IDS;
  APP_IDS = [...new Set(APP_IDS)]; // Unique

  let currentAppIdIndex = 0;

  const getHeaders = () => {
    const h: Record<string, string> = {
      "x-ig-app-id": APP_IDS[currentAppIdIndex],
      "x-requested-with": "XMLHttpRequest",
      "x-asbd-id": "129477",
      "x-ig-www-claim": "0",
      "x-instagram-ajax": ajaxToken
    };
    if (csrfToken) h["x-csrftoken"] = csrfToken;
    return h;
  };

  while (hasNext) {
    if (signal?.aborted) throw new Error("Scan aborted");

    const queryParams = new URLSearchParams({
      count: BATCH_SIZE.toString(),
      max_id: nextMaxId || ""
    });

    const url = `https://www.instagram.com/api/v1/friendships/${userId}/${type}/?${queryParams.toString()}`;

    try {
      const response = await fetch(url, {
        headers: getHeaders(),
        credentials: 'include',
        mode: 'cors'
      });

      if (!response.ok) {
        // App ID Rotation for 400 Errors
        if (response.status === 400) {
          console.warn(`⚠️ App ID ${APP_IDS[currentAppIdIndex]} blocked (400). Rotating to next ID...`);
          currentAppIdIndex = (currentAppIdIndex + 1) % APP_IDS.length;

          await sleep(2000);
          continue; // Retry the same request with new headers
        }

        const text = await response.text();
        console.error(`API Error (${response.status}):`, text.substring(0, 200));

        if (response.status === 401) throw new Error("Unauthorized. Please log in.");
        if (response.status === 429) {
          console.warn("Rate limited (429). Waiting 60 seconds...");
          if (onRateLimit) onRateLimit(60);
          await sleep(60000);
          continue;
        }
        throw new Error(`HTTP Error ${response.status}`);
      }

      // Check if response has content before parsing JSON
      const text = await response.text();
      let json;
      try {
        json = text ? JSON.parse(text) : {};
      } catch (e) {
        console.error("Failed to parse JSON response:", text.substring(0, 100));
        throw new Error("Invalid JSON response from Instagram");
      }

      const chunk = json.users || [];

      const mappedChunk = chunk.map((u: any) => ({
        username: u.username,
        href: `https://instagram.com/${u.username}`,
        timestamp: Math.floor(Date.now() / 1000)
      }));

      users = [...users, ...mappedChunk];
      onProgress(users.length);

      nextMaxId = json.next_max_id;
      hasNext = !!nextMaxId;
      page++;

      await sleep(1500 + Math.random() * 1000);

    } catch (error) {
      console.error(`Error fetching ${type} page ${page}:`, error);
      throw error;
    }
  }

  return users;
};