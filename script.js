// Initialize GSAP with ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize 3D Background
  initBackground();
  
  // Initialize Custom Cursor
  initCustomCursor();
  
  // Initialize Magnetic Buttons
  initMagneticButtons();
  
  // Initialize Glitch Text Effect
  initGlitchText();
  
  // Initialize Floating Tech Icons
  initFloatingIcons();
  
  // Initialize Skill Chart
  initSkillChart();
  
  // Initialize Skill Categories
  initSkillCategories();
  
  // Initialize Timeline Expand Buttons
  initExpandButtons();
  
  // Initialize Project Filters and Cards
  initProjects();
  
  // Initialize GitHub Repos
  fetchGitHubRepos();
  
  // Initialize Form Effects
  initFormEffects();
  
  // Initialize Theme Switcher
  initThemeSwitcher();
  
  // Initialize Mobile Menu
  initMobileMenu();
  
  // Initialize Scroll Animations
  initScrollAnimations();
});

// 3D Background with Three.js
function initBackground() {
  const canvas = document.getElementById('background-canvas');
  if (!canvas) return;
  
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ 
    canvas,
    alpha: true,
    antialias: true
  });
  
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  
  // Create particles
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 1000;
  const posArray = new Float32Array(particlesCount * 3);
  
  for (let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 15;
  }
  
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  
  // Get primary color from CSS variables
  const primaryColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--primary-color')
    .trim();
  
  // Convert hex to RGB for Three.js
  const color = new THREE.Color(primaryColor);
  
  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.02,
    color: color,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  });
  
  const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particlesMesh);
  
  camera.position.z = 5;
  
  // Mouse movement effect
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;
  
  document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
  });
  
  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    
    targetX = mouseX * 0.1;
    targetY = mouseY * 0.1;
    
    particlesMesh.rotation.x += 0.001;
    particlesMesh.rotation.y += 0.001;
    
    particlesMesh.rotation.x += (targetY - particlesMesh.rotation.x) * 0.05;
    particlesMesh.rotation.y += (targetX - particlesMesh.rotation.y) * 0.05;
    
    renderer.render(scene, camera);
  }
  
  animate();
  
  // Handle window resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });
}

// Custom Cursor
function initCustomCursor() {
  const cursor = document.querySelector('.custom-cursor');
  if (!cursor) return;
  
  document.addEventListener('mousemove', (e) => {
    gsap.to(cursor, {
      x: e.clientX,
      y: e.clientY,
      duration: 0.1,
      ease: 'power1.out'
    });
  });
  
  // Change cursor on hover over interactive elements
  const interactiveElements = document.querySelectorAll('a, button, .btn, .project-card, .skill-category h3');
  
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('cursor-hover');
    });
    
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('cursor-hover');
    });
  });
  
  // Hide cursor when it leaves the window
  document.addEventListener('mouseleave', () => {
    cursor.style.display = 'none';
  });
  
  document.addEventListener('mouseenter', () => {
    cursor.style.display = 'block';
  });
}

// Magnetic Buttons
function initMagneticButtons() {
  const magneticBtns = document.querySelectorAll('.magnetic-btn');
  
  magneticBtns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const moveX = (x - centerX) * 0.2;
      const moveY = (y - centerY) * 0.2;
      
      gsap.to(btn, {
        x: moveX,
        y: moveY,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
    
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)'
      });
    });
  });
}

// Glitch Text Effect
function initGlitchText() {
  const glitchText = document.querySelector('.glitch-text');
  if (!glitchText) return;
  
  const text = glitchText.textContent;
  glitchText.setAttribute('data-text', text);
  
  // Random glitch effect
  setInterval(() => {
    if (Math.random() > 0.9) {
      glitchText.style.textShadow = `
        ${Math.random() * 10 - 5}px ${Math.random() * 10 - 5}px ${Math.random() * 10}px rgba(0, 255, 136, 0.6),
        ${Math.random() * 10 - 5}px ${Math.random() * 10 - 5}px ${Math.random() * 10}px rgba(255, 0, 255, 0.4),
        ${Math.random() * 10 - 5}px ${Math.random() * 10 - 5}px ${Math.random() * 10}px rgba(0, 255, 255, 0.4)
      `;
      
      setTimeout(() => {
        glitchText.style.textShadow = '';
      }, 100);
    }
  }, 500);
}

