# Sistema de Gestão de Armazenamento de Estoque

> Aplicação web para gerenciamento de estoque interno, substituindo planilhas e processos manuais.

---

## Sobre o Projeto

Este repositório contém o backend e frontend de um sistema de controle de estoque desenvolvido para fins acadêmicos. O objetivo é substituir planilhas Excel por uma aplicação web que automatiza e torna mais confiáveis as operações de entrada e saída de materiais, emissão de relatórios de status e custos, e gerenciamento de usuários com autenticação segura via JWT.

---

## Tecnologias Utilizadas

* **Python 3.12**
* **Django 5.2**
* **Django REST Framework**
* **PostgreSQL**
* **Vue.js** com **TypeScript**
* **JWT** (JSON Web Token)
* **pytest** & **pytest-django**
* **Virtualenv** + **django-environ**

---

## Funcionalidades

* CRUD de itens, notas fiscais, entradas e saídas de materiais
* Autenticação e autorização via JWT
* Relatórios de status de estoque e custos
* Cadastro e gerenciamento de usuários
* Validação de rotinas e notificações de erros humanos minimizados

---

## Estrutura Geral

1. **stock_control_backend/**: aplicação principal com modelos, views, serializers e testes.
2. **stock_control_frontend/**: interface em Vue.js consumindo a API REST.
3. **tests/**: testes automatizados com cobertura das operações CRUD e autenticação.

---

## Pré-requisitos

* Python 3.12+
* Node.js 18+ e npm/yarn
* PostgreSQL 14+

---

## Instalação do Backend

1. Abra o terminal e navegue até a pasta do backend:
   ```sh
   cd stock_control_backend
   ```
2. Crie um ambiente virtual:
   ```sh
   python -m venv venv
   ```
3. Ative o ambiente virtual:
   - **Windows:**
     ```sh
     venv\Scripts\activate
     ```
   - **Linux/macOS:**
     ```sh
     source venv/bin/activate
     ```
4. Instale as dependências:
   ```sh
   pip install -r requirements.txt
   ```
