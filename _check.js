/* Temporary check driver — delete after use. */
const { spawn } = require('node:child_process');
const os = require('node:os');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9444;
const BASE = 'http://127.0.0.1:8000';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function browserWs() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      const json = await res.json();
      if (json.webSocketDebuggerUrl) return json.webSocketDebuggerUrl;
    } catch (e) {}
    await sleep(250);
  }
  throw new Error('no devtools endpoint');
}

function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let id = 0;
    const pending = new Map();
    ws.onopen = () => resolve({
      send(method, params) {
        const msgId = ++id;
        ws.send(JSON.stringify({ id: msgId, method, params: params || {} }));
        return new Promise((res, rej) => pending.set(msgId, { res, rej }));
      },
      close() { ws.close(); }
    });
    ws.onerror = reject;
    ws.onmessage = (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.id && pending.has(msg.id)) {
        const { res, rej } = pending.get(msg.id);
        pending.delete(msg.id);
        msg.error ? rej(new Error(JSON.stringify(msg.error))) : res(msg.result);
      }
    };
  });
}

(async () => {
  const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-first-run',
    `--remote-debugging-port=${PORT}`,
    '--user-data-dir=' + os.tmpdir() + '/fitgenix-check-profile', 'about:blank'], { stdio: 'ignore' });
  let cdp;
  try {
    await browserWs();
    const tab = await (await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(BASE + '/index.html')}`, { method: 'PUT' })).json();
    cdp = await connect(tab.webSocketDebuggerUrl);
    await cdp.send('Runtime.enable');
    await sleep(700);

    const out = await cdp.send('Runtime.evaluate', {
      awaitPromise: true,
      returnByValue: true,
      expression: `(async () => {
        const r = [];
        const wait = (ms) => new Promise(x => setTimeout(x, ms));
        const frame = (src) => new Promise(res => {
          const f = document.createElement('iframe');
          f.style.cssText = 'width:1200px;height:800px';
          f.src = src;
          f.onload = () => res(f);
          document.body.appendChild(f);
        });
        try { localStorage.removeItem('fitgenix.content.v1'); } catch (e) {}
        const a = await frame('admin.html?t=' + Date.now());
        const ad = a.contentDocument, aw = a.contentWindow;
        const errs = [];
        aw.addEventListener('error', e => errs.push(e.message));
        r.push('toolbar=' + Array.from(ad.querySelectorAll('.a-actions .a-btn')).map(b => b.textContent.trim()).join(' / '));
        r.push('exportImportGone=' + (ad.getElementById('aExport') === null && ad.getElementById('aImport') === null));
        ad.getElementById('loginPass').value = 'admin123';
        ad.getElementById('loginForm').dispatchEvent(new aw.Event('submit', { bubbles: true, cancelable: true }));
        r.push('unlocked=' + !ad.getElementById('adminRoot').hidden);
        r.push('tabs=' + ad.querySelectorAll('#aTabs .a-tab').length);
        let fields = 0, groups = 0;
        for (const t of Array.from(ad.querySelectorAll('#aTabs .a-tab'))) {
          t.click();
          await wait(30);
          fields += ad.querySelectorAll('#aPanel input,#aPanel textarea,#aPanel select').length;
          groups++;
        }
        r.push('tabsRendered=' + groups + ' totalFields=' + fields);
        ad.querySelector('[data-tab="pricing"]').click();
        await wait(50);
        const pn = ad.querySelector('#aPanel input[data-list="pricing.items"][data-index="0"][data-key="price"]');
        pn.value = '777';
        pn.dispatchEvent(new aw.Event('input', { bubbles: true }));
        await wait(900);
        r.push('saveStatus=' + ad.getElementById('aStatus').textContent);
        r.push('storageSaved=' + (localStorage.getItem('fitgenix.content.v1') ? 'yes' : 'no'));
        const site = await frame('index.html?t=' + Date.now());
        await wait(300);
        r.push('sitePrice=' + site.contentDocument.querySelector('#priceGrid .price').textContent);
        r.push('adminErrors=' + (errs.length ? errs.join(';') : 'none'));
        ad.getElementById('aReset').click();
        await wait(150);
        const site2 = await frame('index.html?t=' + Date.now());
        await wait(250);
        r.push('afterResetPrice=' + site2.contentDocument.querySelector('#priceGrid .price').textContent);
        r.push('storageCleared=' + (localStorage.getItem('fitgenix.content.v1') === null));
        return r;
      })()`
    });
    if (out.exceptionDetails) console.log('EXCEPTION', JSON.stringify(out.exceptionDetails).slice(0, 500));
    const results = out.result && out.result.value;
    if (Array.isArray(results)) results.forEach((x) => console.log(' - ' + x));
    else console.log('NO RESULTS', JSON.stringify(out).slice(0, 400));
  } catch (e) {
    console.error('DRIVER ERROR', e.message);
  } finally {
    if (cdp) cdp.close();
    chrome.kill();
  }
})();
