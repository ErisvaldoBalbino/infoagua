# InfoÁgua 💧

O **InfoÁgua** é uma plataforma móvel para o monitoramento colaborativo do abastecimento e da qualidade da água, integrada com previsões climáticas locais. O projeto foi desenvolvido como parte da disciplina de Desenvolvimento de Dispositivos Móveis (DDM).

Este é um monorepo que contém toda a infraestrutura, o serviço de backend e o aplicativo mobile.

---

## 📁 Estrutura do Repositório

O projeto é dividido em três diretórios principais:

*   **`/infra`:** Configurações do ambiente com Docker Compose, contendo os serviços de banco de dados (PostgreSQL) e armazenamento de arquivos compatível com S3 (MinIO).
*   **`/backend`:** API RESTful desenvolvida com **NestJS**.
*   **`/mobile`:** Aplicativo mobile multiplataforma desenvolvido com **React Native** e **Expo**.

---

## 🚀 Como Iniciar o Projeto

### Pré-requisitos
Antes de começar, certifique-se de ter instalado em sua máquina:
*   [Node.js](https://nodejs.org/) (versão LTS recomendada)
*   [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
*   Dispositivo móvel com o app [Expo Go](https://expo.dev/go) instalado ou um emulador (Android Studio / Xcode) configurado.

---

### Passo 1: Subir os Serviços de Infraestrutura
Os serviços de banco de dados (PostgreSQL) e armazenamento (MinIO) devem ser iniciados primeiro.

1. Navegue até a pasta `infra`:
   ```bash
   cd infra
   ```
2. Crie o arquivo de variáveis de ambiente a partir do exemplo:
   ```bash
   cp .env.example .env
   ```
   *(Abra o arquivo `.env` e configure as credenciais necessárias, como senhas e a chave da API OpenWeather).*
3. Inicie os containers do banco de dados e do storage:
   ```bash
   docker compose up -d db minio
   ```

---

### Passo 2: Executar o Backend (NestJS)
Com a infraestrutura rodando, agora configuramos e iniciamos o servidor backend.

1. Em um novo terminal, navegue até a pasta `backend`:
   ```bash
   cd backend
   ```
2. Crie o arquivo de variáveis de ambiente:
   ```bash
   cp .env.example .env
   ```
   *(Certifique-se de preencher as variáveis do `.env` correspondentes aos valores configurados no `.env` da infraestrutura).*
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Execute as migrações do banco de dados para criar as tabelas:
   ```bash
   npx prisma migrate dev
   ```
5. Inicie o servidor em modo de desenvolvimento:
   ```bash
   npm run start:dev
   ```
6. O backend estará acessível em `http://localhost:3000`.
   *   A documentação interativa das rotas (Swagger) estará disponível em: `http://localhost:3000/api/docs`

---

### Passo 3: Executar o Aplicativo Mobile (Expo)
Por fim, iniciamos o aplicativo no emulador ou celular físico.

1. Em um novo terminal, navegue até a pasta `mobile`:
   ```bash
   cd mobile
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento do Expo:
   ```bash
   npm run start
   ```
4. Siga as instruções exibidas no terminal:
   *   Pressione `a` para abrir no emulador Android.
   *   Pressione `i` para abrir no simulador iOS (macOS).
   *   Escaneie o QR Code exibido no terminal utilizando o aplicativo **Expo Go** no seu celular para testar diretamente em um dispositivo físico.

---

## 🛠️ Tecnologias Utilizadas

*   **Backend:** Node.js, NestJS, TypeScript, Prisma ORM, Swagger, Jest.
*   **Mobile (Frontend):** React Native, Expo, Expo Router, TypeScript.
*   **Infraestrutura:** Docker, Docker Compose, PostgreSQL, MinIO (S3-compatible Object Storage).
*   **Integrações:** API do OpenWeather (dados climáticos).
