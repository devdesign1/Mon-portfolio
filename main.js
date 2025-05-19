// Configuration de la scène Three.js avec optimisations
let scene, camera, renderer, particles, wave, stars;
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;
let time = 0;
let starPositions = [];
let starVelocities = [];
let raycaster, mouse;
let particleSystem;
let isAnimating = true;

// Optimisation du curseur personnalisé avec requestAnimationFrame
const cursor = document.querySelector('.cursor');
const cursorFollower = document.querySelector('.cursor-follower');
let animationFrameId;

function updateCursor() {
    if (!isAnimating) return;
    
    targetX += (mouseX - targetX) * 0.1;
    targetY += (mouseY - targetY) * 0.1;
    
    cursorFollower.style.transform = `translate(${targetX}px, ${targetY}px)`;
    cursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    
    animationFrameId = requestAnimationFrame(updateCursor);
}

// Gestion optimisée des événements
const handleMouseMove = (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
};

document.addEventListener('mousemove', handleMouseMove, { passive: true });

// Optimisation des effets de hover
const handleHover = (element) => {
    element.addEventListener('mouseenter', () => {
        cursor.style.transform = 'scale(1.5)';
        cursorFollower.style.transform = 'scale(1.5)';
    }, { passive: true });
    
    element.addEventListener('mouseleave', () => {
        cursor.style.transform = 'scale(1)';
        cursorFollower.style.transform = 'scale(1)';
    }, { passive: true });
};

document.querySelectorAll('a, button').forEach(handleHover);

// Loader optimisé
document.addEventListener('DOMContentLoaded', () => {
    const percentage = document.querySelector('.percentage');
    const vortex = document.querySelector('.vortex');

    if (!percentage || !vortex) {
        console.error('Éléments du loader introuvables !');
        return;
    }

    const loaderTimeline = gsap.timeline({
        onUpdate: function() {
            const progress = Math.floor(this.progress() * 100);
            percentage.textContent = `${progress}%`;
            vortex.style.filter = `
                hue-rotate(${progress * 3.6}deg) 
                blur(${5 - (progress * 0.05)}px)
            `;
        },
        onComplete: () => {
            gsap.to("#loader", {
                opacity: 0,
                duration: 0.8,
                ease: "power4.inOut",
                onComplete: () => {
                    document.getElementById("loader").style.display = "none";
                    startAnimations();
                }
            });
        }
    });

    loaderTimeline.to("#loader", {
        duration: 3,
        ease: "sine.inOut"
    });
});

// Header visibility
const headerObserver = new IntersectionObserver(([entry]) => {
    document.getElementById('main-header').classList.toggle('visible', !entry.isIntersecting);
}, {
    threshold: 0.1,
    rootMargin: '-80px 0px 0px 0px'
});

headerObserver.observe(document.getElementById('hero'));

function initThree() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    renderer = new THREE.WebGLRenderer({ 
        canvas: document.getElementById('bg'),
        antialias: true,
        powerPreference: "low-power",
        alpha: true
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000022, 0.8);

    // Optimisation des vagues
    const waveGeometry = new THREE.PlaneGeometry(40, 40, 50, 50); // Réduit la complexité
    const waveMaterial = new THREE.MeshStandardMaterial({
        color: 0x4488ff,
        metalness: 0.9,
        roughness: 0.1,
        wireframe: true,
        transparent: true,
        opacity: 0.4
    });

    wave = new THREE.Mesh(waveGeometry, waveMaterial);
    scene.add(wave);

    // Optimisation des étoiles
    const starsCount = 1000; // Réduit le nombre d'étoiles
    const starsGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starsCount * 3);
    const colors = new Float32Array(starsCount * 3);
    const sizes = new Float32Array(starsCount);

    for(let i = 0; i < starsCount; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * 100;
        positions[i3 + 1] = (Math.random() - 0.5) * 100;
        positions[i3 + 2] = (Math.random() - 0.5) * 100;

        colors[i3] = 0.8 + Math.random() * 0.2;
        colors[i3 + 1] = 0.8 + Math.random() * 0.2;
        colors[i3 + 2] = 0.9 + Math.random() * 0.1;

        sizes[i] = Math.random() * 0.3;
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    starsGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const starsMaterial = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    });

    stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // Optimisation des lumières
    const ambientLight = new THREE.AmbientLight(0x000033, 0.3);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x4488ff, 0.8);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    camera.position.z = 15;

    // Animation optimisée
    function animate() {
        if (!isAnimating) return;
        
        requestAnimationFrame(animate);
        time += 0.015;

        // Animation des vagues optimisée
        const positions = waveGeometry.attributes.position.array;
        for(let i = 0; i < positions.length; i += 3) {
            positions[i + 2] = Math.sin(time + positions[i] * 0.5) * 1.5;
        }
        waveGeometry.attributes.position.needsUpdate = true;

        // Animation des étoiles optimisée
        stars.rotation.y = time * 0.03;
        stars.rotation.x = Math.sin(time * 0.5) * 0.05;

        // Animation de la vague optimisée
        wave.rotation.z = time * 0.05;
        waveMaterial.color.setHSL((Math.sin(time) + 1) / 2, 0.8, 0.5);

        // Animation de la lumière optimisée
        pointLight.position.x = Math.sin(time) * 8;
        pointLight.position.z = Math.cos(time) * 8;

        renderer.render(scene, camera);
    }

    // Gestion optimisée du redimensionnement
    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    
    // Démarrer l'animation
    animate();
}

