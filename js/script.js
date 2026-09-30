// ===== Hero headline: word-by-word + continuous sweep =====
const heroH1 = document.querySelector('.hero-copy h1');
if (heroH1) {
  const ACCENT_WORDS = ['Luxury', 'Virar'];
  const words = heroH1.textContent.trim().split(/\s+/);
  heroH1.textContent = '';
  words.forEach((word, i) => {
    const w = document.createElement('span');
    w.className = 'w' + (ACCENT_WORDS.includes(word) ? ' accent' : ' wave');
    w.textContent = word;
    const delay = i * 0.45;
    w.style.animationDelay = w.classList.contains('accent')
      ? delay + 's'
      : delay + 's, ' + (4 + delay) + 's';
    heroH1.appendChild(w);
    heroH1.appendChild(document.createTextNode(' '));
  });
}

// ===== Mobile nav toggle =====
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
const navbar = document.getElementById('navbar');

function closeMobileMenu() {
  burger.classList.remove('open');
  navLinks.classList.remove('open');
  document.body.classList.remove('nav-open');
}

burger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  burger.classList.toggle('open', open);
  document.body.classList.toggle('nav-open', open);
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeMobileMenu);
});
window.addEventListener('resize', () => {
  if (window.innerWidth > 820) closeMobileMenu();
});

// ===== Gliding pill indicator =====
const indicator = document.getElementById('navIndicator');
const navLinkEls = Array.from(navLinks.querySelectorAll('a'));
let activeLink = navLinkEls.find(l => l.classList.contains('active'));

function positionIndicator(to) {
  if (!indicator || !to) return;
  const w = to.offsetWidth;
  const x = to.offsetLeft;
  indicator.style.width = w + 'px';
  indicator.style.transform = `translateX(${x}px)`;
  indicator.classList.add('visible');
}

function setActive(link) {
  activeLink = link;
  navLinkEls.forEach(l => l.classList.toggle('active', l === link));
  positionIndicator(link);
  // smoother, slightly longer travel when settling on a link
  indicator.classList.add('idle');
  requestAnimationFrame(() => indicator.classList.add('idle'));
}

navLinkEls.forEach(link => {
  link.addEventListener('mouseenter', () => {
    indicator.classList.remove('idle');
    positionIndicator(link);
  });
});
navLinks.addEventListener('mouseleave', () => {
  if (activeLink) positionIndicator(activeLink);
});

// initial position once layout/link width is known
window.addEventListener('load', () => {
  if (activeLink) positionIndicator(activeLink);
});

// ===== Active link highlight + navbar state on scroll =====
const sections = document.querySelectorAll('section[id]');
const links = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);

  let current = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - 140;
    if (window.scrollY >= top) current = sec.getAttribute('id');
  });
  links.forEach(link => {
    if (link.getAttribute('href') === '#' + current) {
      if (activeLink !== link) setActive(link);
    }
  });
});

// ===== Back to top button =====
const topBtn = document.getElementById('topBtn');
window.addEventListener('scroll', () => {
  topBtn.classList.toggle('show', window.scrollY > 500);
});
topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ===== Scroll progress bar =====
const scrollProgress = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  scrollProgress.style.width = pct + '%';
});

// ===== Toast helper =====
const toast = document.getElementById('toast');
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2600);
}

// ===== Newsletter subscribe (front-end only demo) =====
const subscribeForm = document.getElementById('subscribeForm');
subscribeForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = subscribeForm.querySelector('input[type="email"]').value;
  if (email) {
    showToast('Thanks for subscribing! 💪');
    subscribeForm.reset();
  }
});

// ===== Contact / Book Appointment buttons demo feedback =====
document.querySelectorAll('a[href="#contact"]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const target = document.querySelector(btn.getAttribute('href'));
    if (!target) {
      e.preventDefault();
      showToast('This section is a demo placeholder.');
    }
  });
});

