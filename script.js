let playlist = [];
let indexAtual = 0;
let tocando = false;

// Elementos do DOM
const player = document.getElementById('audio-player');
const cantorTxt = document.getElementById('nome-cantor');
const musicaTxt = document.getElementById('nome-musica');
const btnPlayPause = document.getElementById('btn-play-pause');
const iconPlay = document.getElementById('icon-play');
const equalizer = document.getElementById('equalizer');
const vinyl = document.getElementById('vinyl-record');
const listaProximas = document.getElementById('lista-proximas');

// Elementos da Barra de Progresso
const barraProgresso = document.getElementById('progress');
const tempoAtualTxt = document.getElementById('tempo-atual');
const tempoTotalTxt = document.getElementById('tempo-total');

// Início pausado
equalizer.classList.add('paused');

// 1. Carregar Playlist
fetch('playlist.php')
    .then(res => res.json())
    .then(dados => {
        playlist = dados;
        if(playlist.length > 0) {
            prepararMusica(0);
        } else {
            musicaTxt.innerText = "Sem Músicas";
            cantorTxt.innerText = "Adicione MP3 na pasta";
        }
    });

// 2. Prepara Música e a Lista de Próximas
function prepararMusica(index) {
    if (index >= playlist.length) index = 0; 
    indexAtual = index;
    player.src = playlist[indexAtual];

    // Formata o Nome da Música Atual
    let nomeArquivo = playlist[indexAtual].split('/').pop().replace('.mp3', '');
    let partes = nomeArquivo.split(' - ');

    if (partes.length >= 3) {
        cantorTxt.innerText = partes[1].trim();
        musicaTxt.innerText = partes[2].trim();
    } else {
        cantorTxt.innerText = "VaneKonex Ao Vivo";
        musicaTxt.innerText = nomeArquivo;
    }

    atualizarListaProximas();

    if (tocando) player.play();
}

// 3. Atualiza a lista lateral "A Seguir"
function atualizarListaProximas() {
    listaProximas.innerHTML = ''; // Limpa a lista
    
    // Pega as próximas 3 músicas
    for(let i = 1; i <= 3; i++) {
        let proximoIndex = indexAtual + i;
        if(proximoIndex >= playlist.length) proximoIndex -= playlist.length; // Faz o loop
        
        let nomeArq = playlist[proximoIndex].split('/').pop().replace('.mp3', '');
        let p = nomeArq.split(' - ');
        let textoLi = p.length >= 3 ? `<strong>${p[2].trim()}</strong><br><small>${p[1].trim()}</small>` : nomeArq;

        let li = document.createElement('li');
        li.innerHTML = textoLi;
        listaProximas.appendChild(li);
    }
}

// 4. Controle de Play / Pause
function togglePlay() {
    if (playlist.length === 0) return;

    if (tocando) {
        player.pause();
        iconPlay.classList.replace('fa-pause', 'fa-play');
        equalizer.classList.add('paused');
        vinyl.classList.remove('spinning'); // Pára o vinil
        tocando = false;
    } else {
        player.play();
        iconPlay.classList.replace('fa-play', 'fa-pause');
        equalizer.classList.remove('paused');
        vinyl.classList.add('spinning'); // Roda o vinil
        tocando = true;
    }
}

// 5. Atualiza a Barra de Progresso
player.addEventListener('timeupdate', () => {
    if(player.duration) {
        // Progresso em %
        const progresso = (player.currentTime / player.duration) * 100;
        barraProgresso.style.width = progresso + '%';

        // Formata os tempos (00:00)
        tempoAtualTxt.innerText = formatarTempo(player.currentTime);
        tempoTotalTxt.innerText = formatarTempo(player.duration);
    }
});

function formatarTempo(segundos) {
    let min = Math.floor(segundos / 60);
    let seg = Math.floor(segundos % 60);
    if(seg < 10) seg = '0' + seg;
    if(min < 10) min = '0' + min;
    return `${min}:${seg}`;
}

// 6. Avança faixa ao terminar
player.addEventListener('ended', () => {
    prepararMusica(indexAtual + 1);
});


// =============================================
// NOVAS FUNCIONALIDADES (sem alterar lógica acima)
// =============================================

// Volume Control
const volumeSlider = document.getElementById('volume-slider');
if (volumeSlider) {
    player.volume = volumeSlider.value / 100;
    volumeSlider.addEventListener('input', function() {
        player.volume = this.value / 100;
    });
}

