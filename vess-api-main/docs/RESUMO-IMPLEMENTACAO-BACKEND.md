# VESS — Resumo da implementação (Backend)

**Projeto:** vess-api-main  
**Escopo:** Apenas backend (API). Frontend não foi alterado.  
**Base URL local:** http://localhost:8080  

---

## 1. Gestão de usuários (Administrador)

### 1.1 Objetivo

Permitir que o Administrador visualize, edite, altere o perfil e inative usuários já cadastrados, sem cadastro manual pelo painel e sem exclusão física.

### 1.2 O que foi implementado

- Listagem de usuários: GET /users
- Consulta de um usuário: GET /users/{id}
- Edição de dados permitidos: PUT /users/{id}
- Alteração de perfil (Pesquisador ↔ Administrador): PATCH /users/{id}/profile
- Inativação de usuário: PATCH /users/{id}/inactivate
- Bloqueio de cadastro administrativo: POST /users retorna HTTP 405
- Bloqueio de exclusão física: DELETE /users/{id} retorna HTTP 405
- Controle de acesso: rotas /users e /users/** exigem perfil Administrador (ROLE_ADMINISTRADOR)
- Rotas do próprio usuário: GET /users/me e PUT /users/me permanecem para qualquer usuário autenticado
- Usuário inativo não acessa o sistema: bloqueio no login e revalidação do estado da conta em cada requisição com JWT
- Cadastro público preservado: POST /auth/register (fluxo original)

### 1.3 Campos editáveis pelo administrador (PUT /users/{id})

- username
- email
- institution
- country
- state
- city

Não são alterados por esse endpoint: senha, perfil (use PATCH /profile), status (use PATCH /inactivate).

### 1.4 Arquivos principais alterados/criados

- controller/UserController.java
- service/UserService.java
- dto/AdminUserUpdateDTO.java
- dto/UserProfileUpdateDTO.java
- security/JWTAuthorizationFilter.java
- security/WebSecurity.java
- handler/GlobalExceptionHandler.java

---

## 2. Gestão de avaliações (Administrador e Pesquisador)

### 2.1 Objetivo

- Administrador: visualizar, editar, inativar e reativar avaliações.
- Pesquisador: apenas visualizar (lista e mapa na web).
- App móvel: continua enviando avaliações pela integração com API Key.
- Aplicação web não cadastra avaliações manualmente.

### 2.2 O que foi implementado

- Listagem: GET /avaliacao (retorna status ATIVO/INATIVO e região quando vinculada)
- Consulta: GET /avaliacao/{id}
- Detalhe com amostras (mapa/modal): GET /avaliacao/{id}/completa
- Edição (somente admin): PUT /avaliacao/{id}
- Inativação (somente admin): PATCH /avaliacao/{id}/inativar
- Reativação (somente admin): PATCH /avaliacao/{id}/reativar
- Bloqueio cadastro web: POST /avaliacao sem X-API-Key retorna HTTP 405
- Bloqueio exclusão física: DELETE /avaliacao/{id} retorna HTTP 405
- Status da avaliação: enum ATIVO e INATIVO (compatível com registros antigos na coluna status)
- Região vinculada: campo opcional regiao na resposta; regiaoId na edição/ingestão
- Pesquisador: apenas GET em /avaliacao/** (PUT, PATCH e DELETE retornam 403)
- Integração móvel preservada: POST /avaliacao com header X-API-Key

### 2.3 Endpoints de integração móvel (inalterados em essência)

- POST /avaliacao — header X-API-Key obrigatório
- POST /configuracao
- POST /amostra
- POST /camada

Chave configurada em: app.security.mobile-api-key (application.properties / application-dev.properties)

### 2.4 Campos editáveis pelo administrador (PUT /avaliacao/{id})

- nomeAvaliacao
- dataInicio
- dataFim
- resumoAvaliacao
- descricaoManejoLocal
- avaliador
- informacoes
- regiaoId (opcional; vincula ou altera a região)

Não são alterados por esse endpoint: status (use PATCH inativar/reativar), amostras, totais calculados.

### 2.5 Arquivos principais alterados/criados

- controller/AvaliacaoController.java
- service/AvaliacaoService.java
- repository/AvaliacaoRepository.java
- model/Avaliacao.java
- model/enums/AvaliacaoStatus.java
- model/converter/AvaliacaoStatusConverter.java
- dto/AvaliacaoResponseDTO.java
- dto/RegiaoResumoDTO.java
- dto/AdminAvaliacaoUpdateDTO.java
- security/WebSecurity.java
- docs/gestao-avaliacoes-backend.md

---

## 3. Matriz de permissões (resumo)

### Usuários (/users)

| Método | Rota | Administrador | Pesquisador |
|--------|------|---------------|-------------|
| GET | /users, /users/{id} | Sim | Não (403) |
| PUT | /users/{id} | Sim | Não (403) |
| PATCH | /users/{id}/profile | Sim | Não (403) |
| PATCH | /users/{id}/inactivate | Sim | Não (403) |
| POST | /users | Não (405) | Não (405) |
| DELETE | /users/{id} | Não (405) | Não (405) |
| GET/PUT | /users/me | Sim (próprio usuário) | Sim (próprio usuário) |

### Avaliações (/avaliacao)

| Método | Rota | Administrador | Pesquisador | App móvel |
|--------|------|---------------|-------------|-----------|
| GET | /avaliacao, /avaliacao/{id}, /completa | Sim | Sim | — |
| PUT | /avaliacao/{id} | Sim | Não (403) | — |
| PATCH | /avaliacao/{id}/inativar | Sim | Não (403) | — |
| PATCH | /avaliacao/{id}/reativar | Sim | Não (403) | — |
| POST | /avaliacao | Não (405 sem API Key) | Não (405) | Sim (com X-API-Key) |
| DELETE | /avaliacao/{id} | Não (405) | Não (405) | — |

---

## 4. Como testar no Postman

### 4.1 Configuração inicial

1. Criar environment com variáveis:
   - base_url = http://localhost:8080
   - token = (vazio; preenchido após login)

2. API Key do app móvel (header X-API-Key):
   - Valor em application.properties: app.security.mobile-api-key
   - Exemplo em dev: qzjvTdEGGzT8nZGRZVd4e47a3UwuuVJR

### 4.2 Login (obter token JWT)

Request:
- Método: POST
- URL: {{base_url}}/auth/login
- Authorization: No Auth
- Headers: Content-Type: application/json
- Body (raw JSON):

{
  "username": "email-do-usuario@vess.com",
  "password": "sua_senha"
}

Observação: o campo se chama "username", mas deve conter o e-mail cadastrado.

Resposta esperada: JSON com "token" e "user".

Script opcional (aba Tests do Postman):

const json = pm.response.json();
if (json.token) {
  pm.environment.set("token", json.token);
}

Demais requisições autenticadas:
- Authorization: Bearer Token
- Token: {{token}}

### 4.3 Testes — Gestão de usuários (Administrador)

1) Listar usuários
- GET {{base_url}}/users
- Bearer {{token}} (usuário admin)

2) Ver um usuário
- GET {{base_url}}/users/1

3) Editar usuário
- PUT {{base_url}}/users/1
- Body:

{
  "username": "usuario_teste",
  "email": "usuario@teste.com",
  "institution": "UTFPR",
  "country": "Brasil",
  "state": "Paraná",
  "city": "Curitiba"
}

4) Alterar perfil
- PATCH {{base_url}}/users/1/profile
- Body:

{
  "profile": "ADMINISTRADOR"
}

Valores aceitos: ADMINISTRADOR, PESQUISADOR

5) Inativar usuário
- PATCH {{base_url}}/users/1/inactivate
- Sem body

6) Cadastro bloqueado (deve retornar 405)
- POST {{base_url}}/users

7) Exclusão bloqueada (deve retornar 405)
- DELETE {{base_url}}/users/1

8) Teste como Pesquisador
- Fazer login com usuário Pesquisador
- GET /users → esperado 403 Forbidden
- PUT /users/1 → esperado 403 Forbidden

### 4.4 Testes — Gestão de avaliações (Administrador)

1) Listar avaliações
- GET {{base_url}}/avaliacao
- Bearer {{token}} (admin)

2) Ver uma avaliação
- GET {{base_url}}/avaliacao/1

3) Ver avaliação completa (com amostras)
- GET {{base_url}}/avaliacao/1/completa

4) Editar avaliação
- PUT {{base_url}}/avaliacao/1
- Body:

{
  "nomeAvaliacao": "Avaliação atualizada",
  "dataInicio": "2026-01-01T10:00:00",
  "dataFim": "2026-06-01T18:00:00",
  "resumoAvaliacao": "Resumo da avaliação",
  "descricaoManejoLocal": "Descrição do manejo",
  "avaliador": "Nome do avaliador",
  "informacoes": "Informações adicionais",
  "regiaoId": 1
}

5) Inativar avaliação
- PATCH {{base_url}}/avaliacao/1/inativar
- Sem body
- Resposta: status INATIVO

6) Reativar avaliação
- PATCH {{base_url}}/avaliacao/1/reativar
- Sem body
- Resposta: status ATIVO

7) Cadastro web bloqueado (deve retornar 405)
- POST {{base_url}}/avaliacao
- Sem header X-API-Key

8) Exclusão bloqueada (deve retornar 405)
- DELETE {{base_url}}/avaliacao/1

### 4.5 Testes — Avaliações (Pesquisador)

Fazer login com usuário Pesquisador e usar o token dele.

Deve funcionar (200):
- GET {{base_url}}/avaliacao
- GET {{base_url}}/avaliacao/1
- GET {{base_url}}/avaliacao/1/completa
- GET {{base_url}}/amostra/resumo-mapa

Deve retornar 403 Forbidden:
- PUT {{base_url}}/avaliacao/1
- PATCH {{base_url}}/avaliacao/1/inativar
- PATCH {{base_url}}/avaliacao/1/reativar
- DELETE {{base_url}}/avaliacao/1

### 4.6 Teste — Integração app móvel

Request:
- Método: POST
- URL: {{base_url}}/avaliacao
- Authorization: No Auth (não usar Bearer)
- Header: X-API-Key: <valor da chave mobile>
- Header: Content-Type: application/json
- Body: JSON completo da avaliação (formato já usado pelo app)

Resposta esperada: HTTP 201 Created com id da avaliação criada.

Sem X-API-Key: HTTP 405 (cadastro não permitido pela web).

---

## 5. Critérios de aceite atendidos

### Gestão de usuários

- [x] API permite listar usuários cadastrados
- [x] API permite visualizar um usuário específico
- [x] API permite editar dados permitidos do usuário
- [x] API permite alterar perfil entre Pesquisador e Administrador
- [x] API permite inativar usuários
- [x] Usuários inativos não acessam o sistema
- [x] Apenas Administrador acessa recursos de /users/**
- [x] API não permite cadastro manual pelo painel (POST /users bloqueado)
- [x] Cadastro público mantido em /auth/register
- [x] Sem exclusão física de usuários

### Gestão de avaliações

- [x] Administrador visualiza avaliações
- [x] Administrador edita avaliações
- [x] Administrador inativa avaliações
- [x] Administrador reativa avaliações inativas
- [x] API não disponibiliza cadastro manual pela web (POST sem API Key)
- [x] Pesquisador não edita, inativa ou reativa (403)
- [x] Pesquisador visualiza lista e base do mapa (GET)
- [x] Avaliações com status ativo/inativo
- [x] API retorna região vinculada quando existir
- [x] Sem exclusão física de avaliações
- [x] Integração móvel preservada (POST com X-API-Key)

---

## 6. Observações finais

- Frontend (vess-web-app-main): não implementado nesta entrega; existe guia em docs/implementacao-gestao-usuarios-frontend.md.
- Documentação técnica adicional: docs/gestao-avaliacoes-backend.md.
- Substitua IDs de exemplo (1) pelos IDs reais do banco PostgreSQL (vess).
- No login do Postman, não envie Bearer Token na request de login (use No Auth).

---

Documento gerado para cópia em relatório, wiki ou documentação do projeto.
