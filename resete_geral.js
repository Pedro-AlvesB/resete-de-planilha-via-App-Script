function reset_consultants() {
  // 1. Abre a planilha ativa e localiza a aba alvo pelo nome
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("consultores");
  
  // Validação de segurança: se a aba não existir, interrompe para evitar quebras
  if (!sheet) {
    Logger.log("Erro: A aba 'consultores' não foi encontrada.");
    SpreadsheetApp.getUi().alert("Erro: A aba 'consultores' não foi encontrada.");
    return;
  }
  
  // 2. Captura os limites máximos absolutos de linhas e colunas atuais
  const ultimaLinha = sheet.getLastRow();
  const ultimaColuna = sheet.getLastColumn();
  
  // =================================================================
  // PROCESSO 1: EXCLUSÃO DE LINHAS (Preservando a Linha 1 - Cabeçalho)
  // =================================================================
  if (ultimaLinha > 1) {
    const linhasParaDeletar = ultimaLinha - 1; // Desconta a linha 1
    
    // Deleta fisicamente as linhas a partir da posição 2
    sheet.deleteRows(2, linhasParaDeletar);
    
    Logger.log(`Sucesso [Linhas]: Foram deletadas ${linhasParaDeletar} linhas (da linha 2 até a linha ${ultimaLinha}).`);
  } else {
    Logger.log("Linhas: Nenhuma linha de dados encontrada para apagar além do cabeçalho.");
  }
  
  // =================================================================
  // PROCESSO 2: LIMPEZA DE CONTEÚDO (Da coluna F até a última coluna)
  // =================================================================
  const COLUNA_F = 6; // A coluna F corresponde ao índice numérico 6 (A=1, B=2...)
  
  if (ultimaColuna >= COLUNA_F) {
    // Calcula quantas colunas existem de F até o extremo direito
    const totalColunasLimpar = ultimaColuna - COLUNA_F + 1;
    
    // Define o intervalo (da linha 1 até a última linha, da coluna F até a última preenchida)
    const intervaloParaLimpar = sheet.getRange(1, COLUNA_F, sheet.getMaxRows(), totalColunasLimpar);
    
    // Apaga apenas o conteúdo das células, sem deletar as colunas do layout
    intervaloParaLimpar.clearContent();
    
    Logger.log(`Sucesso [Colunas]: O conteúdo da coluna F até a coluna de índice ${ultimaColuna} foi apagado.`);
  } else {
    Logger.log("Colunas: A planilha atual não possui dados preenchidos a partir da coluna F.");
  }

  limpa_equipes();
}


function limpa_equipes(){

  const aba = SpreadsheetApp.getActive().getSheetByName('equipes');

  if (!aba) {
    SpreadsheetApp.getUi().alert('Aba "equipes" não encontrada.');
    return; // Este return continua aqui porque sem a aba o script não faz nada
  }

  const ultimaColuna = aba.getLastColumn();

  // ── SE HOUVER COLUNAS ALÉM DA COLUNA A (B em diante) ──
  if (ultimaColuna > 1) {
    // ETAPA 1: apaga todos os itens do formulário vinculado
    const formUrl = aba.getFormUrl();

    if (formUrl) {
      const form = FormApp.openByUrl(formUrl);
      form.getItems().forEach(item => form.deleteItem(item));
      Logger.log('Itens do formulário removidos.');
    } else {
      Logger.log('Nenhum formulário vinculado encontrado na aba equipes.');
    }

    // ETAPA 2: limpa as colunas (B até a última)
    aba.deleteColumns(2, ultimaColuna - 1);
    Logger.log('Limpeza de colunas concluída: B até ' + ultimaColuna);
  } else {
    Logger.log('Nenhuma coluna de dados encontrada para remover (Pulando Etapas 1 e 2).');
  }

  // ── ETAPA 3: deleta todas as linhas a partir da linha 2 ──
  // Roda sempre, mesmo se não houver colunas extras para apagar
  const ultimaLinha = aba.getLastRow();

  if (ultimaLinha >= 2) {
    const totalLinhasParaDeletar = ultimaLinha - 1;
    aba.deleteRows(2, totalLinhasParaDeletar);
    Logger.log(`Limpeza de linhas concluída: ${totalLinhasParaDeletar} linha(s) removida(s).`);
  } else {
    Logger.log('Nenhuma linha de dados encontrada para remover.');
  }

  // ── SUCESSO: Agora esta função SEMPRE será chamada ──
  limpa_dados();
}