// Scroll Reveal Animation
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

// Animated Counter
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-target'));
                const duration = 2000;
                const step = target / (duration / 16);
                let current = 0;

                const updateCounter = () => {
                    current += step;
                    if (current < target) {
                        counter.innerText = Math.floor(current).toLocaleString('pt-BR');
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.innerText = target.toLocaleString('pt-BR');
                    }
                };
                updateCounter();
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
}

// Typed Text Effect
function initTypedText() {
    const typedElement = document.getElementById('typed-text');
    if (!typedElement) return;

    const words = ['Online do Brasil!', 'para Você!', 'com Qualidade HD!', 'da sua Cidade!', '24 Horas no Ar!'];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
        const currentWord = words[wordIndex];

        if (isDeleting) {
            typedElement.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typedElement.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
        }

        let speed = isDeleting ? 50 : 100;

        if (!isDeleting && charIndex === currentWord.length) {
            speed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            speed = 500;
        }

        setTimeout(type, speed);
    }
    type();
}

// Floating Particles
function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    for (let i = 0; i < 80; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (4 + Math.random() * 4) + 's';
        if (Math.random() > 0.5) {
            particle.style.background = '#ff007f';
        }
        // Star-like particles
        if (Math.random() > 0.7) {
            particle.style.width = '2px';
            particle.style.height = '2px';
            particle.style.boxShadow = '0 0 6px 2px rgba(255, 255, 255, 0.8)';
            particle.style.background = '#fff';
        }
        container.appendChild(particle);
    }
}

// Sticky Header
function initStickyHeader() {
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Scroll to Top Button
function initScrollTop() {
    const scrollTopBtn = document.getElementById('scroll-top');
    if (!scrollTopBtn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Mobile Menu
function initMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    if (!menuBtn || !navLinks) return;

    menuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });
}

// Form Handlers
function initForms() {
    const formPedido = document.getElementById('form-pedido');
    if (formPedido) {
        formPedido.addEventListener('submit', function(e) {
            e.preventDefault();
            const nome = document.getElementById('pedido-nome').value;
            const musica = document.getElementById('pedido-musica').value;
            const artista = document.getElementById('pedido-artista').value;
            const msg = document.getElementById('pedido-msg').value;

            const whatsappMsg = `🎵 *Pedido Musical - VaneKonex*%0A%0A👤 Nome: ${encodeURIComponent(nome)}%0A🎶 Música: ${encodeURIComponent(musica)}%0A🎤 Artista: ${encodeURIComponent(artista)}%0A💬 Recado: ${encodeURIComponent(msg)}`;
            window.open(`https://wa.me/5511999999999?text=${whatsappMsg}`, '_blank');
            this.reset();
        });
    }

    const formContato = document.getElementById('form-contato');
    if (formContato) {
        formContato.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('✅ Mensagem enviada com sucesso! Entraremos em contato em breve.');
            this.reset();
        });
    }

    const formNewsletter = document.getElementById('form-newsletter');
    if (formNewsletter) {
        formNewsletter.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('✅ E-mail cadastrado! Você receberá nossas novidades.');
            this.reset();
        });
    }
}

// Smooth Scroll for nav links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// Star Field
function createStarField() {
    const container = document.getElementById('star-field');
    if (!container) return;
    for (let i = 0; i < 120; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        const size = 1 + Math.random() * 3;
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        star.style.animationDelay = Math.random() * 4 + 's';
        star.style.animationDuration = (2 + Math.random() * 3) + 's';
        container.appendChild(star);
    }
}

// Initialize all new features
document.addEventListener('DOMContentLoaded', () => {
    applyAdminConfig();
    initScrollReveal();
    animateCounters();
    initTypedText();
    createParticles();
    initStickyHeader();
    initScrollTop();
    initMobileMenu();
    initForms();
    initSmoothScroll();
    initCursorGlow();
    initAudioVisualizer();
    initListenerCounter();
    initSmokeEffect();
    createStarField();
});

// =============================================
// CURSOR GLOW TRAIL
// =============================================
function initCursorGlow() {
    const glow = document.getElementById('cursor-glow');
    if (!glow) return;

    // Only on desktop (no touch)
    if ('ontouchstart' in window) return;

    document.addEventListener('mousemove', (e) => {
        glow.classList.add('active');
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });

    document.addEventListener('mouseleave', () => {
        glow.classList.remove('active');
    });
}

