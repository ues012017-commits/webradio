// =============================================
// PODCAST PAGE - JavaScript
// =============================================

const PODCAST_STORAGE_KEY = 'vanekonex_podcasts';
const ADMIN_PASSWORD = 'konex2026';

// ---- Utility: sanitize text for safe display ----
function sanitizeText(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

// ---- Utility: extract embed URL from video URL ----
function getEmbedUrl(url) {
    // YouTube
    let match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
    if (match) return 'https://www.youtube.com/embed/' + match[1];

    // Vimeo
    match = url.match(/vimeo\.com\/(\d+)/);
    if (match) return 'https://player.vimeo.com/video/' + match[1];

    // Dailymotion
    match = url.match(/dailymotion\.com\/video\/([\w]+)/);
    if (match) return 'https://www.dailymotion.com/embed/video/' + match[1];

    // Already an embed URL or other
    return url;
}

// ---- Utility: validate URL ----
function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'https:' || url.protocol === 'http:';
    } catch (_) {
        return false;
    }
}

// ---- Data: Load / Save podcasts ----
function loadPodcasts() {
    try {
        const data = localStorage.getItem(PODCAST_STORAGE_KEY);
        return data ? JSON.parse(data) : getDefaultPodcasts();
    } catch (e) {
        return getDefaultPodcasts();
    }
}

function savePodcasts(podcasts) {
    localStorage.setItem(PODCAST_STORAGE_KEY, JSON.stringify(podcasts));
}

function getDefaultPodcasts() {
    return [
        {
            id: 1,
            title: 'VaneKonex Podcast #1 - O Futuro da Música Digital',
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            description: 'Discutimos as tendências da música digital e o impacto da IA na indústria musical.',
            category: 'Tecnologia',
            date: '2026-03-15'
        },
        {
            id: 2,
            title: 'VaneKonex Podcast #2 - Entrevista com DJ Alok',
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            description: 'Uma conversa exclusiva com DJ Alok sobre carreira, inspirações e projetos futuros.',
            category: 'Entrevista',
            date: '2026-03-22'
        },
        {
            id: 3,
            title: 'VaneKonex Podcast #3 - Bastidores da Rádio',
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            description: 'Conheça os bastidores da VaneKonex e como funciona uma rádio online moderna.',
            category: 'Bastidores',
            date: '2026-03-29'
        },
        {
            id: 4,
            title: 'VaneKonex Podcast #4 - Top Hits da Semana',
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            description: 'Análise dos maiores hits da semana e as músicas mais pedidas pelos ouvintes.',
            category: 'Música',
            date: '2026-04-01'
        }
    ];
}

// ---- Render: Podcast Grid ----
function renderPodcastGrid() {
    const grid = document.getElementById('podcast-grid');
    const empty = document.getElementById('podcast-empty');
    const countEl = document.getElementById('podcast-ep-count');
    const podcasts = loadPodcasts();

    if (countEl) countEl.textContent = podcasts.length;

    if (!grid) return;

    if (podcasts.length === 0) {
        grid.innerHTML = '';
        if (empty) empty.style.display = 'flex';
        return;
    }
    if (empty) empty.style.display = 'none';

    grid.innerHTML = podcasts.map((ep, idx) => {
        const embedUrl = sanitizeText(getEmbedUrl(ep.url));
        const safeTitle = sanitizeText(ep.title);
        const safeDesc = sanitizeText(ep.description || '');
        const safeCat = sanitizeText(ep.category || 'Geral');
        const safeDate = sanitizeText(ep.date || '');
        const categoryColors = {
            'Geral': '#00f3ff',
            'Música': '#ff007f',
            'Tecnologia': '#6c5ce7',
            'Entrevista': '#ffe66d',
            'Bastidores': '#4ecdc4'
        };
        const catColor = categoryColors[ep.category] || '#00f3ff';

        return `
        <div class="podcast-card scroll-reveal" style="animation-delay: ${idx * 0.1}s">
            <div class="podcast-video-wrap">
                <iframe
                    src="${embedUrl}"
                    title="${safeTitle}"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                    loading="lazy"
                ></iframe>
                <div class="podcast-card-badge" style="background: ${catColor}">${safeCat}</div>
            </div>
            <div class="podcast-card-info">
                <h3>${safeTitle}</h3>
                <p>${safeDesc}</p>
                <div class="podcast-card-meta">
                    <span><i class="fa-regular fa-calendar"></i> ${safeDate}</span>
                    <span><i class="fa-solid fa-podcast"></i> Episódio ${idx + 1}</span>
                </div>
            </div>
        </div>`;
    }).join('');

    // Re-init scroll reveal for new cards
    initScrollReveal();
}