// Fonction pour démarrer les animations
function startAnimations() {
    isAnimating = true;
    updateCursor();
    initThree();
}

// Fonction pour arrêter les animations
function stopAnimations() {
    isAnimating = false;
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
}

// Gestion de la visibilité de la page
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        stopAnimations();
    } else {
        startAnimations();
    }
});

// Menu mobile
const btn = document.getElementById('mobile-menu-btn');
const menu = document.getElementById('mobile-menu');
btn.addEventListener('click', () => {
    menu.classList.toggle('hidden');
});

// Gestion des onglets projets
function initProjectTabs() {
    const tabPerso = document.getElementById('tabPerso');
    const tabPro = document.getElementById('tabPro');
    const projectsPerso = document.getElementById('projectsPerso');
    const projectsPro = document.getElementById('projectsPro');

    if (!tabPerso || !tabPro || !projectsPerso || !projectsPro) return;

    tabPerso.addEventListener('click', function() {
        projectsPerso.classList.remove('hidden');
        projectsPro.classList.add('hidden');
        tabPerso.classList.add('bg-purple-900/30', 'text-pink-300');
        tabPerso.classList.remove('bg-transparent', 'text-purple-300');
        tabPro.classList.remove('bg-purple-900/30', 'text-pink-300');
        tabPro.classList.add('bg-transparent', 'text-purple-300');
        
        gsap.to('.projects-container', {
            duration: 0.5,
            opacity: 0,
            y: 20,
            onComplete: () => {
                gsap.to('.projects-container', {
                    duration: 0.5,
                    opacity: 1,
                    y: 0
                });
            }
        });
    });

    tabPro.addEventListener('click', function() {
        projectsPerso.classList.add('hidden');
        projectsPro.classList.remove('hidden');
        tabPro.classList.add('bg-purple-900/30', 'text-pink-300');
        tabPro.classList.remove('bg-transparent', 'text-purple-300');
        tabPerso.classList.remove('bg-purple-900/30', 'text-pink-300');
        tabPerso.classList.add('bg-transparent', 'text-purple-300');
        
        gsap.to('.projects-container', {
            duration: 0.5,
            opacity: 0,
            y: 20,
            onComplete: () => {
                gsap.to('.projects-container', {
                    duration: 0.5,
                    opacity: 1,
                    y: 0
                });
            }
        });
    });
}

// Animation des cartes de projets
function initProjectCardsAnimation() {
    gsap.registerPlugin(ScrollTrigger);
    
    document.querySelectorAll('.project-card').forEach(card => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: "top 80%",
                toggleActions: "play none none none"
            },
            opacity: 0,
            y: 50,
            duration: 1,
            ease: "power4.out"
        });
    });
}

// Gestion du bouton de retour en haut
function initScrollToTop() {
    const scrollBtn = document.getElementById('scrollToTopBtn');
    if (!scrollBtn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollBtn.classList.remove('hidden');
        } else {
            scrollBtn.classList.add('hidden');
        }
    });

    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Animation des barres de compétences
function initSkillBarsHover() {
    document.querySelectorAll('.skill-bar').forEach(bar => {
        const percent = parseInt(bar.getAttribute('data-percent'), 10);
        const card = bar.closest('.group');
        const textElement = bar.parentElement.querySelector('.skill-bar-text');
        
        if (!card || !textElement) return;

        // Initialiser la barre à 0
        bar.style.width = '0%';
        textElement.textContent = '0%';

        card.addEventListener('mouseenter', () => {
            gsap.to(bar, {
                width: `${percent}%`,
                duration: 1,
                ease: "power2.out"
            });
            gsap.to(textElement, {
                textContent: `${percent}%`,
                duration: 1,
                snap: { textContent: 1 },
                ease: "power2.out"
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(bar, {
                width: '0%',
                duration: 0.5,
                ease: "power2.in"
            });
            gsap.to(textElement, {
                textContent: '0%',
                duration: 0.5,
                snap: { textContent: 1 },
                ease: "power2.in"
            });
        });
    });
}

// Hero Section Animations
function initHeroAnimations() {
    const heroText = document.querySelector('.hero-text');
    const nom = document.querySelector('.nom');
    const subtitle = document.querySelector('.subtitle');
    const ctaButtons = document.querySelectorAll('.cta-btn');

    // Initial animation sequence
    gsap.from(heroText, {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: "power3.out"
    });

    gsap.from(nom, {
        opacity: 0,
        scale: 0.8,
        duration: 1.2,
        delay: 0.3,
        ease: "back.out(1.7)"
    });

    gsap.from(subtitle, {
        opacity: 0,
        y: 30,
        duration: 1,
        delay: 0.6,
        ease: "power2.out"
    });

    gsap.from(ctaButtons, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.9,
        stagger: 0.2,
        ease: "power2.out"
    });

    // Scroll-triggered animations
    gsap.to(heroText, {
        scrollTrigger: {
            trigger: heroText,
            start: "top top",
            end: "bottom top",
            scrub: 1
        },
        y: -100,
        opacity: 0
    });
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    initThree();
    initHeroAnimations();
    initProjectCardsAnimation();
    initProjectTabs();
    initScrollToTop();
    initSkillBarsHover();
}); 