# Monitor de Pátio (Android/iOS + Backend)

Aplicação mobile (Expo/React Native) e backend em Node.js para monitoramento automático do site `https://agendeam.com.br/ujf/motorista.php` a cada 10 segundos.

## Arquitetura

- `backend/`: API própria com coleta automática, cache em disco, autenticação por bearer token, logs e tratamento de falhas.
- `mobile/`: app com tema escuro, dashboard, navegação por abas, histórico e modal de alerta crítico para `TRANSPORTADORA SEIS`.

## Backend

```bash
cd backend
cp .env.example .env
npm install
APP_TOKEN='change-me' npm start
```

### Endpoints

- `GET /api/health`
- `GET /api/dashboard`
- `GET /api/monitoring`
- `GET /api/events/calls`
- `GET /api/alerts/active`
- `POST /api/alerts/:id/confirm`

## Mobile

```bash
cd mobile
cp .env.example .env
npm install
EXPO_PUBLIC_API_URL='http://SEU_IP:4000/api' EXPO_PUBLIC_API_TOKEN='change-me' npm start
```

### Automação no Windows (.bat)

Para automatizar backend + mobile no Windows, execute:

```bat
iniciar_monitoramento.bat
```

Voce nao precisa descobrir o IP manualmente: o script tenta detectar automaticamente e pede confirmacao.

O script:
- valida Node/npm;
- instala dependências (se necessário);
- detecta automaticamente o IP local (com opção de sobrescrever), configura `mobile/.env` com IP e token;
- abre duas janelas (backend e Expo).

### Solução de erro comum no Expo

Se aparecer `The required package expo-asset cannot be found`, execute dentro de `mobile/`:

```bash
npm install
npx expo install expo-asset
```

Depois rode novamente `npm start`.


### Teste rápido no navegador

- `http://SEU_IP:4000/` retorna status da API e instruções de autenticação.
- `http://SEU_IP:4000/api/health` funciona sem token para validar conectividade.
- Endpoints de dados (`/api/dashboard`, `/api/monitoring`, etc.) exigem `Authorization: Bearer <APP_TOKEN>`.

## Abrir Pull Request

Existe um guia rápido de contribuição em [`CONTRIBUTING.md`](./CONTRIBUTING.md) com passo a passo para validar localmente e abrir PR.

## Regras implementadas

- Polling contínuo a cada 10s com reconexão automática.
- Registro de veículos, status e transportadora.
- Contador de veículos com status `FILA`.
- Tela exclusiva de histórico de `CHAMADO DA PORTARIA` com timestamp.
- Alerta crítico bloqueante (som contínuo + notificação + modal) para `TRANSPORTADORA SEIS`, liberado somente após `CONFIRMAR`.
- Confirmação registra horário e usuário na API.

## Compatibilidade de PR (sem binários)

Para evitar erro de revisão em plataformas que não aceitam diff com binários, este repositório mantém apenas arquivos texto no versionamento. Ícones/som podem ser adicionados localmente em builds finais, sem bloquear a criação da PR.
