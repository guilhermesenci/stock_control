# Sistema de Gestão de Armazenamento de Estoque (Engemon)

> Gerenciamento de estoque interno para a obra de revitalização do Aeroporto de Congonhas pela empresa Engemon.

---

## Sobre o Projeto

Este repositório contém o backend e frontend de um sistema de controle de estoque desenvolvido como Projeto Integrador da UNIVESP para a empresa Engemon. O objetivo é substituir planilhas Excel por uma aplicação web que automatiza e torna mais confiáveis as operações de entrada e saída de materiais, emissão de relatórios de status e custos, e gerenciamento de usuários com autenticação segura via JWT.

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

## Arquitetura Geral

1. **inventory/**: aplicação principal com modelos, views, serializers e testes.
2. **stock\_control\_webservices/**: configuração Django do projeto (settings, URLs, WSGI/ASGI).
3. **frontend/**: interface em Vue.js consumindo a API REST.
4. **tests/**: testes automatizados com cobertura das operações CRUD e autenticação.

---

## Pré-requisitos

* Python 3.12+
* Node.js 18+ e npm/yarn
* PostgreSQL 14+
