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