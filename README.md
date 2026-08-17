Aqui está um **README.md** detalhado e bem estruturado documentando todas as funções, o fluxo de execução encadeado e o propósito do sistema.

---

# 🔄 Sistema de Reset e Atualização Automática de Eventos (Google Apps Script)

Este repositório contém o código em **Google Apps Script** responsável por realizar a manutenção, limpeza (reset) e reconfiguração dinâmica de formulários e planilhas vinculadas para a gestão de eventos com **Consultores** e **Equipes**.

---

## 📋 Sumário

* [Visão Geral](https://www.google.com/search?q=%23vis%C3%A3o-geral)
* [Fluxo de Execução Encadeado](https://www.google.com/search?q=%23fluxo-de-execu%C3%A7%C3%A3o-encadeado)
* [Módulos e Funções](https://www.google.com/search?q=%23m%C3%B3dulos-e-fun%C3%A7%C3%B5es)
* [1. Reset de Dados](https://www.google.com/search?q=%231-reset-de-dados)
* [2. Atualização de Formulários](https://www.google.com/search?q=%232-atualiza%C3%A7%C3%A3o-de-formul%C3%A1rios)
* [3. Limpeza de Colunas e Disparadores](https://www.google.com/search?q=%233-limpeza-de-colunas-e-disparadores)


* [Boas Práticas & Tecnologias](https://www.google.com/search?q=%23boas-pr%C3%A1ticas--tecnologias)

---

## 🛠️ Visão Geral

O script atua como um pipeline completo de renovação para novas edições do evento. Ele:

1. **Limpa respostas e dados acumulados** nas abas `consultores`, `equipes` e `tabela expandida`.
2. **Atualiza a grade de horários** no Google Forms com base na aba `DATAS`.
3. **Remove colunas órfãs** geradas por antigas respostas.
4. **Atualiza os cabeçalhos/descrições** dos formulários de Consultores e Equipes.
5. **Apaga respostas antigas dos formulários** e reconfigura os acionadores (*triggers*) do projeto.

---

## 🔄 Fluxo de Execução Encadeado

A execução principal começa na função `reset_consultants()` e encadeia as demais funções sequencialmente:

```
reset_consultants()
 └── limpa_equipes()
      └── limpa_dados()
           └── limpa_comentarios()
                └── atualizarHorariosNoForms()
                     └── limparColunasOrfas()
                          └── atualizarDescricaoConsultores()
                               └── atualizarDescricaoEquipes()
                                    └── setup_trigger()

```

---

## ⚙️ Módulos e Funções

### 1. Reset de Dados

#### `reset_consultants()`

* **Objetivo:** Ponto de entrada do reset. Limpa os dados de consultores.
* **Ações:**
* Apaga fisicamente todas as linhas da aba `consultores` a partir da linha 2 (preserva o cabeçalho na linha 1).
* Limpa o conteúdo das células da coluna `F` em diante (da linha 1 até a última).
* Chama `limpa_equipes()`.



#### `limpa_equipes()`

* **Objetivo:** Reset da estrutura de equipes e formulário vinculado.
* **Ações:**
* Remove todos os itens do Google Forms vinculado à aba `equipes` (se houver).
* Deleta as colunas `B` em diante na aba `equipes`.
* Deleta todas as linhas de dados a partir da linha 2.
* Chama `limpa_dados()`.



#### `limpa_dados()`

* **Objetivo:** Limpa identificadores e links na tabela de consolidação.
* **Ações:**
* Limpa os conteúdos das colunas `I` (índice 9 - `event_id`), `M` (índice 13 - `Mediação`) e `N` (índice 14 - `Link`) na aba `tabela expandida`.
* Chama `limpa_comentarios()`.



#### `limpa_comentarios()`

* **Objetivo:** Remove notas anexadas às células da tabela expandida.
* **Ações:**
* Varre em lote as notas (*notes*) das colunas `I` e `N` na aba `tabela expandida` e remove qualquer nota existente.
* Chama `atualizarHorariosNoForms()`.



---

### 2. Atualização de Formulários

#### `atualizarHorariosNoForms()`

* **Objetivo:** Sincronizar a grade de horários do formulário de consultores com a aba `DATAS`.
* **Ações:**
* Lê as colunas `B` (data) e `C` (hora) da aba `DATAS`.
* Agrupa datas únicas formatadas como `(dia_semana) DD/MM` (linhas do formulário).
* Agrupa horários únicos formatados como `HH:mm` (colunas do formulário).
* Localiza a questão do tipo **Grade da Caixa de Seleção** (*Checkbox Grid Item*) de título `"Horários"` no formulário de consultores e atualiza suas linhas e colunas.
* Chama `limparColunasOrfas()`.



#### `atualizarDescricaoConsultores()`

* **Objetivo:** Atualizar o cabeçalho e resetar respostas do Forms de Consultores.
* **Ações:**
* Lê o texto da célula/variável `CABECALHO_CONSULTORES`.
* Atualiza a descrição principal no topo do formulário vinculado à aba `consultores`.
* Exclui todas as respostas registradas (*responses*) no formulário.
* Chama `atualizarDescricaoEquipes()`.



#### `atualizarDescricaoEquipes()`

* **Objetivo:** Atualizar o cabeçalho e resetar respostas do Forms de Equipes.
* **Ações:**
* Lê o texto da célula/variável `CABECALHO_EQUIPES`.
* Atualiza a descrição principal no topo do formulário vinculado à aba `equipes`.
* Exclui todas as respostas registradas (*responses*) no formulário.
* Chama `setup_trigger()`.



---

### 3. Limpeza de Colunas e Disparadores

#### `limparColunasOrfas()`

* **Objetivo:** Remover colunas vazias intermediárias geradas por formulários dinâmicos.
* **Ações:**
* Aguarda 3 segundos (`Utilities.sleep(3000)`) para sincronização da planilha.
* Inspeciona os cabeçalhos na linha 1 da aba `consultores` a partir da coluna `F`.
* Se houver colunas vazias antes da primeira coluna contendo dados, exclui esse bloco de colunas órfãs.
* Chama `atualizarDescricaoConsultores()`.



#### `setup_trigger()`

* **Objetivo:** Reconfigurar os disparadores (*triggers*) do Google Apps Script.
* **Ações:**
* Remove todos os *triggers* do projeto para evitar duplicações.
* Cria um novo *trigger* vinculado à planilha para a função `on_form_submit` no evento `onFormSubmit()` (envio de formulário).



---

## 📌 Requisitos e Configurações Globais

Para que os scripts funcionem corretamente, garanta que:

1. **Nomes das Abas:** A planilha deve conter exatamente as seguintes abas:
* `consultores`
* `equipes`
* `tabela expandida`
* `DATAS`


2. **Variáveis Globais:** As seguintes variáveis globais/ranges nomeados devem estar definidos no projeto:
* `CABECALHO_CONSULTORES`
* `CABECALHO_EQUIPES`


3. **Formulários Vinculados:** As abas `consultores` e `equipes` devem estar vinculadas aos seus respectivos Google Forms.
