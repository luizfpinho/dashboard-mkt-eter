/**
 * Utilitários para trabalhar com fuso horário de Brasília (GMT-3)
 */

/**
 * Retorna a data/hora atual no fuso horário de Brasília (America/Sao_Paulo)
 */
export function getDataHoraBrasilia(): Date {
  // Criar data UTC
  const agora = new Date();

  // Converter para horário de Brasília usando toLocaleString
  const brasiliaStr = agora.toLocaleString('en-US', {
    timeZone: 'America/Sao_Paulo'
  });

  return new Date(brasiliaStr);
}

/**
 * Retorna apenas a data de hoje em Brasília (sem hora)
 * com hora zerada (00:00:00.000)
 */
export function getHojeBrasilia(): Date {
  const agora = getDataHoraBrasilia();
  agora.setHours(0, 0, 0, 0);
  return agora;
}

/**
 * Converte uma data UTC para o fuso horário de Brasília
 */
export function converterParaBrasilia(dataUTC: Date): Date {
  const brasiliaStr = dataUTC.toLocaleString('en-US', {
    timeZone: 'America/Sao_Paulo'
  });
  return new Date(brasiliaStr);
}

/**
 * Verifica se uma data UTC corresponde a um dia específico em Brasília
 */
export function ehMesmoDiaBrasilia(dataUTC: Date, diaReferencia: Date): boolean {
  const dataBrasilia = converterParaBrasilia(dataUTC);
  const refBrasilia = converterParaBrasilia(diaReferencia);

  return (
    dataBrasilia.getFullYear() === refBrasilia.getFullYear() &&
    dataBrasilia.getMonth() === refBrasilia.getMonth() &&
    dataBrasilia.getDate() === refBrasilia.getDate()
  );
}

/**
 * Retorna o início do dia em Brasília (00:00:00.000) mas em UTC
 * Para usar em comparações com timestamps UTC do banco
 */
export function getInicioDiaBrasiliaEmUTC(data: Date): Date {
  // Converter a data para Brasília
  const dataBrasilia = converterParaBrasilia(data);
  dataBrasilia.setHours(0, 0, 0, 0);

  // Brasília é GMT-3, então precisamos adicionar 3 horas para voltar ao UTC
  const utc = new Date(dataBrasilia);
  utc.setHours(utc.getHours() + 3);

  return utc;
}

/**
 * Retorna o fim do dia em Brasília (23:59:59.999) mas em UTC
 * Para usar em comparações com timestamps UTC do banco
 */
export function getFimDiaBrasiliaEmUTC(data: Date): Date {
  // Converter a data para Brasília
  const dataBrasilia = converterParaBrasilia(data);
  dataBrasilia.setHours(23, 59, 59, 999);

  // Brasília é GMT-3, então precisamos adicionar 3 horas para voltar ao UTC
  const utc = new Date(dataBrasilia);
  utc.setHours(utc.getHours() + 3);

  return utc;
}

/**
 * Formata uma data no formato brasileiro dd/MM/yyyy
 */
export function formatarDataBrasil(data: Date): string {
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = data.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

/**
 * Formata data e hora no formato brasileiro dd/MM/yyyy HH:mm
 */
export function formatarDataHoraBrasil(data: Date): string {
  const dataBrasilia = converterParaBrasilia(data);
  const dia = String(dataBrasilia.getDate()).padStart(2, '0');
  const mes = String(dataBrasilia.getMonth() + 1).padStart(2, '0');
  const ano = dataBrasilia.getFullYear();
  const hora = String(dataBrasilia.getHours()).padStart(2, '0');
  const minuto = String(dataBrasilia.getMinutes()).padStart(2, '0');
  return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
}
