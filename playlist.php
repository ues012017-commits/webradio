<?php
// Permite que o JavaScript leia este arquivo
header('Content-Type: application/json');

// Lê todos os arquivos .mp3 dentro da pasta 'musicas'
$arquivos = glob('musicas/*.mp3');

// Verifica se foi solicitado shuffle
$shuffle = isset($_GET['shuffle']) && $_GET['shuffle'] === '1';
if ($shuffle && !empty($arquivos)) {
    shuffle($arquivos);
}

// Envia a lista para o site
echo json_encode($arquivos);
?>