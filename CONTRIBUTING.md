# Contribuindo / Criando PR

Este guia ajuda a preparar o repositório para abrir Pull Request sem erros básicos de execução.

## 1) Pré-requisitos

- Node.js 20+
- npm 10+
- Git configurado (`user.name` e `user.email`)

## 2) Validar backend

```bash
cd backend
cp .env.example .env
npm install
npm run lint
APP_TOKEN=change-me npm start
```

## 3) Validar mobile

```bash
cd mobile
cp .env.example .env
npm install
npx expo start
```

> Para celular físico, use `EXPO_PUBLIC_API_URL` com o IP local da máquina, nunca `localhost`.

## 4) Fluxo de branch e PR

```bash
git checkout -b feat/minha-mudanca
# ...edite arquivos...
git add .
git commit -m "feat: descreva sua alteração"
git push -u origin feat/minha-mudanca
```

Depois, abra o Pull Request no provedor Git (GitHub/GitLab/Bitbucket), com:

- resumo das mudanças
- riscos/limitações
- comandos de teste executados

## 5) Checklist antes de abrir PR

- [ ] Backend sobe sem erro
- [ ] Mobile inicia no Expo
- [ ] Variáveis de ambiente configuradas
- [ ] Sem segredos/versionamento indevido
- [ ] Commits e título da PR claros
