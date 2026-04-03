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
function updateOnAirBadge(playing) {
    const badge = document.getElementById('now-playing-badge');
    const dot = document.getElementById('player-live-dot');
    const text = document.getElementById('player-live-text');
    const ring = document.getElementById('player-pulse-ring');
    if (!badge) return;
    if (playing) {
        badge.classList.remove('standby');
        if (text) text.textContent = 'AO VIVO';
        if (dot) dot.style.display = 'inline-block';
        if (ring) ring.style.display = 'block';
    } else {
        badge.classList.add('standby');
        if (text) text.textContent = 'AGUARDANDO';
        if (dot) dot.style.display = 'none';
        if (ring) ring.style.display = 'none';
    }
}

function togglePlay() {
    if (playlist.length === 0) return;

    if (tocando) {
        player.pause();
        iconPlay.classList.replace('fa-pause', 'fa-play');
        equalizer.classList.add('paused');
        vinyl.classList.remove('spinning'); // Pára o vinil
        tocando = false;
        updateOnAirBadge(false);
    } else {
        player.play();
        iconPlay.classList.replace('fa-play', 'fa-pause');
        equalizer.classList.remove('paused');
        vinyl.classList.add('spinning'); // Roda o vinil
        tocando = true;
        updateOnAirBadge(true);
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

    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (4 + Math.random() * 4) + 's';
        if (Math.random() > 0.5) {
            particle.style.background = '#ff007f';
        }
        container.appendChild(particle);
    }
}

// Sticky Header
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

