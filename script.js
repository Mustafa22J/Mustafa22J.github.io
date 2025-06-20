gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
  initNetworkBackground();
  initCustomCursor();
  initMagneticButtons();
  initTerminalEffects();
  initSkillAnimations();
  initExpandButtons();
  initProjects();
  initFormEffects();
  initMobileMenu();
  initScrollAnimations();
  initSkillChart();
});

function initNetworkBackground() {
  const canvas = document.getElementById('network-canvas');
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
  
  // Create network nodes
  const nodeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
  const nodeMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x00ffff,
    transparent: true,
    opacity: 0.7
  });
  
  const nodes = [];
  const nodeCount = 100;
  
  for (let i = 0; i < nodeCount; i++) {
    const node = new THREE.Mesh(nodeGeometry, nodeMaterial.clone());
    // Spread nodes across larger area
    const spreadX = (Math.random() - 0.5) * 100;
    const spreadY = (Math.random() - 0.5) * 100;
    const spreadZ = (Math.random() - 0.5) * 100;
    
    node.position.set(
      spreadX,
      spreadY,
      spreadZ
    );
    nodes.push(node);
    scene.add(node);
  }
  
  // Create connections
  const connections = [];
  const connectionMaterial = new THREE.LineBasicMaterial({
    color: 0x0088ff,
    transparent: true,
    opacity: 0.2
  });
  
  for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < nodeCount; j++) {
      const distance = nodes[i].position.distanceTo(nodes[j].position);
      // Increase connection distance threshold
      if (distance < 20) {
        const geometry = new THREE.BufferGeometry().setFromPoints([
          nodes[i].position,
          nodes[j].position
        ]);
        const connection = new THREE.Line(geometry, connectionMaterial);
        connections.push({
          line: connection,
          node1: i,
          node2: j
        });
        scene.add(connection);
      }
    }
  }
  
  // Add floating particles
  const particleGeometry = new THREE.BufferGeometry();
  const particleCount = 500;
  const posArray = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 100; // Spread particles wider
  }
  
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  
  const particleMaterial = new THREE.PointsMaterial({
    size: 0.05,
    color: 0x00ffff,
    transparent: true,
    opacity: 0.3
  });
  
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);
  
  camera.position.z = 40; // Move camera back to see more
  
  // Mouse movement effect
  let mouseX = 0;
  let mouseY = 0;
  
  document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
  });
  
  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    
    // Move nodes slower for calmer effect
    nodes.forEach(node => {
      node.position.x += (Math.random() - 0.5) * 0.005;
      node.position.y += (Math.random() - 0.5) * 0.005;
      node.position.z += (Math.random() - 0.5) * 0.005;
    });
    
    // Update connections
    connections.forEach(conn => {
      const node1 = nodes[conn.node1];
      const node2 = nodes[conn.node2];
      const distance = node1.position.distanceTo(node2.position);
      
      conn.line.geometry.dispose();
      conn.line.geometry = new THREE.BufferGeometry().setFromPoints([
        node1.position,
        node2.position
      ]);
      
      // Adjust opacity based on distance
      const opacity = Math.max(0.1, 0.5 - distance / 30);
      conn.line.material.opacity = opacity;
    });
    
    // Rotate particles
    particles.rotation.x += 0.001;
    particles.rotation.y += 0.001;
    
    // Camera follow mouse
    camera.position.x += (mouseX * 5 - camera.position.x) * 0.02;
    camera.position.y += (mouseY * 5 - camera.position.y) * 0.02;
    camera.lookAt(scene.position);
    
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

function initCustomCursor() {
  const cursor = document.querySelector('.custom-cursor');
  if (!cursor) return;
  
  document.addEventListener('mousemove', (e) => {
    gsap.to(cursor, {
      x: e.clientX,
      y: e.clientY,
      duration: 0.05, // Faster cursor movement
      ease: 'power1.out'
    });
  });
  
  const interactiveElements = document.querySelectorAll('a, button, .btn, .project-card, .skill-category h3');
  
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('cursor-hover');
    });
    
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('cursor-hover');
    });
  });
  
  document.addEventListener('mouseleave', () => {
    cursor.style.display = 'none';
  });
  
  document.addEventListener('mouseenter', () => {
    cursor.style.display = 'block';
  });
}

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
        duration: 0.2, // Faster magnetic effect
        ease: 'power2.out'
      });
    });
    
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.3, // Faster reset
        ease: 'elastic.out(1, 0.3)'
      });
    });
  });
}

function initTerminalEffects() {
  const terminalElements = document.querySelectorAll('.terminal-text, .terminal-command, .terminal-prompt');
  
  terminalElements.forEach(el => {
    setInterval(() => {
      if (Math.random() > 0.9) {
        el.style.textShadow = `0 0 5px rgba(0, 255, 255, 0.8)`;
        setTimeout(() => {
          el.style.textShadow = '';
        }, 100);
      }
    }, 1000);
  });
}

