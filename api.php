<?php
header('Content-Type: application/json');
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
$selfHost = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : '';
$allowedOrigin = $origin && (parse_url($origin, PHP_URL_HOST) === $selfHost) ? $origin : '';
if ($allowedOrigin) {
    header('Access-Control-Allow-Origin: ' . $allowedOrigin);
}
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$configFile = __DIR__ . '/config.json';
$passwordHash = 'f38fcb4e32e6286fa6f924223e3ed4fe250cbf2c2d30023691f0867710b5cfbb';
$MIN_CHECK_INTERVAL = 10;
$MAX_CHECK_INTERVAL = 300;

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($configFile)) {
        $data = file_get_contents($configFile);
        $json = json_decode($data, true);
        if ($json === null) {
            http_response_code(500);
            echo json_encode(['error' => 'Erro ao ler configuração']);
        } else {
            echo $data;
        }
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Arquivo de configuração não encontrado']);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $body = json_decode($input, true);

    if ($body === null) {
        http_response_code(400);
        echo json_encode(['error' => 'JSON inválido']);
        exit;
    }

    if (!isset($body['password'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Senha não fornecida']);
        exit;
    }

    $providedHash = hash('sha256', $body['password']);
    if ($providedHash !== $passwordHash) {
        http_response_code(403);
        echo json_encode(['error' => 'Senha incorreta']);
        exit;
    }

    unset($body['password']);

    $allowedKeys = [
        'radio_nome', 'radio_slogan', 'radio_descricao',
        'telefone', 'whatsapp', 'whatsapp_link', 'email', 'endereco',
        'instagram', 'facebook', 'youtube', 'twitter', 'tiktok',
        'vdj_stream_url', 'vdj_check_interval',
        'locutora_nome', 'locutora_bio', 'locutora_foto',
        'locutora_instagram', 'locutora_facebook', 'locutora_twitter', 'locutora_tiktok',
        'logo_url', 'cor_primaria', 'cor_secundaria', 'programacao'
    ];
    $filtered = [];
    foreach ($allowedKeys as $key) {
        if (isset($body[$key])) {
            if ($key === 'programacao' && is_array($body[$key])) {
                $filtered[$key] = array_map(function($item) {
                    return [
                        'horario' => isset($item['horario']) ? (string)$item['horario'] : '',
                        'programa' => isset($item['programa']) ? (string)$item['programa'] : '',
                        'dj' => isset($item['dj']) ? (string)$item['dj'] : ''
                    ];
                }, $body[$key]);
            } elseif ($key === 'vdj_check_interval') {
                $filtered[$key] = max($MIN_CHECK_INTERVAL, min($MAX_CHECK_INTERVAL, intval($body[$key])));
            } else {
                $filtered[$key] = (string)$body[$key];
            }
        }
    }

    $result = file_put_contents($configFile, json_encode($filtered, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
    if ($result === false) {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao salvar configuração']);
    } else {
        echo json_encode(['success' => true, 'message' => 'Configuração salva com sucesso']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método não permitido']);
