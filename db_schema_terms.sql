-- Tabela de Auditoria Jurídica (Termos de Uso e Contratos)
-- Serve para registrar o consentimento explícito e assinado digitalmente 
-- por meio de aceite no formulário (Checkbox / Assinatura Eletrônica), 
-- garantindo conformidade com a MP 2.200-2/2001 e a LGPD.

CREATE TABLE legal_agreements_log (
    id SERIAL PRIMARY KEY,
    
    -- Vínculo com o usuário que aceitou (Motorista ou Cliente)
    user_id VARCHAR(50) NOT NULL,
    user_role VARCHAR(20) NOT NULL CHECK (user_role IN ('DRIVER', 'CLIENT')),
    
    -- Qual termo foi aceito (importante caso o texto mude no futuro)
    term_type VARCHAR(50) NOT NULL, -- ex: 'TERMOS_USO_CLIENTE', 'AUTONOMIA_RASTREAMENTO_MOTORISTA'
    term_version VARCHAR(20) NOT NULL, -- ex: '1.0.0', '2026-07'
    
    -- Provas de autoria (Assinatura Eletrônica)
    ip_address VARCHAR(45) NOT NULL, -- Suporta IPv4 e IPv6
    user_agent TEXT NOT NULL, -- Navegador, sistema operacional e dispositivo
    accepted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Dados adicionais de auditoria (opcional)
    session_id VARCHAR(100), 
    metadata JSONB -- Armazenamento de informações extras (como localização aproximada via IP, etc)
);

-- Índices para buscas rápidas em auditorias e prestação de contas
CREATE INDEX idx_legal_agreements_user ON legal_agreements_log(user_id, user_role);
CREATE INDEX idx_legal_agreements_date ON legal_agreements_log(accepted_at);
