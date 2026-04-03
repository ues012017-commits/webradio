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

    for (let i = 0; i < 30; i++) {
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
});