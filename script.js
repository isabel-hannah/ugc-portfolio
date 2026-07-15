// Keep only the silent homepage hero moving; all other videos retain their own behavior.
const heroVideo = document.getElementById('hero-video');

if (heroVideo) {
  const heroReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fallbackEvents = ['pointerdown', 'touchstart', 'keydown', 'scroll'];
  let fallbackListenersActive = false;

  function removeHeroFallbackListeners() {
    if (!fallbackListenersActive) return;

    fallbackEvents.forEach((eventName) => {
      window.removeEventListener(eventName, retryHeroAfterInteraction);
    });
    fallbackListenersActive = false;
  }

  function addHeroFallbackListeners() {
    if (fallbackListenersActive || heroReduceMotion.matches) return;

    fallbackEvents.forEach((eventName) => {
      window.addEventListener(eventName, retryHeroAfterInteraction, { passive: true });
    });
    fallbackListenersActive = true;
  }

  function attemptHeroPlayback() {
    if (heroReduceMotion.matches) {
      removeHeroFallbackListeners();
      heroVideo.pause();
      return;
    }

    heroVideo.muted = true;
    heroVideo.defaultMuted = true;
    heroVideo.controls = false;

    const playPromise = heroVideo.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise
        .then(removeHeroFallbackListeners)
        .catch(addHeroFallbackListeners);
    } else if (heroVideo.paused) {
      addHeroFallbackListeners();
    } else {
      removeHeroFallbackListeners();
    }
  }

  function retryHeroAfterInteraction() {
    attemptHeroPlayback();
  }

  document.addEventListener('DOMContentLoaded', attemptHeroPlayback);
  heroVideo.addEventListener('loadedmetadata', attemptHeroPlayback);
  heroVideo.addEventListener('canplay', attemptHeroPlayback);
  heroVideo.addEventListener('playing', removeHeroFallbackListeners);
  window.addEventListener('pageshow', attemptHeroPlayback);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') attemptHeroPlayback();
  });
  heroReduceMotion.addEventListener('change', attemptHeroPlayback);
}

// Featured films play in place, preserving the browsing rhythm of the homepage.
function playFeaturedVideo(targetId) {
  const video = document.getElementById(targetId);
  if (!video) return;

  document.querySelectorAll('.project-media video, .more-grid video').forEach((otherVideo) => {
    if (otherVideo !== video) otherVideo.pause();
  });

  video.muted = false;
  video.volume = 1;
  video.controls = true;
  video.play().catch(() => {
    // Native controls remain available if a browser blocks programmatic playback.
  });
}

document.querySelectorAll('[data-play-target]').forEach((trigger) => {
  const play = () => playFeaturedVideo(trigger.dataset.playTarget);
  trigger.addEventListener('click', play);
  trigger.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      play();
    }
  });
});

// Editorial lifestyle films are intentionally silent and only run while nearby.
const lifestyleVideos = document.querySelectorAll('.lifestyle-video');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function setLifestylePlayback(video, shouldPlay) {
  window.clearTimeout(video.lifestylePlaybackTimer);

  if (reduceMotion.matches) {
    video.pause();
    return;
  }

  if (shouldPlay) {
    const delay = Number(video.dataset.lifestyleDelay || 0);
    video.lifestylePlaybackTimer = window.setTimeout(() => {
      video.play().catch(() => {});
    }, delay);
  } else {
    video.pause();
  }
}

if (lifestyleVideos.length) {
  const lifestyleObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => setLifestylePlayback(entry.target, entry.isIntersecting));
  }, { rootMargin: '220px 0px', threshold: 0.01 });

  lifestyleVideos.forEach((video) => lifestyleObserver.observe(video));
  reduceMotion.addEventListener('change', () => {
    lifestyleVideos.forEach((video) => setLifestylePlayback(video, !reduceMotion.matches));
  });
}
