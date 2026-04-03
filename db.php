<?php
// ============================================
// Conexão com o Banco de Dados MySQL (PDO)
// ============================================

$dbHost = getenv('DB_HOST') ?: 'localhost';
$dbName = getenv('DB_NAME') ?: 'iubsit15_radio';
$dbUser = getenv('DB_USER') ?: 'iubsit15_radiouser';
$dbPass = getenv('DB_PASS') ?: '';
$dbPort = getenv('DB_PORT') ?: '3306';

try {
    $pdo = new PDO(
        "mysql:host=$dbHost;port=$dbPort;dbname=$dbName;charset=utf8mb4",
        $dbUser,
        $dbPass,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao conectar ao banco de dados']);
    exit;
}

/**
 * Retorna todas as configurações como array associativo.
 */
function getConfig(PDO $pdo): array {
    $stmt = $pdo->query('SELECT chave, valor FROM configuracao');
    $config = [];
    while ($row = $stmt->fetch()) {
        $config[$row['chave']] = $row['valor'];
    }

    // Carrega a programação
    $stmt = $pdo->query('SELECT horario, programa, dj FROM programacao ORDER BY ordem ASC');
    $config['programacao'] = $stmt->fetchAll();

    // Converte vdj_check_interval para inteiro
    if (isset($config['vdj_check_interval'])) {
        $config['vdj_check_interval'] = (int) $config['vdj_check_interval'];
    }

    return $config;
}

/**
 * Salva configurações no banco de dados.
 *
 * @param PDO   $pdo    Conexão PDO
 * @param array $data   Dados filtrados a salvar
 * @param int   $minInterval Intervalo mínimo do VDJ
 * @param int   $maxInterval Intervalo máximo do VDJ
 */
function saveConfig(PDO $pdo, array $data, int $minInterval, int $maxInterval): void {
    $allowedKeys = [
        'radio_nome', 'radio_slogan', 'radio_descricao',
        'telefone', 'whatsapp', 'whatsapp_link', 'email', 'endereco',
        'instagram', 'facebook', 'youtube', 'twitter', 'tiktok',
        'vdj_stream_url', 'vdj_check_interval',
        'locutora_nome', 'locutora_bio', 'locutora_foto',
        'locutora_instagram', 'locutora_facebook', 'locutora_twitter', 'locutora_tiktok',
        'logo_url', 'cor_primaria', 'cor_secundaria',
    ];

    $pdo->beginTransaction();

    try {
        // Atualiza configurações simples (chave-valor)
        $stmt = $pdo->prepare(
            'INSERT INTO configuracao (chave, valor) VALUES (:chave, :valor)
             ON DUPLICATE KEY UPDATE valor = :valor_update'
        );

        foreach ($allowedKeys as $key) {
            if (isset($data[$key])) {
                $valor = $key === 'vdj_check_interval'
                    ? (string) max($minInterval, min($maxInterval, intval($data[$key])))
                    : (string) $data[$key];

                $stmt->execute(['chave' => $key, 'valor' => $valor, 'valor_update' => $valor]);
            }
        }

        // Atualiza programação se fornecida
        if (isset($data['programacao']) && is_array($data['programacao'])) {
            $pdo->exec('DELETE FROM programacao');

            $stmtProg = $pdo->prepare(
                'INSERT INTO programacao (horario, programa, dj, ordem) VALUES (:horario, :programa, :dj, :ordem)'
            );

            foreach ($data['programacao'] as $index => $item) {
                $stmtProg->execute([
                    'horario'  => isset($item['horario']) ? (string) $item['horario'] : '',
                    'programa' => isset($item['programa']) ? (string) $item['programa'] : '',
                    'dj'       => isset($item['dj']) ? (string) $item['dj'] : '',
                    'ordem'    => $index + 1,
                ]);
            }
        }

        $pdo->commit();
    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }
}
