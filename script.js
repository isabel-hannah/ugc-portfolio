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
