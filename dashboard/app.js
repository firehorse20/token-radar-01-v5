// Token Radar v5 — the dashboard. Reads window.RADAR (written by main.ts),
// renders the board, the detail drawer, the model page and the set-aside
// live-token view. No network, no fetch: everything is local data.
(function () {
  'use strict';
  var D = window.RADAR;
  if (!D) { document.body.innerHTML = '<p style="padding:30px">No radar data found.</p>'; return; }
  var rows = D.rows, live = D.live;

  function $(id) { return document.getElementById(id); }
  function money(n) {
    if (n === null || n === undefined) return '—';
    var a = Math.abs(n);
    if (a >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B';
    if (a >= 1e6) return '$' + (n / 1e6).toFixed(1) + 'M';
    if (a >= 1e3) return '$' + (n / 1e3).toFixed(1) + 'K';
    return '$' + Math.round(n);
  }
  function moneyFull(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
  function pct(n) {
    if (n === null || n === undefined) return '<span class="flat">—</span>';
    var c = n > 0 ? 'pos' : n < 0 ? 'neg' : 'flat';
    return '<span class="' + c + '">' + (n > 0 ? '+' : '') + n.toFixed(2) + '%</span>';
  }
  function ageText(d) {
    if (d === null || d === undefined) return '—';
    if (d < 30) return d + 'd';
    if (d < 365) return (d / 30).toFixed(1) + 'mo';
    return (d / 365).toFixed(1) + 'y';
  }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function tierLabel(t) {
    return t === 'watchlist' ? 'Watchlist' : t === 'early' ? 'Early' : t === 'product' ? 'Product' : 'Deployment';
  }

  // Header meta + stat cards.
  var totalImplied = rows.reduce(function (a, r) { return a + r.implied_value_usd; }, 0);
  $('meta').innerHTML =
    '<b>Snapshot</b> ' + esc(D.as_of) + '<br><b>Model</b> ' + esc(D.model_version) +
    ' &middot; global multiple ' + D.global_multiple +
    '<br><b>Source</b> DefiLlama protocols';
  var top = rows[0];
  $('stats').innerHTML = [
    ['Protocols ranked', rows.length, D.tier_sizes.watchlist + ' watchlist · ' + D.tier_sizes.early + ' early'],
    ['Watchlist covered', D.watchlist_size + ' / ' + D.watchlist_size, 'every slug on the list'],
    ['Global multiple', D.global_multiple + '×', 'live market, geometric median'],
    ['Total implied value', money(totalImplied), 'across ' + rows.length + ' rows'],
    ['Rank 1', esc(top ? top.name : '—'), top ? money(top.implied_value_usd) + ' implied' : ''],
  ].map(function (s, i) {
    return '<div class="stat"><div class="k">' + s[0] + '</div><div class="v' + (i === 3 ? ' gold' : '') + '">' + s[1] + '</div><div class="s">' + s[2] + '</div></div>';
  }).join('');

  // Scope pills.
  var SCOPES = [
    ['all', 'All ' + rows.length],
    ['watchlist', 'Watchlist ' + D.tier_sizes.watchlist],
    ['top40', 'Top 40'],
    ['early', 'Early radar ' + D.tier_sizes.early],
    ['product', 'Products ' + D.tier_sizes.product],
    ['deployment', 'Deployments ' + D.tier_sizes.deployment],
  ];
  var scope = 'all';
  var sortKey = 'rank', sortDir = 1;
  function renderScopes() {
    $('scopes').innerHTML = SCOPES.map(function (s) {
      return '<button data-scope="' + s[0] + '"' + (s[0] === scope ? ' class="on"' : '') + '>' + s[1] + '</button>';
    }).join('');
    Array.prototype.forEach.call($('scopes').querySelectorAll('button'), function (b) {
      b.addEventListener('click', function () { scope = b.getAttribute('data-scope'); renderScopes(); renderRows(); syncHash(); });
    });
  }

  // Filter selects.
  var cats = [], chains = [];
  rows.forEach(function (r) {
    if (r.category && cats.indexOf(r.category) < 0) cats.push(r.category);
    r.chains.forEach(function (c) { if (chains.indexOf(c) < 0) chains.push(c); });
  });
  cats.sort(); chains.sort();
  $('category').innerHTML = '<option value="">All categories</option>' + cats.map(function (c) { return '<option>' + esc(c) + '</option>'; }).join('');
  $('chain').innerHTML = '<option value="">All chains</option>' + chains.map(function (c) { return '<option>' + esc(c) + '</option>'; }).join('');

  function filtered() {
    var q = $('search').value.trim().toLowerCase();
    var cat = $('category').value, ch = $('chain').value;
    return rows.filter(function (r) {
      if (scope === 'watchlist' && r.tier !== 'watchlist') return false;
      if (scope === 'top40' && r.rank > 40) return false;
      if (scope === 'early' && r.tier !== 'early') return false;
      if (scope === 'product' && r.tier !== 'product') return false;
      if (scope === 'deployment' && r.tier !== 'deployment') return false;
      if (cat && r.category !== cat) return false;
      if (ch && r.chains.indexOf(ch) < 0) return false;
      if (q && r.name.toLowerCase().indexOf(q) < 0 && r.slug.toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
  }
  function sortVal(r, k) {
    if (k === 'multiple') return r.model.category_multiple;
    if (k === 'chains') return r.chains[0] || '';
    if (k === 'change_7d') return r.change_7d === null ? -9999 : r.change_7d;
    if (k === 'age_days') return r.age_days === null ? -1 : r.age_days;
    return r[k];
  }
  function renderRows() {
    var list = filtered().slice();
    list.sort(function (a, b) {
      var va = sortVal(a, sortKey), vb = sortVal(b, sortKey);
      var c = va < vb ? -1 : va > vb ? 1 : 0;
      if (c === 0) c = a.rank - b.rank;
      return c * sortDir;
    });
    var maxImplied = rows[0] ? rows[0].implied_value_usd : 1;
    $('rows').innerHTML = list.map(function (r) {
      var w = Math.max(2, Math.round(100 * r.implied_value_usd / maxImplied));
      return '<tr data-slug="' + esc(r.slug) + '"><td class="num">' + r.rank + '</td>' +
        '<td><span class="name">' + esc(r.name) + '</span> <span class="badge ' + r.tier + '">' + tierLabel(r.tier) + '</span><br><span class="slug">' + esc(r.slug) + '</span></td>' +
        '<td>' + esc(r.category || '—') + '</td><td>' + esc(r.chains.slice(0, 3).join(', ')) + (r.chains.length > 3 ? ' +' + (r.chains.length - 3) : '') + '</td>' +
        '<td class="num">' + money(r.tvl_usd) + '</td><td class="num">' + pct(r.change_7d) + '</td>' +
        '<td class="num">' + money(r.implied_value_usd) + '<div class="bar"><i style="width:' + w + '%"></i></div></td>' +
        '<td class="num">' + r.model.category_multiple.toFixed(2) + '×</td>' +
        '<td class="num">' + ageText(r.age_days) + '</td></tr>';
    }).join('');
    $('count').textContent = list.length + ' of ' + rows.length + ' rows';
    Array.prototype.forEach.call($('rows').querySelectorAll('tr'), function (tr) {
      tr.addEventListener('click', function () { openDetail(tr.getAttribute('data-slug')); });
    });
    Array.prototype.forEach.call(document.querySelectorAll('#board thead th'), function (th) {
      th.classList.toggle('sorted', th.getAttribute('data-sort') === sortKey);
      th.textContent = th.textContent.replace(/ [▲▼]$/, '') + (th.getAttribute('data-sort') === sortKey ? (sortDir === 1 ? ' ▲' : ' ▼') : '');
    });
  }
  Array.prototype.forEach.call(document.querySelectorAll('#board thead th'), function (th) {
    th.addEventListener('click', function () {
      var k = th.getAttribute('data-sort');
      if (k === sortKey) sortDir = -sortDir; else { sortKey = k; sortDir = k === 'name' || k === 'category' || k === 'chains' ? 1 : -1; }
      if (k === 'rank') sortDir = 1;
      renderRows();
    });
  });
  $('search').addEventListener('input', renderRows);
  $('category').addEventListener('change', renderRows);
  $('chain').addEventListener('change', renderRows);

  // Category multiples table.
  $('multiples').querySelector('tbody').innerHTML = D.multiples.map(function (m) {
    return '<tr><td>' + esc(m.category) + '</td><td class="num">' + m.multiple.toFixed(3) + '×</td><td class="num">' + m.live_count + '</td><td>' + m.confidence + '</td></tr>';
  }).join('');

  // Live-token set-aside table.
  $('livetable').querySelector('tbody').innerHTML = live.map(function (p) {
    return '<tr><td>' + esc(p.name) + '</td><td>' + esc(p.category || '—') + '</td><td class="num">' +
      (p.mcap_usd ? money(p.mcap_usd) : '—') + '</td><td class="num">' + money(p.tvl_usd) + '</td><td class="num">' + pct(p.change_7d) + '</td></tr>';
  }).join('');

  // Detail drawer.
  var drawer = $('drawer');
  function openDetail(slug) {
    var r = null;
    for (var i = 0; i < rows.length; i++) if (rows[i].slug === slug) { r = rows[i]; break; }
    if (!r) return;
    var f = r.value_breakdown;
    var html = '<h2>' + esc(r.name) + ' <span class="badge ' + r.tier + '">' + tierLabel(r.tier) + '</span></h2>' +
      '<p class="sub">Rank #' + r.rank + ' · ' + esc(r.category || 'Uncategorised') + ' · ' + esc(r.chains.join(', ')) +
      ' · listed ' + (r.listed_at || 'date not reported') + ' · records no token.</p>' +
      '<div class="kv">' +
      '<div><div class="k">Implied value</div><div class="v">' + moneyFull(r.implied_value_usd) + '</div></div>' +
      '<div><div class="k">TVL</div><div class="v">' + moneyFull(r.tvl_usd) + '</div></div>' +
      '<div><div class="k">7-day change</div><div class="v">' + (r.change_7d === null ? '—' : (r.change_7d > 0 ? '+' : '') + r.change_7d.toFixed(2) + '%') + '</div></div>' +
      '<div><div class="k">Category multiple</div><div class="v">' + r.model.category_multiple.toFixed(3) + '× <span style="font-size:12px;color:var(--muted)">' + esc(r.model.multiple_confidence) + '</span></div></div>' +
      '<div><div class="k">Effort</div><div class="v">' + esc(r.effort) + '</div></div>' +
      '<div><div class="k">Est. cost to farm</div><div class="v">≈ $' + r.est_cost_usd + '</div></div>' +
      '</div>' +
      '<h3>Value breakdown — radar-6</h3>' +
      f.map(function (x) {
        var w = x.key === 'base' ? 100 : Math.round(100 * (x.factor - 0.6) / 0.7);
        w = Math.max(2, Math.min(100, w));
        var cls = x.key === 'base' ? '' : x.factor < 0.95 ? 'low' : x.factor > 1.05 ? 'high' : '';
        return '<div class="factor"><div class="fl"><span>' + esc(x.label) + '</span><b>' +
          (x.key === 'base' ? moneyFull(x.value) : '×' + x.factor.toFixed(4)) + '</b></div>' +
          '<div class="fbar"><i class="' + cls + '" style="width:' + w + '%"></i></div>' +
          '<div class="fn">' + esc(x.note) + '</div></div>';
      }).join('') +
      '<h3>Farm plan — 8 steps</h3><ol class="steps">' +
      r.farm_steps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol>' +
      '<p class="sub">Implied value is this radar\'s own model, never a promise, and never a prediction of whether or when a token is issued.</p>';
    $('detail').innerHTML = html;
    drawer.hidden = false;
    syncHash(slug);
  }
  function closeDetail() { drawer.hidden = true; syncHash(null); }
  $('drawerClose').addEventListener('click', closeDetail);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDetail(); });

  function syncHash(detailSlug) {
    var h = scope !== 'all' ? 'scope=' + scope : '';
    if (detailSlug) h += (h ? '&' : '') + 'detail=' + detailSlug;
    try { history.replaceState(null, '', h ? '#' + h : '#'); } catch (e) { /* file:// */ }
  }
  function applyHash() {
    var h = (location.hash || '').replace(/^#/, '');
    var parts = {};
    h.split('&').forEach(function (p) { var kv = p.split('='); if (kv[0]) parts[kv[0]] = kv[1]; });
    if (parts.scope && SCOPES.some(function (s) { return s[0] === parts.scope; })) scope = parts.scope;
    renderScopes(); renderRows();
    if (parts.detail) openDetail(decodeURIComponent(parts.detail));
  }
  renderScopes();
  renderRows();
  applyHash();
})();
