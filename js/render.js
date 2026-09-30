/* ==========================================================
   FitGenix — Content renderer
   ----------------------------------------------------------
   Runs BEFORE js/script.js so the enhancements (counters, FAQ
   accordion, lightbox, comparison sliders, hero word animation)
   all bind to the freshly rendered markup.

   Bindings used in index.html:
     data-cms="path"       -> textContent
     data-cms-html="path"  -> innerHTML
     data-cms-src="path"   -> img src
     data-cms-alt="path"   -> img alt
     data-cms-href="path"  -> href
   Lists are rendered into containers by id (see RENDERERS).
   ========================================================== */
(function () {
  'use strict';

  var Store = window.FitGenixStore;
  if (!Store) return;

  var C = Store.get();

  /* ---------- helpers ---------- */
  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function get(path) {
    return path.split('.').reduce(function (acc, key) {
      if (acc == null) return undefined;
      return acc[key];
    }, C);
  }

  /** "#booking" -> true (in-page anchor). Everything else is treated as a link. */
  function ext(href) {
    return !/^#/.test(href || '');
  }

  function byId(id) {
    return document.getElementById(id);
  }

  /* ---------- theme ---------- */
  var root = document.documentElement;
  var t = C.theme || {};
  if (t.accent) root.style.setProperty('--accent', t.accent);
  if (t.accentDim) root.style.setProperty('--accentDim', t.accentDim);
  if (t.accentDim) root.style.setProperty('--accent-dim', t.accentDim);
  if (t.bg) root.style.setProperty('--bg', t.bg);
  if (t.bgAlt) {
    root.style.setProperty('--bgAlt', t.bgAlt);
    root.style.setProperty('--bg-alt', t.bgAlt);
  }
  if (t.card) root.style.setProperty('--card', t.card);

  /* ---------- page meta + brand ---------- */
  if (C.brand) {
    if (C.brand.pageTitle) document.title = C.brand.pageTitle;
    var desc = document.querySelector('meta[name="description"]');
    if (desc && C.brand.metaDescription) desc.setAttribute('content', C.brand.metaDescription);
  }

  /* ---------- section headings (plain + accent part) ---------- */
  document.querySelectorAll('[data-cms-heading]').forEach(function (el) {
    var sec = get(el.getAttribute('data-cms-heading'));
    if (!sec) return;
    el.innerHTML = esc(sec.heading) + ' <span class="accent">' + esc(sec.headingAccent) + '</span>';
  });

  /* ---------- scalar bindings ---------- */
  document.querySelectorAll('[data-cms]').forEach(function (el) {
    var v = get(el.getAttribute('data-cms'));
    if (v != null) el.textContent = v;
  });
  document.querySelectorAll('[data-cms-html]').forEach(function (el) {
    var v = get(el.getAttribute('data-cms-html'));
    if (v != null) el.innerHTML = v;
  });
  document.querySelectorAll('[data-cms-src]').forEach(function (el) {
    var v = get(el.getAttribute('data-cms-src'));
    if (v) el.setAttribute('src', v);
  });
  document.querySelectorAll('[data-cms-alt]').forEach(function (el) {
    var v = get(el.getAttribute('data-cms-alt'));
    if (v != null) el.setAttribute('alt', v);
  });
  document.querySelectorAll('[data-cms-href]').forEach(function (el) {
    var v = get(el.getAttribute('data-cms-href'));
    if (v) el.setAttribute('href', v);
  });

  /* logo lockups (brand name is split into normal + accent parts) */
  if (C.brand) {
    document.querySelectorAll('.logo-badge img').forEach(function (img) {
      if (C.brand.logo) img.setAttribute('src', C.brand.logo);
    });
    document.querySelectorAll('.logo-text').forEach(function (el) {
      el.innerHTML = esc(C.brand.name) + '<em>' + esc(C.brand.nameAccent) + '</em>';
    });
  }

  /* brand name in the footer copyright (supports HTML in the string) */
  if (C.footer && C.footer.copyright) {
    var copy = byId('footerCopy');
    if (copy) copy.innerHTML = C.footer.copyright;
  }

  /* WhatsApp / phone links everywhere */
  if (C.contact) {
    var wa = 'https://wa.me/' + C.contact.whatsapp +
      '?text=' + encodeURIComponent(C.contact.whatsappMessage || '');
    document.querySelectorAll('[data-cms-wa]').forEach(function (el) {
      el.setAttribute('href', wa);
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener');
    });
    document.querySelectorAll('[data-cms-tel]').forEach(function (el) {
      el.setAttribute('href', 'tel:' + C.contact.phoneRaw);
    });
    document.querySelectorAll('[data-cms-phone]').forEach(function (el) {
      el.textContent = C.contact.phone;
    });
    var map = byId('mapFrame');
    if (map && C.contact.mapQuery) {
      map.setAttribute('src', 'https://www.google.com/maps?q=' + encodeURIComponent(C.contact.mapQuery) + '&output=embed');
      if (C.contact.mapTitle) map.setAttribute('title', C.contact.mapTitle);
    }
  }

  /* ---------- list renderers ---------- */
  var RENDERERS = {
    navLinks: function () {
      var nav = byId('navLinks');
      if (!nav) return;
      var indicator = nav.querySelector('.nav-indicator');
      nav.querySelectorAll('a').forEach(function (a) { a.remove(); });
      (C.nav.links || []).forEach(function (l, i) {
        var a = document.createElement('a');
        a.href = l.href;
        a.textContent = l.label;
        if (i === 0) a.className = 'active';
        nav.appendChild(a);
      });
      if (indicator) nav.insertBefore(indicator, nav.firstChild);
    },

    heroSlides: function () {
      var wrap = byId('heroSlides');
      if (!wrap) return;
      var slides = C.hero.slides || [];
      var cycle = Math.max(6, slides.length * 6);
      wrap.innerHTML = slides.map(function (s, i) {
        var src = typeof s === 'string' ? s : s.src;
        return '<div class="slide" style="background-image:url(\'' + esc(src) +
          '\');animation-delay:' + (i * 6) + 's;animation-duration:' + cycle + 's"></div>';
      }).join('');
    },

    statsGrid: function () {
      var grid = byId('statsGrid');
      if (!grid) return;
      grid.innerHTML = (C.stats.items || []).map(function (s) {
        return '<div class="stat">' +
          '<span class="stat-num" data-target="' + esc(s.value) + '">0</span>' +
          '<span class="stat-suffix">' + esc(s.suffix) + '</span>' +
          '<p>' + esc(s.label) + '</p></div>';
      }).join('');
    },

    whyGrid: function () {
      var grid = byId('whyGrid');
      if (!grid) return;
      grid.innerHTML = (C.why.items || []).map(function (it) {
        return '<div class="why-item">' +
          '<span class="why-check">' + esc(it.icon) + '</span>' +
          '<div><strong>' + esc(it.title) + '</strong><p>' + esc(it.text) + '</p></div></div>';
      }).join('');
    },

    equipCatGrid: function () {
      var grid = byId('equipCatGrid');
      if (!grid) return;
      grid.innerHTML = (C.equipment.items || []).map(function (it) {
        return '<div class="equip-cat">' +
          '<span class="equip-num">' + esc(it.count) + '</span>' +
          '<h3>' + esc(it.title) + '</h3><p>' + esc(it.text) + '</p></div>';
      }).join('');
    },

    trainingGrid: function () {
      var grid = byId('trainingGrid');
      if (!grid) return;
      var cards = C.training.cards || [];
      grid.innerHTML = cards.map(function (c, i) {
        var arrow = '<a href="#" class="arrow-btn">↗</a>';
        if (i === 0) {
          return '<div class="train-card wide">' +
            '<img src="' + esc(c.image) + '" alt="' + esc(c.label || 'FitGenix training') + '">' +
            '<div class="train-caption"><h3>' + esc(c.title || c.label) + ' ' + arrow + '</h3>' +
            '<p>' + esc(c.text) + '</p></div></div>';
        }
        return '<div class="train-card narrow">' +
          '<img src="' + esc(c.image) + '" alt="' + esc(c.label || 'FitGenix training') + '">' +
          '<div class="narrow-label"><span>' + esc(c.label) + '</span>' + arrow + '</div></div>';
      }).join('');
    },

    marqueeWrap: function () {
      var words = C.marquee.words || [];
      if (!words.length) return;
      var chunk = '';
      for (var r = 0; r < 3; r++) {
        words.forEach(function (w) {
          chunk += '<span>' + esc(w) + '</span><span>•</span>';
        });
      }
      document.querySelectorAll('[data-cms-marquee] .marquee-track').forEach(function (track) {
        track.innerHTML = chunk;
      });
    },

    schedGrid: function () {
      var grid = byId('schedGrid');
      if (!grid) return;
      grid.innerHTML = (C.schedule.items || []).map(function (s) {
        return '<div class="sched-card"><span class="sched-day">' + esc(s.day) + '</span>' +
          '<h3>' + esc(s.title) + '</h3><p>' + esc(s.time) + '</p></div>';
      }).join('');
    },

    trainerGrid: function () {
      var grid = byId('trainerGrid');
      if (!grid) return;
      grid.innerHTML = (C.trainers.items || []).map(function (p) {
        return '<div class="trainer-card">' +
          '<div class="trainer-img" style="background-image:url(\'' + esc(p.image) + '\')"></div>' +
          '<h3>' + esc(p.name) + '</h3><p>' + esc(p.role) + '</p></div>';
      }).join('');
    },

    reviewList: function () {
      var list = byId('reviewList');
      if (!list) return;
      list.innerHTML = (C.testimonials.items || []).map(function (r) {
        var initial = (r.name || '?').trim().charAt(0).toUpperCase();
        return '<div class="review-item">' +
          '<div class="review-avatar">' + esc(initial) + '</div><div>' +
          '<p class="reviewer">' + esc(r.name) + ' <span class="stars">★★★★★</span></p>' +
          '<p class="review-text">' + esc(r.text) + '</p></div></div>';
      }).join('');
    },

    priceGrid: function () {
      var grid = byId('priceGrid');
      if (!grid) return;
      grid.innerHTML = (C.pricing.items || []).map(function (p) {
        var link = '<a href="' + esc(p.ctaHref || '#booking') + '" class="btn ' +
          (p.featured ? 'btn-primary' : 'btn-outline') + ' plan-cta"' +
          (ext(p.ctaHref) ? ' target="_blank" rel="noopener"' : '') + '>' + esc(p.ctaLabel) + '</a>';
        return '<div class="price-card' + (p.featured ? ' featured' : '') + '">' +
          (p.badge ? '<span class="badge">' + esc(p.badge) + '</span>' : '') +
          '<h3>' + esc(p.name) + '</h3>' +
          '<p class="price"><span>₹</span>' + esc(p.price) + '<span>' + esc(p.period) + '</span></p>' +
          '<ul>' + (p.features || []).map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul>' +
          link + '</div>';
      }).join('');
    },

    offerGrid: function () {
      var grid = byId('offerGrid');
      if (!grid) return;
      grid.innerHTML = (C.offers.items || []).map(function (o) {
        return '<div class="offer-card' + (o.featured ? ' offer-featured' : '') + '">' +
          (o.tag ? '<span class="offer-tag">' + esc(o.tag) + '</span>' : '') +
          (o.num ? '<span class="offer-num">' + esc(o.num) + '</span>' : '') +
          '<h3>' + esc(o.title) + '</h3><p>' + esc(o.text) + '</p>' +
          '<a href="' + esc(o.ctaHref || '#booking') + '" class="btn ' +
          (o.featured ? 'btn-primary' : 'btn-outline') + '"' +
          (ext(o.ctaHref) ? ' target="_blank" rel="noopener"' : '') + '>' + esc(o.ctaLabel) + '</a></div>';
      }).join('');
    },

    galleryGrid: function () {
      var grid = byId('galleryGrid');
      if (!grid) return;
      grid.innerHTML = (C.gallery.images || []).map(function (im) {
        return '<div class="gallery-item"><img src="' + esc(im.src) + '" alt="' + esc(im.alt || 'FitGenix gym') +
          '" data-full="' + esc(im.src) + '"></div>';
      }).join('');
    },

    transformGrid: function () {
      var grid = byId('transformGrid');
      if (!grid) return;
      grid.innerHTML = (C.transformations.items || []).map(function (it) {
        return '<div class="transform-card">' +
          '<div class="compare" data-compare>' +
          '<img class="cmp-after" src="' + esc(it.after) + '" alt="After transformation">' +
          '<img class="cmp-before" src="' + esc(it.before) + '" alt="Before transformation">' +
          '<span class="cmp-label cmp-label-before">Before</span>' +
          '<span class="cmp-label cmp-label-after">After</span>' +
          '<span class="cmp-handle">⇄</span></div>' +
          '<h3>' + esc(it.title) + '</h3><p>' + esc(it.note) + '</p></div>';
      }).join('');
    },

    faqList: function () {
      var list = byId('faqList');
      if (!list) return;
      list.innerHTML = (C.faq.items || []).map(function (f) {
        return '<div class="faq-item">' +
          '<button class="faq-q">' + esc(f.q) + ' <span class="faq-icon">+</span></button>' +
          '<div class="faq-a"><p>' + esc(f.a) + '</p></div></div>';
      }).join('');
    },

    bookPerks: function () {
      var ul = byId('bookPerks');
      if (!ul) return;
      ul.innerHTML = (C.booking.perks || []).map(function (p) {
        return '<li>✔ ' + esc(p) + '</li>';
      }).join('');
    },

    footerSocials: function () {
      var box = byId('footerSocials');
      if (!box) return;
      box.innerHTML = (C.socials || []).map(function (s) {
        return '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.label) + '</a>';
      }).join('');
    },

    footerLegal: function () {
      var box = byId('footerLegal');
      if (!box) return;
      box.innerHTML = (C.footer.legal || []).map(function (l) {
        return '<a href="' + esc(l.href) + '">' + esc(l.label) + '</a>';
      }).join('');
    },

    footerContact: function () {
      var box = byId('footerContact');
      if (!box) return;
      var c = C.contact;
      var maps = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(c.mapQuery);
      box.innerHTML =
        '<a class="footer-address" href="tel:' + esc(c.phoneRaw) + '">📞 ' + esc(c.phone) + '</a>' +
        '<a class="footer-address" href="mailto:' + esc(c.email) + '">✉️ ' + esc(c.email) + '</a>' +
        '<a class="footer-address" href="' + esc(maps) + '" target="_blank" rel="noopener">📍 ' +
        c.address + '</a>';
    },

    bookingPlanSelect: function () {
      var sel = document.querySelector('#bookingForm select[name="plan"]');
      if (!sel) return;
      sel.innerHTML = '<option value="">Select a plan</option>' +
        (C.pricing.items || []).map(function (p) {
          return '<option>' + esc(p.name) + '</option>';
        }).join('') + '<option>Not sure yet</option>';
    }
  };

  Object.keys(RENDERERS).forEach(function (id) {
    try {
      RENDERERS[id]();
    } catch (err) {
      /* one broken section should never blank the whole page */
      if (window.console) console.warn('FitGenix: failed to render #' + id, err);
    }
  });

  window.FitGenixContent = C;
})();
