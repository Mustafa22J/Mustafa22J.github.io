gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initLightweightNetwork();
  initCustomCursor();
  initMagneticButtons();
  initTypedEffect();
  initStatCounters();
  initSkillChart();
  initSkillProgressBars();
  initExpandButtons();
  initProjectsFilterAndDetails();
  initMobileMenu();
  initScrollAnimations();
  initScrollProgress();
  initCsProjectsToggle();
});

function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (preloader) setTimeout(() => { preloader.style.opacity = '0'; setTimeout(() => preloader.style.display = 'none', 500); }, 1200);
}

// LIGHTWEIGHT 3D (no per-frame geometry rebuild)
function initLightweightNetwork() {
  const canvas = document.getElementById('network-canvas');
  if (!canvas) return;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMappingExposure = 1.3;
  
  const nodes = [];
  const nodeCount = 80; // reduced
  const geometry = new THREE.SphereGeometry(0.1, 6, 6);
	const material = new THREE.MeshStandardMaterial({
	  color: 0x00f2ff,
	  emissive: 0x00f2ff,
	  emissiveIntensity: 1.2
	});
  for (let i = 0; i < nodeCount; i++) {
    const node = new THREE.Mesh(geometry, material);
    node.position.set((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 60);
    nodes.push(node);
    scene.add(node);
  }
  // static connections (no updates)
  for (let i = 0; i < nodeCount; i++) {
    for (let j = i+1; j < nodeCount; j++) {
      if (nodes[i].position.distanceTo(nodes[j].position) < 18) {
        const points = [nodes[i].position, nodes[j].position];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
		const lineMat = new THREE.LineBasicMaterial({
		  color: 0x00f2ff,
		  transparent: true,
		  opacity: 0.35   // MUCH stronger
		});
        scene.add(new THREE.Line(lineGeo, lineMat));
      }
    }
  }
  const light = new THREE.AmbientLight(0x222233);
  scene.add(light);
  camera.position.z = 45;
  
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;
  });
  function animate() {
    requestAnimationFrame(animate);
    camera.position.x += (mouseX * 5 - camera.position.x) * 0.05;
    camera.position.y += (mouseY * 3 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
  }
  animate();
  window.addEventListener('resize', () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); });
}

function initCustomCursor() {
  const cursor = document.querySelector('.custom-cursor');
  const trail = document.querySelector('.cursor-trail');
  if (!cursor) return;
  let mouseX = 0, mouseY = 0, trailX = 0, trailY = 0;
  document.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; gsap.to(cursor, { x: mouseX, y: mouseY, duration: 0.05 }); });
  function animateTrail() { trailX += (mouseX - trailX) * 0.2; trailY += (mouseY - trailY) * 0.2; if(trail) gsap.set(trail, { x: trailX, y: trailY }); requestAnimationFrame(animateTrail); }
  animateTrail();
  document.querySelectorAll('a, button, .btn, .project-card').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
  });
}

function initMagneticButtons() {
  document.querySelectorAll('.magnetic-btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width/2;
      const y = e.clientY - rect.top - rect.height/2;
      gsap.to(btn, { x: x*0.2, y: y*0.2, duration: 0.2 });
    });
    btn.addEventListener('mouseleave', () => gsap.to(btn, { x: 0, y: 0, duration: 0.3 }));
  });
}

function initTypedEffect() {
  const el = document.getElementById('typed-text');
  if(!el) return;
  const words = ['sudo apt-get install future', 'network engineer', 'automation addict', 'cybersecurity enthusiast'];
  let wi = 0, ci = 0;
  function type() { if(ci < words[wi].length) { el.textContent += words[wi].charAt(ci); ci++; setTimeout(type, 90); } else setTimeout(erase, 2000); }
  function erase() { if(ci > 0) { el.textContent = words[wi].substring(0, ci-1); ci--; setTimeout(erase, 40); } else { wi = (wi+1)%words.length; setTimeout(type, 200); } }
  type();
}

function initStatCounters() {
  document.querySelectorAll('.stat-item').forEach(stat => {
    const target = parseFloat(stat.getAttribute('data-target'));
    const span = stat.querySelector('.stat-value');
    let current = 0;
    const update = () => {
      if(current < target) { current += Math.ceil(target/50); if(current>target) current=target; span.textContent = (target===10?current+'Gbps': target===256?current+'-bit': current+'%'); requestAnimationFrame(update); }
    };
    const observer = new IntersectionObserver(entries => { if(entries[0].isIntersecting) { update(); observer.disconnect(); } });
    observer.observe(stat);
  });
}

