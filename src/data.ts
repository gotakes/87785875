import { Driver, OrderService } from './types';

export const mockDrivers: Driver[] = [
  {
    id: 'd1',
    name: 'Carlos Almeida Silva',
    cpf: '123.456.789-00',
    phone: '(11) 98765-4321',
    pixKeyType: 'CPF',
    pixKey: '123.456.789-00',
    bank: 'Nubank (260)',
    agency: '0001',
    account: '12345-6',
    vehiclePlateHorse: 'ABC-1234',
    vehiclePlateTrailer: 'XYZ-9876',
    vehicleType: 'Bitrem',
    axes: 7,
    lat: -23.5505,
    lng: -46.6333,
    status: 'MOVING',
  },
  {
    id: 'd2',
    name: 'Roberto Fernandes',
    cpf: '987.654.321-11',
    phone: '(41) 99999-8888',
    pixKeyType: 'Telefone',
    pixKey: '(41) 99999-8888',
    bank: 'Itaú (341)',
    agency: '1234',
    account: '98765-4',
    vehiclePlateHorse: 'DEF-5678',
    vehiclePlateTrailer: '',
    vehicleType: 'Truck',
    axes: 3,
    lat: -25.4284,
    lng: -49.2733,
    status: 'PARKED',
  },
];

export const mockOSs: OrderService[] = [
  {
    id: 'os1',
    number: '0001',
    driverId: 'd1',
    status: 'IN_TRANSIT',
    origin: 'São Paulo, SP',
    destinations: ['Campinas, SP', 'Ribeirão Preto, SP'],
    cargoType: 'Grãos',
    kmL: 2.5,
    dieselPrice: 5.9,
    distanceKm: 315,
    tollCost: 185.5,
    fuelCost: 743.4,
    freightMinimum: 3500.0,
    grossValue: 4500.0,
    netValue: 3571.1,
    totalValue: 4500.0 + 185.5,
    createdAt: new Date().toISOString(),
  },
];