// Floating Tech Icons
function initFloatingIcons() {
  const container = document.querySelector('.floating-tech-icons');
  if (!container) return;
  
  const icons = [
    'fa-java',
    'fa-js',
    'fa-php',
    'fa-database',
    'fa-linux',
    'fa-network-wired',
    'fa-server',
    'fa-shield-alt',
    'fa-code'
  ];
  
  // Create 15 random icons
  for (let i = 0; i < 15; i++) {
    const icon = document.createElement('i');
    icon.className = `fab ${icons[Math.floor(Math.random() * icons.length)]}`;
    
    // Random position
    icon.style.left = `${Math.random() * 100}%`;
    icon.style.top = `${Math.random() * 100}%`;
    
    // Random size
    const size = Math.random() * 2 + 1;
    icon.style.fontSize = `${size}rem`;
    
    // Random animation delay
    icon.style.animationDelay = `${Math.random() * 5}s`;
    
    container.appendChild(icon);
  }
}

// Skill Chart with Chart.js
function initSkillChart() {
  const ctx = document.getElementById('skills-chart');
  if (!ctx) return;
  
  // Get primary color from CSS variables
  const primaryColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--primary-color')
    .trim();
  
  const primaryColorRgb = getComputedStyle(document.documentElement)
    .getPropertyValue('--primary-color-rgb')
    .trim();
  
  const skillsChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Programming', 'Networking', 'Databases', 'Web Development', 'System Administration', 'Security'],
      datasets: [{
        label: 'Skill Level',
        data: [90, 70, 80, 85, 65, 75],
        backgroundColor: `rgba(${primaryColorRgb}, 0.2)`,
        borderColor: primaryColor,
        pointBackgroundColor: primaryColor,
        pointBorderColor: '#121212',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: primaryColor
      }]
    },
    options: {
      scales: {
        r: {
          angleLines: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          pointLabels: {
            color: '#e0e0e0',
            font: {
              size: 14,
              family: "'Inter', sans-serif"
            }
          },
          ticks: {
            backdropColor: 'transparent',
            color: 'rgba(224, 224, 224, 0.5)',
            z: 100
          },
          suggestedMin: 0,
          suggestedMax: 100
        }
      },
      plugins: {
        legend: {
          display: false
        }
      },
      responsive: true,
      maintainAspectRatio: false
    }
  });
  
  // Update chart on theme change
  document.addEventListener('themeChanged', () => {
    const newPrimaryColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--primary-color')
      .trim();
    
    const newPrimaryColorRgb = getComputedStyle(document.documentElement)
      .getPropertyValue('--primary-color-rgb')
      .trim();
    
    skillsChart.data.datasets[0].backgroundColor = `rgba(${newPrimaryColorRgb}, 0.2)`;
    skillsChart.data.datasets[0].borderColor = newPrimaryColor;
    skillsChart.data.datasets[0].pointBackgroundColor = newPrimaryColor;
    skillsChart.data.datasets[0].pointHoverBorderColor = newPrimaryColor;
    
    skillsChart.update();
  });
}

