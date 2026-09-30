/* ==========================================================
   FitGenix — Content store
   ----------------------------------------------------------
   All editable site content lives here as DEFAULTS.
   Whatever the admin saves in admin.html is kept in localStorage
   and merged on top of these defaults, so the site always has
   something to show (even on a device that never opened admin).

   NOTE: this is a static, front-end-only site. Edits made in the
   admin panel are saved in the browser that made them
   (localStorage). To publish them for every visitor, wire this
   store up to a real backend, or copy the values straight into
   DEFAULTS below.
   ========================================================== */
(function () {
  'use strict';

  var STORAGE_KEY = 'fitgenix.content.v1';

  var DEFAULTS = {
    theme: {
      accent: '#ff2e2e',
      accentDim: '#d31f1f',
      bg: '#080808',
      bgAlt: '#0d0d0d',
      card: '#121212'
    },

    brand: {
      name: 'Fit',
      nameAccent: 'Genix',
      logo: 'img/logo-icon.png',
      pageTitle: 'FitGenix | 1st Luxury Gym of Vasai Virar',
      metaDescription:
        'FitGenix Gym — Transform your body with strength and discipline at Santosh Bhavan, Nalasopara East. Strength training, functional workouts, cardio, personal coaching & modern equipment.'
    },

    contact: {
      phone: '+91 99999 99999',
      phoneRaw: '+919999999999',
      whatsapp: '919999999999',
      whatsappMessage: 'Hi FitGenix, I want to book a free trial!',
      email: 'info@fitgenix.com',
      address: 'Santosh Bhavan, Nalasopara East,<br>Maharashtra 401209',
      mapQuery: 'Nalasopara East, Maharashtra 401209',
      mapTitle: 'FitGenix location map'
    },

    socials: [
      { label: 'WhatsApp', url: 'https://wa.me/919999999999' },
      { label: 'Instagram', url: 'https://instagram.com' },
      { label: 'Facebook', url: 'https://facebook.com' },
      { label: 'LinkedIn', url: 'https://linkedin.com' }
    ],

    nav: {
      links: [
        { label: 'Home', href: '#home' },
        { label: 'Why Choose Us', href: '#about' },
        { label: 'Equipment', href: '#equipment' },
        { label: 'Training', href: '#training' },
        { label: 'Schedule', href: '#schedule' },
        { label: 'Trainers', href: '#trainers' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Stories', href: '#stories' },
        { label: 'FAQ', href: '#faq' }
      ],
      ctaLabel: 'Contact Us',
      ctaHref: '#contact'
    },

    hero: {
      title: '1st Luxury Gym Of Vasai Virar',
      ctaPrimaryLabel: 'Contact Us',
      ctaPrimaryHref: '#contact',
      ctaSecondaryLabel: 'Book Appointment',
      ctaSecondaryHref: '#pricing',
      slides: [
        { src: 'img/gallery/gym-4.jpg', alt: 'Gym floor' },
        { src: 'img/gallery/gym-3.jpg', alt: 'Heavy weight training' },
        { src: 'img/Fitness Is a Lifestyle.jpg', alt: 'Fitness is a lifestyle' }
      ]
    },

    stats: {
      items: [
        { value: 1500, suffix: '+', label: 'Happy Members' },
        { value: 25, suffix: '+', label: 'Expert Trainers' },
        { value: 40, suffix: '+', label: 'Programs & Classes' },
        { value: 10, suffix: '+', label: 'Years of Experience' }
      ]
    },

    why: {
      heading: 'Why Choose',
      headingAccent: 'FitGenix',
      text: 'Everything you need to train hard, recover fast, and stay consistent — all under one roof.',
      items: [
        { icon: '₹', title: 'No Cost EMI', text: 'Start today with easy monthly installments — zero extra cost.' },
        { icon: '▣', title: '1000 sq. ft. Area', text: 'Spacious training floor spread over 1000 square feet.' },
        { icon: '+', title: '45+ Equipment', text: 'Premium machines and free weights for every fitness goal.' },
        { icon: '↗', title: 'Open Air CrossFit', text: 'Train in the fresh open-air crossfit zone for outdoor energy.' },
        { icon: '♨', title: 'Steam Shower', text: 'Relax, detox and recover in a premium steam room.' },
        { icon: '✓', title: 'Certified Trainers', text: 'Expert coaches who guide, motivate and push you to your goals.' }
      ]
    },

    equipment: {
      heading: 'Gym',
      headingAccent: 'Equipment',
      text: 'Premium machines and free weights for every body part — train every muscle with the right tool.',
      items: [
        { count: '10', title: 'Back Workout', text: 'Lat pulldowns, rows and pull machines for a strong, wide back.' },
        { count: '8', title: 'Chest Workout', text: 'Bench presses, fly and pec-deck stations to build a powerful chest.' },
        { count: '8', title: 'Biceps & Triceps', text: 'Preacher, cable and dip stations for defined arms.' },
        { count: '8', title: 'Shoulders', text: 'Military press, shoulder machines and lateral raise stations.' },
        { count: '10', title: 'Legs & Glutes', text: 'Squat racks, leg press and extension machines for lower-body power.' },
        { count: '6', title: 'Core & Abs', text: 'Ab benches, crunch machines and cable core stations.' },
        { count: '12', title: 'Cardio Zone', text: 'Treadmills, cross-trainers, cycles and more for heart and stamina.' },
        { count: '15', title: 'Functional & Free Weights', text: 'Dumbbells, kettlebells, bars and functional rigs for every movement.' }
      ]
    },

    training: {
      heading: 'Serious Training For',
      headingAccent: 'Real Results',
      text:
        'Our gym is designed for individuals who are committed to fitness, performance, and long-term health. We combine structured workouts, certified trainers, and high-quality equipment to help you reach every goal.',
      cards: [
        {
          image: 'img/gallery/gym-4.jpg',
          label: 'GYM',
          title: 'GYM',
          text: 'Professional strength and conditioning training using world-class equipment for muscle building and fat loss.'
        },
        { image: 'img/gallery/gym-6.jpg', label: 'STRENGTH TRAINING', title: '', text: '' },
        { image: 'img/gallery/gym-7.jpg', label: 'FUNCTIONAL WORKOUT', title: '', text: '' },
        { image: 'img/gallery/gym-8.jpg', label: 'CARDIO TRAINING', title: '', text: '' },
        { image: 'img/gallery/gym-3.jpg', label: 'HEAVY WEIGHT', title: '', text: '' }
      ]
    },

    marquee: {
      words: ['TRAIN HARD', 'STAY STRONG', 'NEVER QUIT']
    },

    schedule: {
      heading: 'Weekly',
      headingAccent: 'Class Schedule',
      text: 'Pick a session that fits your routine. All classes are led by certified FitGenix trainers.',
      items: [
        { day: 'MON', title: 'Strength', time: '6:00 AM · 7:00 PM' },
        { day: 'TUE', title: 'HIIT', time: '6:00 AM · 7:00 PM' },
        { day: 'WED', title: 'Yoga', time: '6:30 AM · 6:00 PM' },
        { day: 'THU', title: 'Functional', time: '6:00 AM · 7:00 PM' },
        { day: 'FRI', title: 'Cardio', time: '6:00 AM · 7:00 PM' },
        { day: 'SAT', title: 'Full Body', time: '7:00 AM · 6:00 PM' },
        { day: 'SUN', title: 'Open Gym', time: '8:00 AM · 12:00 PM' }
      ]
    },

    trainers: {
      heading: 'Meet Your',
      headingAccent: 'Trainers',
      text: 'Certified coaches dedicated to your progress — from first-timers to athletes.',
      items: [
        { name: 'Aman', role: 'Strength & Conditioning', image: 'img/gallery/gym-6.jpg' },
        { name: 'Priya', role: 'Functional & HIIT', image: 'img/gallery/gym-7.jpg' },
        { name: 'Rahul', role: 'Cardio & Weight Loss', image: 'img/gallery/gym-8.jpg' }
      ]
    },

    push: {
      heading: 'Push Beyond',
      headingAccent: 'Your Limits',
      text:
        'Experience intense workouts that challenge your body and mind, guided by professional trainers who keep you motivated and focused.',
      image: 'img/gallery/gym-2.jpg',
      videoUrl: ''
    },

    testimonials: {
      heading: 'What Our',
      headingAccent: 'Members Say',
      text: 'Our members trust us for professional training, supportive coaching, and real fitness transformations.',
      text2: 'We take pride in helping people achieve confidence, strength, and a healthier lifestyle.',
      image: 'img/gallery/gym-10.jpg',
      rating: '4.5',
      reviews: '322+ reviews',
      items: [
        { name: 'Maudie', text: 'Best coaching and equipment in the city, real results in weeks.' },
        { name: 'Davion', text: 'Motivating trainers and a clean, well-equipped gym floor.' }
      ]
    },

    pricing: {
      heading: 'Membership',
      headingAccent: 'Plans',
      text: 'Flexible plans built around your goals. No hidden fees — cancel anytime.',
      items: [
        {
          name: 'Basic',
          price: '1,199',
          period: '/mo',
          badge: '',
          features: ['Gym floor access', 'Locker room', 'Cardio zone', 'Open gym hours'],
          ctaLabel: 'Choose Basic',
          ctaHref: '#booking',
          featured: false
        },
        {
          name: 'Pro',
          price: '1,999',
          period: '/mo',
          badge: 'Popular',
          features: [
            'Everything in Basic',
            'Group classes',
            'Personalized plan',
            '2 PT sessions/mo',
            'Diet guidance'
          ],
          ctaLabel: 'Choose Pro',
          ctaHref: '#booking',
          featured: true
        },
        {
          name: 'Elite',
          price: '3,499',
          period: '/mo',
          badge: '',
          features: [
            'Everything in Pro',
            'Unlimited PT sessions',
            'Priority booking',
            'Recovery zone',
            'Guest passes'
          ],
          ctaLabel: 'Choose Elite',
          ctaHref: '#booking',
          featured: false
        }
      ]
    },

    offers: {
      heading: 'Gym Plans &',
      headingAccent: 'Offers',
      text: 'What we do best — structured programs, flexible payments, and a plan for every goal.',
      tagline: 'TRAIN HARD . STAY STRONG . NEVER QUIT',
      items: [
        {
          tag: 'Most Loved',
          num: '90 Days',
          title: 'Transformation Challenge',
          text: 'A structured 90-day challenge with weekly check-ins and certified trainer guidance to hit your goal.',
          ctaLabel: 'Join Now',
          ctaHref: '#booking',
          featured: true
        },
        {
          tag: '',
          num: '₹17,500',
          title: 'Full Year · 365 Days',
          text: 'Unlimited gym access for one whole year — just ₹47 per day. No hidden fees, cancel anytime.',
          ctaLabel: 'Grab This Deal',
          ctaHref: '#booking',
          featured: false
        },
        {
          tag: '',
          num: 'No Cost',
          title: 'EMI Available',
          text: 'Split your membership into easy monthly installments with zero extra charges.',
          ctaLabel: 'Know More',
          ctaHref: '#booking',
          featured: false
        },
        {
          tag: '',
          num: 'Free',
          title: 'Trial Day',
          text: 'Try a full day free before you join — body assessment and trainer guidance included.',
          ctaLabel: 'Book Trial',
          ctaHref: '#booking',
          featured: false
        }
      ]
    },

    gallery: {
      heading: 'Inside',
      headingAccent: 'FitGenix',
      text: 'A quick look at our space, equipment, and the energy that fuels every workout.',
      images: [
        { src: 'img/gallery/gym-1.jpg', alt: 'FitGenix gym' },
        { src: 'img/gallery/gym-2.jpg', alt: 'FitGenix training' },
        { src: 'img/gallery/gym-3.jpg', alt: 'FitGenix workout' },
        { src: 'img/gallery/gym-4.jpg', alt: 'FitGenix equipment' },
        { src: 'img/gallery/gym-5.jpg', alt: 'FitGenix floor' },
        { src: 'img/gallery/gym-10.jpg', alt: 'FitGenix member' }
      ]
    },

    transformations: {
      heading: 'Real',
      headingAccent: 'Transformations',
      text:
        'Drag the handle to see the change. Your results start with that first session — the rest is discipline.',
      items: [
        {
          before: 'img/gallery/real-before.jpg',
          after: 'img/gallery/real-after.jpg',
          title: 'Weight Loss',
          note: 'Real member · 6 months'
        },
        {
          before: 'img/gallery/gym-8.jpg',
          after: 'img/gallery/gym-7.jpg',
          title: 'Weight Loss',
          note: 'Cardio + diet guidance · 5 months'
        },
        {
          before: 'img/gallery/gym-5.jpg',
          after: 'img/gallery/gym-3.jpg',
          title: 'Strength & Tone',
          note: 'Functional program · 8 months'
        }
      ]
    },

    faq: {
      heading: 'Frequently Asked',
      headingAccent: 'Questions',
      items: [
        {
          q: 'Can I take a free trial session?',
          a: 'Yes! We offer a free trial day for first-time visitors. Message us on WhatsApp or book via the form to schedule yours.'
        },
        {
          q: 'What are the gym timings?',
          a: "We're open every day from 5:00 AM to 10:00 PM, including weekends and public holidays."
        },
        {
          q: 'Are personal trainers included?',
          a: 'Personal training is included in the Pro and Elite plans. Basic members can add PT sessions anytime.'
        },
        {
          q: 'Do you offer diet and nutrition guidance?',
          a: 'Yes — Pro and Elite members get a personalized diet plan, and we host monthly nutrition workshops.'
        }
      ]
    },

    calculators: {
      heading: 'Fitness',
      headingAccent: 'Calculators',
      text:
        'One toolkit — six calculators for BMI, BMR, TDEE, daily calories, protein and your one-rep max. Pick a mode, enter your details, get instant results.'
    },

    booking: {
      heading: 'Book Your',
      headingAccent: 'Free Trial',
      text: "Fill in your details and we'll reach out instantly on WhatsApp to confirm your trial session.",
      perks: ['Free trial day', 'Free body assessment', 'Expert trainer guidance'],
      buttonLabel: 'Book on WhatsApp ↗'
    },

    footer: {
      copyright: 'Copyright <strong>FitGenix</strong> All Rights Reserved 2025.',
    legal: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Admin', href: 'admin.html' },
        { label: 'Terms of Use', href: '#' },
        { label: 'Cookie Policy', href: '#' }
      ]
    },

    admin: {
      password: 'admin123'
    }
  };

  /* ---------- deep merge (stored over defaults) ---------- */
  function isPlainObject(v) {
    return v && typeof v === 'object' && !Array.isArray(v);
  }

  function clone(v) {
    return JSON.parse(JSON.stringify(v));
  }

  function merge(base, override) {
    if (!isPlainObject(override)) return clone(base);
    var out = clone(base);
    Object.keys(override).forEach(function (k) {
      if (isPlainObject(override[k]) && isPlainObject(base[k])) out[k] = merge(base[k], override[k]);
      else out[k] = clone(override[k]);
    });
    return out;
  }

  /* ---------- safe localStorage (private mode / file:// quirks) ---------- */
  function read() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    } catch (err) {
      return null;
    }
  }

  function write(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (err) {
      return false;
    }
  }

  var Store = {
    key: STORAGE_KEY,
    defaults: DEFAULTS,

    /** Full content: saved edits layered over defaults. */
    get: function () {
      return merge(DEFAULTS, read());
    },

    /** Save the whole content object (used by the admin panel). */
    replace: function (data) {
      write(clone(data));
      return this.get();
    },

    /** Throw away every saved edit and fall back to the defaults. */
    reset: function () {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (err) {
        /* ignore */
      }
    }
  };

  window.FitGenixStore = Store;
})();
