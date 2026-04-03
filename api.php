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

require_once __DIR__ . '/db.php';

$passwordHash = 'f38fcb4e32e6286fa6f924223e3ed4fe250cbf2c2d30023691f0867710b5cfbb';
$MIN_CHECK_INTERVAL = 10;
$MAX_CHECK_INTERVAL = 300;

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $config = getConfig($pdo);
        echo json_encode($config, JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao ler configuração']);
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

    try {
        saveConfig($pdo, $body, $MIN_CHECK_INTERVAL, $MAX_CHECK_INTERVAL);
        echo json_encode(['success' => true, 'message' => 'Configuração salva com sucesso']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao salvar configuração']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método não permitido']);
