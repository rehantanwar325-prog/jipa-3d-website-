/* =========================================================
   JEPH BEV PVT. LTD. — NATURES PRIDE INTERACTIVE SCRIPTS
   Ultra-Smooth 60FPS, Mobile-Optimized Video & Graphics Engine
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  // ================= VIDEO CONSTANTS =================
  const VIDEO_9_16 = 'logoremover-1786882988011_AOz4B6BX.mp4';
  const VIDEO_16_9 = 'logoremover_1786882988011.mp4';

  const isMobile = window.innerWidth <= 768;

  // Tracks whether hero section is on screen (used to pause hero video decode when scrolled away)
  let heroInView = true;

  // ================= 1. HEADER & NAVBAR SCROLL =================
  const header = document.getElementById('header');
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');
  const backToTopBtn = document.getElementById('backToTopBtn');

  let lastScrollY = window.scrollY;
  let ticking = false;

  const onScroll = () => {
    const scrollY = window.scrollY;

    // Header glass background & smart hide
    if (header) {
      if (scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      if (navMenu && navMenu.classList.contains('open')) {
        header.classList.remove('header-hidden');
      } else if (scrollY > 120 && scrollY > lastScrollY + 8) {
        header.classList.add('header-hidden');
      } else if (scrollY < lastScrollY - 8 || scrollY <= 80) {
        header.classList.remove('header-hidden');
      }
    }
    lastScrollY = scrollY;

    // Back to top button
    if (backToTopBtn) {
      if (scrollY > 400) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }

    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  // Mobile Menu Toggle
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      navMenu.classList.toggle('open');
      menuToggle.classList.toggle('active');
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        menuToggle.classList.remove('active');
      });
    });

    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('open') && !navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        navMenu.classList.remove('open');
        menuToggle.classList.remove('active');
      }
    });
  }

  // Back to Top Click
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }


  // ================= 2. BULLETPROOF INSTANT AUTOPLAY VIDEO ENGINE =================
  const bgVideo = document.getElementById('heroFullscreenVideo');
  const prodVideos = document.querySelectorAll('.prod-video');

  // Helper to reliably trigger video playback
  const tryPlayVideo = (vid) => {
    if (!vid) return;
    vid.muted = true;
    vid.defaultMuted = true;
    const playPromise = vid.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Fallback handled via interaction listeners
      });
    }
  };

  // 1. Hero Video: Instant guaranteed mobile autoplay (0-second delay)
  if (bgVideo) {
    bgVideo.muted = true;
    bgVideo.defaultMuted = true;
    bgVideo.playsInline = true;
    bgVideo.setAttribute('playsinline', '');
    bgVideo.setAttribute('webkit-playsinline', '');
    bgVideo.setAttribute('x5-playsinline', '');
    bgVideo.setAttribute('muted', '');

    tryPlayVideo(bgVideo);

    // Global user interaction listener to immediately unlock hero video if blocked by browser policy
    const unlockHeroVideo = () => {
      if (bgVideo && bgVideo.paused && !bgVideo.dataset.userPaused) {
        tryPlayVideo(bgVideo);
      }
    };

    ['touchstart', 'touchend', 'click', 'scroll', 'pointerdown'].forEach(evt => {
      window.addEventListener(evt, unlockHeroVideo, { once: true, passive: true });
    });

    // Pause hero video when scrolled out of view — frees GPU/decoder so product videos never stutter
    if ('IntersectionObserver' in window) {
      const heroSectionEl = document.getElementById('home');
      if (heroSectionEl) {
        const heroVisibilityObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            heroInView = entry.isIntersecting;
            if (heroInView && !bgVideo.dataset.userPaused) {
              tryPlayVideo(bgVideo);
            } else if (!heroInView && !bgVideo.paused) {
              bgVideo.pause();
            }
          });
        }, { threshold: 0.05 });
        heroVisibilityObserver.observe(heroSectionEl);
      }
    }
  }

  // 2. Product Card Videos: Lazy Load & Play ONLY when scrolled into view (saves 10MB+ startup bandwidth)
  if ('IntersectionObserver' in window) {
    const prodObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const vid = entry.target;
        if (entry.isIntersecting) {
          tryPlayVideo(vid);
        } else {
          if (!vid.paused) {
            vid.pause();
          }
        }
      });
    }, { threshold: 0.1, rootMargin: '150px' });

    prodVideos.forEach(vid => {
      vid.muted = true;
      vid.defaultMuted = true;
      vid.playsInline = true;
      vid.setAttribute('playsinline', '');
      vid.setAttribute('webkit-playsinline', '');
      vid.setAttribute('x5-playsinline', '');
      vid.setAttribute('muted', '');
      prodObserver.observe(vid);
    });
  } else {
    // Fallback for older browsers without IntersectionObserver
    prodVideos.forEach(tryPlayVideo);
  }


  // ================= 3. HERO VIDEO CONTROLS (STOP/PLAY & SOUND) =================
  const heroSection = document.getElementById('home');
  const heroVideoStopBtn = document.getElementById('heroVideoStopBtn');
  const heroAudioToggle = document.getElementById('heroAudioToggle');
  const audioToggleIcon = document.getElementById('audioToggleIcon');
  const audioToggleLabel = document.getElementById('audioToggleLabel');
  const videoFlashIndicator = document.getElementById('videoFlashIndicator');
  const videoFlashIcon = document.getElementById('videoFlashIcon');

  if (bgVideo) {
    let isManuallyPaused = false;
    let flashTimeout = null;

    const flashVideoStatus = (isPaused) => {
      if (!videoFlashIndicator || !videoFlashIcon) return;
      videoFlashIcon.className = isPaused ? 'fa-solid fa-pause' : 'fa-solid fa-play';
      videoFlashIndicator.classList.add('show-flash');
      clearTimeout(flashTimeout);
      flashTimeout = setTimeout(() => {
        videoFlashIndicator.classList.remove('show-flash');
      }, 500);
    };

    const updateAudioButton = () => {
      if (!heroAudioToggle) return;
      if (bgVideo.muted) {
        if (audioToggleIcon) audioToggleIcon.className = 'fa-solid fa-volume-xmark';
        if (audioToggleLabel) audioToggleLabel.textContent = 'Sound On';
        heroAudioToggle.classList.remove('active');
      } else {
        if (audioToggleIcon) audioToggleIcon.className = 'fa-solid fa-volume-high';
        if (audioToggleLabel) audioToggleLabel.textContent = 'Mute';
        heroAudioToggle.classList.add('active');
      }
    };

    const unmuteAudio = () => {
      bgVideo.muted = false;
      bgVideo.volume = 1.0;
      updateAudioButton();
      if (bgVideo.paused && !isManuallyPaused) {
        bgVideo.play().catch(() => {});
      }
    };

    const muteAudio = () => {
      bgVideo.muted = true;
      updateAudioButton();
    };

    // Toggle sound
    if (heroAudioToggle) {
      heroAudioToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (bgVideo.muted) {
          unmuteAudio();
        } else {
          muteAudio();
        }
      });
    }

    // Toggle video play / pause on center tap
    if (heroVideoStopBtn) {
      heroVideoStopBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!bgVideo.paused) {
          bgVideo.pause();
          isManuallyPaused = true;
          bgVideo.dataset.userPaused = 'true';
          flashVideoStatus(true);
        } else {
          isManuallyPaused = false;
          delete bgVideo.dataset.userPaused;
          tryPlayVideo(bgVideo);
          flashVideoStatus(false);
        }
      });
    }

    // Loop fail-safe
    bgVideo.addEventListener('ended', () => {
      bgVideo.currentTime = 0;
      tryPlayVideo(bgVideo);
    });

    // Visibility Change: pause when tab hidden (also respects hero scroll visibility)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && !bgVideo.paused) {
        bgVideo.pause();
      } else if (!document.hidden && !isManuallyPaused && heroInView) {
        tryPlayVideo(bgVideo);
      }
    });
  }


  // ================= 4. 3D TILT EFFECT (DESKTOP ONLY) =================
  if (!isMobile) {
    const tiltCards = document.querySelectorAll('[data-tilt]');
    tiltCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = -((y - centerY) / rect.height) * 8;
        const rotateY = ((x - centerX) / rect.width) * 8;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        card.style.setProperty('--glow-x', `${(x / rect.width) * 100}%`);
        card.style.setProperty('--glow-y', `${(y / rect.height) * 100}%`);
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        card.style.setProperty('--glow-x', '50%');
        card.style.setProperty('--glow-y', '50%');
      });
    });
  }


  // ================= 5. ANIMATED STAT COUNTERS =================
  const statNumbers = document.querySelectorAll('.stat-number');
  let countersAnimated = false;

  const animateCounters = () => {
    statNumbers.forEach(stat => {
      const target = parseFloat(stat.getAttribute('data-target'));
      const isDecimal = target % 1 !== 0;
      const duration = 1600;
      const startTime = performance.now();

      const updateCounter = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = target * ease;

        if (isDecimal) {
          stat.textContent = current.toFixed(1);
        } else {
          stat.textContent = Math.floor(current).toLocaleString('en-IN');
        }

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          stat.textContent = isDecimal ? target.toFixed(1) : target.toLocaleString('en-IN');
        }
      };

      requestAnimationFrame(updateCounter);
    });
  };

  const statsBanner = document.querySelector('.about-stats-banner');
  if (statsBanner && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !countersAnimated) {
          countersAnimated = true;
          animateCounters();
        }
      });
    }, { threshold: 0.1 });

    observer.observe(statsBanner);
  }


  // ================= 6. INQUIRY FORM SUBMISSION =================
  const inquiryForm = document.getElementById('inquiryForm');
  const formFeedback = document.getElementById('formFeedback');
  const submitFormBtn = document.getElementById('submitFormBtn');

  if (inquiryForm && formFeedback) {
    inquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('fullName').value;
      const phone = document.getElementById('phoneNum').value;
      const type = document.getElementById('inquiryType').value;
      const product = document.getElementById('productInterest').value;
      const message = document.getElementById('userMessage').value;

      submitFormBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';
      submitFormBtn.disabled = true;

      setTimeout(() => {
        submitFormBtn.innerHTML = '<i class="fa-solid fa-check"></i> Inquiry Sent Successfully!';
        submitFormBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';

        formFeedback.textContent = `Thank you, ${name}! Your inquiry for ${product} (${type}) has been recorded. Our Jaipur sales desk will contact you at ${phone} shortly.`;
        formFeedback.className = 'form-feedback success';

        const waText = encodeURIComponent(`*New Natures Pride Wholesale Inquiry*\nName: ${name}\nPhone: ${phone}\nType: ${type}\nProduct: ${product}\nNote: ${message}`);
        const waLink = `https://wa.me/919876543210?text=${waText}`;
        
        setTimeout(() => {
          window.open(waLink, '_blank');
          inquiryForm.reset();
          submitFormBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Inquiry Now';
          submitFormBtn.style.background = '';
          submitFormBtn.disabled = false;
        }, 1200);
      }, 800);
    });
  }


  // ================= 6.5 FAQ ACCORDION =================
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (!questionBtn) return;

    questionBtn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      faqItems.forEach(other => {
        other.classList.remove('open');
        const otherBtn = other.querySelector('.faq-question');
        if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('open');
        questionBtn.setAttribute('aria-expanded', 'true');
      }
    });
  });


  // ================= 7. HD PROMO VIDEO MODAL CONTROLLER =================
  const videoModalBackdrop = document.getElementById('videoModalBackdrop');
  const videoModalCloseBtn = document.getElementById('videoModalCloseBtn');
  const openVideoModalBtn = document.getElementById('openVideoModalBtn');
  const modalVideoPlayer = document.getElementById('modalVideoPlayer');
  const videoModalPlayerWrap = document.getElementById('videoModalPlayerWrap');
  const ratioBtn916 = document.getElementById('ratioBtn916');
  const ratioBtn169 = document.getElementById('ratioBtn169');

  if (videoModalBackdrop && modalVideoPlayer) {
    const setModalRatio = (ratio) => {
      const targetSrc = (ratio === '9-16') ? VIDEO_9_16 : VIDEO_16_9;
      const currentTime = modalVideoPlayer.currentTime || 0;

      if (videoModalPlayerWrap) {
        videoModalPlayerWrap.className = `video-modal-player-wrap ratio-${ratio}`;
      }

      if (ratioBtn916 && ratioBtn169) {
        if (ratio === '9-16') {
          ratioBtn916.classList.add('active');
          ratioBtn169.classList.remove('active');
        } else {
          ratioBtn169.classList.add('active');
          ratioBtn916.classList.remove('active');
        }
      }

      if (!modalVideoPlayer.src.includes(targetSrc)) {
        modalVideoPlayer.src = targetSrc;
        modalVideoPlayer.load();
        if (currentTime > 0) {
          modalVideoPlayer.currentTime = currentTime;
        }
        modalVideoPlayer.play().catch(() => {});
      }
    };

    const openVideoModal = () => {
      if (bgVideo && !bgVideo.paused) {
        bgVideo.pause();
      }

      const initialRatio = window.innerWidth <= 768 ? '9-16' : '16-9';
      setModalRatio(initialRatio);

      videoModalBackdrop.classList.add('active');
      document.body.style.overflow = 'hidden';

      modalVideoPlayer.muted = false;
      modalVideoPlayer.volume = 1.0;
      modalVideoPlayer.play().catch(() => {
        modalVideoPlayer.muted = true;
        modalVideoPlayer.play().catch(() => {});
      });
    };

    const closeVideoModal = () => {
      videoModalBackdrop.classList.remove('active');
      document.body.style.overflow = '';
      if (modalVideoPlayer) {
        modalVideoPlayer.pause();
      }
    };

    if (openVideoModalBtn) {
      openVideoModalBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openVideoModal();
      });
    }

    if (videoModalCloseBtn) {
      videoModalCloseBtn.addEventListener('click', closeVideoModal);
    }

    videoModalBackdrop.addEventListener('click', (e) => {
      if (e.target === videoModalBackdrop) {
        closeVideoModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && videoModalBackdrop.classList.contains('active')) {
        closeVideoModal();
      }
    });

    if (ratioBtn916) ratioBtn916.addEventListener('click', () => setModalRatio('9-16'));
    if (ratioBtn169) ratioBtn169.addEventListener('click', () => setModalRatio('16-9'));
  }


  // ================= 8. THREE.JS 3D PARTICLES (DESKTOP ONLY, DYNAMIC LOAD) =================
  const startThreeJsParticles = () => {
    const canvas = document.getElementById('products3dCanvas');
    const productsSection = document.getElementById('products');
    if (!canvas || !productsSection || typeof THREE === 'undefined') return;

    try {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
      camera.position.z = 50;

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setClearColor(0x000000, 0);

      const particleCount = 40;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);

      const brandColors = [
        new THREE.Color('#e11d48'),
        new THREE.Color('#d97706'),
        new THREE.Color('#b45309'),
        new THREE.Color('#7c3aed'),
        new THREE.Color('#059669'),
      ];

      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 40;

        const color = brandColors[Math.floor(Math.random() * brandColors.length)];
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: 2.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
      });

      const particles = new THREE.Points(geometry, material);
      scene.add(particles);

      let isVisible = false;
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          isVisible = entries[0].isIntersecting;
        }, { threshold: 0.05 });
        observer.observe(productsSection);
      }

      let animId;
      const animate = () => {
        animId = requestAnimationFrame(animate);
        if (!isVisible) return;
        particles.rotation.y += 0.0008;
        particles.rotation.x += 0.0004;
        renderer.render(scene, camera);
      };
      animate();

      window.addEventListener('resize', () => {
        if (window.innerWidth <= 768) {
          cancelAnimationFrame(animId);
          return;
        }
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      }, { passive: true });
    } catch (e) {
      // Graceful fallback if WebGL not available
    }
  };

  const initThreeJsParticles = () => {
    if (window.innerWidth <= 768) return;

    if (typeof THREE !== 'undefined') {
      startThreeJsParticles();
      return;
    }

    // Load Three.js (~600KB) only on desktop, after page is interactive
    const threeScript = document.createElement('script');
    threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    threeScript.onload = startThreeJsParticles;
    document.head.appendChild(threeScript);
  };


  // ================= 9. GSAP SCROLL-TRIGGERED ANIMATIONS =================
  const initScrollAnimations = () => {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      // Fallback: make all animated elements visible immediately
      document.querySelectorAll('[data-animate], [data-animate-child], [data-3d-flip]').forEach(el => {
        el.classList.add('is-visible');
        el.classList.add('flipped-in');
      });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    document.querySelectorAll('[data-animate]').forEach(el => {
      const animType = el.getAttribute('data-animate');

      if (animType === 'stagger-up') {
        const children = el.querySelectorAll('[data-animate-child]');
        ScrollTrigger.create({
          trigger: el,
          start: 'top 90%',
          once: true,
          onEnter: () => {
            children.forEach((child, index) => {
              setTimeout(() => {
                child.classList.add('is-visible');
              }, index * 100);
            });
          }
        });
        return;
      }

      ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        once: true,
        onEnter: () => {
          el.classList.add('is-visible');
        }
      });
    });

    const processContainer = document.querySelector('.process-flow-container');
    if (processContainer) {
      const flipCards = document.querySelectorAll('[data-3d-flip]');
      ScrollTrigger.create({
        trigger: processContainer,
        start: 'top 95%',
        once: true,
        onEnter: () => {
          flipCards.forEach((card, index) => {
            setTimeout(() => {
              card.classList.add('flipped-in');
            }, index * 120);
          });
        }
      });
    }
  };


  // ================= 10. FLOATING FRUIT PARTICLES (DESKTOP ONLY) =================
  const initFloatingFruits = () => {
    if (window.innerWidth <= 768) return; // Skip completely on mobile for 60FPS

    const container = document.getElementById('floatingFruits');
    if (!container) return;

    const fruits = ['🥥', '🥭', '🍈', '🍇', '🍊', '🫐'];
    const particleCount = 6; // Lightweight count

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('span');
      particle.className = 'fruit-particle depth-mid';
      particle.textContent = fruits[Math.floor(Math.random() * fruits.length)];

      const leftPos = (i / particleCount) * 90 + Math.random() * 10;
      const duration = 18 + Math.random() * 15;
      const delay = Math.random() * 10;
      const driftX = (Math.random() - 0.5) * 60;

      particle.style.left = `${leftPos}%`;
      particle.style.setProperty('--duration', `${duration}s`);
      particle.style.setProperty('--delay', `-${delay}s`);
      particle.style.setProperty('--drift-x', `${driftX}px`);
      particle.style.setProperty('--max-opacity', '0.25');

      container.appendChild(particle);
    }
  };


  // Initialize enhancements
  initThreeJsParticles();
  initScrollAnimations();
  initFloatingFruits();

});
