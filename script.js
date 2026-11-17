/**
 * STUDIOFLOW AI — DIGITAL WEDDING INVITATION INTERACTIVITY
 * Celebration: Zaeem & Fatima Nikkah Ceremony
 * Target Date: 6 January 2027 · Dubai
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const envelopeCover = document.getElementById('envelopeCover');
  const openInvitationBtn = document.getElementById('openInvitation');
  const invitationContent = document.getElementById('invitationContent');
  const weddingAudio = document.getElementById('weddingAudio');
  const audioToggle = document.getElementById('audioToggle');
  const progress = document.getElementById('progress');
  const burstContainer = document.getElementById('burstContainer');

  // Dialog Elements
  const wishDialog = document.getElementById('wishDialog');
  const openWishesBtn = document.getElementById('openWishesBtn');
  const closeDialogBtn = document.getElementById('closeDialogBtn');
  const rsvpWishForm = document.getElementById('rsvpWishForm');
  const sendWhatsAppBtn = document.getElementById('sendWhatsAppBtn');
  const toastNotification = document.getElementById('toastNotification');
  const dialogStatus = document.getElementById('dialogStatus');

  // Calendar Elements
  const saveCalendarIcsBtn = document.getElementById('saveCalendarIcs');

  // State Variables
  let isEnvelopeOpened = false;
  let isMusicPlaying = false;
  let userWantsMusic = true;

  weddingAudio.volume = 0.75;

  /* ==========================================================================
     1. AUDIO PLAYBACK & EQUALIZER CONTROLS
     ========================================================================== */
  function updateAudioState(playing) {
    isMusicPlaying = playing;
    audioToggle.setAttribute('aria-pressed', String(playing));
    audioToggle.classList.toggle('is-playing', playing);
  }

  function startAudio() {
    const playPromise = weddingAudio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => updateAudioState(true))
        .catch((err) => {
          console.log('Audio autoplay prevented or waiting for interaction:', err);
          updateAudioState(false);
        });
    }
  }

  function pauseAudio() {
    weddingAudio.pause();
    updateAudioState(false);
  }

  weddingAudio.addEventListener('play', () => updateAudioState(true));
  weddingAudio.addEventListener('pause', () => updateAudioState(false));

  audioToggle.addEventListener('click', () => {
    if (weddingAudio.paused) {
      userWantsMusic = true;
      startAudio();
    } else {
      userWantsMusic = false;
      pauseAudio();
    }
  });

  // Pause audio when browser tab is inactive to respect user device
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      weddingAudio.pause();
    } else if (isEnvelopeOpened && userWantsMusic) {
      weddingAudio.play().catch(() => {});
    }
  });

  /* ==========================================================================
     2. ENVELOPE UNBOXING ANIMATION SEQUENCE
     ========================================================================== */
  openInvitationBtn.addEventListener('click', handleOpenEnvelope);

  function handleOpenEnvelope() {
    if (isEnvelopeOpened) return;
    isEnvelopeOpened = true;
    openInvitationBtn.disabled = true;

    // Start background audio immediately on user click
    startAudio();

    // Reveal floating equalizer button
    audioToggle.classList.add('is-visible');

    // Stage 1: Golden charge & seam light glow
    envelopeCover.classList.add('is-charging');

    // Stage 2: Flap lifts open in 3D perspective
    setTimeout(() => {
      envelopeCover.classList.add('is-lifting');
    }, 1500);

    // Stage 3: Burst florets & reveal main invitation
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      invitationContent.classList.add('is-revealed');
      envelopeCover.classList.add('is-opened');
      triggerFloretBurst();
    }, 2800);

    // Stage 4: Clean up cover & enable body scrolling
    setTimeout(() => {
      envelopeCover.hidden = true;
      invitationContent.inert = false;
      document.body.classList.remove('sealed');
    }, 3900);
  }

  /* ==========================================================================
     3. PARTICLE & FLORET BURST EFFECT
     ========================================================================== */
  function triggerFloretBurst() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const count = 18;
    const rect = burstContainer.getBoundingClientRect();
    const width = rect.width || window.innerWidth;
    const height = Math.min(rect.height || window.innerHeight, 600);

    for (let i = 0; i < count; i++) {
      const floret = document.createElement('img');
      floret.src = 'assets/floret.webp';
      floret.alt = '';
      floret.className = 'burst-floret';

      const size = 22 + Math.random() * 26;
      floret.style.width = `${size}px`;
      floret.style.height = 'auto';

      burstContainer.appendChild(floret);

      const startX = width * (0.45 + Math.random() * 0.1);
      const startY = height * 0.45;

      const angle = Math.random() * Math.PI * 2;
      const distance = 80 + Math.random() * 160;
      const targetX = startX + Math.cos(angle) * distance;
      const targetY = startY + Math.sin(angle) * distance + 40;

      const rotStart = Math.random() * 360;
      const rotEnd = rotStart + (Math.random() < 0.5 ? -1 : 1) * (180 + Math.random() * 260);

      const duration = 1600 + Math.random() * 900;
      const delay = Math.random() * 300;

      floret.animate(
        [
          { transform: `translate(${startX}px, ${startY}px) rotate(${rotStart}deg) scale(0.3)`, opacity: 0 },
          { transform: `translate(${(startX + targetX) / 2}px, ${(startY + targetY) / 2 - 30}px) rotate(${(rotStart + rotEnd) / 2}deg) scale(1)`, opacity: 1, offset: 0.2 },
          { transform: `translate(${targetX}px, ${targetY}px) rotate(${rotEnd}deg) scale(0.85)`, opacity: 0 }
        ],
        {
          duration,
          delay,
          easing: 'cubic-bezier(0.25, 0.7, 0.35, 1)',
          fill: 'both'
        }
      ).onfinish = () => floret.remove();
    }
  }

  /* ==========================================================================
     4. SCROLL PROGRESS & CHAPTER REVEAL OBSERVER
     ========================================================================== */
  const chapterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in-view');
        }
      });
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll('.reveal-on-scroll').forEach((el) => chapterObserver.observe(el));

  // Throttled scroll progress bar
  let isScrolling = false;
  window.addEventListener('scroll', () => {
    if (!isScrolling) {
      window.requestAnimationFrame(() => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progressRatio = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
        progress.style.setProperty('--progress-width', `${Math.min(100, Math.max(0, progressRatio))}%`);
        isScrolling = false;
      });
      isScrolling = true;
    }
  }, { passive: true });

  /* ==========================================================================
     5. LUXURY COUNTDOWN TIMER TO FOREVER
     ========================================================================== */
  const targetDate = new Date('2027-01-06T20:00:00+04:00'); // Dubai time (UTC+4)

  const daysVal = document.getElementById('daysVal');
  const hoursVal = document.getElementById('hoursVal');
  const minsVal = document.getElementById('minsVal');
  const secsVal = document.getElementById('secsVal');

  function updateCountdown() {
    const now = new Date();
    const diffSeconds = Math.max(0, Math.floor((targetDate - now) / 1000));

    const days = Math.floor(diffSeconds / (3600 * 24));
    const hours = Math.floor((diffSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((diffSeconds % 3600) / 60);
    const seconds = diffSeconds % 60;

    daysVal.textContent = String(days).padStart(2, '0');
    hoursVal.textContent = String(hours).padStart(2, '0');
    minsVal.textContent = String(minutes).padStart(2, '0');
    secsVal.textContent = String(seconds).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ==========================================================================
     6. SAVE THE DATE (.ICS) CALENDAR FILE GENERATOR
     ========================================================================== */
  saveCalendarIcsBtn.addEventListener('click', () => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//StudioFlowAI//Nikkah Invitation//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:zaeem-fatima-20270106@studioflow.invitation',
      'DTSTAMP:20261112T000000Z',
      'DTSTART:20270106T160000Z',
      'DTEND:20270106T193000Z',
      'SUMMARY:Nikkah Ceremony — Zaeem & Fatima',
      'DESCRIPTION:We invite you to celebrate the Nikkah Ceremony of Zaeem & Fatima. 8:00 PM Nikkah Ceremony followed by Royal Dinner at 8:30 PM (Dubai Local Time).',
      'LOCATION:Arjaan by Rotana, Dubai Media City, King Salman Bin Abdulaziz Al Saud Street, Dubai, United Arab Emirates',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Zaeem-Fatima-Nikkah.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Calendar event downloaded successfully! 📅');
    setTimeout(() => URL.revokeObjectURL(link.href), 1500);
  });

  /* ==========================================================================
     7. INTERACTIVE WISHES & RSVP MODAL
     ========================================================================== */
  openWishesBtn.addEventListener('click', () => {
    wishDialog.showModal();
  });

  closeDialogBtn.addEventListener('click', () => {
    wishDialog.close();
  });

  // Close dialog on clicking backdrop
  wishDialog.addEventListener('click', (e) => {
    const dialogDimensions = wishDialog.getBoundingClientRect();
    if (
      e.clientX < dialogDimensions.left ||
      e.clientX > dialogDimensions.right ||
      e.clientY < dialogDimensions.top ||
      e.clientY > dialogDimensions.bottom
    ) {
      wishDialog.close();
    }
  });

  function getFormattedMessage() {
    const formData = new FormData(rsvpWishForm);
    const guestName = formData.get('name') || 'A Loving Guest';
    const attendance = formData.get('attendance') || 'Joyfully Attending';
    const guestCount = formData.get('guest_count') || '2 Guests';
    const wishes = formData.get('message') || 'Heartiest congratulations!';

    return `✨ *Wishes & RSVP for Zaeem & Fatima* ✨\n\n` +
           `💍 *Event:* Nikkah Ceremony (6 Jan 2027)\n` +
           `👤 *From:* ${guestName}\n` +
           `💌 *RSVP Status:* ${attendance} (${guestCount})\n\n` +
           `🌸 *Prayers & Wishes:*\n"${wishes}"\n\n` +
           `_Sent with heartfelt prayers & warmth._`;
  }

  // Send via WhatsApp
  sendWhatsAppBtn.addEventListener('click', () => {
    if (!rsvpWishForm.checkValidity()) {
      rsvpWishForm.reportValidity();
      return;
    }

    const message = getFormattedMessage();
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
    dialogStatus.textContent = 'WhatsApp opened! Review and send your message to the couple.';
    showToast('Opening WhatsApp to send wishes... 💬');
  });

  // Copy Wishes & RSVP
  rsvpWishForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = getFormattedMessage();

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(message);
        dialogStatus.textContent = 'Copied to clipboard! You can now paste and send to the couple.';
        showToast('Wishes & RSVP copied to clipboard! 📋');
      } else {
        dialogStatus.textContent = 'Please copy the message manually.';
      }
    } catch (err) {
      console.error('Failed to copy message:', err);
      dialogStatus.textContent = 'Could not copy to clipboard. Please copy manually.';
    }
  });

  /* ==========================================================================
     8. TOAST NOTIFICATION HELPER
     ========================================================================== */
  let toastTimeout;
  function showToast(msg) {
    clearTimeout(toastTimeout);
    toastNotification.textContent = msg;
    toastNotification.classList.add('is-active');

    toastTimeout = setTimeout(() => {
      toastNotification.classList.remove('is-active');
    }, 3200);
  }
});
