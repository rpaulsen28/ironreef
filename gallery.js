// Iron Reef photo gallery: horizontal strip with arrows, tap a photo to open it full screen.
(function () {
  document.querySelectorAll('.gallery').forEach(function (g) {
    var track = g.querySelector('.gallery-track');
    var shots = Array.prototype.slice.call(track.querySelectorAll('button'));
    var step = function () { return Math.max(track.clientWidth * 0.8, 240); };
    g.querySelector('.prev').addEventListener('click', function () { track.scrollBy({ left: -step() }); });
    g.querySelector('.next').addEventListener('click', function () { track.scrollBy({ left: step() }); });

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
    shots.forEach(function (b, n) {
      b.addEventListener('click', function () { show(n); if (box.showModal) box.showModal(); else box.setAttribute('open', ''); });
    });
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