// ===== Play button — opens the video link set in the admin (content store) =====
const playBtn = document.querySelector('.play-btn');
if (playBtn) {
  const pushSection = (window.FitGenixContent && window.FitGenixContent.push) || {};
  const videoUrl = (pushSection.videoUrl || '').trim();
  playBtn.addEventListener('click', () => {
    if (videoUrl) window.open(videoUrl, '_blank', 'noopener');
    else showToast('Add a video link in the admin panel to play a video here 🎬');
  });
}

// ===== Animated counters (stats band) — smooth eased count-up =====
const counters = document.querySelectorAll('.stat-num');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = +el.dataset.target;
    el.textContent = 0;
    const startTime = performance.now();
    const duration = 2200;
    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target).toLocaleString('en-IN');
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}, { threshold: 0.4 });
counters.forEach(c => counterObserver.observe(c));

// ===== FAQ accordion =====
document.querySelectorAll('.faq-item').forEach(item => {
  const q = item.querySelector('.faq-q');
  const a = item.querySelector('.faq-a');
  q.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(o => {
      o.classList.remove('open');
      o.querySelector('.faq-a').style.maxHeight = null;
    });
    if (!isOpen) {
      item.classList.add('open');
      a.style.maxHeight = a.scrollHeight + 'px';
    }
  });
});