function initSkillAnimations() {
  const progressBars = document.querySelectorAll('.progress');
  
  ScrollTrigger.batch(progressBars, {
    onEnter: batch => {
      gsap.to(batch, {
        width: element => element.style.width,
        duration: 1, // Faster progress animation
        ease: 'power2.out',
        stagger: 0.1
      });
    },
    start: "top 80%"
  });
}

function initSkillChart() {
  const ctx = document.getElementById('skills-chart');
  if (!ctx) return;
  
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
        data: [90, 75, 85, 80, 70, 75],
        backgroundColor: `rgba(${primaryColorRgb}, 0.2)`,
        borderColor: primaryColor,
        pointBackgroundColor: primaryColor,
        pointBorderColor: '#0a1929',
        pointHoverBackgroundColor: '#e0f7ff',
        pointHoverBorderColor: primaryColor
      }]
    },
    options: {
      scales: {
        r: {
          angleLines: {
            color: 'rgba(224, 247, 255, 0.1)'
          },
          grid: {
            color: 'rgba(224, 247, 255, 0.1)'
          },
          pointLabels: {
            color: '#e0f7ff',
            font: {
              size: 14,
              family: "'Share Tech Mono', monospace"
            }
          },
          ticks: {
            backdropColor: 'transparent',
            color: 'rgba(224, 247, 255, 0.5)',
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
}

function initExpandButtons() {
  const expandBtns = document.querySelectorAll('.expand-btn');
  
  expandBtns.forEach(btn => {
    const targetId = btn.getAttribute('aria-controls');
    const targetContent = document.getElementById(targetId);
    
    if (!targetContent) return;
    
    btn.setAttribute('aria-expanded', 'false');
    
    btn.addEventListener('click', () => {
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', !isExpanded);
      targetContent.classList.toggle('expanded');
    });
  });
}

function initProjects() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const filter = btn.getAttribute('data-filter');
      
      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        
        if (filter === 'all' || filter === category) {
          gsap.to(card, {
            opacity: 1,
            scale: 1,
            duration: 0.3 // Faster filter transition
          });
        } else {
          gsap.to(card, {
            opacity: 0.3,
            scale: 0.95,
            duration: 0.3 // Faster filter transition
          });
        }
      });
    });
  });
  
  projectCards.forEach(card => {
    const overlay = card.querySelector('.project-overlay');
    const details = card.querySelector('.project-details');
    
    overlay.addEventListener('click', () => {
      if (details.style.display === 'block') {
        gsap.to(details, {
          height: 0,
          opacity: 0,
          duration: 0.2, // Faster close animation
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
            duration: 0.3 // Faster open animation
          }
        );
      }
    });
  });
}

function initFormEffects() {
  const formInputs = document.querySelectorAll('.contact-form input, .contact-form textarea');
  
  formInputs.forEach(input => {
    input.addEventListener('focus', () => {
      const icon = input.previousElementSibling;
      if (icon && icon.tagName === 'I') {
        gsap.to(icon, {
          color: 'var(--primary-color)',
          scale: 1.2,
          duration: 0.2 // Faster focus effect
        });
      }
    });
    
    input.addEventListener('blur', () => {
      const icon = input.previousElementSibling;
      if (icon && icon.tagName === 'I') {
        gsap.to(icon, {
          color: 'var(--text-secondary)',
          scale: 1,
          duration: 0.2 // Faster blur effect
        });
      }
    });
  });
}

function initMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  if (!menuToggle || !navLinks) return;
  
  menuToggle.addEventListener('click', () => {
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', !isExpanded);
    navLinks.classList.toggle('active');
  });
  
  const links = navLinks.querySelectorAll('a');
  links.forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.setAttribute('aria-expanded', 'false');
      navLinks.classList.remove('active');
    });
  });
}

function initScrollAnimations() {
  gsap.utils.toArray('.section-title').forEach(title => {
    gsap.from(title, {
      y: 30,
      opacity: 0,
      duration: 0.5, // Faster scroll animation
      scrollTrigger: {
        trigger: title,
        start: 'top bottom-=100'
      }
    });
  });
  
  gsap.utils.toArray('.project-card').forEach(card => {
    gsap.from(card, {
      y: 50,
      opacity: 0,
      duration: 0.5, // Faster scroll animation
      scrollTrigger: {
        trigger: card,
        start: 'top bottom-=50'
      }
    });
  });
  
  gsap.utils.toArray('.skill-category').forEach(category => {
    gsap.from(category, {
      x: -30,
      opacity: 0,
      duration: 0.5, // Faster scroll animation
      scrollTrigger: {
        trigger: category,
        start: 'top bottom-=100'
      }
    });
  });
}
