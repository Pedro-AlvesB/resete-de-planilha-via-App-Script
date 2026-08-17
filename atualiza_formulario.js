function atualizarDescricaoConsultores() {
  /**
   * Lê o texto da descrição da célula CABECALHO_CONSULTORES,
   * converte quebras de linha e atualiza a DESCRIÇÃO PRINCIPAL (cabeçalho)
   * do formulário.
   */

  // 1. Lê o texto da descrição diretamente do CABECALHO_CONSULTORES
  const textoTemplate = CABECALHO_CONSULTORES.getValue();

  if (!textoTemplate) {
    Logger.log('Célula de descrição vazia. Nada foi atualizado.');
    return;
  }

  Logger.log('Texto final da descrição:\n' + textoTemplate);

  // 3. Abre o formulário vinculado à aba "consultores"
  const abaConsultores = SpreadsheetApp.getActive().getSheetByName('consultores');
  
  if (!abaConsultores) {
    Logger.log('Aba "consultores" não foi encontrada.');
    return;
  }

  const formUrl = abaConsultores.getFormUrl();
  if (!formUrl) {
    Logger.log('Nenhum formulário vinculado à aba "consultores".');
    return;
  }

  const form = FormApp.openByUrl(formUrl);

  // 4. Atualiza a descrição principal do topo do formulário
  form.setDescription(textoTemplate);

  Logger.log(`Descrição principal do formulário "${form.getTitle()}" atualizada com sucesso.`);
  
  // --- VALIDAÇÃO E LIMPEZA DE RESPOSTAS ---
  const respostas = form.getResponses();

  if (respostas.length > 0) {
    form.deleteAllResponses();
    Logger.log(`Sucesso: ${respostas.length} resposta(s) excluída(s) do formulário!`);
  } else {
    Logger.log("Nenhuma resposta registrada no formulário para excluir.");
  }
  
  // Chama a próxima função
  atualizarDescricaoEquipes();
}

function atualizarDescricaoEquipes() {
  /**
   * Lê o texto da descrição da célula CABECALHO_CONSULTORES,
   * converte quebras de linha e atualiza a DESCRIÇÃO PRINCIPAL (cabeçalho)
   * do formulário.
   */

  // 1. Lê o texto da descrição diretamente do CABECALHO_CONSULTORES
  const textoTemplate = CABECALHO_EQUIPES.getValue();

  if (!textoTemplate) {
    Logger.log('Célula de descrição vazia. Nada foi atualizado.');
    return;
  }

  Logger.log('Texto final da descrição:\n' + textoTemplate);

  // 3. Abre o formulário vinculado à aba "consultores"
  const abaEquipes = SpreadsheetApp.getActive().getSheetByName('equipes');
  
  if (!abaEquipes) {
    Logger.log('Aba "equipes" não foi encontrada.');
    return;
  }

  const formUrl = abaEquipes.getFormUrl();
  if (!formUrl) {
    Logger.log('Nenhum formulário vinculado à aba "equipes".');
    return;
  }

  const form = FormApp.openByUrl(formUrl);

  // 4. Atualiza a descrição principal do topo do formulário
  form.setDescription(textoTemplate);

  Logger.log(`Descrição principal do formulário "${form.getTitle()}" atualizada com sucesso.`);
  
  // --- VALIDAÇÃO E LIMPEZA DE RESPOSTAS ---
  const respostas = form.getResponses();

  if (respostas.length > 0) {
    form.deleteAllResponses();
    Logger.log(`Sucesso: ${respostas.length} resposta(s) excluída(s) do formulário!`);
  } else {
    Logger.log("Nenhuma resposta registrada no formulário para excluir.");
  }
  setup_trigger();
}


function setup_trigger() {
  /**
   * Remove todos os acionadores existentes do projeto e cria um novo:
   * on_form_submit, disparado ao enviar o formulário vinculado à planilha.
   */

  // remove todos os acionadores atuais, evitando duplicados
  ScriptApp.getProjectTriggers().forEach(function (trigger) {
    ScriptApp.deleteTrigger(trigger);
  });
  Logger.log('Acionadores antigos removidos.');

  // cria o acionador: on_form_submit, origem planilha, evento "ao enviar formulário"
  ScriptApp.newTrigger('on_form_submit')
    .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
    .onFormSubmit()
    .create();

  Logger.log('Acionador on_form_submit criado com sucesso.');
}