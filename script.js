/* =========================================================
   JEPH BEV PVT. LTD. — NATURES PRIDE INTERACTIVE SCRIPTS
   Fullscreen Autoplay Video Hero, 3D Tilt, Stats & WhatsApp
   + 3D IMMERSIVE UPGRADE: Three.js, GSAP, Particles
   
   FIXED: All video playback issues, mobile compatibility,
   missing functions, lazy loading, infinite loops
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  // ================= VIDEO SOURCE CONSTANTS =================
  // Portrait (9:16) video for mobile / vertical screens
  const VIDEO_9_16 = 'logoremover-1786882988011_AOz4B6BX.mp4';
  // Landscape (16:9) video for desktop / widescreen
  const VIDEO_16_9 = 'logoremover_1786882988011.mp4';


  // ================= 1. HEADER & NAVBAR SCROLL =================
  const header = document.getElementById('header');
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');
  const backToTopBtn = document.getElementById('backToTopBtn');

  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Header glass background
    if (header) {
      if (scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      // Smart Auto-Hide Header on Scroll Down, Show on Scroll Up
      if (navMenu && navMenu.classList.contains('open')) {
        header.classList.remove('header-hidden');
      } else if (scrollY > 120 && scrollY > lastScrollY + 6) {
        // Scrolling down -> hide navbar so it never covers form or section headings
        header.classList.add('header-hidden');
      } else if (scrollY < lastScrollY - 6 || scrollY <= 80) {
        // Scrolling up -> instantly reveal navbar
        header.classList.remove('header-hidden');
      }
    }
    lastScrollY = scrollY;

    // Back to top button (if present)
    if (backToTopBtn) {
      if (scrollY > 400) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }

    // Active Section Tracking
    const sections = document.querySelectorAll('section[id]');
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  });

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

    // Close menu when tapping anywhere outside
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


  // ================= 2. HERO VIDEO — SMART SOURCE SWITCHING =================
  const bgVideo = document.getElementById('heroFullscreenVideo');
  const heroSection = document.getElementById('home');
  const heroVideoStopBtn = document.getElementById('heroVideoStopBtn');
  const heroAudioToggle = document.getElementById('heroAudioToggle');
  const audioToggleIcon = document.getElementById('audioToggleIcon');
  const audioToggleLabel = document.getElementById('audioToggleLabel');
  const videoFlashIndicator = document.getElementById('videoFlashIndicator');
  const videoFlashIcon = document.getElementById('videoFlashIcon');

  // Helper: Detect if current screen is portrait/mobile
  const isPortraitOrMobile = () => {
    return window.innerWidth <= 768 || window.matchMedia('(orientation: portrait)').matches;
  };

  // Sync Hero Video Source — switches between portrait & landscape videos
  const syncHeroVideoSource = () => {
    if (!bgVideo) return;

    const targetSrc = isPortraitOrMobile() ? VIDEO_9_16 : VIDEO_16_9;
    const currentSource = bgVideo.querySelector('source');
    
    // Only switch if the source is actually different
    if (currentSource && currentSource.src && currentSource.src.includes(targetSrc)) return;

    const wasPlaying = !bgVideo.paused;
    const wasMuted = bgVideo.muted;
    
    if (currentSource) {
      currentSource.src = targetSrc;
    }
    
    bgVideo.load();
    bgVideo.muted = wasMuted;

    if (wasPlaying) {
      bgVideo.play().catch(() => {
        bgVideo.muted = true;
        bgVideo.play().catch(() => {});
      });
    }
  };

  if (bgVideo) {
    let isManuallyPaused = false;
    let flashTimeout = null;

    bgVideo.muted = true;
    bgVideo.defaultMuted = true;
    bgVideo.playsInline = true;
    bgVideo.loop = true;

    // Set the correct source for current device immediately
    syncHeroVideoSource();

    // Helper: flash state icon momentarily on click
    const flashVideoStatus = (isPaused) => {
      if (!videoFlashIndicator || !videoFlashIcon) return;
      videoFlashIcon.className = isPaused ? 'fa-solid fa-pause' : 'fa-solid fa-play';
      videoFlashIndicator.classList.add('show-flash');
      clearTimeout(flashTimeout);
      flashTimeout = setTimeout(() => {
        videoFlashIndicator.classList.remove('show-flash');
      }, 550);
    };

    // Helper to update Audio button state
    const updateAudioButton = () => {
      if (!heroAudioToggle) return;
      if (bgVideo.muted) {
        if (audioToggleIcon) audioToggleIcon.className = 'fa-solid fa-volume-xmark';
        if (audioToggleLabel) audioToggleLabel.textContent = 'Tap for Sound';
        heroAudioToggle.classList.remove('active');
      } else {
        if (audioToggleIcon) audioToggleIcon.className = 'fa-solid fa-volume-high';
        if (audioToggleLabel) audioToggleLabel.textContent = 'Sound Playing';
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

    const safePlayHeroVideo = () => {
      if (isManuallyPaused) return;
      const playPromise = bgVideo.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If unmuted autoplay blocked, fallback to muted autoplay
          bgVideo.muted = true;
          updateAudioButton();
          bgVideo.play().catch(() => {});
        });
      }
    };

    // Initial play setup
    updateAudioButton();
    
    // Wait for video data before playing
    const onVideoReady = () => {
      safePlayHeroVideo();
    };
    
    bgVideo.addEventListener('loadeddata', onVideoReady, { once: false });
    bgVideo.addEventListener('canplay', onVideoReady, { once: false });
    
    // Try initial play
    safePlayHeroVideo();

    // Auto-loop failsafe
    bgVideo.addEventListener('ended', () => {
      bgVideo.currentTime = 0;
      safePlayHeroVideo();
    });

    // Auto-unmute on first user interaction anywhere in hero
    const tryUnmuteOnInteraction = () => {
      if (bgVideo.muted) {
        unmuteAudio();
      }
    };
    if (heroSection) {
      heroSection.addEventListener('click', tryUnmuteOnInteraction, { once: true });
    }

    // Toggle video play / stop
    const toggleVideoPlayback = () => {
      if (!bgVideo.paused) {
        bgVideo.pause();
        isManuallyPaused = true;
        flashVideoStatus(true);
      } else {
        isManuallyPaused = false;
        safePlayHeroVideo();
        flashVideoStatus(false);
      }
    };

    if (heroVideoStopBtn) {
      heroVideoStopBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleVideoPlayback();
      });
    }

    // Audio Toggle Button Click
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

    // Pause only when hero section is completely scrolled out of view
    if (heroSection && 'IntersectionObserver' in window) {
      const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            if (!isManuallyPaused) {
              safePlayHeroVideo();
            }
          } else {
            if (!bgVideo.paused) {
              bgVideo.pause();
            }
          }
        });
      }, { threshold: 0.15 });

      heroObserver.observe(heroSection);
    }

    // Auto pause when tab is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && !bgVideo.paused) {
        bgVideo.pause();
      } else if (!document.hidden && !isManuallyPaused) {
        safePlayHeroVideo();
      }
    });

    // Listen for orientation changes — switch video source
    if (window.screen && window.screen.orientation) {
      window.screen.orientation.addEventListener('change', () => {
        setTimeout(syncHeroVideoSource, 200);
      });
    }
    
    // Also listen for resize (covers orientation change on iOS etc)
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(syncHeroVideoSource, 300);
    });
  }


  // ================= 2.5 PRODUCT CARDS — LAZY-LOADED AUTOPLAY VIDEOS =================
  const setupProductCardVideo = (videoId) => {
    const vid = document.getElementById(videoId);
    if (!vid) return;

    const container = vid.closest('.product-image-container');
    const fallbackImg = container ? container.querySelector('.prod-fallback-img') : null;
    let videoLoaded = false;
    let isPlaying = false;

    vid.muted = true;
    vid.defaultMuted = true;
    vid.volume = 0;
    vid.playsInline = true;
    vid.loop = true;

    // Show fallback image initially, hide when video can play
    const showFallback = () => {
      if (fallbackImg) {
        fallbackImg.style.display = 'block';
        vid.style.display = 'none';
      }
    };

    const hideFallback = () => {
      if (fallbackImg) {
        fallbackImg.style.display = 'none';
        vid.style.display = 'block';
      }
    };

    // Initially show fallback
    showFallback();

    const startPlay = () => {
      if (isPlaying) return; // Prevent duplicate calls
      
      vid.muted = true;
      
      // If video hasn't loaded yet, trigger load first
      if (!videoLoaded) {
        vid.preload = 'auto';
        vid.load();
        videoLoaded = true;
      }

      const playPromise = vid.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          isPlaying = true;
          hideFallback();
        }).catch(() => {
          // Autoplay blocked — show fallback image instead
          showFallback();
          isPlaying = false;
          
          // Retry on first user interaction
          const resumeOnInteraction = () => {
            vid.muted = true;
            vid.play().then(() => {
              isPlaying = true;
              hideFallback();
            }).catch(() => {
              showFallback();
            });
          };
          ['scroll', 'touchstart', 'click'].forEach(evt => {
            window.addEventListener(evt, resumeOnInteraction, { once: true, passive: true });
          });
        });
      }
    };

    const stopPlay = () => {
      if (!vid.paused) {
        vid.pause();
      }
      isPlaying = false;
    };

    // When video can play, hide fallback
    vid.addEventListener('canplay', () => {
      if (isPlaying || !vid.paused) {
        hideFallback();
      }
    });

    // Auto-loop failsafe
    vid.addEventListener('ended', () => {
      vid.currentTime = 0;
      startPlay();
    });

    // Handle video errors gracefully — show fallback
    vid.addEventListener('error', () => {
      showFallback();
      isPlaying = false;
    });

    // Viewport Visibility Observer — LAZY LOAD: only start when in view
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            startPlay();
          } else {
            stopPlay();
          }
        });
      }, { threshold: 0.1, rootMargin: '100px' });
      
      observer.observe(container || vid);
    } else {
      // Fallback for browsers without IntersectionObserver
      startPlay();
    }
  };

  setupProductCardVideo('cocoProductVideo');
  setupProductCardVideo('mangoProductVideo');
  setupProductCardVideo('guavaProductVideo');
  setupProductCardVideo('mixedProductVideo');


  // ================= 3. ENHANCED 3D TILT WITH CURSOR GLOW TRACKING =================
  const tiltCards = document.querySelectorAll('[data-tilt]');
  const isTouchDevice = window.innerWidth <= 768;

  tiltCards.forEach(card => {
    if (isTouchDevice) return; // Skip tilt on mobile

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = -((y - centerY) / rect.height) * 10;
      const rotateY = ((x - centerX) / rect.width) * 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;

      // Cursor glow tracking via CSS custom properties
      const glowX = (x / rect.width) * 100;
      const glowY = (y / rect.height) * 100;
      card.style.setProperty('--glow-x', `${glowX}%`);
      card.style.setProperty('--glow-y', `${glowY}%`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      card.style.setProperty('--glow-x', '50%');
      card.style.setProperty('--glow-y', '50%');
    });
  });


  // ================= 4. ANIMATED STAT COUNTERS =================
  const statNumbers = document.querySelectorAll('.stat-number');
  let countersAnimated = false;

  const animateCounters = () => {
    statNumbers.forEach(stat => {
      const target = parseFloat(stat.getAttribute('data-target'));
      const isDecimal = target % 1 !== 0;
      const duration = 1800;
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
  if (statsBanner) {
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


  // ================= 5. INQUIRY FORM SUBMISSION =================
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
      }, 1000);
    });
  }


  // ================= 6. HD PROMO VIDEO MODAL CONTROLLER (9:16 / 16:9 SWITCHER) =================
  const videoModalBackdrop = document.getElementById('videoModalBackdrop');
  const videoModalCloseBtn = document.getElementById('videoModalCloseBtn');
  const openVideoModalBtn = document.getElementById('openVideoModalBtn');
  const modalVideoPlayer = document.getElementById('modalVideoPlayer');
  const videoModalPlayerWrap = document.getElementById('videoModalPlayerWrap');
  const ratioBtn916 = document.getElementById('ratioBtn916');
  const ratioBtn169 = document.getElementById('ratioBtn169');

  if (videoModalBackdrop && modalVideoPlayer) {
    let currentModalRatio = '16-9';

    const setModalRatio = (ratio) => {
      currentModalRatio = ratio;
      const targetSrc = (ratio === '9-16') ? VIDEO_9_16 : VIDEO_16_9;
      const currentTime = modalVideoPlayer.currentTime || 0;
      const wasPlaying = !modalVideoPlayer.paused;

      // Update Wrapper Ratio Class
      if (videoModalPlayerWrap) {
        videoModalPlayerWrap.className = `video-modal-player-wrap ratio-${ratio}`;
      }

      // Update Switcher Buttons
      if (ratioBtn916 && ratioBtn169) {
        if (ratio === '9-16') {
          ratioBtn916.classList.add('active');
          ratioBtn169.classList.remove('active');
        } else {
          ratioBtn169.classList.add('active');
          ratioBtn916.classList.remove('active');
        }
      }

      // Update Video Source smoothly
      if (!modalVideoPlayer.src.includes(targetSrc)) {
        modalVideoPlayer.src = targetSrc;
        modalVideoPlayer.load();
        if (currentTime > 0) {
          modalVideoPlayer.currentTime = currentTime;
        }
        if (wasPlaying || videoModalBackdrop.classList.contains('active')) {
          modalVideoPlayer.play().catch(() => {});
        }
      }
    };

    const openVideoModal = () => {
      // Pause Hero Video
      if (bgVideo && !bgVideo.paused) {
        bgVideo.pause();
      }

      // Choose optimal initial ratio based on current viewport
      const initialRatio = isPortraitOrMobile() ? '9-16' : '16-9';

      setModalRatio(initialRatio);

      videoModalBackdrop.classList.add('active');
      document.body.style.overflow = 'hidden';

      modalVideoPlayer.muted = false;
      modalVideoPlayer.volume = 1.0;
      modalVideoPlayer.play().catch(() => {
        // Fallback muted if browser blocks sound autoplay
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

    // Open button listeners
    if (openVideoModalBtn) {
      openVideoModalBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openVideoModal();
      });
    }

    // Modal Close button
    if (videoModalCloseBtn) {
      videoModalCloseBtn.addEventListener('click', closeVideoModal);
    }

    // Close on Backdrop Click
    videoModalBackdrop.addEventListener('click', (e) => {
      if (e.target === videoModalBackdrop) {
        closeVideoModal();
      }
    });

    // Close on Escape Key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && videoModalBackdrop.classList.contains('active')) {
        closeVideoModal();
      }
    });

    // Ratio Switch Buttons
    if (ratioBtn916) {
      ratioBtn916.addEventListener('click', () => setModalRatio('9-16'));
    }
    if (ratioBtn169) {
      ratioBtn169.addEventListener('click', () => setModalRatio('16-9'));
    }
  }


  // ==========================================================================
  //  3D IMMERSIVE UPGRADE — NEW FEATURES
  // ==========================================================================


  // ================= 7. THREE.JS 3D PARTICLE BACKGROUND =================
  const initThreeJsParticles = () => {
    if (typeof THREE === 'undefined') return;

    const canvas = document.getElementById('products3dCanvas');
    const productsSection = document.getElementById('products');
    if (!canvas || !productsSection) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.z = 50;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    // Create floating particle orbs
    const particleCount = window.innerWidth <= 768 ? 30 : 80;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    // Beverage brand colors
    const brandColors = [
      new THREE.Color('#e11d48'), // Guava pink
      new THREE.Color('#d97706'), // Mango gold
      new THREE.Color('#b45309'), // Coco brown
      new THREE.Color('#7c3aed'), // Mixed purple
      new THREE.Color('#059669'), // Emerald fresh
      new THREE.Color('#ff9900'), // Orange accent
    ];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;

      const color = brandColors[Math.floor(Math.random() * brandColors.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = Math.random() * 3 + 1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Custom shader material for glowing orbs
    const material = new THREE.PointsMaterial({
      size: 2.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Mouse tracking
    let mouseX = 0, mouseY = 0;
    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    // Animation speeds per particle
    const velocities = [];
    for (let i = 0; i < particleCount; i++) {
      velocities.push({
        x: (Math.random() - 0.5) * 0.04,
        y: (Math.random() - 0.5) * 0.03,
        z: (Math.random() - 0.5) * 0.02,
      });
    }

    // Check if section is visible
    let isVisible = false;
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        isVisible = entries[0].isIntersecting;
      }, { threshold: 0.05 });
      observer.observe(productsSection);
    }

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      if (!isVisible) return;

      const posArray = particles.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        posArray[i * 3] += velocities[i].x;
        posArray[i * 3 + 1] += velocities[i].y;
        posArray[i * 3 + 2] += velocities[i].z;

        // Boundary bounce
        if (Math.abs(posArray[i * 3]) > 50) velocities[i].x *= -1;
        if (Math.abs(posArray[i * 3 + 1]) > 30) velocities[i].y *= -1;
        if (Math.abs(posArray[i * 3 + 2]) > 20) velocities[i].z *= -1;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      // Subtle mouse-driven camera sway
      camera.position.x += (mouseX * 3 - camera.position.x) * 0.02;
      camera.position.y += (-mouseY * 2 - camera.position.y) * 0.02;
      camera.lookAt(scene.position);

      // Slow rotation
      particles.rotation.y += 0.001;
      particles.rotation.x += 0.0005;

      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    window.addEventListener('resize', () => {
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    });
  };


  // ================= 8. GSAP SCROLL-TRIGGERED ANIMATIONS =================
  const initScrollAnimations = () => {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    // Animate all [data-animate] elements
    document.querySelectorAll('[data-animate]').forEach(el => {
      const animType = el.getAttribute('data-animate');

      if (animType === 'stagger-up') {
        // Stagger children animation
        const children = el.querySelectorAll('[data-animate-child]');
        ScrollTrigger.create({
          trigger: el,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            children.forEach((child, index) => {
              setTimeout(() => {
                child.classList.add('is-visible');
              }, index * 150);
            });
          }
        });
        return;
      }

      // Standard fade animations
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          el.classList.add('is-visible');
        }
      });
    });

    // 3D Flip cards for manufacturing process
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
            }, index * 200);
          });
        }
      });
    }

    // Parallax depth effect on about ambient glows
    gsap.to('.glow-about-1', {
      y: -60,
      scrollTrigger: {
        trigger: '.about-section',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      }
    });

    gsap.to('.glow-about-2', {
      y: 60,
      scrollTrigger: {
        trigger: '.about-section',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      }
    });
  };


  // ================= 9. FLOATING 3D FRUIT PARTICLES =================
  const initFloatingFruits = () => {
    const container = document.getElementById('floatingFruits');
    if (!container) return;

    const fruits = ['🥥', '🥭', '🍈', '🍇', '🍊', '🫐', '🍋'];
    const depthLayers = ['depth-far', 'depth-mid', 'depth-near'];
    const particleCount = window.innerWidth <= 768 ? 6 : 12;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('span');
      particle.className = `fruit-particle ${depthLayers[Math.floor(Math.random() * depthLayers.length)]}`;
      particle.textContent = fruits[Math.floor(Math.random() * fruits.length)];

      // Random positioning and timing
      const leftPos = Math.random() * 100;
      const duration = 15 + Math.random() * 20;
      const delay = Math.random() * duration;
      const driftX = (Math.random() - 0.5) * 120;
      const maxOpacity = particle.classList.contains('depth-far') ? 0.2 :
                          particle.classList.contains('depth-mid') ? 0.3 : 0.4;

      particle.style.left = `${leftPos}%`;
      particle.style.setProperty('--duration', `${duration}s`);
      particle.style.setProperty('--delay', `-${delay}s`);
      particle.style.setProperty('--drift-x', `${driftX}px`);
      particle.style.setProperty('--max-opacity', maxOpacity);

      container.appendChild(particle);
    }
  };


  // ================= INITIALIZE ALL 3D ENHANCEMENTS =================
  // Wait for deferred scripts to load
  const waitForLibs = () => {
    // Three.js particles — skip on mobile for performance
    if (typeof THREE !== 'undefined' && window.innerWidth > 768) {
      initThreeJsParticles();
    }

    // GSAP scroll animations
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      initScrollAnimations();
    }

    // Floating fruit particles (no dependency)
    initFloatingFruits();
  };

  // Use a small delay to ensure deferred scripts are loaded
  if (typeof THREE !== 'undefined' && typeof gsap !== 'undefined') {
    waitForLibs();
  } else {
    // Retry after a short delay for deferred scripts
    setTimeout(waitForLibs, 300);
    // Fallback retry
    setTimeout(() => {
      if (typeof THREE !== 'undefined' && window.innerWidth > 768 && !document.querySelector('.products-3d-canvas[data-initialized]')) {
        initThreeJsParticles();
      }
      if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        initScrollAnimations();
      }
    }, 1000);
  }

});
