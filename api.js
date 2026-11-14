// 住宅設備アプリ（GitHub Pages）から「住宅設備API」（Apps Script）を呼ぶ。
// 各画面は Apps Script の画面と同じ google.script.run で書いてあるので、ここでそれを API 呼び出しに置き換える。
// 合言葉は最初に1回入れるとスマホに覚えさせる（jPass）。違っていたら入れ直してもらう
const API_URL = 'https://script.google.com/macros/s/AKfycbwuSrk2ny2oWX1hnTH2645ALGlkdJrZe9b2FqrtETQh11WWgZFTr_StRuaSo--fTyKbDQ/exec';

(function () {
  const KEY = 'jPass';
  const pass = () => { try { return localStorage.getItem(KEY) || ''; } catch (e) { return ''; } };
  let asking = false;

  // text/plain で送ると、ブラウザの事前確認（CORS）が要らない
  function call(fn, args) {
    return fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ fn: fn, args: args, pass: pass() }) })
      .catch(() => { throw new Error('通信できません（電波を確認してください）'); })
      .then(r => r.json())
      .then(r => {
        if (r.auth) { askPass(pass() ? '合言葉が違います' : ''); throw new Error('合言葉を入れてください'); }
        if (r.error) throw new Error(r.error);
        return r.result;
      });
  }

  // google.script.run.withSuccessHandler(f).withFailureHandler(g).関数名(引数) と同じ書き方で使えるようにする
  function runner() {
    let ok = () => {}, ng = () => {};
    const p = new Proxy({}, { get(_, k) {
      if (k === 'withSuccessHandler') return f => { ok = f; return p; };
      if (k === 'withFailureHandler') return f => { ng = f; return p; };
      return (...a) => { call(k, a).then(r => ok(r), e => ng(e)); };
    } });
    return p;
  }
  window.google = { script: { get run() { return runner(); } } };

  function askPass(msg) {
    if (asking) return;
    asking = true;
    const show = () => {
      const d = document.createElement('div');
      d.id = 'lfLogin';
      d.innerHTML = '<div class="box"><div class="mk"></div><small>LIEN FORT</small><b>住宅設備</b>' +
        '<p></p><input type="password" placeholder="合言葉" autocomplete="current-password"><button>はじめる</button></div>';
      d.querySelector('p').textContent = msg || 'チームの合言葉を入れてください';
      const save = () => {
        const v = d.querySelector('input').value.trim();
        if (!v) return;
        try { localStorage.setItem(KEY, v); } catch (e) {}
        location.reload();
      };
      d.querySelector('button').onclick = save;
      d.querySelector('input').onkeydown = e => { if (e.key === 'Enter') save(); };
      document.body.appendChild(d);
      d.querySelector('input').focus();
    };
    if (document.body) show(); else document.addEventListener('DOMContentLoaded', show);
  }
  if (!pass()) askPass();

  // 画面をスマホに保存しておく（sw.js）
  if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
})();