// Skill Categories
function initSkillCategories() {
  const categories = document.querySelectorAll('.skill-category');
  if (categories.length === 0) return;
  
  categories.forEach(category => {
    const heading = category.querySelector('h3');
    const details = category.querySelector('.skill-details');
    
    heading.addEventListener('click', () => {
      const isActive = category.classList.contains('active');
      
      // Close all categories
      categories.forEach(cat => {
        cat.classList.remove('active');
        const catDetails = cat.querySelector('.skill-details');
        gsap.to(catDetails, {
          height: 0,
          opacity: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      });
      
      // Open clicked category if it wasn't active
      if (!isActive) {
        category.classList.add('active');
        gsap.to(details, {
          height: 'auto',
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out'
        });
      }
    });
  });
  
  // Initialize progress bars
  const progressBars = document.querySelectorAll('.progress');
  
  ScrollTrigger.batch(progressBars, {
    onEnter: batch => {
      gsap.to(batch, {
        width: element => element.style.width,
        duration: 1.5,
        ease: 'power2.out',
        stagger: 0.1,
        overwrite: true
      });
    },
    onLeaveBack: batch => {
      gsap.to(batch, {
        width: 0,
        duration: 1,
        ease: 'power2.out',
        overwrite: true
      });
    },
    start: "top 80%"
  });
}

// Timeline Expand Buttons - FIXED VERSION using CSS class toggle
function initExpandButtons() {
  const expandBtns = document.querySelectorAll('.expand-btn');
  
  expandBtns.forEach(btn => {
    const targetId = btn.getAttribute('aria-controls');
    const targetContent = document.getElementById(targetId);
    
    if (!targetContent) return;
    
    // Set initial state
    if (btn.getAttribute('aria-expanded') === 'true') {
      targetContent.classList.add('expanded');
    } else {
      btn.setAttribute('aria-expanded', 'false');
    }
    
    btn.addEventListener('click', () => {
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      
      // Toggle aria-expanded attribute
      btn.setAttribute('aria-expanded', !isExpanded);
      
      // Toggle expanded class
      targetContent.classList.toggle('expanded');
      
      // Add a small delay to ensure the animation is visible
      if (!isExpanded) {
        // Force a reflow to ensure the animation runs
        void targetContent.offsetWidth;
      }
    });
  });
}

// Project Filters and Cards
function initProjects() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  
  if (filterBtns.length === 0 || projectCards.length === 0) return;
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const filter = btn.getAttribute('data-filter');
      
      // Filter projects
      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        
        if (filter === 'all' || filter === category) {
          gsap.to(card, {
            scale: 1,
            opacity: 1,
            duration: 0.5,
            ease: 'power2.out',
            clearProps: 'all'
          });
        } else {
          gsap.to(card, {
            scale: 0.95,
            opacity: 0.5,
            duration: 0.5,
            ease: 'power2.out'
          });
        }
      });
    });
  });
  
  // Project card details toggle
  projectCards.forEach(card => {
    const overlay = card.querySelector('.project-overlay');
    const details = card.querySelector('.project-details');
    
    if (!overlay || !details) return;
    
    // Initially set display to none
    details.style.display = 'none';
    
    overlay.addEventListener('click', () => {
      const isVisible = details.style.display === 'block';
      
      if (isVisible) {
        gsap.to(details, {
          height: 0,
          opacity: 0,
          duration: 0.3,
          ease: 'power2.out',
          onComplete: () => {
            details.style.display = 'none';
          }
        });
      } else {
        details.style.display = 'block';
        gsap.fromTo(details, 
          { height: 0, opacity: 0 },
          { 
            height: 'auto', 
            opacity: 1, 
            duration: 0.5, 
            ease: 'power2.out'
          }
        );
      }
    });
  });
}

// GitHub Repos
async function fetchGitHubRepos() {
  const repoContainer = document.getElementById('github-repos');
  if (!repoContainer) return;
  
  try {
    const username = 'Mustafa22J';
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch GitHub repositories');
    }
    
    const repos = await response.json();
    
    repoContainer.innerHTML = '';
    
    if (repos.length === 0) {
      repoContainer.innerHTML = '<p class="text-center">No repositories found.</p>';
      return;
    }
    
    repos.forEach(repo => {
      const repoCard = document.createElement('div');
      repoCard.classList.add('repo-card');
      
      repoCard.innerHTML = `
        <h4>${repo.name}</h4>
        <p>${repo.description || 'No description available'}</p>
        <div class="repo-stats">
          <span><i class="fas fa-star"></i> ${repo.stargazers_count}</span>
          <span><i class="fas fa-code-branch"></i> ${repo.forks_count}</span>
          <span><i class="fas fa-circle"></i> ${repo.language || 'N/A'}</span>
        </div>
        <a href="${repo.html_url}" class="btn btn-sm" target="_blank">View Repository</a>
      `;
      
      repoContainer.appendChild(repoCard);
      
      // Animate repo cards
      gsap.from(repoCard, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: repoCard,
          start: 'top bottom-=100',
          toggleActions: 'play none none none'
        }
      });
    });
  } catch (error) {
    console.error('Error fetching GitHub repos:', error);
    repoContainer.innerHTML = `
      <p class="text-center">Failed to load GitHub repositories. Please try again later.</p>
    `;
  }
}

