## SGE-JP - Sistema de Gestão Estoque

### Sobre o Projeto

Este projeto consiste em uma API REST completa para gerenciamento e controle de estoque. O sistema conta com autenticação via JWT, persistência de dados em banco local e rigoroso controle de acesso baseado em perfis: `admin`, `estoquista` e `consulta`.

### Tecnologias Utilizadas
- **Node.js + Express** (Backend API)
- **SQLite** (Banco de dados relacional via `arquivo.db`)
- **jsonwebtoken** (Autenticação e segurança)
- **bcrypt** (Criptografia de senhas)
- **Docker** (Conteinerização da aplicação)
- **GitHub Actions** (Integração Contínua - CI)
---

### Como criar o banco de dados?

O sistema usa SQLite. Para criar as tabelas necessárias (`usuarios`, `produtos`, `movimentacoes`) e popular o banco com o usuário administrador padrão, siga os passos abaixo:

1. Abra o terminal na raiz do projeto.
2. Execute o comando:
   ```bash
   npm run init-db
   ```
3. O arquivo `estoque-jp.db` será gerado automaticamente na raiz do projeto.

#### Credenciais geradas automaticamente
- **Usuário**: `admin`
- **Senha**: `adminjp`
---

### Como iniciar o projeto?
Você pode rodar o projeto localmente via Node.js ou utilizando Docker.
#### Opção 1: Via Node.js (Local)
1. Instale as dependências:
   ```bash
   npm install
   ```
2. Inicie o servidor:
   ```bash
   npm start
   ```
A API estará rodando em `http://localhost:3000.
#### Opção 2: Via Docker
1. Certifique-se de que o banco `estoque-jp.db` já foi criado via `npm run init-db`.
2. Suba o contêiner:
  ```bash
   docker compose up -d
   ```
A API estará rodando na porta 3000.

---

### 🔒 Autenticação
Todas as rotas (exceto o login) exigem um token JWT válido.
Envie o token no cabeçalho das requisições:
`Authorization: Bearer <SEU_TOKEN>`

---

### 🛣️ Rotas Principais e Exemplos de Uso

Abaixo estão os exemplos de uso para os principais endpoints:

#### 1. Autenticação 
* **`POST` `/auth/login`**
  * **Body:** `{"usuario": "admin", "senha": "adminjp"}`
  * **Retorno:** `{"token": "eyJhb..."}`

#### 2. Produtos (Gerenciamento) 
* **`POST` `/produtos`** *(Permitido: admin, estoquista)*
  * **Body:** `{"nome": "Notebook", "quantidade": 50, "minimo": 10}`

* **`GET` `/produtos`** *(Permitido: todos autenticados)*
  * **Retorno:** Retorna a lista completa de produtos.

* **`PATCH` `/produtos/:id`** *(Permitido: admin, estoquista)*
  * **Body:** `{"nome": "Notebook Pro", "minimo": 15}`

#### 3. Movimentações (Entradas e Saídas) 
> **Nota:** Saídas não podem ser maiores que o estoque disponível e quantidades negativas não são permitidas.

* **`POST` `/movimentacoes/entrada`** *(Permitido: admin, estoquista)*
  * **Body:** `{"produto_id": 1, "quantidade": 20}`

* **`POST` `/movimentacoes/saida`** *(Permitido: admin, estoquista)*
  * **Body:** `{"produto_id": 1, "quantidade": 5}`

#### 4. Relatórios 
* **`GET` `/relatorios/baixo-estoque`** *(Permitido: todos autenticados)*
  * **Retorno:** Retorna todos os produtos cuja quantidade atual é menor ou igual ao estoque mínimo configurado.