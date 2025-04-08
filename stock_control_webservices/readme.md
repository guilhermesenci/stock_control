# Stock Control Webservices

Projeto backend desenvolvido com Django e Django REST Framework para controle de estoques. A aplicação expõe endpoints REST para gerenciamento de itens, notas fiscais, entradas, saídas, fornecedores e usuários. Também há suporte para autenticação via JWT e registro de usuários.

## Tabela de Conteúdos

- [Descrição](#descrição)
- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Rodando a Aplicação](#rodando-a-aplicação)
- [Endpoints da API](#endpoints-da-api)
- [Testes](#testes)
- [Uso do Script de Teste Externo](#uso-do-script-de-teste-externo)
- [Documentação da API](#documentação-da-api)
- [Contribuição](#contribuição)
- [Licença](#licença)

## Descrição

Este projeto oferece uma API para controle de estoque, gerenciando itens, notas fiscais, entradas/saídas e usuários. Desenvolvido com Django, o sistema utiliza o PostgreSQL com um schema customizado e segue boas práticas de desenvolvimento, testes com pytest e autenticação com JWT.

## Funcionalidades

- CRUD de **Itens**, **Notas Fiscais**, **Entradas**, **Saídas**, **Fornecedores** e **Usuários**.
- Endpoint de **registro de usuário** para criação via API.
- Autenticação via **JWT**.
- Testes automatizados com **pytest** e **pytest-django**.

## Arquitetura

- **Backend**: Django 5.2, Django REST Framework.
- **Banco de dados**: PostgreSQL, utilizando o schema `projinteg` para tabelas.
- **Ambiente de desenvolvimento**: Virtualenv e configuração baseada em `.env`.
- **Testes**: Cobertura de testes com pytest (testes unitários e de integração).

## Instalação

1. **Clone o repositório**:
   ```bash
   git clone <URL_DO_REPOSITÓRIO>
   cd stock_control_webservices
