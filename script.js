// Featured films play in place, preserving the browsing rhythm of the homepage.
function playFeaturedVideo(targetId) {
  const video = document.getElementById(targetId);
  if (!video) return;

  document.querySelectorAll('.project-media video, .more-grid video').forEach((otherVideo) => {
    if (otherVideo !== video) otherVideo.pause();
  });

  video.muted = true;
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
