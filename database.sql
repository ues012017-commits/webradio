-- ============================================
-- VaneKonex Rádio - Banco de Dados MySQL
-- ============================================

CREATE DATABASE IF NOT EXISTS webradio
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE webradio;

-- --------------------------------------------
-- Tabela: configuracao (chave-valor)
-- Armazena todas as configurações da rádio
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS configuracao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chave VARCHAR(100) NOT NULL UNIQUE,
    valor TEXT,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------
-- Tabela: programacao
-- Grade de programação da rádio
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS programacao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    horario VARCHAR(50) NOT NULL,
    programa VARCHAR(150) NOT NULL,
    dj VARCHAR(150) NOT NULL,
    ordem INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Dados iniciais (valores padrão)
-- ============================================

INSERT INTO configuracao (chave, valor) VALUES
    ('radio_nome', 'VaneKonex Rádio'),
    ('radio_slogan', 'Sua Rádio, Sua Conexão'),
    ('radio_descricao', 'A Rádio VaneKonex nasceu da paixão pela música e pela vontade de conectar pessoas.'),
    ('telefone', '(11) 99999-9999'),
    ('whatsapp', '(11) 99999-9999'),
    ('whatsapp_link', 'https://wa.me/5511999999999'),
    ('email', 'contato@vanekonex.com.br'),
    ('endereco', 'Rua da Música, 123 - Centro'),
    ('instagram', 'https://instagram.com/vanekonex'),
    ('facebook', 'https://facebook.com/vanekonex'),
    ('youtube', 'https://youtube.com/vanekonex'),
    ('twitter', 'https://twitter.com/vanekonex'),
    ('tiktok', 'https://tiktok.com/@vanekonex'),
    ('vdj_stream_url', ''),
    ('vdj_check_interval', '30'),
    ('locutora_nome', 'Vanessa Corrêa'),
    ('locutora_bio', 'Locutora apaixonada por rádio e comunicação.'),
    ('locutora_foto', 'https://placehold.co/150x150/1a1a2e/00f3ff?text=VC&font=poppins'),
    ('locutora_instagram', '#'),
    ('locutora_facebook', '#'),
    ('locutora_twitter', '#'),
    ('locutora_tiktok', '#'),
    ('logo_url', 'logo.png'),
    ('cor_primaria', '#00f3ff'),
    ('cor_secundaria', '#ff007f');

INSERT INTO programacao (horario, programa, dj, ordem) VALUES
    ('06:00 - 09:00', 'Bom Dia VaneKonex', 'DJ Carlos', 1),
    ('09:00 - 12:00', 'Manhã Musical', 'DJ Ana', 2),
    ('12:00 - 14:00', 'Hora do Almoço', 'DJ Roberto', 3),
    ('14:00 - 17:00', 'Tarde Elétrica', 'DJ Max', 4),
    ('17:00 - 20:00', 'Sertanejo & Forró', 'DJ Paula', 5),
    ('20:00 - 00:00', 'Noite VaneKonex', 'DJ Léo', 6);