export const engineeringGuideMarkdown = `
# Guia de Engenharia: El Nathan - Sistema de Gestão de Transportes

Este guia detalha a arquitetura, modelagem de dados e estratégias de integração para o aplicativo **El Nathan**, projetado para suportar operações logísticas com foco em redução de custos (mapas open-source) e automação de cálculos (ANTT e Qualp).

---

## 1. Arquitetura do Sistema (Propostas)

Para atender à natureza híbrida do projeto (Motoristas em trânsito com conectividade instável e Administradores no escritório), recomendamos as seguintes abordagens:

### Opção A: Stack Tradicional (Recomendada para longo prazo e escalabilidade)
*   **Mobile (Motoristas):** \`React Native\` com o framework \`Expo\`. É ideal para criar apps Android e iOS com uma única base de código. Possui bibliotecas maduras como \`expo-location\` para captura de GPS em background de forma eficiente.
*   **Web (Administradores):** \`React.js\` (Vite) utilizando \`Tailwind CSS\` para uma interface rápida, responsiva e moderna (exatamente como este protótipo).
*   **Backend & APIs:** \`Node.js\` com \`NestJS\` (TypeScript). Permite criar filas de processamento (com Redis) para lidar com milhares de pings de GPS simultâneos sem derrubar o banco principal.
*   **Banco de Dados:** \`PostgreSQL\` para dados estruturados (Motoristas, Veículos, OS) gerenciado via Prisma ORM. 

### Opção B: Stack No-Code Avançado (Rápido Go-to-Market)
*   **Frontend (Web & Mobile):** \`FlutterFlow\`. Permite desenhar a interface visualmente e compilar para código Flutter real. Suporta integrações REST API e captura de localização nativa.
*   **Backend as a Service:** \`Supabase\`. Um backend open-source baseado em PostgreSQL. Oferece Autenticação, Banco de Dados, e o mais importante: **Realtime Subscriptions**. O mapa do admin atualizaria automaticamente sempre que o GPS do motorista fosse atualizado no banco, sem precisar fazer "polling" (requisições de tempo em tempo).

---

## 2. Modelagem do Banco de Dados (PostgreSQL)

Estrutura relacional recomendada para garantir integridade financeira e histórica.

\`\`\`sql
-- Tabela de Motoristas e Veículos
CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    cpf_cnpj VARCHAR(18) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Senha criptografada do motorista
    pix_key_type VARCHAR(20),
    pix_key VARCHAR(100),
    bank_details JSONB, -- { "bank": "...", "agency": "...", "account": "..." }
    vehicle_plate_horse VARCHAR(10) NOT NULL,
    vehicle_plate_trailer VARCHAR(10),
    vehicle_type VARCHAR(50), -- 'Toco', 'Truck', 'Bitrem', 'Rodotrem'
    axes INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Ordens de Serviço (OS)
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number SERIAL,
    driver_id UUID REFERENCES drivers(id),
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, IN_TRANSIT, COMPLETED
    origin TEXT NOT NULL,
    destinations JSONB NOT NULL, -- Array de locais
    cargo_type VARCHAR(100),
    
    -- Variáveis de Cálculo Salvas (Auditoria)
    km_l NUMERIC(5,2),
    diesel_price NUMERIC(10,2),
    distance_km NUMERIC(10,2),
    
    -- Valores Processados (Retorno das APIs)
    toll_cost NUMERIC(10,2),
    fuel_cost NUMERIC(10,2),
    freight_minimum NUMERIC(10,2),
    gross_value NUMERIC(10,2),
    net_value NUMERIC(10,2),
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Logs de Rastreamento (Alta Volumetria)
CREATE TABLE location_logs (
    id BIGSERIAL PRIMARY KEY,
    driver_id UUID REFERENCES drivers(id),
    order_id UUID REFERENCES orders(id),
    latitude NUMERIC(10,8) NOT NULL,
    longitude NUMERIC(11,8) NOT NULL,
    speed NUMERIC(5,2),
    recorded_at TIMESTAMP DEFAULT NOW()
);
-- Índice essencial para performance no mapa:
CREATE INDEX idx_location_logs_driver_time ON location_logs(driver_id, recorded_at DESC);
\`\`\`

---

## 3. Lógica do Mapa Open-Source (Leaflet.js)

Para evitar os altos custos do Google Maps API (que cobra por carregamento), a solução é utilizar o **Leaflet.js** consumindo os mapas tile do **OpenStreetMap** (100% gratuito).

No protótipo, utilizamos a biblioteca \`react-leaflet\`. Abaixo está o código JavaScript puro/conceitual para renderização:

\`\`\`javascript
// 1. Inicializar o Mapa apontando para o Brasil
const map = L.map('map_id').setView([-14.235, -51.925], 4);

// 2. Adicionar a camada gratuita do OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18,
}).addTo(map);

// 3. Função para renderizar e atualizar os marcadores da frota
async function renderFrota() {
    // Busca as coordenadas recentes do backend
    const frota = await fetch('/api/frota/locais').then(res => res.json());
    
    frota.forEach(veiculo => {
        // Define cor baseada no status
        const iconColor = veiculo.status === 'MOVING' ? 'green' : 'red';
        
        // Customização do Pin
        const markerIcon = L.divIcon({
            className: 'custom-pin',
            html: \`<div style="background-color: \${iconColor}; width: 20px; height: 20px; border-radius: 50%;"></div>\`
        });
        
        // Adiciona ao mapa
        const marker = L.marker([veiculo.lat, veiculo.lng], { icon: markerIcon }).addTo(map);
    });
}
\`\`\`

---

## 4. Segurança e LGPD

1. **Consentimento (Opt-In):** Tela de "Termos de Privacidade" explícita.
2. **Janela de Rastreamento:** Localização só é capturada se houver OS \`IN_TRANSIT\`.
3. **Indicador Visual:** Notificação persistente de "Rastreamento da OS ativo".
4. **Retenção de Dados:** Exclusão de logs detalhados do banco após 6 meses.

---

## 5. Sugestões de Aprimoramento (Roadmap El Nathan)

Para elevar o sistema a um nível enterprise, recomendo fortemente as seguintes implementações futuras:

1. **Funcionamento Offline-First (Motoristas):**
   - **O que é:** O app do motorista deve funcionar sem internet, utilizando um banco de dados local (ex: WatermelonDB ou SQLite via Expo).
   - **Vantagem:** Se o motorista perder o sinal na rodovia, ele ainda consegue ver os dados da OS e a rota. O GPS continua salvando os pontos localmente e sincroniza tudo com o servidor automaticamente assim que a internet voltar.

2. **Upload de Canhotos e Recibos (Gestão Documental):**
   - **O que é:** Adicionar a função de capturar fotos do canhoto assinado ou recibos de pedágio diretamente na tela da OS pelo celular.
   - **Vantagem:** O Administrador recebe o comprovante de entrega no painel em tempo real, agilizando o processo de faturamento junto ao cliente final.

3. **Automação de Pagamentos (Split de Pagamento PIX):**
   - **O que é:** Integrar uma API bancária corporativa (ex: Banco Cora, Stark Bank ou Asaas).
   - **Vantagem:** Com apenas um clique no painel do administrador, o sistema transfere o "Valor Líquido (Frete)" automaticamente para a chave PIX do motorista, garantindo velocidade e zero erro de digitação.

4. **Telemetria e Manutenção Preventiva:**
   - **O que é:** Aproveitando o cálculo de distância das OSs, o sistema soma automaticamente a quilometragem rodada de cada veículo.
   - **Vantagem:** O Administrador pode receber alertas visuais: *"Atenção: O Cavalo ABC-1234 atingiu 40.000km rodados desde a última troca de óleo"*.

5. **Notificações Push Reais:**
   - **O que é:** Integrar o \`Firebase Cloud Messaging (FCM)\`.
   - **Vantagem:** Sempre que uma nova OS for gerada, o celular do motorista emite um alerta sonoro com a notificação push: *"Nova Viagem Atribuída: São Paulo -> Campinas"*.
`;