// =============================================
// AUDIO VISUALIZER (Web Audio API)
// =============================================
// Shared audio analysis state (used by visualizer)
let sharedAudioContext = null;
let sharedAnalyser = null;
let sharedDataArray = null;
let sharedAudioConnected = false;

function setupSharedAudioContext() {
    if (sharedAudioConnected) return;
    try {
        sharedAudioContext = new (window.AudioContext || window.webkitAudioContext)();
        sharedAnalyser = sharedAudioContext.createAnalyser();
        sharedAnalyser.fftSize = 256;
        const bufferLength = sharedAnalyser.frequencyBinCount;
        sharedDataArray = new Uint8Array(bufferLength);

        const source = sharedAudioContext.createMediaElementSource(player);
        source.connect(sharedAnalyser);
        sharedAnalyser.connect(sharedAudioContext.destination);
        sharedAudioConnected = true;
    } catch (e) {
        sharedAudioConnected = false;
    }
}

function initAudioVisualizer() {
    const canvas = document.getElementById('audio-visualizer');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animId = null;

    function resizeCanvas() {
        const ratio = window.devicePixelRatio || 1;
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(ratio, ratio);
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function drawVisualizer() {
        animId = requestAnimationFrame(drawVisualizer);

        const w = canvas.offsetWidth;
        const h = canvas.offsetHeight;
        ctx.clearRect(0, 0, w, h);

        if (sharedAudioConnected && sharedAnalyser) {
            sharedAnalyser.getByteFrequencyData(sharedDataArray);
        }

        const barCount = 64;
        const barWidth = w / barCount;
        const gap = 2;

        for (let i = 0; i < barCount; i++) {
            let barHeight;
            if (sharedAudioConnected && sharedDataArray) {
                const index = Math.floor(i * (sharedDataArray.length / barCount));
                barHeight = (sharedDataArray[index] / 255) * h * 0.9;
            } else {
                // Idle animation when not connected
                barHeight = (Math.sin(Date.now() / 500 + i * 0.3) * 0.3 + 0.4) * h * 0.3;
                if (tocando) {
                    barHeight = (Math.sin(Date.now() / 200 + i * 0.5) * 0.4 + 0.5) * h * 0.5;
                }
            }

            const x = i * barWidth + gap / 2;
            const gradient = ctx.createLinearGradient(x, h, x, h - barHeight);
            gradient.addColorStop(0, 'rgba(255, 0, 127, 0.8)');
            gradient.addColorStop(0.5, 'rgba(0, 243, 255, 0.8)');
            gradient.addColorStop(1, 'rgba(108, 92, 231, 0.6)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.roundRect(x, h - barHeight, barWidth - gap, barHeight, 2);
            ctx.fill();

            // Glow effect
            ctx.shadowColor = 'rgba(0, 243, 255, 0.3)';
            ctx.shadowBlur = 5;
        }
        ctx.shadowBlur = 0;
    }

    drawVisualizer();

    // Connect audio when user first plays
    const origTogglePlay = window.togglePlay;
    if (origTogglePlay) {
        // We hook into player's play event to connect audio context
        player.addEventListener('play', function connectOnce() {
            setupSharedAudioContext();
            if (sharedAudioContext && sharedAudioContext.state === 'suspended') {
                sharedAudioContext.resume();
            }
        });
    }
}

// =============================================
// LIVE LISTENER COUNTER ANIMATION
// =============================================
function initListenerCounter() {
    const counterEl = document.getElementById('listener-count');
    if (!counterEl) return;

    // Starting listener count (simulated for demo purposes)
    const INITIAL_LISTENER_COUNT = 1247;
    let baseCount = INITIAL_LISTENER_COUNT;

    setInterval(() => {
        const change = Math.floor(Math.random() * 11) - 4; // -4 to +6
        baseCount = Math.max(800, Math.min(2000, baseCount + change));
        counterEl.textContent = baseCount.toLocaleString('pt-BR');
    }, 5000);
}

// =============================================
// SMOKE / FOG EFFECT
// =============================================
function initSmokeEffect() {
    const container = document.getElementById('smoke-container');
    if (!container) return;

    function createSmokePuff() {
        const puff = document.createElement('div');
        puff.classList.add('smoke-puff');
        const size = 80 + Math.random() * 200;
        puff.style.width = size + 'px';
        puff.style.height = size + 'px';
        puff.style.left = Math.random() * 100 + '%';
        puff.style.animationDuration = (6 + Math.random() * 6) + 's';
        puff.style.animationDelay = (Math.random() * 2) + 's';

        // Vary colors
        const rand = Math.random();
        if (rand > 0.6) {
            puff.style.background = 'radial-gradient(circle, rgba(255,0,127,0.07) 0%, rgba(0,243,255,0.03) 40%, transparent 70%)';
        } else if (rand > 0.3) {
            puff.style.background = 'radial-gradient(circle, rgba(108,92,231,0.06) 0%, rgba(0,243,255,0.03) 40%, transparent 70%)';
        }

        container.appendChild(puff);

        puff.addEventListener('animationend', () => {
            puff.remove();
        });
    }

    // Create initial puffs
    for (let i = 0; i < 15; i++) {
        setTimeout(() => createSmokePuff(), i * 600);
    }

    // Keep generating
    setInterval(createSmokePuff, 700);
}

// =============================================
// APPLY ADMIN CONFIGURATION FROM LOCALSTORAGE
// =============================================
function applyAdminConfig() {
    const saved = localStorage.getItem('webradio_config');
    if (!saved) return;

    let config;
    try {
        config = JSON.parse(saved);
    } catch (e) {
        return;
    }

    // Page title
    if (config.pageTitle) {
        document.title = config.pageTitle;
    }

    // Radio name in header
    if (config.radioName) {
        const logoH1 = document.querySelector('.logo h1');
        if (logoH1) {
            logoH1.textContent = config.radioName;
        }
    }

    // Logo
    if (config.logoUrl) {
        const logoIcon = document.querySelector('.logo .neon-icon');
        if (logoIcon) {
            const img = document.createElement('img');
            img.src = config.logoUrl;
            img.alt = config.radioName || 'Logo';
            img.style.height = '40px';
            img.style.width = 'auto';
            img.style.borderRadius = '8px';
            logoIcon.replaceWith(img);
        }
    }

    // Hero description
    if (config.radioSlogan) {
        const heroDesc = document.querySelector('.hero-desc');
        if (heroDesc) {
            heroDesc.textContent = config.radioSlogan;
        }
    }

    // About section
    if (config.aboutText) {
        const sobreTexto = document.querySelector('.sobre-texto p');
        if (sobreTexto) {
            sobreTexto.textContent = config.aboutText;
        }
    }

    // Footer copyright
    if (config.footerText) {
        const footerCopyright = document.getElementById('footer-copyright');
        if (footerCopyright) {
            footerCopyright.textContent = config.footerText;
        }
    }

    // Footer radio name
    if (config.radioName) {
        const footerTitle = document.querySelector('.footer-col h4');
        if (footerTitle) {
            footerTitle.innerHTML = '<i class="fa-solid fa-tower-broadcast"></i> ' + escapeHtmlConfig(config.radioName);
        }
    }

    // Contact info
    const contactItems = document.querySelectorAll('.contato-item');
    if (contactItems.length >= 4) {
        if (config.phone) {
            contactItems[0].querySelector('p').textContent = config.phone;
        }
        if (config.whatsapp) {
            contactItems[1].querySelector('p').textContent = config.whatsapp;
        }
        if (config.email) {
            contactItems[2].querySelector('p').textContent = config.email;
        }
        if (config.address) {
            contactItems[3].querySelector('p').textContent = config.address;
        }
    }

    // Social links - header
    const headerSocials = document.querySelectorAll('.social-icons a');
    const socialMap = {
        0: config.instagram,
        1: config.whatsappLink,
        2: config.facebook,
        3: config.youtube,
        4: config.tiktok
    };
    headerSocials.forEach((link, index) => {
        if (socialMap[index]) {
            link.href = socialMap[index];
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
        }
    });

    // Social links - contact section
    const contactSocials = document.querySelectorAll('.contato-socials a');
    const contactSocialMap = {
        0: config.instagram,
        1: config.facebook,
        2: config.youtube,
        3: config.twitter,
        4: config.tiktok
    };
    contactSocials.forEach((link, index) => {
        if (contactSocialMap[index]) {
            link.href = contactSocialMap[index];
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
        }
    });

    // Colors
    if (config.colorPrimary) {
        document.documentElement.style.setProperty('--neon-cyan', config.colorPrimary);
    }
    if (config.colorSecondary) {
        document.documentElement.style.setProperty('--neon-magenta', config.colorSecondary);
    }
    if (config.colorBg) {
        document.documentElement.style.setProperty('--bg-color', config.colorBg);
    }

    // Programs
    if (config.programs && config.programs.length > 0) {
        const grid = document.querySelector('.programacao-grid');
        if (grid) {
            grid.innerHTML = '';
            config.programs.forEach((prog, index) => {
                const card = document.createElement('div');
                card.className = 'programa-card' + (index === 0 ? ' active-program' : '');
                card.innerHTML =
                    '<div class="programa-horario">' + escapeHtmlConfig(prog.time) + '</div>' +
                    '<div class="programa-icon"><i class="fa-solid fa-' + escapeHtmlConfig(prog.icon || 'music') + '"></i></div>' +
                    '<h4>' + escapeHtmlConfig(prog.name) + '</h4>' +
                    '<p>' + escapeHtmlConfig(prog.desc) + '</p>' +
                    '<span class="programa-dj"><i class="fa-solid fa-microphone"></i> ' + escapeHtmlConfig(prog.dj) + '</span>' +
                    (index === 0 ? '<span class="programa-badge ao-vivo-badge">NO AR</span>' : '');
                grid.appendChild(card);
            });
        }

        // Update footer programs list
        const footerPrograms = document.querySelectorAll('.footer-col')[2];
        if (footerPrograms) {
            const ul = footerPrograms.querySelector('ul');
            if (ul) {
                ul.innerHTML = '';
                config.programs.slice(0, 4).forEach(prog => {
                    const li = document.createElement('li');
                    li.innerHTML = '<a href="#programacao">' + escapeHtmlConfig(prog.name) + '</a>';
                    ul.appendChild(li);
                });
            }
        }
    }

    // Stream URL - override playlist loading
    if (config.streamUrl) {
        applyStreamUrl(config.streamUrl);
    }

    // WhatsApp number for music requests
    if (config.whatsappNumber) {
        applyWhatsAppNumber(config.whatsappNumber);
    }
}

function escapeHtmlConfig(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

function applyStreamUrl(url) {
    // Validate URL protocol
    try {
        const parsed = new URL(url);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return;
    } catch (e) {
        return;
    }

    // Override the player to use stream instead of local files
    const audioPlayer = document.getElementById('audio-player');
    if (!audioPlayer) return;

    audioPlayer.src = url;
    const musicaEl = document.getElementById('nome-musica');
    const cantorEl = document.getElementById('nome-cantor');
    if (musicaEl) musicaEl.textContent = 'Rádio Ao Vivo';
    if (cantorEl) cantorEl.textContent = 'Transmissão em Tempo Real';

    // Hide next songs list since we're streaming
    const nextList = document.getElementById('lista-proximas');
    if (nextList) {
        nextList.innerHTML = '<li>Transmissão ao vivo</li>';
    }
}

function applyWhatsAppNumber(number) {
    const formPedido = document.getElementById('form-pedido');
    if (!formPedido) return;

    // Remove existing handler and add new one
    const newForm = formPedido.cloneNode(true);
    formPedido.parentNode.replaceChild(newForm, formPedido);

    newForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const nome = document.getElementById('pedido-nome').value;
        const musica = document.getElementById('pedido-musica').value;
        const artista = document.getElementById('pedido-artista').value;
        const msg = document.getElementById('pedido-msg').value;
        const config = JSON.parse(localStorage.getItem('webradio_config') || '{}');
        const radioName = config.radioName || 'Web Rádio';

        const whatsappMsg = '🎵 *Pedido Musical - ' + encodeURIComponent(radioName) + '*%0A%0A👤 Nome: ' + encodeURIComponent(nome) + '%0A🎶 Música: ' + encodeURIComponent(musica) + '%0A🎤 Artista: ' + encodeURIComponent(artista) + '%0A💬 Recado: ' + encodeURIComponent(msg);
        window.open('https://wa.me/' + number + '?text=' + whatsappMsg, '_blank');
        this.reset();
    });
}