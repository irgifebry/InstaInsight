if (window.location.search.includes("ii_scan=true")) {
(async () => {
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
      overlay.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;z-index:999999;background:rgba(9,11,17,0.96);color:#f8fafc;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:'Space Grotesk', system-ui, -apple-system, sans-serif;text-align:center;padding:20px;box-sizing:border-box;";
      
      overlay.innerHTML = "<style>#ii-copy-btn,#ii-close-btn{transition:transform 0.1s ease,box-shadow 0.1s ease;}#ii-copy-btn:hover,#ii-close-btn:hover{transform:translate(-1px,-1px);box-shadow:4px 4px 0 #000000!important;}#ii-copy-btn:active,#ii-close-btn:active{transform:translate(2px,2px);box-shadow:none!important;}</style><div style='background:#131824;border:3px solid #f8fafc;box-shadow:6px 6px 0 #000000;padding:24px;width:100%;max-width:340px;box-sizing:border-box;'><div><h3 id='ii-txt' style='margin:0 0 16px;font-size:20px;font-weight:900;text-transform:uppercase;letter-spacing:-0.02em;'>Loading... Please wait.</h3><div style='width:100%;height:14px;background:#090b11;border:2px solid #f8fafc;overflow:hidden;margin:0 auto;'><div id='ii-bar' style='width:0%;height:100%;background:#c084fc;transition:width 0.3s;'></div></div></div><div id='ii-result' style='display:none;margin-top:24px;'><p style='font-size:11px;color:#94a3b8;margin-bottom:16px;font-weight:bold;text-transform:uppercase;letter-spacing:0.05em;'>Scan Complete! Use the button below:</p><button id='ii-copy-btn' style='width:100%;padding:14px;background:#e2e8f0;color:#090b11;border:3px solid #f8fafc;box-shadow:3px 3px 0 #000000;font-size:14px;font-weight:900;text-transform:uppercase;cursor:pointer;margin-bottom:16px;box-sizing:border-box;'>COPY RESULTS</button><textarea id='ii-json' readonly style='width:100%;height:70px;background:#090b11;border:3px solid #f8fafc;color:#f8fafc;font-size:9px;font-family:monospace;padding:8px;margin-bottom:16px;box-sizing:border-box;resize:none;'></textarea><button id='ii-close-btn' style='width:100%;padding:10px;background:#131824;color:#f8fafc;border:3px solid #f8fafc;box-shadow:3px 3px 0 #000000;font-size:12px;font-weight:800;text-transform:uppercase;cursor:pointer;box-sizing:border-box;'>Close</button></div></div>";
      
      document.body.appendChild(overlay);

      const update = (msg, pct) => {
         const t = document.getElementById('ii-txt');
         const b = document.getElementById('ii-bar');
         if(t) t.innerText = msg;
         if(b) {
            b.style.width = pct + '%';
            b.style.background = pct === 100 ? '#22c55e' : '#c084fc';
         }
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

      async function get(type, startPct, endPct) {
        let list = [];
        let maxId = "";
        let hasNext = true;
        update("Fetching " + type + "...", startPct);
        
        let page = 0;
        while (hasNext) {
          try {
            const u = "https://www.instagram.com/api/v1/friendships/" + userId + "/" + type + "/?count=200&max_id=" + (maxId||"");
            const r = await fetch(u, { headers: hdrs() });
            if (!r.ok) {
               if(r.status === 401) throw new Error("Auth");
                if(r.status === 429) { 
                   let wait = 60;
                   while(wait > 0) {
                       update("Rate limited! Resting for... " + wait + " seconds", startPct);
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
            
            page++;
            let currentPct = startPct + Math.min(page * 5, (endPct - startPct) - 5);
            if (!hasNext) currentPct = endPct;
            
            update("Got " + list.length + " " + type, currentPct);
            await sleep(500 + Math.random() * 300); 
          } catch (e) { break; }
        }
        return list;
      }

      const flw = await get("followers", 10, 50);
      await sleep(800);
      const flg = await get("following", 50, 95);

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
                  copyBtn.innerHTML = "READY! COPIED";
                  copyBtn.style.background = "#22c55e";
                  copyBtn.style.color = "#f8fafc";
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
})();
}