// Scroll to Top Button
function initScrollTop() {
    const scrollTopBtn = document.getElementById('scroll-top');
    if (!scrollTopBtn) return;

    let scrollTicking = false;
    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            requestAnimationFrame(() => {
                if (window.scrollY > 500) {
                    scrollTopBtn.classList.add('visible');
                } else {
                    scrollTopBtn.classList.remove('visible');
                }
                scrollTicking = false;
            });
            scrollTicking = true;
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

// Chatbot
function initChatbot() {
    const toggle = document.getElementById('chatbot-toggle');
    const container = document.getElementById('chatbot-container');
    const closeBtn = document.getElementById('chatbot-close');
    const inputField = document.getElementById('chatbot-input-field');
    const sendBtn = document.getElementById('chatbot-send');
    const messagesContainer = document.getElementById('chatbot-messages');
    const notification = document.querySelector('.chat-notification');

    if (!toggle || !container) return;

    toggle.addEventListener('click', () => {
        container.classList.toggle('active');
        if (container.classList.contains('active') && notification) {
            notification.style.display = 'none';
        }
    });

    closeBtn.addEventListener('click', () => {
        container.classList.remove('active');
    });

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    function addMessage(text, isUser) {
        const msg = document.createElement('div');
        msg.className = 'chat-message ' + (isUser ? 'user-message' : 'bot-message');

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = '<i class="fa-solid fa-' + (isUser ? 'user' : 'robot') + '"></i>';

        const content = document.createElement('div');
        content.className = 'message-content';
        const p = document.createElement('p');

        if (isUser) {
            p.textContent = text;
        } else {
            p.innerHTML = text;
        }

        content.appendChild(p);
        msg.appendChild(avatar);
        msg.appendChild(content);
        messagesContainer.appendChild(msg);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function showTyping() {
        const typing = document.createElement('div');
        typing.className = 'chat-message bot-message typing-msg';
        typing.innerHTML = `
            <div class="message-avatar"><i class="fa-solid fa-robot"></i></div>
            <div class="message-content"><div class="typing-indicator"><span></span><span></span><span></span></div></div>
        `;
        messagesContainer.appendChild(typing);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return typing;
    }

    function getBotResponse(message) {
        const msg = message.toLowerCase().trim();

        if (msg.includes('programação') || msg.includes('programa')) {
            return '📻 Nossa programação é incrível! Temos:\n\n🌅 06h-09h: Bom Dia VaneKonex\n🎵 09h-12h: Manhã Musical\n🍽️ 12h-14h: Hora do Almoço\n⚡ 14h-17h: Tarde Elétrica\n🎸 17h-20h: Sertanejo & Forró\n🌙 20h-00h: Noite VaneKonex\n\nQual programa você mais curte? 😊';
        }
        if (msg.includes('pedir') || msg.includes('música') || msg.includes('musica') || msg.includes('pedido')) {
            return '🎵 Para pedir sua música, você pode:\n\n1️⃣ Usar o formulário "Peça Sua Música" na página\n2️⃣ Mandar mensagem no WhatsApp: (11) 99999-9999\n3️⃣ Me dizer aqui o nome da música e artista!\n\nQual música você quer ouvir? 🎶';
        }
        if (msg.includes('promoção') || msg.includes('promoções') || msg.includes('promo')) {
            return '🎁 Temos promoções incríveis!\n\n🎫 Concorra a ingressos para shows\n📱 Ganhe um celular novo\n🎧 Kits de fones premium\n\nPara participar, ouça a rádio e fique ligado nos programas! A senha da promoção pode ser dita a qualquer momento! 🤩';
        }
        if (msg.includes('contato') || msg.includes('telefone') || msg.includes('whatsapp')) {
            return '📞 Nossos contatos:\n\n📱 WhatsApp: (11) 99999-9999\n📧 E-mail: contato@vanekonex.com.br\n📸 Instagram: @vanekonex\n📍 Rua da Música, 123 - Centro\n\nEstamos sempre disponíveis para você! 💙';
        }
        if (msg.includes('olá') || msg.includes('oi') || msg.includes('hey') || msg.includes('eae') || msg.includes('bom dia') || msg.includes('boa tarde') || msg.includes('boa noite')) {
            return 'Olá! 😄 Que bom ter você aqui na VaneKonex! Como posso te ajudar? Posso falar sobre:\n\n📻 Programação\n🎵 Pedidos musicais\n🎁 Promoções\n📞 Contato\n\nÉ só perguntar! 🎧';
        }
        if (msg.includes('app') || msg.includes('aplicativo') || msg.includes('download')) {
            return '📱 Nosso app está quase pronto! Em breve você poderá baixar na Google Play e App Store. Fique ligado nas nossas redes sociais para ser o primeiro a saber! 🚀';
        }
        if (msg.includes('locutor') || msg.includes('dj') || msg.includes('equipe')) {
            return '🎙️ Nossa equipe de DJs é sensacional!\n\n👨‍🎤 DJ Carlos - Bom Dia VaneKonex\n👩‍🎤 DJ Ana - Manhã Musical\n🎤 DJ Roberto - Hora do Almoço\n🎧 DJ Max - Tarde Elétrica\n👩‍🎤 DJ Paula - Sertanejo & Forró\n🎤 DJ Léo - Noite VaneKonex\n\nTodos super talentosos! 🌟';
        }
        if (msg.includes('obrigado') || msg.includes('valeu') || msg.includes('thanks')) {
            return 'Por nada! 😊 Estou sempre aqui para ajudar. Curta a VaneKonex e não esqueça de compartilhar com os amigos! 🎶💙';
        }

        return 'Que legal sua mensagem! 😊 Posso te ajudar com informações sobre:\n\n📻 Programação da rádio\n🎵 Pedidos musicais\n🎁 Promoções ativas\n📞 Contato\n🎙️ Nossos DJs\n📱 Nosso App\n\nÉ só perguntar! 🎧';
    }

    function handleSend() {
        const text = inputField.value.trim();
        if (!text) return;

        addMessage(text, true);
        inputField.value = '';

        const typingEl = showTyping();

        setTimeout(() => {
            typingEl.remove();
            const response = getBotResponse(text);
            addMessage(response.replace(/\n/g, '<br>'), false);
        }, 1000 + Math.random() * 1000);
    }

    sendBtn.addEventListener('click', handleSend);
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });

    // Quick replies
    document.querySelectorAll('.quick-reply').forEach(btn => {
        btn.addEventListener('click', function() {
            const msg = this.getAttribute('data-msg');
            inputField.value = msg;
            handleSend();
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

// Initialize all new features
document.addEventListener('DOMContentLoaded', () => {
    updateOnAirBadge(false);
    initScrollReveal();
    animateCounters();
    initTypedText();
    createParticles();
    initStickyHeader();
    initScrollTop();
    initMobileMenu();
    initChatbot();
    initForms();
    initSmoothScroll();
    initCursorGlow();
    initAudioVisualizer();
    initListenerCounter();
    initTiltCards();
    initSmokeEffect();
    loadSiteConfig();
    initVirtualDJCheck();
});

// =============================================
// CURSOR GLOW TRAIL
// =============================================
function initCursorGlow() {
    const glow = document.getElementById('cursor-glow');
    if (!glow) return;

    // Only on desktop (no touch)
    if ('ontouchstart' in window) return;

    const halfW = glow.offsetWidth / 2;
    const halfH = glow.offsetHeight / 2;

    document.addEventListener('mousemove', (e) => {
        glow.classList.add('active');
        glow.style.transform = 'translate(' + (e.clientX - halfW) + 'px, ' + (e.clientY - halfH) + 'px)';
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
// 3D TILT EFFECT ON CARDS
// =============================================
function initTiltCards() {
    if ('ontouchstart' in window) return; // Skip on mobile

    const cards = document.querySelectorAll('[data-tilt]');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -6;
            const rotateY = ((x - centerX) / centerX) * 6;

            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px) scale(1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0) scale(1)';
        });
    });
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
        const size = 60 + Math.random() * 120;
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
    for (let i = 0; i < 8; i++) {
        setTimeout(() => createSmokePuff(), i * 600);
    }

    // Keep generating
    setInterval(createSmokePuff, 1200);
}

// =============================================
// LOAD SITE CONFIG FROM API / LOCALSTORAGE
// =============================================
function loadSiteConfig() {
    fetch('api.php')
        .then(res => res.json())
        .then(config => {
            applySiteConfig(config);
            localStorage.setItem('vanekonex_config', JSON.stringify(config));
        })
        .catch(() => {
            const cached = localStorage.getItem('vanekonex_config');
            if (cached) {
                try { applySiteConfig(JSON.parse(cached)); } catch(e) {}
            }
        });
}

function applySiteConfig(cfg) {
    if (!cfg) return;

    // Contact info
    const contatoItems = document.querySelectorAll('.contato-item');
    if (contatoItems.length >= 4) {
        if (cfg.telefone) contatoItems[0].querySelector('p').textContent = cfg.telefone;
        if (cfg.whatsapp) contatoItems[1].querySelector('p').textContent = cfg.whatsapp;
        if (cfg.email) contatoItems[2].querySelector('p').textContent = cfg.email;
        if (cfg.endereco) contatoItems[3].querySelector('p').textContent = cfg.endereco;
    }

    // Header social links
    const headerSocials = document.querySelectorAll('header .social-icons a');
    const socialMap = [
        { key: 'instagram', icon: 'instagram' },
        { key: 'whatsapp_link', icon: 'whatsapp' },
        { key: 'facebook', icon: 'facebook' },
        { key: 'youtube', icon: 'youtube' },
        { key: 'tiktok', icon: 'tiktok' }
    ];
    headerSocials.forEach((a, i) => {
        if (socialMap[i] && cfg[socialMap[i].key]) {
            a.href = cfg[socialMap[i].key];
        }
    });

    // Contact section socials
    const contatoSocials = document.querySelectorAll('.contato-socials a');
    const contatoSocialMap = ['instagram', 'facebook', 'youtube', 'twitter', 'tiktok'];
    contatoSocials.forEach((a, i) => {
        if (contatoSocialMap[i] && cfg[contatoSocialMap[i]]) {
            a.href = cfg[contatoSocialMap[i]];
        }
    });

    // Locutora info
    const locutoraName = document.getElementById('locutora-name');
    const locutoraPhoto = document.getElementById('locutora-photo');
    if (locutoraName && cfg.locutora_nome) locutoraName.textContent = cfg.locutora_nome;
    if (locutoraPhoto && cfg.locutora_foto) locutoraPhoto.src = cfg.locutora_foto;

    const locutoraSocials = {
        'locutora-instagram': cfg.locutora_instagram,
        'locutora-facebook': cfg.locutora_facebook,
        'locutora-twitter': cfg.locutora_twitter,
        'locutora-tiktok': cfg.locutora_tiktok
    };
    document.querySelectorAll('.locutora-social-link').forEach(a => {
        const key = a.getAttribute('data-social');
        if (key && locutoraSocials[key]) {
            a.href = locutoraSocials[key];
        }
    });

    // VDJ stream URL
    if (cfg.vdj_stream_url) {
        localStorage.setItem('vdj_stream_url', cfg.vdj_stream_url);
    }
    if (cfg.vdj_check_interval) {
        localStorage.setItem('vdj_check_interval', cfg.vdj_check_interval);
    }
}

// =============================================
// VIRTUAL DJ STREAM CHECK
// =============================================
let vdjCheckTimer = null;

function initVirtualDJCheck() {
    checkVDJStream();
    const interval = parseInt(localStorage.getItem('vdj_check_interval')) || 30;
    vdjCheckTimer = setInterval(checkVDJStream, interval * 1000);
}

function checkVDJStream() {
    const streamUrl = localStorage.getItem('vdj_stream_url');
    const vdjDot = document.getElementById('vdj-dot');
    const vdjText = document.getElementById('vdj-text');
    const liveIndicator = document.getElementById('live-indicator');
    const liveText = liveIndicator ? liveIndicator.querySelector('.live-text') : null;

    if (!streamUrl) {
        setVDJOffline(vdjDot, vdjText);
        return;
    }

    fetch(streamUrl, { method: 'HEAD', mode: 'no-cors', cache: 'no-store' })
        .then(() => {
            if (vdjDot) { vdjDot.classList.add('live'); }
            if (vdjText) { vdjText.classList.add('live'); vdjText.textContent = 'AO VIVO'; }
            if (liveText) { liveText.textContent = 'AO VIVO'; }
            if (liveIndicator) { liveIndicator.querySelector('.live-dot').style.background = '#2ecc71'; }
        })
        .catch(() => {
            setVDJOffline(vdjDot, vdjText);
        });
}

function setVDJOffline(dot, text) {
    if (dot) { dot.classList.remove('live'); }
    if (text) { text.classList.remove('live'); text.textContent = 'OFFLINE'; }
}
