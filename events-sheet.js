/* Eventy z Google Tabuľky.
   Tabuľka: stĺpce  datum | typ | nazov | miesto | cas
   datum = napr. 7.11.2026 alebo 2026-11-07. Minulé eventy sa schovajú samy.
   Ak sa tabuľka nenačíta, ostáva statický zoznam priamo v eventy.html. */
(function () {
  var SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1n-54ZuS1sREAMSSPtlYL5W2N8qlwBY16aTIk8t4nYpo/export?format=csv&gid=0';
  var box = document.querySelector('.events');
  if (!SHEET_CSV_URL || !box) return;

  var MON = ['JAN','FEB','MAR','APR','MÁJ','JÚN','JÚL','AUG','SEP','OKT','NOV','DEC'];
  var TAGS = { // typ → farba štítku (outreach = predvolená červená)
    talk: 'background:#00F2F2;color:#13131A;',
    'príprava': 'background:#00F2F2;color:#13131A;',
    priprava: 'background:#00F2F2;color:#13131A;',
    pochod: 'background:#F2F200;color:#13131A;',
    'big event': 'background:#F2F200;color:#13131A;'
  };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function parseCSV(t) {
    var rows = [], row = [], f = '', q = false;
    for (var i = 0; i < t.length; i++) {
      var c = t[i];
      if (q) {
        if (c === '"' && t[i + 1] === '"') { f += '"'; i++; }
        else if (c === '"') q = false;
        else f += c;
      } else if (c === '"') q = true;
      else if (c === ',') { row.push(f); f = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && t[i + 1] === '\n') i++;
        row.push(f); f = ''; rows.push(row); row = [];
      } else f += c;
    }
    if (f || row.length) { row.push(f); rows.push(row); }
    return rows;
  }

  function parseDate(s) {
    s = (s || '').trim();
    var m = s.match(/^(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})?/);
    if (m) return new Date(+(m[3] || new Date().getFullYear()), +m[2] - 1, +m[1]);
    m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
    return null;
  }

  fetch(SHEET_CSV_URL, { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw 0; return r.text(); })
    .then(function (txt) {
      var rows = parseCSV(txt);
      var head = (rows.shift() || []).map(function (h) { return h.trim().toLowerCase(); });
      if (head.indexOf('datum') < 0 || head.indexOf('nazov') < 0) throw 0; // nie je to naša tabuľka
      var ix = function (n) { return head.indexOf(n); };
      var today = new Date(); today.setHours(0, 0, 0, 0);

      var list = rows.map(function (r) {
        var d = parseDate(r[ix('datum')]);
        return d && { d: d, typ: (r[ix('typ')] || '').trim(), nazov: (r[ix('nazov')] || '').trim(),
                      miesto: (r[ix('miesto')] || '').trim(), cas: (r[ix('cas')] || '').trim() };
      }).filter(function (e) { return e && e.nazov && e.d >= today; })
        .sort(function (a, b) { return a.d - b.d; });

      box.innerHTML = list.length ? list.map(function (e) {
        var meta = [];
        if (e.miesto) meta.push('📍 ' + esc(e.miesto));
        meta.push(e.d.getDate() + '. ' + (e.d.getMonth() + 1) + '.');
        if (e.cas) meta.push(esc(e.cas));
        var st = TAGS[e.typ.toLowerCase()];
        return '<article class="event"><div class="event__date"><span class="event__day">' +
          ('0' + e.d.getDate()).slice(-2) + '</span><span class="event__mon">' + MON[e.d.getMonth()] +
          '</span></div><div class="event__body">' +
          (e.typ ? '<span class="event__tag"' + (st ? ' style="' + st + '"' : '') + '>' + esc(e.typ) + '</span>' : '') +
          '<h3 class="event__title">' + esc(e.nazov) + '</h3><p class="event__meta">' + meta.join(' · ') +
          '</p></div><a href="kontakt.html" class="btn btn--red btn--sm event__cta">Mám záujem</a></article>';
      }).join('') : '<p style="color:var(--text-muted);">Nové termíny pridáme čoskoro. Sleduj našu WhatsApp komunitu.</p>';
    })
    .catch(function () { /* ostáva statický zoznam */ });
})();
