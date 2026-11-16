// Iron Reef photo gallery: horizontal strip with arrows, tap a photo to open it full screen.
(function () {
  document.querySelectorAll('.gallery').forEach(function (g) {
    var track = g.querySelector('.gallery-track');
    var shots = Array.prototype.slice.call(track.querySelectorAll('button'));
    var step = function () { return Math.max(track.clientWidth * 0.8, 240); };

    // Auto-scroll: the strip drifts slowly through the photos and loops.
    // It pauses while someone hovers, touches or uses the arrows, then resumes.
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var SPEED = 35; // pixels per second
    var playing = false, visible = false, hovered = false, idleTimer = null, pos = 0, last = 0;
    shots.forEach(function (b) { // a copy of the photos so the loop is seamless
      var c = b.cloneNode(true);
      c.setAttribute('aria-hidden', 'true'); c.tabIndex = -1; c.dataset.clone = '1';
      track.appendChild(c);
    });
    var half = function () { return track.scrollWidth / 2; };
    function frame(t) {
      if (!playing || !visible) { last = 0; return; }
      if (last) {
        pos += SPEED * (t - last) / 1000;
        if (pos >= half()) pos -= half();
        track.scrollLeft = pos;
      }
      last = t;
      requestAnimationFrame(frame);
    }
    function play() {
      if (reduce || playing) return;
      playing = true; pos = track.scrollLeft % half(); track.classList.add('auto');
      requestAnimationFrame(frame);
    }
    function pause() {
      playing = false; track.classList.remove('auto');
      clearTimeout(idleTimer);
    }
    function resumeLater() { clearTimeout(idleTimer); idleTimer = setTimeout(function () { if (!hovered && !box.open) play(); }, 3000); }
    g.addEventListener('mouseenter', function () { hovered = true; });
    g.addEventListener('mouseleave', function () { hovered = false; });
    ['mouseenter', 'touchstart', 'focusin', 'wheel'].forEach(function (ev) {
      g.addEventListener(ev, pause, { passive: true });
    });
    ['mouseleave', 'touchend', 'focusout'].forEach(function (ev) {
      g.addEventListener(ev, resumeLater, { passive: true });
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting;
        if (visible && playing) { last = 0; requestAnimationFrame(frame); }
      }, { threshold: 0.2 }).observe(g);
    } else { visible = true; }
    play();

    g.querySelector('.prev').addEventListener('click', function () {
      pause(); if (track.scrollLeft < 10) track.scrollLeft += half();
      track.scrollBy({ left: -step(), behavior: 'smooth' }); resumeLater();
    });
    g.querySelector('.next').addEventListener('click', function () {
      pause(); if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 10) track.scrollLeft -= half();
      track.scrollBy({ left: step(), behavior: 'smooth' }); resumeLater();
    });

    var box = document.createElement('dialog');
    box.className = 'lightbox';
    box.setAttribute('aria-label', 'Photo viewer');
    box.innerHTML = '<figure><img alt=""><figcaption></figcaption></figure>' +
      '<button class="lb-close" aria-label="Close">&times;</button>' +
      '<button class="lb-prev" aria-label="Previous photo">&#8249;</button>' +
      '<button class="lb-next" aria-label="Next photo">&#8250;</button>';
    document.body.appendChild(box);
    var img = box.querySelector('img'), cap = box.querySelector('figcaption'), i = 0;
    function show(n) {
      i = (n + shots.length) % shots.length;
      var b = shots[i], t = b.querySelector('img');
      img.src = b.dataset.full; img.alt = t.alt;
      cap.textContent = t.alt + '  (' + (i + 1) + ' of ' + shots.length + ')';
    }
    Array.prototype.forEach.call(track.querySelectorAll('button'), function (b, n) {
      b.addEventListener('click', function () {
        pause(); show(n % shots.length);
        if (box.showModal) box.showModal(); else box.setAttribute('open', '');
      });
    });
    box.addEventListener('close', resumeLater);
    box.querySelector('.lb-close').addEventListener('click', function () { box.close(); });
    box.querySelector('.lb-prev').addEventListener('click', function () { show(i - 1); });
    box.querySelector('.lb-next').addEventListener('click', function () { show(i + 1); });
    box.addEventListener('click', function (e) { if (e.target === box || e.target.tagName === 'FIGURE') box.close(); });
    box.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(i - 1);
      if (e.key === 'ArrowRight') show(i + 1);
    });
    var x0 = null;
    box.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) show(dx < 0 ? i + 1 : i - 1);
    });
  });
})();
