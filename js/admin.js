/* ==========================================================
   FitGenix — Admin panel
   ----------------------------------------------------------
   A generic, schema-driven editor for everything in
   js/content.js. Each field writes into a working copy of the
   content and is auto-saved to localStorage, so index.html
   picks the changes up on reload.
   ========================================================== */
(function () {
  'use strict';

  var Store = window.FitGenixStore;
  if (!Store) return;

  var AUTH_KEY = 'fitgenix.admin.auth';
  var PANEL_HTML_KEY = 'fitgenix.admin.tab';
  var MAX_IMAGE_BYTES = 1.2 * 1024 * 1024;

  var draft = Store.get();
  var activeTab = sessionStorage.getItem(PANEL_HTML_KEY) || 'brand';

  /* ---------- tiny helpers ---------- */
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getPath(obj, path) {
    return path.split('.').reduce(function (acc, k) { return acc == null ? acc : acc[k]; }, obj);
  }

  function setPath(obj, path, value) {
    var parts = path.split('.');
    var last = parts.pop();
    var target = parts.reduce(function (acc, k) {
      if (acc[k] == null) acc[k] = {};
      return acc[k];
    }, obj);
    target[last] = value;
  }

  /* ---------- toast + save status ---------- */
  var toastEl = $('#aToast');
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2800);
  }

  var statusEl = $('#aStatus');
  var statusTimer;
  function setStatus(text, ok) {
    statusEl.textContent = text;
    statusEl.classList.toggle('saved', !!ok);
    clearTimeout(statusTimer);
    if (ok) statusTimer = setTimeout(function () { statusEl.textContent = ''; }, 2200);
  }

  function persist(silent) {
    var ok = Store.replace(draft);
    if (!ok) {
      toast('Could not save — browser storage is full. Try smaller images, or delete photos you no longer use.');
      setStatus('Save failed');
      return false;
    }
    setStatus('Saved ✓', true);
    if (!silent) toast('Changes saved. Reload the site to see them.');
    return true;
  }

  /* ==========================================================
     SCHEMA — every editable field of the website
     ========================================================== */
  var GROUPS = [
    {
      id: 'brand',
      label: '🎨 Brand & Theme',
      title: 'Brand & Theme',
      blurb: 'Your gym name, logo, page title and the whole colour palette.',
      cards: [
        {
          title: 'Brand',
          fields: [
            { path: 'brand.name', label: 'Brand name (first part)', type: 'text', help: 'Shown in the navbar, e.g. "Fit" of FitGenix.' },
            { path: 'brand.nameAccent', label: 'Brand name (accent part)', type: 'text', help: 'Highlighted in red, e.g. "Genix".' },
            { path: 'brand.logo', label: 'Logo image', type: 'image', help: 'Square icon works best. Upload a file or paste a path like img/logo-icon.png.' },
            { path: 'brand.pageTitle', label: 'Browser tab title', type: 'text' },
            { path: 'brand.metaDescription', label: 'Search engine description', type: 'textarea' }
          ]
        },
        {
          title: 'Colours',
          fields: [
            { path: 'theme.accent', label: 'Accent (buttons, highlights)', type: 'color' },
            { path: 'theme.accentDim', label: 'Accent (dark shade)', type: 'color' },
            { path: 'theme.bg', label: 'Page background', type: 'color' },
            { path: 'theme.bgAlt', label: 'Alternate background', type: 'color' },
            { path: 'theme.card', label: 'Card background', type: 'color' }
          ]
        }
      ]
    },

    {
      id: 'nav',
      label: '🧭 Menu & Hero',
      title: 'Navigation & Hero',
      blurb: 'The menu links, the main headline and the big hero buttons + slideshow.',
      cards: [
        {
          title: 'Menu button',
          fields: [
            { path: 'nav.ctaLabel', label: 'Navbar button text', type: 'text' },
            { path: 'nav.ctaHref', label: 'Navbar button link', type: 'text', help: 'Use #booking for an in-page section, or a full https:// link.' }
          ]
        },
        {
          title: 'Hero',
          fields: [
            { path: 'hero.title', label: 'Headline', type: 'textarea', help: 'The words "Luxury" and "Virar" are highlighted automatically if present.' },
            { path: 'hero.ctaPrimaryLabel', label: 'Main button text', type: 'text' },
            { path: 'hero.ctaPrimaryHref', label: 'Main button link', type: 'text' },
            { path: 'hero.ctaSecondaryLabel', label: 'Second button text', type: 'text' },
            { path: 'hero.ctaSecondaryHref', label: 'Second button link', type: 'text' }
          ]
        }
      ],
      lists: [
        {
          path: 'hero.slides', title: 'Hero background slideshow', itemLabel: 'Slide',
          titleKey: 'alt', newItem: { src: 'img/gallery/gym-1.jpg', alt: 'New slide' },
          fields: [
            { key: 'src', label: 'Image', type: 'image' },
            { key: 'alt', label: 'Caption / alt text', type: 'text' }
          ]
        },
        {
          path: 'nav.links', title: 'Menu links', itemLabel: 'Link',
          titleKey: 'label', newItem: { label: 'New Link', href: '#home' },
          fields: [
            { key: 'label', label: 'Label', type: 'text' },
            { key: 'href', label: 'Link', type: 'text' }
          ]
        }
      ]
    },

    {
      id: 'stats',
      label: '🔢 Stats Band',
      title: 'Stats Band',
      blurb: 'The animated counter strip right under the hero. Numbers count up automatically.',
      lists: [
        {
          path: 'stats.items', title: 'Statistic counters', itemLabel: 'Stat',
          titleKey: 'label',
          newItem: { value: 100, suffix: '+', label: 'New stat' },
          fields: [
            { key: 'value', label: 'Number', type: 'number' },
            { key: 'suffix', label: 'Suffix', type: 'text', help: 'Shown right after the number, e.g. + or k.' },
            { key: 'label', label: 'Label', type: 'text' }
          ]
        }
      ]
    },

    {
      id: 'why',
      label: '⭐ Why Choose Us',
      title: 'Why Choose Us',
      blurb: 'The "everything under one roof" list of benefits.',
      cards: [
        {
          title: 'Section text',
          fields: [
            { path: 'why.heading', label: 'Heading (plain part)', type: 'text' },
            { path: 'why.headingAccent', label: 'Heading (red part)', type: 'text' },
            { path: 'why.text', label: 'Intro paragraph', type: 'textarea' }
          ]
        }
      ],
      lists: [
        {
          path: 'why.items', title: 'Benefits', itemLabel: 'Benefit',
          titleKey: 'title',
          newItem: { icon: '✓', title: 'New benefit', text: 'Describe it here.' },
          fields: [
            { key: 'icon', label: 'Icon', type: 'text', help: 'A single character or emoji, e.g. ₹ ✓ ♨️' },
            { key: 'title', label: 'Title', type: 'text' },
            { key: 'text', label: 'Description', type: 'textarea' }
          ]
        }
      ]
    },

    {
      id: 'equipment',
      label: '🏋 Equipment',
      title: 'Gym Equipment Categories',
      blurb: 'The grid of equipment categories with an item count on each card.',
      cards: [
        {
          title: 'Section text',
          fields: [
            { path: 'equipment.heading', label: 'Heading (plain part)', type: 'text' },
            { path: 'equipment.headingAccent', label: 'Heading (red part)', type: 'text' },
            { path: 'equipment.text', label: 'Intro paragraph', type: 'textarea' }
          ]
        }
      ],
      lists: [
        {
          path: 'equipment.items', title: 'Equipment categories', itemLabel: 'Category',
          titleKey: 'title',
          newItem: { count: '5', title: 'New category', text: 'Machines in this group.' },
          fields: [
            { key: 'count', label: 'Number of machines', type: 'text' },
            { key: 'title', label: 'Category name', type: 'text' },
            { key: 'text', label: 'Description', type: 'textarea' }
          ]
        }
      ]
    },

    {
      id: 'training',
      label: '📸 Training Grid',
      title: 'Training Grid',
      blurb: 'The big image mosaic. The first card is the large one; the rest are the small tiles.',
      cards: [
        {
          title: 'Section text',
          fields: [
            { path: 'training.heading', label: 'Heading (plain part)', type: 'text' },
            { path: 'training.headingAccent', label: 'Heading (red part)', type: 'text' },
            { path: 'training.text', label: 'Intro paragraph', type: 'textarea' }
          ]
        }
      ],
      lists: [
        {
          path: 'training.cards', title: 'Training cards', itemLabel: 'Card',
          titleKey: 'label',
          newItem: { image: 'img/gallery/gym-1.jpg', label: 'NEW PROGRAM', title: '', text: '' },
          fields: [
            { key: 'image', label: 'Image', type: 'image' },
            { key: 'label', label: 'Tile label', type: 'text', help: 'Shown on the small tiles, e.g. CARDIO TRAINING.' },
            { key: 'title', label: 'Title (large card only)', type: 'text' },
            { key: 'text', label: 'Description (large card only)', type: 'textarea' }
          ]
        }
      ]
    },

    {
      id: 'marquee',
      label: '📢 Ribbons',
      title: 'Scrolling Ribbons',
      blurb: 'The diagonal "TRAIN HARD • STAY STRONG" ribbons. One phrase per line.',
      cards: [
        {
          title: 'Ribbon words',
          fields: [
            { path: 'marquee.words', label: 'Phrases (one per line)', type: 'lines' }
          ]
        }
      ]
    },

    {
      id: 'schedule',
      label: '🗓 Schedule',
      title: 'Weekly Class Schedule',
      blurb: 'Class timetable cards, Monday through Sunday.',
      cards: [
        {
          title: 'Section text',
          fields: [
            { path: 'schedule.heading', label: 'Heading (plain part)', type: 'text' },
            { path: 'schedule.headingAccent', label: 'Heading (red part)', type: 'text' },
            { path: 'schedule.text', label: 'Intro paragraph', type: 'textarea' }
          ]
        }
      ],
      lists: [
        {
          path: 'schedule.items', title: 'Class slots', itemLabel: 'Class',
          titleKey: 'title',
          newItem: { day: 'MON', title: 'New class', time: '6:00 AM · 7:00 PM' },
          fields: [
            { key: 'day', label: 'Day', type: 'text', help: 'Short label, e.g. MON.' },
            { key: 'title', label: 'Class name', type: 'text' },
            { key: 'time', label: 'Timings', type: 'text' }
          ]
        }
      ]
    },

    {
      id: 'trainers',
      label: '🧑‍🏫 Trainers',
      title: 'Trainers',
      blurb: 'Trainer photos, names and specialities.',
      cards: [
        {
          title: 'Section text',
          fields: [
            { path: 'trainers.heading', label: 'Heading (plain part)', type: 'text' },
            { path: 'trainers.headingAccent', label: 'Heading (red part)', type: 'text' },
            { path: 'trainers.text', label: 'Intro paragraph', type: 'textarea' }
          ]
        }
      ],
      lists: [
        {
          path: 'trainers.items', title: 'Trainer profiles', itemLabel: 'Trainer',
          titleKey: 'name',
          newItem: { name: 'New trainer', role: 'Speciality', image: 'img/gallery/gym-6.jpg' },
          fields: [
            { key: 'name', label: 'Name', type: 'text' },
            { key: 'role', label: 'Speciality', type: 'text' },
            { key: 'image', label: 'Photo', type: 'image' }
          ]
        }
      ]
    },

    {
      id: 'push',
      label: '🎬 Video Banner',
      title: 'Push Beyond Your Limits',
      blurb: 'The wide banner with the play button.',
      cards: [
        {
          title: 'Section text',
          fields: [
            { path: 'push.heading', label: 'Heading (plain part)', type: 'text' },
            { path: 'push.headingAccent', label: 'Heading (red part)', type: 'text' },
            { path: 'push.text', label: 'Intro paragraph', type: 'textarea' },
            { path: 'push.image', label: 'Banner image', type: 'image' },
            { path: 'push.videoUrl', label: 'Video link', type: 'text', help: 'Optional. Paste a YouTube link and the play button opens it. Leave empty for the placeholder message.' }
          ]
        }
      ]
    },

    {
      id: 'testimonials',
      label: '💬 Reviews',
      title: 'Member Reviews',
      blurb: 'The star rating card and the member quotes.',
      cards: [
        {
          title: 'Section text',
          fields: [
            { path: 'testimonials.heading', label: 'Heading (plain part)', type: 'text' },
            { path: 'testimonials.headingAccent', label: 'Heading (red part)', type: 'text' },
            { path: 'testimonials.text', label: 'Paragraph 1', type: 'textarea' },
            { path: 'testimonials.text2', label: 'Paragraph 2', type: 'textarea' },
            { path: 'testimonials.image', label: 'Section image', type: 'image' },
            { path: 'testimonials.rating', label: 'Average rating', type: 'text', help: 'e.g. 4.5' },
            { path: 'testimonials.reviews', label: 'Review count', type: 'text', help: 'e.g. 322+ reviews' }
          ]
        }
      ],
      lists: [
        {
          path: 'testimonials.items', title: 'Member quotes', itemLabel: 'Review',
          titleKey: 'name',
          newItem: { name: 'Member name', text: 'What they said about the gym.' },
          fields: [
            { key: 'name', label: 'Member name', type: 'text' },
            { key: 'text', label: 'Quote', type: 'textarea' }
          ]
        }
      ]
    },

    {
      id: 'pricing',
      label: '💳 Pricing',
      title: 'Membership Plans',
      blurb: 'Plan names, prices and what each plan includes. Mark one plan as featured to highlight it.',
      cards: [
        {
          title: 'Section text',
          fields: [
            { path: 'pricing.heading', label: 'Heading (plain part)', type: 'text' },
            { path: 'pricing.headingAccent', label: 'Heading (red part)', type: 'text' },
            { path: 'pricing.text', label: 'Intro paragraph', type: 'textarea' }
          ]
        }
      ],
      lists: [
        {
          path: 'pricing.items', title: 'Plans', itemLabel: 'Plan',
          titleKey: 'name',
          newItem: {
            name: 'New plan', price: '999', period: '/mo', badge: '',
            features: ['Feature one', 'Feature two'], ctaLabel: 'Choose plan',
            ctaHref: '#booking', featured: false
          },
          fields: [
            { key: 'name', label: 'Plan name', type: 'text' },
            { key: 'price', label: 'Price', type: 'text', help: 'Numbers only — the ₹ symbol is added automatically.' },
            { key: 'period', label: 'Period', type: 'text', help: 'e.g. /mo or /year' },
            { key: 'badge', label: 'Ribbon badge', type: 'text', help: 'Optional, e.g. "Popular". Leave empty for none.' },
            { key: 'features', label: 'Included features (one per line)', type: 'lines' },
            { key: 'ctaLabel', label: 'Button text', type: 'text' },
            { key: 'ctaHref', label: 'Button link', type: 'text' },
            { key: 'featured', label: 'Highlight this plan', type: 'checkbox' }
          ]
        }
      ]
    },

    {
      id: 'offers',
      label: '🎁 Offers',
      title: 'Gym Plans & Offers',
      blurb: 'The promotional offer cards.',
      cards: [
        {
          title: 'Section text',
          fields: [
            { path: 'offers.heading', label: 'Heading (plain part)', type: 'text' },
            { path: 'offers.headingAccent', label: 'Heading (red part)', type: 'text' },
            { path: 'offers.text', label: 'Intro paragraph', type: 'textarea' },
            { path: 'offers.tagline', label: 'Tagline', type: 'text' }
          ]
        }
      ],
      lists: [
        {
          path: 'offers.items', title: 'Offer cards', itemLabel: 'Offer',
          titleKey: 'title',
          newItem: {
            tag: '', num: 'New', title: 'New offer', text: 'Describe the offer.',
            ctaLabel: 'Know More', ctaHref: '#booking', featured: false
          },
          fields: [
            { key: 'tag', label: 'Corner tag', type: 'text', help: 'Optional, e.g. "Most Loved".' },
            { key: 'num', label: 'Highlight value', type: 'text', help: 'e.g. 90 Days, ₹17,500, Free.' },
            { key: 'title', label: 'Title', type: 'text' },
            { key: 'text', label: 'Description', type: 'textarea' },
            { key: 'ctaLabel', label: 'Button text', type: 'text' },
            { key: 'ctaHref', label: 'Button link', type: 'text' },
            { key: 'featured', label: 'Highlight this card', type: 'checkbox' }
          ]
        }
      ]
    },

    {
      id: 'gallery',
      label: '🖼 Gallery',
      title: 'Gallery',
      blurb: 'The photo grid with the click-to-zoom lightbox.',
      cards: [
        {
          title: 'Section text',
          fields: [
            { path: 'gallery.heading', label: 'Heading (plain part)', type: 'text' },
            { path: 'gallery.headingAccent', label: 'Heading (red part)', type: 'text' },
            { path: 'gallery.text', label: 'Intro paragraph', type: 'textarea' }
          ]
        }
      ],
      lists: [
        {
          path: 'gallery.images', title: 'Gallery photos', itemLabel: 'Photo',
          titleKey: 'alt',
          newItem: { src: 'img/gallery/gym-1.jpg', alt: 'FitGenix gym' },
          fields: [
            { key: 'src', label: 'Image', type: 'image' },
            { key: 'alt', label: 'Caption / alt text', type: 'text' }
          ]
        }
      ]
    },

    {
      id: 'transformations',
      label: '⇄ Transformations',
      title: 'Before / After',
      blurb: 'The draggable before-and-after comparison sliders.',
      cards: [
        {
          title: 'Section text',
          fields: [
            { path: 'transformations.heading', label: 'Heading (plain part)', type: 'text' },
            { path: 'transformations.headingAccent', label: 'Heading (red part)', type: 'text' },
            { path: 'transformations.text', label: 'Intro paragraph', type: 'textarea' }
          ]
        }
      ],
      lists: [
        {
          path: 'transformations.items', title: 'Transformations', itemLabel: 'Story',
          titleKey: 'title',
          newItem: {
            before: 'img/gallery/gym-5.jpg', after: 'img/gallery/gym-3.jpg',
            title: 'New result', note: 'Program · duration'
          },
          fields: [
            { key: 'before', label: 'Before image', type: 'image' },
            { key: 'after', label: 'After image', type: 'image' },
            { key: 'title', label: 'Title', type: 'text' },
            { key: 'note', label: 'Subtitle', type: 'text' }
          ]
        }
      ]
    },

    {
      id: 'faq',
      label: '❓ FAQ',
      title: 'FAQ',
      blurb: 'Frequently asked questions shown in the accordion.',
      cards: [
        {
          title: 'Section text',
          fields: [
            { path: 'faq.heading', label: 'Heading (plain part)', type: 'text' },
            { path: 'faq.headingAccent', label: 'Heading (red part)', type: 'text' }
          ]
        }
      ],
      lists: [
        {
          path: 'faq.items', title: 'Questions', itemLabel: 'Question',
          titleKey: 'q',
          newItem: { q: 'New question?', a: 'The answer.' },
          fields: [
            { key: 'q', label: 'Question', type: 'text' },
            { key: 'a', label: 'Answer', type: 'textarea' }
          ]
        }
      ]
    },

    {
      id: 'calculators',
      label: '🧮 Calculators',
      title: 'Fitness Calculators',
      blurb: 'The BMI / BMR / TDEE / calorie toolkit intro text.',
      cards: [
        {
          title: 'Section text',
          fields: [
            { path: 'calculators.heading', label: 'Heading (plain part)', type: 'text' },
            { path: 'calculators.headingAccent', label: 'Heading (red part)', type: 'text' },
            { path: 'calculators.text', label: 'Intro paragraph', type: 'textarea' }
          ]
        }
      ]
    },

    {
      id: 'booking',
      label: '📅 Booking Form',
      title: 'Free Trial Booking',
      blurb: 'The WhatsApp booking section. Plan options come from your Pricing plans.',
      cards: [
        {
          title: 'Section text',
          fields: [
            { path: 'booking.heading', label: 'Heading (plain part)', type: 'text' },
            { path: 'booking.headingAccent', label: 'Heading (red part)', type: 'text' },
            { path: 'booking.text', label: 'Intro paragraph', type: 'textarea' },
            { path: 'booking.perks', label: 'Bullet points (one per line)', type: 'lines' },
            { path: 'booking.buttonLabel', label: 'Submit button text', type: 'text' }
          ]
        }
      ]
    },

    {
      id: 'contact',
      label: '📞 Contact & Footer',
      title: 'Contact & Footer',
      blurb: 'Phone, WhatsApp, email, address, map location, social links and footer notes.',
      cards: [
        {
          title: 'Contact details',
          fields: [
            { path: 'contact.phone', label: 'Phone (displayed)', type: 'text' },
            { path: 'contact.phoneRaw', label: 'Phone (for calling)', type: 'text', help: 'Digits with country code, e.g. +919999999999.' },
            { path: 'contact.whatsapp', label: 'WhatsApp number', type: 'text', help: 'Digits only with country code, no + or spaces.' },
            { path: 'contact.whatsappMessage', label: 'WhatsApp pre-filled message', type: 'textarea' },
            { path: 'contact.email', label: 'Email address', type: 'text' },
            { path: 'contact.address', label: 'Address', type: 'html', help: 'You can use <br> for a line break.' },
            { path: 'contact.mapQuery', label: 'Map search text', type: 'text', help: 'What gets looked up on Google Maps, e.g. your full address.' },
            { path: 'contact.mapTitle', label: 'Map iframe title', type: 'text' }
          ]
        },
        {
          title: 'Footer',
          fields: [
            { path: 'footer.copyright', label: 'Copyright line', type: 'html', help: 'HTML allowed — use <strong>FitGenix</strong> to bold your name.' }
          ]
        }
      ],
      lists: [
        {
          path: 'socials', title: 'Social links', itemLabel: 'Social',
          titleKey: 'label',
          newItem: { label: 'New link', url: 'https://' },
          fields: [
            { key: 'label', label: 'Label', type: 'text' },
            { key: 'url', label: 'URL', type: 'text' }
          ]
        },
        {
          path: 'footer.legal', title: 'Footer bottom links', itemLabel: 'Link',
          titleKey: 'label',
          newItem: { label: 'New page', href: '#' },
          fields: [
            { key: 'label', label: 'Label', type: 'text' },
            { key: 'href', label: 'Link', type: 'text' }
          ]
        }
      ]
    },

    {
      id: 'settings',
      label: '⚙ Settings',
      title: 'Settings & Backup',
      blurb: 'Set the admin password and see where your edits are stored.',
      cards: [
        {
          title: 'Admin access',
          fields: [
            { path: 'admin.password', label: 'Admin password', type: 'password', help: 'Ask for this on the login screen. Purely front-end, so treat it as a polite lock rather than security.' }
          ]
        },
        {
          title: 'How your edits are stored',
          html:
            '<div class="a-note">' +
            '<strong>Where do changes live?</strong><br>' +
            'Edits are saved in this browser\'s localStorage, so they appear instantly on <em>index.html</em> ' +
            'on this device. They stay on this device — to publish them for everyone, a small backend is needed.<br><br>' +
            '<strong>Tip:</strong> uploaded pictures are stored inside the JSON, so keep them small ' +
            '(under ~1 MB) or your browser will run out of storage.' +
            '</div>'
        }
      ]
    }
  ];

  /* ==========================================================
     Rendering
     ========================================================== */
  function fieldHtml(f, value, ctx) {
    var bind = ctx && ctx.listPath
      ? ' data-list="' + esc(ctx.listPath) + '" data-index="' + ctx.index + '" data-key="' + esc(f.key) + '"'
      : ' data-path="' + esc(f.path) + '"';
    var type = f.type || 'text';
    var id = 'fld-' + Math.random().toString(36).slice(2, 9);
    var out = '<div class="a-field">';
    var control;

    if (type === 'textarea' || type === 'html') {
      control = '<textarea class="a-textarea" id="' + id + '" data-type="text"' + bind + '>' + esc(value) + '</textarea>';
    } else if (type === 'lines') {
      var lines = Array.isArray(value) ? value.join('\n') : (value || '');
      control = '<textarea class="a-textarea" id="' + id + '" data-type="lines"' + bind + '>' + esc(lines) + '</textarea>';
    } else if (type === 'number') {
      control = '<input class="a-input" type="number" id="' + id + '" data-type="number"' + bind + ' value="' + esc(value) + '">';
    } else if (type === 'password') {
      control = '<input class="a-input" type="password" id="' + id + '" data-type="text"' + bind + ' value="' + esc(value) + '">';
    } else if (type === 'color') {
      control = '<input class="a-input a-color" type="color" id="' + id + '" data-type="text" data-preview-color' + bind + ' value="' + esc(value) + '">';
    } else if (type === 'checkbox') {
      return '<div class="a-field"><label class="a-check"><input type="checkbox" data-type="checkbox"' + bind +
        (value ? ' checked' : '') + '> ' + esc(f.label) + '</label>' +
        (f.help ? '<p class="help">' + esc(f.help) + '</p>' : '') + '</div>';
    } else if (type === 'image') {
      var src = value || '';
      return '<div class="a-field"><label for="' + id + '">' + esc(f.label) + '</label>' +
        '<div class="a-img-field">' +
        '<div class="a-img-preview" style="' + (src ? "background-image:url('" + esc(src) + "')" : '') + '"></div>' +
        '<div class="a-img-controls">' +
        '<input class="a-input" type="text" id="' + id + '" data-type="text"' + bind + ' value="' + esc(src) + '" placeholder="img/gallery/gym-1.jpg or https://…">' +
        '<div class="row">' +
        '<label class="a-btn a-file">⤒ Upload image<input type="file" accept="image/*" data-upload' + bind + ' hidden></label>' +
        '<button type="button" class="a-btn a-btn-danger" data-clear-image' + bind + '>Clear</button>' +
        '</div></div></div>' +
        (f.help ? '<p class="help">' + esc(f.help) + '</p>' : '') + '</div>';
    } else {
      control = '<input class="a-input" type="text" id="' + id + '" data-type="text"' + bind + ' value="' + esc(value) + '">';
    }

    out += '<label for="' + id + '">' + esc(f.label) + '</label>' + control;
    if (f.help) out += '<p class="help">' + esc(f.help) + '</p>';
    out += '</div>';
    return out;
  }

  function listHtml(list) {
    var items = getPath(draft, list.path) || [];
    var html = '<div class="a-card">' +
      '<div class="a-list-head"><h3>' + esc(list.title) + '</h3>' +
      '<button type="button" class="a-btn" data-action="add-item" data-list="' + esc(list.path) + '">+ Add ' + esc(list.itemLabel) + '</button>' +
      '</div>';

    if (!items.length) {
      html += '<p class="a-empty">Nothing here yet — add your first ' + esc(list.itemLabel.toLowerCase()) + '.</p>';
    }

    items.forEach(function (item, i) {
      var label = list.titleKey ? (item[list.titleKey] || '') : '';
      label = String(label).replace(/<[^>]*>/g, '').slice(0, 46);
      html += '<div class="a-item">' +
        '<div class="a-item-head">' +
        '<strong>' + esc(list.itemLabel) + ' ' + (i + 1) + (label ? ' · ' + esc(label) : '') + '</strong>' +
        '<div class="a-item-tools">' +
        '<button type="button" class="a-icon-btn" data-action="move-up" data-list="' + esc(list.path) + '" data-index="' + i + '" title="Move up">↑</button>' +
        '<button type="button" class="a-icon-btn" data-action="move-down" data-list="' + esc(list.path) + '" data-index="' + i + '" title="Move down">↓</button>' +
        '<button type="button" class="a-icon-btn danger" data-action="remove-item" data-list="' + esc(list.path) + '" data-index="' + i + '" title="Delete">✕</button>' +
        '</div></div>';

      list.fields.forEach(function (f) {
        html += fieldHtml(f, item[f.key], { listPath: list.path, index: i });
      });

      html += '</div>';
    });

    return html + '</div>';
  }

  function renderTabs() {
    $('#aTabs').innerHTML = GROUPS.map(function (g) {
      return '<button type="button" class="a-tab' + (g.id === activeTab ? ' active' : '') + '" data-tab="' + g.id + '">' +
        esc(g.label) + '</button>';
    }).join('');
  }

  function renderPanel() {
    var group = GROUPS.filter(function (g) { return g.id === activeTab; })[0] || GROUPS[0];
    var html = '<div class="a-group-head"><h2>' + esc(group.title) + '</h2><p>' + esc(group.blurb) + '</p></div>';

    (group.cards || []).forEach(function (card) {
      html += '<div class="a-card">';
      if (card.title) html += '<h3>' + esc(card.title) + '</h3>';
      if (card.html) html += card.html;
      (card.fields || []).forEach(function (f) {
        html += fieldHtml(f, getPath(draft, f.path), null);
      });
      html += '</div>';
    });

    (group.lists || []).forEach(function (list) {
      html += listHtml(list);
    });

    $('#aPanel').innerHTML = html;
    window.scrollTo({ top: 0 });
  }

  /* ==========================================================
     Editing events
     ========================================================== */
  var saveTimer;
  function scheduleSave() {
    setStatus('Saving…');
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () { persist(true); }, 500);
  }

  function readInput(el) {
    var type = el.dataset.type;
    if (type === 'checkbox') return el.checked;
    if (type === 'number') {
      var n = parseFloat(el.value);
      return isNaN(n) ? 0 : n;
    }
    if (type === 'lines') {
      return el.value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
    }
    return el.value;
  }

  function writeInput(el, value) {
    if (el.dataset.list) {
      var arr = getPath(draft, el.dataset.list) || [];
      var item = arr[parseInt(el.dataset.index, 10)];
      if (item) item[el.dataset.key] = value;
      // keep the item header label in sync
      var list = findList(el.dataset.list);
      var head = el.closest('.a-item');
      if (list && head && list.titleKey) {
        var strong = head.querySelector('.a-item-head strong');
        if (strong) {
          strong.textContent = list.itemLabel + ' ' + (parseInt(el.dataset.index, 10) + 1) +
            (value && list.titleKey === el.dataset.key ? ' · ' + String(value).replace(/<[^>]*>/g, '').slice(0, 46) : '');
        }
      }
    } else {
      setPath(draft, el.dataset.path, value);
    }
    scheduleSave();
  }

  function findList(path) {
    var found = null;
    GROUPS.forEach(function (g) {
      (g.lists || []).forEach(function (l) { if (l.path === path) found = l; });
    });
    return found;
  }

  function previewFor(el) {
    var box = el.closest('.a-img-field');
    return box ? box.querySelector('.a-img-preview') : null;
  }

  var panel = $('#aPanel');

  panel.addEventListener('input', function (e) {
    var el = e.target;
    if (!el.matches('input,textarea') || el.type === 'file') return;
    if (el.hasAttribute('data-upload')) return;
    writeInput(el, readInput(el));
  });

  panel.addEventListener('change', function (e) {
    var el = e.target;

    if (el.hasAttribute('data-upload') && el.files && el.files[0]) {
      var file = el.files[0];
      if (file.size > MAX_IMAGE_BYTES) {
        toast('That image is too large (' + Math.round(file.size / 1024) + ' KB). Please use one under 1 MB.');
        el.value = '';
        return;
      }
      var reader = new FileReader();
      reader.onload = function () {
        var dataUrl = reader.result;
        var box = el.closest('.a-img-field');
        var textInput = box.querySelector('input[type="text"]');
        textInput.value = dataUrl;
        var prev = box.querySelector('.a-img-preview');
        prev.style.backgroundImage = "url('" + dataUrl + "')";
        writeInput(textInput, dataUrl);
        toast('Image added (' + Math.round(file.size / 1024) + ' KB) — saved with your content.');
      };
      reader.readAsDataURL(file);
      return;
    }

    if (el.matches('select,input[type="checkbox"],input[type="color"]')) {
      writeInput(el, readInput(el));
    }
  });

  panel.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-action],[data-clear-image]');
    if (!btn) return;

    if (btn.hasAttribute('data-clear-image')) {
      var box = btn.closest('.a-img-field');
      var input = box.querySelector('input[type="text"]');
      input.value = '';
      box.querySelector('.a-img-preview').style.backgroundImage = '';
      writeInput(input, '');
      toast('Image removed.');
      return;
    }

    var action = btn.dataset.action;
    var listPath = btn.dataset.list;
    var arr = getPath(draft, listPath);
    if (!Array.isArray(arr)) return;
    var i = parseInt(btn.dataset.index, 10);

    if (action === 'add-item') {
      var def = findList(listPath);
      arr.push(def && def.newItem ? JSON.parse(JSON.stringify(def.newItem)) : {});
      renderPanel();
      scheduleSave();
      toast('Added — scroll down to edit it.');
      var items = $$('.a-item', panel);
      if (items.length) items[items.length - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (action === 'remove-item') {
      if (!window.confirm('Delete this item?')) return;
      arr.splice(i, 1);
      renderPanel();
      scheduleSave();
      return;
    }
    if (action === 'move-up' && i > 0) {
      arr.splice(i - 1, 0, arr.splice(i, 1)[0]);
      renderPanel();
      scheduleSave();
      return;
    }
    if (action === 'move-down' && i < arr.length - 1) {
      arr.splice(i + 1, 0, arr.splice(i, 1)[0]);
      renderPanel();
      scheduleSave();
    }
  });

  $('#aTabs').addEventListener('click', function (e) {
    var tab = e.target.closest('[data-tab]');
    if (!tab) return;
    activeTab = tab.dataset.tab;
    sessionStorage.setItem(PANEL_HTML_KEY, activeTab);
    renderTabs();
    renderPanel();
  });

  /* ==========================================================
     Toolbar
     ========================================================== */
  $('#aSave').addEventListener('click', function () {
    clearTimeout(saveTimer);
    persist(false);
  });

  $('#aReset').addEventListener('click', function () {
    if (!window.confirm('Reset ALL content back to the original defaults? This cannot be undone.')) return;
    Store.reset();
    draft = Store.get();
    renderPanel();
    renderTheme();
    toast('Everything is back to the original content.');
  });

  /* preview panel */
  var preview = $('#aPreview');
  var previewFrame = $('#aPreviewFrame');
  $('#aPreviewToggle').addEventListener('click', function () {
    preview.hidden = !preview.hidden;
    document.body.classList.toggle('preview-open', !preview.hidden);
    if (!preview.hidden) refreshPreview();
  });
  $('#aPreviewClose').addEventListener('click', function () {
    preview.hidden = true;
    document.body.classList.remove('preview-open');
  });
  $('#aPreviewRefresh').addEventListener('click', refreshPreview);
  function refreshPreview() {
    persist(true);
    previewFrame.src = 'index.html?t=' + Date.now();
    toast('Preview refreshed with your latest content.');
  }

  /* ==========================================================
     Auth
     ========================================================== */
  var login = $('#login');
  var root = $('#adminRoot');

  function showPanel() {
    login.hidden = true;
    root.hidden = false;
    renderTheme();
    renderTabs();
    renderPanel();
  }

  function renderTheme() {
    var t = draft.theme || {};
    if (t.accent) document.documentElement.style.setProperty('--accent', t.accent);
  }

  $('#loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var pass = $('#loginPass').value;
    if (pass === ((draft.admin && draft.admin.password) || '')) {
      try { sessionStorage.setItem(AUTH_KEY, '1'); } catch (err) { /* ignore */ }
      showPanel();
    } else {
      toast('Wrong password. Try again.');
      $('#loginPass').value = '';
    }
  });

  $('#aLogout').addEventListener('click', function () {
    try { sessionStorage.removeItem(AUTH_KEY); } catch (err) { /* ignore */ }
    window.location.reload();
  });

  var authed = false;
  try { authed = sessionStorage.getItem(AUTH_KEY) === '1'; } catch (err) { authed = false; }
  if (authed) showPanel();

  /* warn before leaving with an unsaved debounce still pending */
  window.addEventListener('beforeunload', function () {
    clearTimeout(saveTimer);
    persist(true);
  });
})();