// Form Effects
function initFormEffects() {
  const formInputs = document.querySelectorAll('.contact-form input, .contact-form textarea');
  
  formInputs.forEach(input => {
    input.addEventListener('focus', () => {
      const icon = input.previousElementSibling;
      if (icon && icon.tagName === 'I') {
        gsap.to(icon, {
          color: 'var(--primary-color)',
          scale: 1.2,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    });
    
    input.addEventListener('blur', () => {
      const icon = input.previousElementSibling;
      if (icon && icon.tagName === 'I') {
        gsap.to(icon, {
          color: input.value ? 'var(--primary-color)' : 'var(--text-secondary)',
          scale: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    });
  });
  
  // Form submission animation
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const submitText = submitBtn.querySelector('span');
      const submitIcon = submitBtn.querySelector('i');
      
      // We don't prevent default here to allow the form to submit normally
      
      // Animate button on submit
      gsap.to(submitText, {
        opacity: 0,
        y: -10,
        duration: 0.2,
        ease: 'power2.in'
      });
      
      gsap.to(submitIcon, {
        opacity: 1,
        scale: 1.5,
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)',
        delay: 0.2
      });
      
      // Reset button after submission (for demo purposes)
      setTimeout(() => {
        gsap.to(submitText, {
          opacity: 1,
          y: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
        
        gsap.to(submitIcon, {
          opacity: 1,
          scale: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
      }, 3000);
    });
  }
}

// Theme Switcher
function initThemeSwitcher() {
  const themeSelect = document.getElementById('theme-select');
  if (!themeSelect) return;
  
  themeSelect.addEventListener('change', (e) => {
    document.documentElement.setAttribute('data-theme', e.target.value);
    
    // Dispatch custom event for components that need to update on theme change
    document.dispatchEvent(new CustomEvent('themeChanged', {
      detail: { theme: e.target.value }
    }));
  });
}

// Mobile Menu
function initMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  if (!menuToggle || !navLinks) return;
  
  menuToggle.addEventListener('click', () => {
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    
    menuToggle.setAttribute('aria-expanded', !isExpanded);
    navLinks.classList.toggle('active');
  });
  
  // Close menu when clicking on a link
  const links = navLinks.querySelectorAll('a');
  
  links.forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.setAttribute('aria-expanded', 'false');
      navLinks.classList.remove('active');
    });
  });
}

// Scroll Animations
function initScrollAnimations() {
  // Animate section titles
  gsap.utils.toArray('.section-title').forEach(title => {
    gsap.from(title, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: title,
        start: 'top bottom-=100',
        toggleActions: 'play none none none'
      }
    });
  });
  
  // Animate about section
  const aboutContent = document.querySelector('.about-content');
  if (aboutContent) {
    gsap.from('.profile-container', {
      x: -50,
      opacity: 0,
      duration: 1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: aboutContent,
        start: 'top bottom-=100',
        toggleActions: 'play none none none'
      }
    });
    
    gsap.from('.about-text', {
      x: 50,
      opacity: 0,
      duration: 1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: aboutContent,
        start: 'top bottom-=100',
        toggleActions: 'play none none none'
      }
    });
  }
  
  // Animate timeline nodes
  gsap.utils.toArray('.timeline-node').forEach((node, i) => {
    gsap.from(node, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      delay: i * 0.2,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: node,
        start: 'top bottom-=50',
        toggleActions: 'play none none none'
      }
    });
  });
  
  // Animate project cards
  gsap.utils.toArray('.project-card').forEach((card, i) => {
    gsap.from(card, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      delay: Math.min(i * 0.1, 0.5),
      ease: 'power2.out',
      scrollTrigger: {
        trigger: card,
        start: 'top bottom-=50',
        toggleActions: 'play none none none'
      }
    });
  });
  
  // Animate contact form and info
  const contactContainer = document.querySelector('.contact-container');
  if (contactContainer) {
    gsap.from('.contact-info', {
      x: -50,
      opacity: 0,
      duration: 1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: contactContainer,
        start: 'top bottom-=100',
        toggleActions: 'play none none none'
      }
    });
    
    gsap.from('.contact-form', {
      x: 50,
      opacity: 0,
      duration: 1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: contactContainer,
        start: 'top bottom-=100',
        toggleActions: 'play none none none'
      }
    });
  }
  
  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registration successful');
      })
      .catch(error => {
        console.log('ServiceWorker registration failed:', error);
      });
  });
}