function initSkillProgressBars() {
  document.querySelectorAll('.progress').forEach(bar => {

    const finalWidth = bar.style.width; // get 95%, 90%, etc
    const textSpan = bar.querySelector('.progress-text');

    // start from 0
    bar.style.width = '0%';
    if (textSpan) textSpan.textContent = '0%';

    let current = 0;
    const target = parseInt(finalWidth);

    const animateText = () => {
      if (current < target) {
        current++;
        if (textSpan) textSpan.textContent = current + '%';
        requestAnimationFrame(animateText);
      }
    };

    ScrollTrigger.create({
      trigger: bar,
      start: 'top 85%',
      onEnter: () => {
        gsap.to(bar, {
          width: finalWidth,
          duration: 1,
          ease: "power2.out"
        });
        animateText();
      }
    });
  });
}

function initSkillChart() {
  const ctx = document.getElementById('skills-chart');
  if(!ctx) return;
  new Chart(ctx, {
    type: 'radar',
    data: { labels: ['Programming','Networking','Databases','Web Dev','SysAdmin','Security'], datasets: [{ label: 'Skill Level', data: [85,82,78,80,86,75], backgroundColor: 'rgba(0,242,255,0.2)', borderColor: '#00f2ff', pointBackgroundColor: '#00f2ff', pointBorderColor: '#050b14' }] },
    options: { scales: { r: { angleLines: { color: 'rgba(255,255,255,0.1)' }, grid: { color: 'rgba(255,255,255,0.1)' }, pointLabels: { color: '#eef5ff' }, ticks: { backdropColor: 'transparent', color: '#8aa9c9' } } }, plugins: { legend: { display: false } }, responsive: true, maintainAspectRatio: false }
  });
}

function initExpandButtons() {
  document.querySelectorAll('.expand-btn').forEach(btn => {
    const target = document.getElementById(btn.getAttribute('aria-controls'));
    if(!target) return;
    btn.setAttribute('aria-expanded','false');
    target.style.maxHeight = '0px';
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', !expanded);
      if(!expanded) { target.style.maxHeight = target.scrollHeight + 'px'; target.classList.add('expanded'); }
      else { target.style.maxHeight = '0px'; target.classList.remove('expanded'); }
    });
  });
}

function initProjectsFilterAndDetails() {
  // filter
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      cards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if(filter === 'all' || filter === cat) gsap.to(card, { opacity:1, scale:1, duration:0.2 });
        else gsap.to(card, { opacity:0.3, scale:0.95, duration:0.2 });
      });
    });
  });
  // view details toggle
  cards.forEach(card => {
    const detailsDiv = card.querySelector('.project-details');
    const existingBtn = card.querySelector('.view-details-btn');
    if(!detailsDiv) return;
    detailsDiv.style.display = 'none';
    if(!existingBtn) {
      const btn = document.createElement('button');
      btn.textContent = 'View Details';
      btn.classList.add('view-details-btn');
      card.querySelector('.project-content').appendChild(btn);
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if(detailsDiv.style.display === 'none') {
          detailsDiv.style.display = 'block';
          btn.textContent = 'Hide Details';
        } else {
          detailsDiv.style.display = 'none';
          btn.textContent = 'View Details';
        }
      });
    }
  });
}

function initMobileMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav-links');
  if(toggle && nav) {
    toggle.addEventListener('click', () => { nav.classList.toggle('active'); });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => nav.classList.remove('active')));
  }
}

function initScrollAnimations() {
  gsap.utils.toArray('.section-title').forEach(title => { gsap.from(title, { y:30, opacity:0, duration:0.5, scrollTrigger: { trigger:title, start:'top bottom-=100' } }); });
  gsap.utils.toArray('.project-card').forEach(card => { gsap.from(card, { y:40, opacity:0, duration:0.5, scrollTrigger: { trigger:card, start:'top bottom-=80' } }); });
}

function initScrollProgress() {
  window.addEventListener('scroll', () => { const winScroll = document.documentElement.scrollTop; const height = document.documentElement.scrollHeight - window.innerHeight; const scrolled = (winScroll / height) * 100; document.querySelector('.scroll-progress-bar').style.width = scrolled + '%';; });
}

function initCsProjectsToggle() {
  const btn = document.getElementById('toggleCsProjects');
  const content = document.getElementById('csProjectsContent');
  if(btn && content) {
    btn.addEventListener('click', () => {
      if(content.style.display === 'none') { content.style.display = 'block'; btn.innerHTML = '<i class="fas fa-chevron-up"></i>'; }
      else { content.style.display = 'none'; btn.innerHTML = '<i class="fas fa-chevron-down"></i>'; }
    });
  }
}