# InfoÁgua Infraestrutura 🐳

Este diretório contém as configurações de infraestrutura baseadas em **Docker** e **Docker Compose** para orquestrar os serviços locais de banco de dados, armazenamento de arquivos (S3-compatible object storage) e execução conteinerizada da API.

---

## 🛠️ Serviços Configurados

1.  **Banco de Dados (PostgreSQL `db`):** Banco de dados relacional para persistir os usuários, ocorrências, comentários e demais tabelas da aplicação.
2.  **Armazenamento de Arquivos (MinIO `minio`):** Serviço compatível com S3 para armazenar imagens de ocorrências e avatares de usuários enviados à plataforma.
    *   Console de administração web acessível em: `http://localhost:9001`
3.  **API Backend (NestJS `backend`):** A própria API configurada em container.

---

## ⚙️ Configuração Inicial

Antes de executar qualquer comando Docker, configure as variáveis de ambiente necessárias.

1.  Crie o arquivo `.env` copiando o modelo:
    ```bash
    cp .env.example .env
    ```
2.  Abra o arquivo `.env` e ajuste as credenciais (ex: senhas do banco e chaves de acesso do MinIO).
3.  *(Importante)* Preencha a variável `OPENWEATHER_API_KEY` com a chave correspondente caso queira que o backend consulte informações climáticas.

---

## 🚀 Modos de Execução

Você pode executar a infraestrutura de três formas diferentes, dependendo da sua necessidade de desenvolvimento:

### Modo 1: Apenas Banco de Dados e Storage (Recomendado para Desenvolvimento local da API)
Se você deseja modificar o código da API no seu editor e rodar `npm run start:dev` na sua máquina local, inicie apenas os containers de banco e arquivos:

```bash
docker compose up -d db minio
```

*   **Para parar os serviços:** `docker compose down`

---

### Modo 2: Ambiente de Desenvolvimento Completo com Docker
Se deseja rodar todos os serviços (incluindo o backend) dentro do Docker, mantendo o recarregamento automático (hot-reload) ativo quando você altera os arquivos locais:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

---

### Modo 3: Execução de Produção / Homologação
Se deseja rodar o ambiente completo fechado e otimizado, sem compartilhamento de pastas de código locais:

```bash
docker compose up --build -d
```

---

## 📁 Estrutura de Pastas de Infraestrutura

*   **`/postgres/init.sql`:** Script executado na inicialização do banco para habilitar extensões obrigatórias (`uuid-ossp` e `unaccent`).
*   **`docker-compose.yml`:** Configuração base dos serviços PostgreSQL, MinIO e do container de build final do backend.
*   **`docker-compose.dev.yml`:** Configuração adicional para desenvolvimento, expondo portas locais adicionais e mapeando volumes para sincronizar o código local com o container.