function limpa_dados() {
  /**
   * Limpa os dados de event_id, Mediação e Link da tabela expandida,
   * removendo também as notas deixadas pelo prune_pending_events().
   * 
   * Usado para reset entre edições do evento.
   */

  const aba = SpreadsheetApp.getActive().getSheetByName('tabela expandida');

  if (!aba) {
    SpreadsheetApp.getUi().alert('Aba "tabela expandida" não encontrada.');
    return;
  }

  const ultimaLinha = aba.getLastRow();

  if (ultimaLinha <= 1) {
    Logger.log('Nenhuma linha de dados encontrada.');
    return;
  }

  const totalLinhas = ultimaLinha - 1; // desconsidera o cabeçalho

  // ── ETAPA 1: limpa o conteúdo das colunas I, M e N de uma vez ──
  // Coluna I = índice 9, M = 13, N = 14 (base 1)
  [9, 13, 14].forEach(coluna => {
    aba.getRange(2, coluna, totalLinhas, 1).clearContent();
  });

  Logger.log('Etapa 1 concluída: conteúdo de event_id, Mediação e Link apagados.');

  limpa_comentarios();
}

function limpa_comentarios(){
  const aba = SpreadsheetApp.getActive().getSheetByName('tabela expandida');

  if (!aba) {
    SpreadsheetApp.getUi().alert('Aba "tabela expandida" não encontrada.');
    return;
  }

  const ultimaLinha = aba.getLastRow();

  if (ultimaLinha <= 1) {
    Logger.log('Nenhuma linha de dados encontrada.');
    return;
  }

  const totalLinhas = ultimaLinha - 1; // desconsidera o cabeçalho

  // ── ETAPA 2: remove notas das colunas I e N ──
  // Lê todas as notas de uma vez (mais eficiente que célula por célula)
  const notasI = aba.getRange(2, 9, totalLinhas, 1).getNotes();
  const notasN = aba.getRange(2, 14, totalLinhas, 1).getNotes();

  notasI.forEach((linha, i) => {
    if (linha[0] !== '') {
      aba.getRange(i + 2, 9).clearNote();
      Logger.log(`Nota removida: coluna I, linha ${i + 2}`);
    }
  });

  notasN.forEach((linha, i) => {
    if (linha[0] !== '') {
      aba.getRange(i + 2, 14).clearNote();
      Logger.log(`Nota removida: coluna N, linha ${i + 2}`);
    }
  });

  Logger.log('Etapa 2 concluída: notas removidas das colunas I M e N.');

  atualizarHorariosNoForms();
}

/**
 * Lê a aba DATAS e atualiza o item "Horários" (Grade da caixa de seleção)
 * do formulário de inscrição de consultores.
 */