// ---- Admin: Episode list in admin panel ----
function renderAdminList() {
    const list = document.getElementById('admin-ep-list');
    if (!list) return;
    const podcasts = loadPodcasts();

    if (podcasts.length === 0) {
        list.innerHTML = '<p class="admin-no-eps">Nenhum episódio cadastrado.</p>';
        return;
    }

    list.innerHTML = podcasts.map(ep => {
        const safeTitle = sanitizeText(ep.title);
        const safeCat = sanitizeText(ep.category || 'Geral');
        return `
        <div class="admin-ep-item">
            <div class="admin-ep-info">
                <strong>${safeTitle}</strong>
                <small>${safeCat} &bull; ${sanitizeText(ep.date || '')}</small>
            </div>
            <div class="admin-ep-actions">
                <button class="btn-icon btn-danger" data-delete-id="${ep.id}" title="Remover">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>`;
    }).join('');

    // Bind delete buttons
    list.querySelectorAll('[data-delete-id]').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-delete-id'), 10);
            deletePodcast(id);
        });
    });
}

function deletePodcast(id) {
    let podcasts = loadPodcasts();
    podcasts = podcasts.filter(ep => ep.id !== id);
    savePodcasts(podcasts);
    renderPodcastGrid();
    renderAdminList();
}

function addPodcast(title, url, desc, category) {
    const podcasts = loadPodcasts();
    const newId = podcasts.length > 0 ? Math.max(...podcasts.map(p => p.id)) + 1 : 1;
    const today = new Date().toISOString().slice(0, 10);
    podcasts.push({
        id: newId,
        title: title,
        url: url,
        description: desc,
        category: category,
        date: today
    });
    savePodcasts(podcasts);
    renderPodcastGrid();
    renderAdminList();
}

// ---- Admin: Auth ----
function initAdmin() {
    const authPanel = document.getElementById('admin-auth');
    const contentPanel = document.getElementById('admin-content');
    const loginBtn = document.getElementById('admin-login-btn');
    const logoutBtn = document.getElementById('admin-logout-btn');
    const pwdInput = document.getElementById('admin-password');
    const addBtn = document.getElementById('ep-add-btn');

    if (!authPanel || !contentPanel) return;

    loginBtn.addEventListener('click', () => {
        if (pwdInput.value === ADMIN_PASSWORD) {
            authPanel.style.display = 'none';
            contentPanel.style.display = 'block';
            renderAdminList();
        } else {
            pwdInput.classList.add('input-error');
            pwdInput.value = '';
            pwdInput.placeholder = 'Senha incorreta!';
            setTimeout(() => {
                pwdInput.classList.remove('input-error');
                pwdInput.placeholder = 'Senha do admin';
            }, 2000);
        }
    });

    pwdInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') loginBtn.click();
    });

    logoutBtn.addEventListener('click', () => {
        authPanel.style.display = '';
        contentPanel.style.display = 'none';
        pwdInput.value = '';
    });

    addBtn.addEventListener('click', () => {
        const title = document.getElementById('ep-title').value.trim();
        const url = document.getElementById('ep-url').value.trim();
        const desc = document.getElementById('ep-desc').value.trim();
        const category = document.getElementById('ep-category').value;

        if (!title || !url) {
            alert('Preencha o título e a URL do vídeo.');
            return;
        }
        if (!isValidUrl(url)) {
            alert('URL inválida. Use uma URL válida (ex: https://youtube.com/watch?v=...)');
            return;
        }

        addPodcast(title, url, desc, category);

        document.getElementById('ep-title').value = '';
        document.getElementById('ep-url').value = '';
        document.getElementById('ep-desc').value = '';
        document.getElementById('ep-category').value = 'Geral';
    });
}

