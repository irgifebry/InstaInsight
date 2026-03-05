const SCRIPT_CONTENT = `
(async () => {
  console.log("InstaInsight: Scraper script initialized...");
  try {
      const sleep = (ms) => new Promise(r => setTimeout(r, ms));
      const getCookie = (name) => {
        const v = "; " + document.cookie;
        const p = v.split("; " + name + "=");
        if (p.length === 2) return p.pop().split(";").shift();
        return null;
      };

      if (document.getElementById('ii-overlay')) document.getElementById('ii-overlay').remove();
      const overlay = document.createElement('div');
      overlay.id = 'ii-overlay';
      overlay.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;z-index:999999;background:rgba(0,0,0,0.95);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;text-align:center;padding:20px;box-sizing:border-box;";
      
      overlay.innerHTML = "<div><div style='font-size:40px;margin-bottom:10px;'>🕵️</div><h3 id='ii-txt' style='margin:0 0 10px;font-size:18px;'>Loading... Please wait.</h3><div style='width:250px;height:6px;background:#333;border-radius:3px;overflow:hidden;margin:0 auto;'><div id='ii-bar' style='width:0%;height:100%;background:#8b5cf6;transition:width 0.3s;'></div></div></div><div id='ii-result' style='display:none;margin-top:30px;width:100%;max-width:320px;'><p style='font-size:14px;color:#cbd5e1;margin-bottom:15px;'>Scan Complete! Use the button below:</p><button id='ii-copy-btn' style='width:100%;padding:16px;background:#22c55e;color:#fff;border:none;border-radius:12px;font-size:16px;font-weight:bold;cursor:pointer;box-shadow:0 4px 12px rgba(34,197,94,0.4);margin-bottom:15px;display:flex;align-items:center;justify-content:center;gap:8px;'>📋 COPY RESULTS (LET US GO!)</button><textarea id='ii-json' readonly style='width:100%;height:60px;background:#1e293b;border:1px solid #334155;color:#94a3b8;font-size:10px;border-radius:8px;padding:8px;margin-bottom:10px;'></textarea><button id='ii-close-btn' style='background:transparent;border:1px solid #475569;color:#94a3b8;padding:10px;border-radius:8px;width:100%;font-size:12px;'>Close</button></div>";
      
      document.body.appendChild(overlay);

      const update = (msg, pct) => {
         const t = document.getElementById('ii-txt');
         const b = document.getElementById('ii-bar');
         if(t) t.innerText = msg;
         if(b) b.style.width = pct + '%';
      };

      const send = async (type, data = {}) => {
        let attempts = 0;
        let success = false;
        while(attempts < 3) {
            if (window.opener) {
                try { 
                    window.opener.postMessage({ type, data }, '*'); 
                    success = true; 
                    if(type === 'IG_DATA_SYNC') break; 
                } catch(e){}
            }
            if(success && type !== 'IG_DATA_SYNC') break;
            await sleep(300);
            attempts++;
        }
        return success;
      };

      const userId = getCookie("ds_user_id");
      if (!userId) {
        update("Oops, please login first!", 0);
        alert("Sorry, please login to Instagram first.");
        overlay.remove();
        return;
      }

      const APP_IDS = ["936619543551", "1217981644879628"];
      let currId = 0;
      let ajax = "1";
      try {
        const m = document.body.innerHTML.match(/"app_id":"(\\d+)"/);
        if(m) APP_IDS.unshift(m[1]);
      } catch(e){}

      const hdrs = () => ({
        "x-ig-app-id": APP_IDS[currId],
        "x-requested-with": "XMLHttpRequest",
        "x-csrftoken": getCookie("csrftoken"),
        "x-instagram-ajax": ajax
      });

      async function get(type) {
        let list = [];
        let maxId = "";
        let hasNext = true;
        update("Fetching " + type + "...", 10);
        
        while (hasNext) {
          try {
            const u = "https://www.instagram.com/api/v1/friendships/" + userId + "/" + type + "/?count=200&max_id=" + (maxId||"");
            const r = await fetch(u, { headers: hdrs() });
            if (!r.ok) {
               if(r.status === 401) throw new Error("Auth");
                if(r.status === 429) { 
                   let wait = 60;
                   while(wait > 0) {
                       update("Rate limited! Resting for... " + wait + " seconds", 50);
                       await sleep(1000);
                       wait--;
                   }
                   continue; 
                }
               if(r.status === 400) { currId = (currId + 1) % APP_IDS.length; await sleep(1000); continue; }
            }
            const j = await r.json();
            list.push(...(j.users||[]).map(x => ({ username: x.username }))); 
            maxId = j.next_max_id;
            hasNext = !!maxId;
            update("Got " + list.length + " " + type, 50);
            await sleep(500 + Math.random() * 300); 
          } catch (e) { break; }
        }
        return list;
      }

      const flw = await get("followers");
      await sleep(800);
      const flg = await get("following");

      const res = { 
        followers: flw.map(x => ({ string_list_data: [{ value: x.username }] })), 
        following: flg.map(x => ({ string_list_data: [{ value: x.username }] })) 
      };
      
      update("Done!", 100);
      
      const resDiv = document.getElementById('ii-result');
      const copyBtn = document.getElementById('ii-copy-btn');
      const txtArea = document.getElementById('ii-json');
      const closeBtn = document.getElementById('ii-close-btn');

      if(resDiv && copyBtn && txtArea) {
          resDiv.style.display = 'block';
          const jsonStr = JSON.stringify(res);
          txtArea.value = jsonStr;

          copyBtn.onclick = () => {
              txtArea.select();
              txtArea.setSelectionRange(0, 99999);
              
              const successCopy = () => {
                  copyBtn.innerHTML = "✅ READY! COPIED";
                  copyBtn.style.background = "#16a34a";
                  alert("Data safe! Copied. Please return to the previous tab.");
              };

              try {
                  if (navigator.clipboard) {
                      navigator.clipboard.writeText(jsonStr).then(successCopy).catch(() => {
                          document.execCommand('copy');
                          successCopy();
                      });
                  } else {
                      document.execCommand('copy');
                      successCopy();
                  }
              } catch(e) {
                  document.execCommand('copy');
                  successCopy();
              }
          };

          closeBtn.onclick = () => overlay.remove();
          try { send('IG_DATA_SYNC', res); } catch(e){}
      }

  } catch (e) {
    alert("Error: " + e.message);
  }
})();`;

export const getScraperScript = () => {
  return SCRIPT_CONTENT
    .replace(/\/\*[\s\S]*?\*\//gm, ' ')
    .split('\n')
    .map(line => {
      const l = line.trim();
      return l.startsWith('//') ? '' : l;
    })
    .filter(line => line.length > 0)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
};

export const getBookmarkletHref = () => {
  const script = getScraperScript();
  return `javascript:(function(){${encodeURIComponent(script)}})();`;
};