// ===== Booking form -> WhatsApp =====
// Contact details come from the admin-editable content store (js/content.js).
const SITE_CONTACT = (window.FitGenixContent && window.FitGenixContent.contact) || {};
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
  const WHATSAPP_NUMBER = SITE_CONTACT.whatsapp || '919999999999';
  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = bookingForm.querySelector('[name="name"]').value.trim();
    const phone = bookingForm.querySelector('[name="phone"]').value.trim();
    const plan = bookingForm.querySelector('[name="plan"]').value;
    if (!name || !phone) { showToast('Please fill your name and phone.'); return; }
    const msg = `Hi FitGenix! I'd like to book a free trial.%0A%0A` +
      `Name: ${encodeURIComponent(name)}%0A` +
      `Phone: ${encodeURIComponent(phone)}%0A` +
      `Plan: ${encodeURIComponent(plan || 'Not sure yet')}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
    showToast('Opening WhatsApp to confirm your trial 💪');
    bookingForm.reset();
  });
}

// ===== Text reveal on scroll (headings & paragraphs) =====
const revealTextEls = document.querySelectorAll(
  '.section-head h2, .section-head p, .equip-copy > *, .testi-copy > *, .book-copy > *:not(ul), .calc-card h3, .trainer-card h3, .trainer-card p'
);
const textObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('revealed');
    textObserver.unobserve(entry.target);
  });
}, { threshold: 0.15 });
revealTextEls.forEach((el, i) => {
  el.setAttribute('data-reveal', '');
  const siblings = Array.from(el.parentElement.children).filter(c => c.hasAttribute ? c.hasAttribute('data-reveal') : false);
  el.style.transitionDelay = (siblings.indexOf(el) * 120) + 'ms';
  textObserver.observe(el);
});

// ===== Simple scroll reveal =====
const revealEls = document.querySelectorAll('.train-card, .equip-media, .testi-media, .banner, .equip-cat, .offer-card');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = 1;
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealEls.forEach(el => {
  el.style.opacity = 0;
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity .6s ease, transform .6s ease';
  observer.observe(el);
});

// ===== Gallery lightbox =====
const galleryGrid = document.getElementById('galleryGrid');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');
let lightboxImages = [];
let lightboxIndex = 0;

function updateLightbox() {
  lightboxImg.src = lightboxImages[lightboxIndex];
}
function openLightbox(i) {
  lightboxIndex = i;
  updateLightbox();
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.classList.add('nav-open');
}
function closeLightbox() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('nav-open');
}

if (galleryGrid) {
  lightboxImages = Array.from(galleryGrid.querySelectorAll('img')).map(img => img.dataset.full || img.src);
  galleryGrid.querySelectorAll('img').forEach((img, i) => {
    img.addEventListener('click', () => openLightbox(i));
  });
}
lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
lightboxPrev.addEventListener('click', () => {
  lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
  updateLightbox();
});
lightboxNext.addEventListener('click', () => {
  lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
  updateLightbox();
});
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') lightboxPrev.click();
  if (e.key === 'ArrowRight') lightboxNext.click();
});

// ===== Fitness calculators (BMI, BMR, TDEE, Calories, Protein, 1RM) =====
const calcForm = document.getElementById('calcForm');
if (calcForm) {
  const calcTabs = document.querySelectorAll('.calc-tab');
  const calcTitle = document.getElementById('calcTitle');
  const calcValue = document.getElementById('calcValue');
  const calcValueLabel = document.getElementById('calcValueLabel');
  const calcDetail = document.getElementById('calcDetail');
  const calcResult = document.getElementById('calcResult');
  const calcGauge = document.getElementById('calcGauge');
  const calcGenderEl = document.getElementById('calcGender');
  const calcHipWrap = document.getElementById('calcHipWrap');
  let activeCalc = 'bmi';

  const CALC_NAMES = {
    bmi: 'BMI Calculator',
    bmr: 'BMR Calculator',
    tdee: 'TDEE Calculator',
    calorie: 'Daily Calorie Calculator',
    protein: 'Protein Intake Calculator',
    bodyfat: 'Body Fat Calculator',
    water: 'Water Intake Calculator',
    '1rm': 'One-Rep Max (1RM) Calculator'
  };

  function syncHipField() {
    const isBF = activeCalc === 'bodyfat';
    const female = calcGenderEl.value === 'female';
    if (calcHipWrap) calcHipWrap.classList.toggle('show', isBF && female);
  }

  function updateGauge(val, max) {
    if (!calcGauge) return;
    const pct = val <= 0 ? 5 : Math.max(4, Math.min(100, (val / max) * 100));
    calcGauge.style.setProperty('--g', pct);
  }

  function setCalc(name) {
    activeCalc = name;
    calcTabs.forEach(t => t.classList.toggle('active', t.dataset.calc === name));
    calcTitle.textContent = CALC_NAMES[name];
    document.querySelectorAll('.calc-extra').forEach(g =>
      g.classList.toggle('show', g.dataset.extra.split(' ').includes(name))
    );
    syncHipField();
    if (calcResult) calcResult.hidden = true;
  }
  calcGenderEl.addEventListener('change', syncHipField);
  calcTabs.forEach(t => t.addEventListener('click', () => setCalc(t.dataset.calc)));

  calcForm.addEventListener('submit', (e) => {
    e.preventDefault();
    function num(id) { return parseFloat(document.getElementById(id).value); }

    const age = num('calcAge');
    const gender = document.getElementById('calcGender').value;
    const height = num('calcHeight');
    const weight = num('calcWeight');

    // 1RM needs different fields
    if (activeCalc === '1rm') {
      const lifted = num('calcLiftWeight');
      const reps = num('calcLiftReps');
      if (!lifted || !reps || lifted <= 0 || reps <= 0) { showToast('Enter the weight and reps.'); return; }
      const est = lifted * (1 + reps / 30);
      calcValue.textContent = est.toFixed(0) + ' kg';
      calcValueLabel.textContent = 'Estimated One-Rep Max';
      calcDetail.textContent = 'Based on the Epley formula. Treat as an estimate — always lift with a spotter.';
      updateGauge(est, 250);
      calcResult.hidden = false;
      return;
    }

    // Body fat % (Navy circumference method)
    if (activeCalc === 'bodyfat') {
      const waist = num('calcWaist');
      const neck = num('calcNeck');
      const hip = gender === 'female' ? num('calcHip') : 0;
      if (!waist || !neck || waist <= 0 || neck <= 0 || (gender === 'female' && !hip)) {
        showToast('Enter waist and neck' + (gender === 'female' ? ' and hip (women).' : '.'));
        return;
      }
      const L10 = Math.log10;
      let bf;
      if (gender === 'male') bf = 86.010 * L10(waist - neck) - 70.041 * L10(height) + 36.76;
      else bf = 163.205 * L10(waist + hip - neck) - 97.684 * L10(height) - 78.387;
      bf = Math.max(3, Math.min(60, bf));
      const fatMass = weight * (bf / 100);
      const leanMass = weight - fatMass;
      const idealBf = gender === 'male' ? 0.15 : 0.24;
      const idealWeight = leanMass / (1 - idealBf);
      const fatToLose = Math.max(0, fatMass - idealWeight * idealBf);
      let cat;
      if (bf < 11) cat = gender === 'male' ? 'Athletic' : 'Lean';
      else if (bf < 20) cat = 'Fit';
      else if (bf < 26) cat = 'Average';
      else if (bf < 32) cat = 'Overfat';
      else cat = 'Obese';
      calcValue.textContent = bf.toFixed(1) + ' %';
      calcValueLabel.textContent = 'Body Fat Percentage';
      calcDetail.textContent =
        'Category: ' + cat + ' · Current fat ≈ ' + Math.round(fatMass) + ' kg, muscle ≈ ' + Math.round(leanMass) + ' kg. ' +
        'Ideal weight ≈ ' + Math.round(idealWeight) + ' kg' +
        (fatToLose > 1 ? ' (fat to lose ≈ ' + Math.round(fatToLose) + ' kg).' : ' — you are in great shape!') +
        (bf >= 26 ? ' Our fat-loss + diet program (Pro plan) is perfect for you.' : '');
      updateGauge(bf, 50);
      calcResult.hidden = false;
      return;
    }

    // Water intake
    if (activeCalc === 'water') {
      const ex = num('calcExercise') || 0;
      const liters = (weight * 0.033) + (ex / 30) * 0.35;
      calcValue.textContent = liters.toFixed(2) + ' L';
      calcValueLabel.textContent = 'Daily Water Intake';
      calcDetail.textContent =
        '≈ ' + Math.round(liters * 4) + ' × 250 ml glasses. In litres: ' + liters.toFixed(2) +
        ' L. Drink steadily through the day, and add more on hot days or after heavy sweat sessions.';
      updateGauge(liters, 5);
      calcResult.hidden = false;
      return;
    }

    if (!age || !height || !weight || age <= 0 || height <= 0 || weight <= 0) {
      showToast('Please fill age, height and weight.');
      return;
    }

    let bmr;
    if (gender === 'male') bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    else bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);

    switch (activeCalc) {
      case 'bmi': {
        const m = height / 100;
        const bmi = weight / (m * m);
        let cat, rec;
        if (bmi < 18.5) { cat = 'Underweight'; rec = 'Focus on lean muscle gain — our Pro plan with nutrition coaching suits you.'; }
        else if (bmi < 25) { cat = 'Normal weight — keep it up!'; rec = 'Any plan works — try Basic or Pro to stay consistent.'; }
        else if (bmi < 30) { cat = 'Overweight'; rec = 'Time to get started! Our fat-loss + cardio program (Pro) is a great fit.'; }
        else { cat = 'Obese'; rec = 'We highly recommend our Transformation Challenge with daily trainer support.'; }
        calcValue.textContent = bmi.toFixed(1);
        calcValueLabel.textContent = 'Body Mass Index';
        calcDetail.textContent = 'Category: ' + cat + ' · Healthy range is 18.5 – 24.9. ' + rec;
        updateGauge(bmi, 40);
        break;
      }
      case 'bmr': {
        calcValue.textContent = Math.round(bmr) + ' kcal';
        calcValueLabel.textContent = 'Basal Metabolic Rate';
        calcDetail.textContent = 'Energy your body burns at rest (Revised Harris–Benedict formula). Multiply by your activity level for TDEE.';
        updateGauge(bmr, 3000);
        break;
      }
      case 'tdee': {
        const factor = parseFloat(document.getElementById('calcActivity').value) || 1.55;
        const tdee = bmr * factor;
        calcValue.textContent = Math.round(tdee) + ' kcal';
        calcValueLabel.textContent = 'Total Daily Energy Expenditure';
        calcDetail.textContent = 'Maintenance calories for your activity level — eat around this to stay the same weight.';
        updateGauge(tdee, 4000);
        break;
      }
      case 'calorie': {
        const factor = parseFloat(document.getElementById('calcActivity').value) || 1.55;
        const tdee = bmr * factor;
        const goal = document.getElementById('calcGoal').value;
        let cal, note;
        if (goal === 'lose') { cal = tdee * 0.85; note = 'weight loss (~15% deficit)'; }
        else if (goal === 'gain') { cal = tdee * 1.15; note = 'muscle gain (~15% surplus)'; }
        else { cal = tdee; note = 'maintaining weight'; }
        const pMult = goal === 'lose' ? 1.8 : goal === 'gain' ? 2.0 : 1.5;
        const pG = weight * pMult;
        const fG = (cal * 0.25) / 9;
        const cG = (cal * 0.50) / 4;
        calcValue.textContent = Math.round(cal) + ' kcal';
        calcValueLabel.textContent = 'Daily Calories';
        calcDetail.textContent =
          'Target for ' + note + '. Smart macros per day: ' + Math.round(pG) + ' g protein · ' +
          Math.round(fG) + ' g fat · ' + Math.round(cG) + ' g carbs. Over 3 meals ≈ ' +
          Math.round(pG / 3) + ' g protein per meal. Adjust as you track results.';
        updateGauge(cal, 4000);
        break;
      }
      case 'protein': {
        const goal = document.getElementById('calcGoal').value;
        let mult, note;
        if (goal === 'lose') { mult = 1.8; note = 'weight loss'; }
        else if (goal === 'gain') { mult = 2.0; note = 'muscle building'; }
        else { mult = 1.5; note = 'maintenance'; }
        const grams = weight * mult;
        calcValue.textContent = Math.round(grams) + ' g';
        calcValueLabel.textContent = 'Protein / day';
        calcDetail.textContent =
          'About ' + mult.toFixed(1) + ' g per kg of body weight for ' + note + '. Spread across ' +
          Math.max(3, Math.round(grams / 30)) + ' meals ≈ ' + Math.round(grams / 3) + ' g per meal (chicken, eggs, paneer, whey, dal, curd).';
        updateGauge(grams, 250);
        break;
      }
    }
    calcResult.hidden = false;
  });
}

// ===== Before/After slider =====
const compareEls = document.querySelectorAll('.compare[data-compare]');
function setComparePos(el, x) {
  const rect = el.getBoundingClientRect();
  if (rect.width === 0) return;
  const pct = Math.min(100, Math.max(0, ((x - rect.left) / rect.width) * 100));
  el.style.setProperty('--pos', pct);
}
compareEls.forEach(el => {
  // default to 50%
  if (!el.style.getPropertyValue('--pos')) el.style.setProperty('--pos', 50);
  const move = (e) => setComparePos(el, e.clientX);
  el.addEventListener('pointerdown', move);
  el.addEventListener('pointermove', (e) => {
    if (e.buttons & 1) move(e);
  });
});

// sync slider position on window resize so the handle stays put
window.addEventListener('resize', () => {
  compareEls.forEach(el => {
    const pct = parseFloat(el.style.getPropertyValue('--pos') || '50');
    const rect = el.getBoundingClientRect();
    if (rect.width) {
      const x = rect.left + (pct / 100) * rect.width;
      setComparePos(el, x);
    }
  });
});