// ---- Shared UI: Scroll Reveal ----
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.scroll-reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, { threshold: 0.1 });
    revealElements.forEach(el => observer.observe(el));
}

// ---- Shared UI: Particles ----
function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (4 + Math.random() * 4) + 's';
        if (Math.random() > 0.5) particle.style.background = '#ff007f';
        container.appendChild(particle);
    }
}

// ---- Shared UI: Sticky Header ----
function initStickyHeader() {
    const header = document.querySelector('header');
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                if (window.scrollY > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
                ticking = false;
            });
            ticking = true;
        }
    });
}

// ---- Shared UI: Scroll Top ----
function initScrollTop() {
    const btn = document.getElementById('scroll-top');
    if (!btn) return;
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                if (window.scrollY > 500) btn.classList.add('visible');
                else btn.classList.remove('visible');
                ticking = false;
            });
            ticking = true;
        }
    });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ---- Shared UI: Mobile Menu ----
function initMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    if (!menuBtn || !navLinks) return;
    menuBtn.addEventListener('click', () => navLinks.classList.toggle('active'));
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => navLinks.classList.remove('active'));
    });
}

// ---- Shared UI: Cursor Glow ----
function initCursorGlow() {
    const glow = document.getElementById('cursor-glow');
    if (!glow || 'ontouchstart' in window) return;
    const halfW = glow.offsetWidth / 2;
    const halfH = glow.offsetHeight / 2;
    document.addEventListener('mousemove', (e) => {
        glow.classList.add('active');
        glow.style.transform = 'translate(' + (e.clientX - halfW) + 'px, ' + (e.clientY - halfH) + 'px)';
    });
    document.addEventListener('mouseleave', () => glow.classList.remove('active'));
}

// ---- Shared UI: Smoke ----
function initSmokeEffect() {
    const container = document.getElementById('smoke-container');
    if (!container) return;
    function createSmokePuff() {
        const puff = document.createElement('div');
        puff.classList.add('smoke-puff');
        const size = 60 + Math.random() * 120;
        puff.style.width = size + 'px';
        puff.style.height = size + 'px';
        puff.style.left = Math.random() * 100 + '%';
        puff.style.animationDuration = (6 + Math.random() * 6) + 's';
        puff.style.animationDelay = (Math.random() * 2) + 's';
        const rand = Math.random();
        if (rand > 0.6) {
            puff.style.background = 'radial-gradient(circle, rgba(255,0,127,0.07) 0%, rgba(0,243,255,0.03) 40%, transparent 70%)';
        } else if (rand > 0.3) {
            puff.style.background = 'radial-gradient(circle, rgba(108,92,231,0.06) 0%, rgba(0,243,255,0.03) 40%, transparent 70%)';
        }
        container.appendChild(puff);
        puff.addEventListener('animationend', () => puff.remove());
    }
    for (let i = 0; i < 8; i++) setTimeout(() => createSmokePuff(), i * 600);
    setInterval(createSmokePuff, 1200);
}

// ---- Shared UI: Newsletter form ----
function initForms() {
    const formNewsletter = document.getElementById('form-newsletter');
    if (formNewsletter) {
        formNewsletter.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('✅ E-mail cadastrado! Você receberá nossas novidades.');
            this.reset();
        });
    }
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
    renderPodcastGrid();
    initAdmin();
    initScrollReveal();
    createParticles();
    initStickyHeader();
    initScrollTop();
    initMobileMenu();
    initCursorGlow();
    initSmokeEffect();
    initForms();
});