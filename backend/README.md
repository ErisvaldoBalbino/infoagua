# InfoÁgua API 🚀

Este diretório contém o servidor backend do **InfoÁgua**, uma API RESTful desenvolvida utilizando o framework **NestJS**.

A API fornece funcionalidades de autenticação (JWT), gerenciamento de usuários, registro e acompanhamento de ocorrências (com suporte a upload de imagens no MinIO/S3), comentários, curtidas e integração com o OpenWeather para dados meteorológicos.

---

## 🛠️ Pré-requisitos

Certifique-se de possuir instalado em sua máquina:
*   [Node.js](https://nodejs.org/) (versão LTS recomendada)
*   Banco de dados PostgreSQL e servidor de arquivos MinIO ativos (veja a pasta `/infra` para rodá-los via Docker).

---

## ⚙️ Instalação e Configuração

### 1. Instalar as dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
Crie um arquivo `.env` baseado no modelo disponível:
```bash
cp .env.example .env
```
Abra o arquivo `.env` recém-criado e preencha as variáveis necessárias:
*   `DATABASE_URL`: String de conexão com o banco de dados PostgreSQL.
*   `JWT_SECRET` e `JWT_EXPIRES_IN`: Chave de criptografia e tempo de expiração do token de autenticação.
*   `STORAGE_ENDPOINT`, `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY`: Credenciais para o MinIO/S3.
*   `OPENWEATHER_API_KEY`: Sua chave privada da API [OpenWeatherMap](https://openweathermap.org/api).

---

## 🗄️ Banco de Dados (Prisma ORM)

O Prisma é utilizado para gerenciar a modelagem do banco de dados e as consultas.

*   **Aplicar migrações pendentes e atualizar o banco:**
    ```bash
    npx prisma migrate dev
    ```
*   **Gerar o cliente do Prisma (se necessário):**
    ```bash
    npx prisma generate
    ```
*   **Abrir o visualizador gráfico do banco de dados (Prisma Studio):**
    ```bash
    npx prisma studio
    ```

---

## 🏃 Como Executar

*   **Modo de Desenvolvimento (Watch mode):**
    ```bash
    npm run start:dev
    ```
*   **Compilar para Produção:**
    ```bash
    npm run build
    ```
*   **Executar em Produção:**
    ```bash
    npm run start:prod
    ```

A API estará rodando por padrão em `http://localhost:3000`.

---

## 📚 Documentação das Rotas (Swagger)

A API possui documentação automática gerada com Swagger. Com o servidor em execução, acesse:
👉 **[http://localhost:3000/api/docs](http://localhost:3000/api/docs)**

> [!NOTE]
> Todas as rotas da API possuem o prefixo de versão `/v1` (ex: `http://localhost:3000/v1/auth/login`).

---

## 🧪 Execução de Testes

Os testes automatizados utilizam o framework Jest.

*   **Testes Unitários:**
    ```bash
    npm run test
    ```
*   **Testes de Integração / End-to-End (E2E):**
    ```bash
    npm run test:e2e
    ```
*   **Cobertura de Testes (Coverage):**
    ```bash
    npm run test:cov
    ```