function atualizarHorariosNoForms() {
  const ss = SpreadsheetApp.getActive();
  const abaDatas = ss.getSheetByName('DATAS');

  if (!abaDatas) {
    Logger.log('Aba "DATAS" não encontrada.');
    return;
  }

  const ultimaLinha = abaDatas.getLastRow();
  if (ultimaLinha < 2) {
    Logger.log('Nenhum dado na aba DATAS.');
    return;
  }

  // lê colunas B (data) e C (hora) a partir da linha 2
  const valores = abaDatas.getRange(2, 2, ultimaLinha - 1, 2).getValues();

  // ── extrai datas únicas e horas únicas, preservando a ordem de aparição ──
  const datasUnicas = [];
  const chavesDatas = new Set();

  const horasUnicas = [];
  const chavesHoras = new Set();

  valores.forEach(([data, hora]) => {
    if (!(data instanceof Date) || !(hora instanceof Date)) return;

    // chave por dia (ignora o horário na comparação)
    const chaveData = `${data.getFullYear()}-${data.getMonth()}-${data.getDate()}`;
    if (!chavesDatas.has(chaveData)) {
      chavesDatas.add(chaveData);
      datasUnicas.push(data);
    }

    // chave por horário (ignora a data na comparação)
    const chaveHora = `${hora.getHours()}:${hora.getMinutes()}`;
    if (!chavesHoras.has(chaveHora)) {
      chavesHoras.add(chaveHora);
      horasUnicas.push(hora);
    }
  });

  if (datasUnicas.length === 0 || horasUnicas.length === 0) {
    Logger.log('Nenhuma data ou hora válida encontrada.');
    return;
  }

  // ── formata as linhas: "(dia da semana) DD/MM" ──
  const diasSemana = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  const fuso = Session.getScriptTimeZone();

  const linhas = datasUnicas.map(data => {
    const diaSemana = diasSemana[data.getDay()];
    const dataFormatada = Utilities.formatDate(data, fuso, 'dd/MM');
    return `(${diaSemana}) ${dataFormatada}`;
  });

  // ── formata as colunas: "HH:mm" ──
  const colunas = horasUnicas.map(hora =>
    Utilities.formatDate(hora, fuso, 'HH:mm')
  );

  // ── abre o formulário de consultores (NÃO é o de equipes) ──
  const abaConsultores = ss.getSheetByName('consultores');
  if (!abaConsultores) {
    Logger.log('Aba "consultores" não encontrada.');
    return;
  }

  const formUrl = abaConsultores.getFormUrl();
  if (!formUrl) {
    Logger.log('Nenhum formulário vinculado à aba consultores.');
    return;
  }

  const form = FormApp.openByUrl(formUrl);

  // ── localiza o item "Horários" (Grade da caixa de seleção) ──
  const itemHorarios = form.getItems(FormApp.ItemType.CHECKBOX_GRID)
    .find(item => item.getTitle().trim() === 'Horários');

  if (!itemHorarios) {
    Logger.log('Item "Horários" (Grade da caixa de seleção) não encontrado no formulário.');
    return;
  }

  const gridItem = itemHorarios.asCheckboxGridItem();

  // 1. REESCREVE as linhas e colunas do Forms com as novas opções
  gridItem.setRows(linhas);
  gridItem.setColumns(colunas);

  // // 2. REESCREVE os cabeçalhos na planilha (da coluna E em diante) para sincronia perfeita
  // const novosCabecalhos = linhas.map(dia => `Horários [${dia}]`);
  
  // if (novosCabecalhos.length > 0) {
  //   // Linha 1, Coluna 5 (E), 1 linha de altura, largura dinâmica com base no número de novos dias
  //   abaConsultores.getRange(1, 5, 1, novosCabecalhos.length).setValues([novosCabecalhos]);
  //   Logger.log(`Cabeçalhos atualizados na aba consultores (E1 em diante).`);
  // }
  
  Logger.log(`Formulário e planilha atualizados com sucesso: ${linhas.length} linha(s) e ${colunas.length} coluna(s).`);
  Logger.log('Linhas enviadas ao Forms: ' + linhas.join(', '));
  Logger.log('Colunas enviadas ao Forms: ' + colunas.join(', '));

  limparColunasOrfas();
}

function limparColunasOrfas() {
  Utilities.sleep(3000);

  const ss = SpreadsheetApp.getActive();
  const aba = ss.getSheetByName('consultores');

  if (!aba) {
    Logger.log('Aba "consultores" não encontrada.');
    return;
  }

  const ultimaColuna = aba.getLastColumn();

  // se não há colunas a partir de F (índice 6), não há órfãs para deletar
  if (ultimaColuna < 6) {
    Logger.log('Nenhuma coluna a partir de F. Pulando limpeza de órfãs.');
    atualizarDescricaoConsultores();
    return;
  }

  const linha1 = aba.getRange(1, 6, 1, ultimaColuna - 5).getValues()[0];

  let primeiraColunaDados = -1;
  for (let i = 0; i < linha1.length; i++) {
    if (linha1[i] !== '') {
      primeiraColunaDados = i + 6;
      break;
    }
  }

  if (primeiraColunaDados === -1) {
    Logger.log('Nenhuma coluna com dado encontrada a partir de F.');
    atualizarDescricaoConsultores();
    return;
  }

  const quantidadeColunas = primeiraColunaDados - 6;

  if (quantidadeColunas <= 0) {
    Logger.log('Nenhuma coluna órfã encontrada.');
    atualizarDescricaoConsultores();
    return;
  }

  aba.deleteColumns(6, quantidadeColunas);
  Logger.log(`${quantidadeColunas} coluna(s) órfã(s) deletadas a partir de F.`);

  atualizarDescricaoConsultores();
}