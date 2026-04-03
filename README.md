# 📻 Web Rádio

Web rádio profissional com player de streaming ao vivo, grade de programação, pedidos musicais e design moderno responsivo.

## ✅ Funcionalidades

- 🎵 Player de streaming ao vivo com controles de play/pause e volume
- 📊 Equalizador visual animado
- 📋 Grade de programação com destaque automático do programa no ar
- 🎸 Seção de gêneros musicais
- 💬 Formulário de pedidos musicais via WhatsApp
- 📱 Design 100% responsivo (celular, tablet e desktop)
- 🎹 Atalhos de teclado (Espaço = play/pause, setas = volume)
- 🔽 Player fixo na parte inferior ao rolar a página
- ✨ Animações suaves de scroll

## 📁 Estrutura dos Arquivos

| Arquivo | O que faz |
|---------|-----------|
| `index.html` | Página principal da web rádio |
| `script.js` | Player de áudio, controles e interatividade |
| `logo.png` | Logo da rádio |

## 🚀 Como Usar

### 1. Configure o stream de áudio

No arquivo `script.js`, altere a URL do stream na linha de configuração:

```javascript
var STREAM_URL = 'https://sua-url-de-streaming.com/stream';
```

Compatível com servidores Icecast, Shoutcast, Zeno.fm, e outros.

### 2. Personalize as informações

No `index.html`, edite:
- Nome da rádio
- Grade de programação (horários, nomes dos programas e DJs)
- Informações de contato (WhatsApp, e-mail)
- Links de redes sociais

### 3. Publique

Faça upload dos arquivos para qualquer hospedagem web (GitHub Pages, Netlify, Vercel, hospedagem compartilhada, etc.).

## ⌨️ Atalhos de Teclado

| Tecla | Ação |
|-------|------|
| `Espaço` | Play / Pause |
| `↑` Seta para cima | Aumentar volume |
| `↓` Seta para baixo | Diminuir volume |

## 📱 Compatibilidade

- Chrome, Firefox, Safari, Edge
- Android e iOS
- Desktop e mobile
