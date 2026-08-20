/* Jhanks — site behaviour
   테마 전환 / 모바일 메뉴 / Research 필터 / 목차 스크롤스파이 / 코드 블록 헤더 */
(function () {
  'use strict';

  var root = document.documentElement;

  // ── 테마 ──────────────────────────────────────────────────
  function currentTheme() {
    return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function paintToggle(btn) {
    if (!btn) return;
    var icon = btn.querySelector('span');
    var dark = currentTheme() === 'dark';
    if (icon) icon.textContent = dark ? '☀' : '☾';
    btn.setAttribute('aria-label', dark ? '라이트 모드로 전환' : '다크 모드로 전환');
  }

  var themeBtn = document.getElementById('theme-toggle');
  paintToggle(themeBtn);

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) { /* private mode */ }
      paintToggle(themeBtn);
    });
  }

  // ── 모바일 메뉴 ───────────────────────────────────────────
  var navBtn = document.getElementById('nav-toggle');
  var nav = document.getElementById('site-nav');

  if (navBtn && nav) {
    navBtn.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      navBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      navBtn.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
      var icon = navBtn.querySelector('span');
      if (icon) icon.textContent = open ? '✕' : '☰';
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) navBtn.click();
    });
  }

  // ── Research 카테고리 필터 ────────────────────────────────
  var filterBar = document.getElementById('research-filters');
  var list = document.getElementById('research-list');

  if (filterBar && list) {
    var rows = Array.prototype.slice.call(list.querySelectorAll('[data-category]'));
    var emptyBox = document.getElementById('filter-empty');
    var buttons = Array.prototype.slice.call(filterBar.querySelectorAll('[data-filter]'));

    function applyFilter(key, push) {
      var shown = 0;

      rows.forEach(function (row) {
        var match = key === 'all' || row.getAttribute('data-category') === key;
        row.hidden = !match;
        if (match) shown++;
      });

      buttons.forEach(function (b) {
        var on = b.getAttribute('data-filter') === key;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });

      if (emptyBox) emptyBox.hidden = shown !== 0;

      if (push && window.history && window.history.replaceState) {
        var url = key === 'all'
          ? window.location.pathname
          : window.location.pathname + '?c=' + encodeURIComponent(key);
        window.history.replaceState(null, '', url);
      }
    }

    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-filter]');
      if (btn) applyFilter(btn.getAttribute('data-filter'), true);
    });

    // ?c=mobile 같은 진입 URL 반영
    var initial = (new URLSearchParams(window.location.search)).get('c');
    if (initial && buttons.some(function (b) { return b.getAttribute('data-filter') === initial; })) {
      applyFilter(initial, false);
    }
  }

  // ── CONTACT 모달 ──────────────────────────────────────────
  var modal = document.getElementById('contact-modal');

  if (modal) {
    var emailEl = document.getElementById('contact-email');
    var copyBtn = document.getElementById('contact-copy');
    var mailto  = document.getElementById('contact-mailto');
    var lastFocus = null;

    // 평문으로 두지 않은 주소를 여기서 조립
    var address = emailEl.getAttribute('data-user') + '@' + emailEl.getAttribute('data-domain');
    emailEl.textContent = address;
    mailto.href = 'mailto:' + address;

    function openModal() {
      lastFocus = document.activeElement;
      modal.hidden = false;
      document.body.style.overflow = 'hidden';
      copyBtn.focus();
    }

    function closeModal() {
      modal.hidden = true;
      document.body.style.overflow = '';
      copyBtn.textContent = 'copy';
      copyBtn.classList.remove('is-done');
      if (lastFocus) lastFocus.focus();
    }

    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-contact]')) { e.preventDefault(); openModal(); return; }
      if (!modal.hidden && e.target.closest('[data-modal-close]')) closeModal();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hidden) closeModal();
    });

    // /about/#contact 처럼 링크로 바로 열 수 있게
    if (window.location.hash === '#contact') openModal();

    copyBtn.addEventListener('click', function () {
      function done() {
        copyBtn.textContent = 'copied';
        copyBtn.classList.add('is-done');
        setTimeout(function () {
          copyBtn.textContent = 'copy';
          copyBtn.classList.remove('is-done');
        }, 1600);
      }
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(address).then(done, selectFallback);
      } else {
        selectFallback();
      }
      // 클립보드 API를 못 쓰면 최소한 드래그 없이 선택은 되게
      function selectFallback() {
        var r = document.createRange();
        r.selectNodeContents(emailEl);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(r);
        try { if (document.execCommand('copy')) done(); } catch (err) { /* 수동 복사 */ }
      }
    });
  }

  // ── 코드 블록 헤더 ────────────────────────────────────────
  Array.prototype.forEach.call(
    document.querySelectorAll('.post-body div.highlighter-rouge'),
    function (block) {
      if (block.querySelector('.code-head')) return;

      var lang = '';
      Array.prototype.forEach.call(block.classList, function (c) {
        if (c.indexOf('language-') === 0) lang = c.slice(9);
      });
      if (lang === 'plaintext') lang = '';

      var label = block.getAttribute('data-file') || block.getAttribute('file') || lang || 'code';

      var head = document.createElement('div');
      head.className = 'code-head';
      head.innerHTML =
        '<span class="dot dot-r"></span><span class="dot dot-y"></span><span class="dot dot-g"></span>' +
        '<span class="code-label"></span>' +
        '<button class="code-copy" type="button">copy</button>';
      head.querySelector('.code-label').textContent = label;

      var copyBtn = head.querySelector('.code-copy');
      copyBtn.addEventListener('click', function () {
        var pre = block.querySelector('pre');
        if (!pre || !navigator.clipboard) return;
        navigator.clipboard.writeText(pre.innerText.replace(/\n$/, '')).then(function () {
          copyBtn.textContent = 'copied';
          copyBtn.classList.add('is-done');
          setTimeout(function () {
            copyBtn.textContent = 'copy';
            copyBtn.classList.remove('is-done');
          }, 1600);
        });
      });

      block.insertBefore(head, block.firstChild);
    }
  );

  // ── 방문자 카운터 (GoatCounter) ───────────────────────────
  // 서드파티 스크립트를 로드하지 않는다. 집계는 이미지 픽셀 한 장,
  // 표시는 JSON 을 받아 textContent 로만 넣는다 (코드 실행 경로 없음).
  var gcMeta = document.querySelector('meta[name="goatcounter"]');
  var gc = gcMeta && gcMeta.content;

  if (gc && /^[a-z0-9-]{1,64}$/i.test(gc)) {
    var base = 'https://' + gc + '.goatcounter.com';

    // 1) 집계 — 같은 세션에서 같은 경로는 한 번만 보낸다
    (function () {
      var key = 'gc:' + location.pathname;
      try { if (sessionStorage.getItem(key)) return; sessionStorage.setItem(key, '1'); } catch (e) { /* private mode */ }
      var px = new Image(1, 1);
      px.referrerPolicy = 'no-referrer-when-downgrade';
      px.src = base + '/count'
        + '?p=' + encodeURIComponent(location.pathname)
        + '&t=' + encodeURIComponent(document.title)
        + '&r=' + encodeURIComponent(document.referrer)
        + '&rnd=' + Math.random().toString(36).slice(2);
    })();

    // 2) 표시 — 누적 방문자
    (function () {
      var box = document.getElementById('visits');
      if (!box) return;

      // GoatCounter 는 "1 088 856" 처럼 구분자를 넣어 준다. 숫자만 뽑아 다시 포맷.
      function pretty(s) {
        var n = parseInt(String(s == null ? '' : s).replace(/\D/g, ''), 10);
        return isNaN(n) ? null : n.toLocaleString('ko-KR');
      }

      // start 를 반드시 명시한다. 파라미터 없이 부르면 데이터가 있어도 0 이 돌아온다.
      // 응답은 GoatCounter 가 최대 4시간 캐시하므로 실시간이 아니다.
      fetch(base + '/counter/TOTAL.json?start=2000-01-01', { mode: 'cors' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) {
          var n = j && pretty(j.count);
          if (n === null || n === undefined) return;   // 실패 시 숨긴 채로 둔다
          document.getElementById('visits-total').textContent = n;
          box.hidden = false;
        })
        .catch(function () { /* 차단되거나 오프라인 — 그냥 숨겨 둔다 */ });
    })();
  }

  // ── 목차 스크롤스파이 ─────────────────────────────────────
  var toc = document.getElementById('toc');

  if (toc) {
    var links = Array.prototype.slice.call(toc.querySelectorAll('[data-toc]'));
    var targets = links
      .map(function (a) { return document.getElementById(a.getAttribute('data-toc')); })
      .filter(Boolean);

    var ticking = false;

    function spy() {
      ticking = false;
      var active = 0;
      for (var i = 0; i < targets.length; i++) {
        if (targets[i].getBoundingClientRect().top <= 140) active = i;
      }
      links.forEach(function (a, i) { a.classList.toggle('is-active', i === active); });
    }

    if (targets.length) {
      window.addEventListener('scroll', function () {
        if (!ticking) { ticking = true; window.requestAnimationFrame(spy); }
      }, { passive: true });
      spy();
    }
  }
})();
