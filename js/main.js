document.addEventListener('DOMContentLoaded', () => {
  // --- Particle Background Canvas ---
  const canvas = document.getElementById('particles-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const particleCount = Math.min(Math.floor(window.innerWidth / 15), 70);

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.2
      });
    }

    function animateParticles() {
      ctx.clearRect(0, 0, width, height);

      const isLightMode = document.body.getAttribute('data-theme') === 'light';
      const particleColor = isLightMode ? 'rgba(14, 165, 233,' : 'rgba(56, 189, 248,';

      particles.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${particleColor} ${p.alpha})`;
        ctx.fill();

        for (let j = index + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `${particleColor} ${0.15 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      });

      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  }

  // --- Dynamic Typing Effect ---
  const typingElement = document.getElementById('typing-text');
  if (typingElement) {
    const phrases = [
      "B.E. Computer Science & Engineering Student",
      "Web Developer (HTML, CSS, JS, Node.js)",
      "IoT & Hardware Troubleshooting Specialist",
      "Tech Enthusiast & Problem Solver"
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;

    function typeEffect() {
      const currentPhrase = phrases[phraseIndex];

      if (isDeleting) {
        typingElement.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
        typeSpeed = 40;
      } else {
        typingElement.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
        typeSpeed = 90;
      }

      if (!isDeleting && charIndex === currentPhrase.length) {
        isDeleting = true;
        typeSpeed = 2000; // Pause at end
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typeSpeed = 500; // Pause before new phrase
      }

      setTimeout(typeEffect, typeSpeed);
    }
    typeEffect();
  }

  // --- Theme Toggle Switch ---
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (themeToggleBtn) {
    const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.body.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.body.setAttribute('data-theme', newTheme);
      localStorage.setItem('portfolio-theme', newTheme);
      updateThemeIcon(newTheme);
      showToast(`Switched to ${newTheme} mode`);
    });
  }

  function updateThemeIcon(theme) {
    const icon = themeToggleBtn.querySelector('i');
    if (icon) {
      if (theme === 'dark') {
        icon.className = 'fas fa-sun';
      } else {
        icon.className = 'fas fa-moon';
      }
    }
  }

  // --- Navbar Header Scroll & Active Links ---
  const header = document.querySelector('.header');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    let currentSectionId = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  });

  // --- Mobile Nav Toggle ---
  const mobileToggle = document.getElementById('mobile-toggle');
  const navLinksMenu = document.querySelector('.nav-links');
  if (mobileToggle && navLinksMenu) {
    mobileToggle.addEventListener('click', () => {
      navLinksMenu.classList.toggle('active');
      const icon = mobileToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
      }
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navLinksMenu.classList.remove('active');
        const icon = mobileToggle.querySelector('i');
        if (icon) {
          icon.classList.add('fa-bars');
          icon.classList.remove('fa-xmark');
        }
      });
    });
  }

  // --- IoT Academic Project Interactive Live Sensor Simulation ---
  const aqiVal = document.getElementById('aqi-value');
  const noiseVal = document.getElementById('noise-value');
  const aqiBar = document.getElementById('aqi-bar');
  const noiseBar = document.getElementById('noise-bar');
  const simulateBtn = document.getElementById('simulate-sensor-btn');
  const resetSensorBtn = document.getElementById('reset-sensor-btn');

  let sensorInterval = null;
  let isSimulating = false;

  function updateSensorDisplay(aqi, noise) {
    if (aqiVal) aqiVal.textContent = aqi;
    if (noiseVal) noiseVal.textContent = noise;
    if (aqiBar) {
      const percentage = Math.min((aqi / 300) * 100, 100);
      aqiBar.style.width = `${percentage}%`;
      aqiBar.style.background = aqi > 100 ? '#f59e0b' : '#38bdf8';
    }
    if (noiseBar) {
      const percentage = Math.min((noise / 120) * 100, 100);
      noiseBar.style.width = `${percentage}%`;
      noiseBar.style.background = noise > 75 ? '#ef4444' : '#818cf8';
    }
  }

  if (simulateBtn) {
    simulateBtn.addEventListener('click', () => {
      isSimulating = !isSimulating;
      if (isSimulating) {
        simulateBtn.innerHTML = '<i class="fas fa-pause"></i> Pause Sensor Feed';
        simulateBtn.classList.replace('btn-secondary', 'btn-primary');
        showToast('Live IoT Sensor Stream Active');
        sensorInterval = setInterval(() => {
          const randomAQI = Math.floor(Math.random() * 65) + 35; // 35 - 100 AQI
          const randomNoise = Math.floor(Math.random() * 45) + 40; // 40 - 85 dB
          updateSensorDisplay(randomAQI, randomNoise);
        }, 1500);
      } else {
        clearInterval(sensorInterval);
        simulateBtn.innerHTML = '<i class="fas fa-play"></i> Live Sensor Stream';
        simulateBtn.classList.replace('btn-primary', 'btn-secondary');
        showToast('Sensor Stream Paused');
      }
    });
  }

  if (resetSensorBtn) {
    resetSensorBtn.addEventListener('click', () => {
      if (isSimulating) {
        clearInterval(sensorInterval);
        isSimulating = false;
        if (simulateBtn) {
          simulateBtn.innerHTML = '<i class="fas fa-play"></i> Live Sensor Stream';
          simulateBtn.classList.replace('btn-primary', 'btn-secondary');
        }
      }
      updateSensorDisplay(42, 58);
      showToast('Sensor Readings Reset to Baseline');
    });
  }

  // --- Copy to Clipboard Functionality ---
  const copyButtons = document.querySelectorAll('.copy-btn');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const textToCopy = btn.getAttribute('data-copy');
      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast(`Copied: ${textToCopy}`);
        }).catch(() => {
          showToast('Failed to copy text');
        });
      }
    });
  });

  // --- Contact Form Submission ---
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('contact-name').value.trim();
      const emailInput = document.getElementById('contact-email').value.trim();
      const messageInput = document.getElementById('contact-message').value.trim();
      
      const emailTarget = "guru2005savi@gmail.com";
      const subject = encodeURIComponent(`Portfolio Contact Form Message from ${nameInput}`);
      const body = encodeURIComponent(`Hello Guru Thiyanesh,\n\nYou received a new message from your portfolio website:\n\nName: ${nameInput}\nEmail: ${emailInput}\n\nMessage:\n${messageInput}\n\n---\nSent via Guru Thiyanesh V Portfolio`);

      // Trigger mailto link so user's email app opens prefilled
      window.location.href = `mailto:${emailTarget}?subject=${subject}&body=${body}`;

      showToast(`Opening email application to send to ${emailTarget}...`);
      contactForm.reset();
    });
  }

  // --- Toast Notification Helper ---
  function showToast(message) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fas fa-info-circle" style="color: var(--accent-cyan);"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
});
