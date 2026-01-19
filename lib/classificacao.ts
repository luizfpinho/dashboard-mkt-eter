import { Lead, LeadClassificado } from '@/types/lead';

/**
 * Classifica um lead em Business Unit (BU) e ICP baseado no faturamento
 */
export function classificarLead(lead: Lead): LeadClassificado {
  // Proteção contra dados inválidos
  const fat = (lead.faturamento || '').toLowerCase().trim();

  let bu: LeadClassificado['bu'] = 'Não Qualificado';
  let icp: LeadClassificado['icp'] = null;

  // CONSULTORIA (faturamento >= R$ 100k/mês ou >= 1MM/ano)
  if (fat.includes('mais de 10 milhões') || fat.includes('mais de 10 milhoes')) {
    bu = 'Consultoria';
    icp = 'ICP3';
  } else if (fat.includes('5 a 10 milhões') || fat.includes('5 a 10 milhoes') || fat.includes('de 5 a 10 milhões') || fat.includes('de 5 a 10 milhoes')) {
    bu = 'Consultoria';
    icp = 'ICP2';
  } else if (fat.includes('1 milhão a 5 milhões') || fat.includes('1 milhao a 5 milhoes') || fat.includes('de 1 milhão a 5 milhões') || fat.includes('de 1 milhao a 5 milhoes')) {
    bu = 'Consultoria';
    icp = 'ICP1';
  }
  // ACELERADORA POR ANO (500k - 1MM/ano)
  else if (fat.includes('700 mil a 1 milhão') || fat.includes('700 mil a 1 milhao') || fat.includes('de 700 mil a 1 milhão') || fat.includes('de 700 mil a 1 milhao')) {
    bu = 'Aceleradora';
    icp = 'ICP3';
  } else if (fat.includes('500 a 700 mil por ano') || fat.includes('de 500 a 700 mil por ano')) {
    bu = 'Aceleradora';
    icp = 'ICP2';
  }
  // ACELERADORA POR MÊS (10k - 50k/mês) - Vem após o pipe " | "
  else if (fat.includes('50 a 100 mil por mês') || fat.includes('de 50 a 100 mil por mês')) {
    bu = 'Aceleradora';
    icp = 'ICP3';
  } else if (fat.includes('30 a 50 mil por mês') || fat.includes('de 30 a 50 mil por mês')) {
    bu = 'Aceleradora';
    icp = 'ICP2';
  } else if (fat.includes('20 a 30 mil por mês') || fat.includes('de 20 a 30 mil por mês')) {
    bu = 'Aceleradora';
    icp = 'ICP1';
  } else if (fat.includes('10 a 20 mil por mês') || fat.includes('de 10 a 20 mil por mês')) {
    bu = 'Aceleradora';
    icp = 'ICP1';
  }

  // CANAL
  const canal = classificarOrigem(lead.origem);

  return {
    ...lead,
    bu,
    icp,
    canal
  };
}

/**
 * Classifica a origem/canal do lead
 */
export function classificarOrigem(utm: string): string {
  // Proteção contra dados inválidos
  const utmLower = (utm || '').toLowerCase().trim();

  if (utmLower.includes('bio-eter')) {
    return 'bio-eter';
  } else if (utmLower.includes('fermento')) {
    return 'fermento';
  } else if (utmLower.includes('bio')) {
    return 'bio';
  } else if (utmLower.includes('storys') || utmLower.includes('stories')) {
    return 'storys';
  } else if (utmLower && utmLower !== '' && utmLower !== 'null' && utmLower !== 'none') {
    return 'Tráfego Pago';
  } else {
    return 'Não identificado';
  }
}

/**
 * Remove duplicatas de leads baseado no email
 * Mantém o lead mais recente quando houver duplicatas
 */
export function deduplicarLeads(leads: LeadClassificado[]): LeadClassificado[] {
  if (!leads || leads.length === 0) {
    return [];
  }

  const emailsVistos = new Set<string>();
  const leadsUnicos: LeadClassificado[] = [];
  let duplicatasRemovidas = 0;

  // Processar em ordem reversa para manter o lead mais recente
  for (let i = leads.length - 1; i >= 0; i--) {
    const lead = leads[i];

    // Validar que o lead tem email
    if (!lead.email || lead.email.trim() === '') {
      console.warn('Lead sem email encontrado:', lead.nome);
      continue;
    }

    const emailNormalizado = lead.email.toLowerCase().trim();

    if (!emailsVistos.has(emailNormalizado)) {
      emailsVistos.add(emailNormalizado);
      leadsUnicos.unshift(lead);
    } else {
      duplicatasRemovidas++;
      if (process.env.NODE_ENV === 'development') {
        console.log(`Duplicata removida: ${lead.nome} (${lead.email})`);
      }
    }
  }

  if (duplicatasRemovidas > 0) {
    console.log(`📊 Deduplicação: ${leads.length} leads → ${leadsUnicos.length} únicos (${duplicatasRemovidas} duplicatas removidas)`);
  }

  return leadsUnicos;
}

/**
 * Filtra leads baseado nos critérios selecionados
 */
export function filtrarLeads(
  leads: LeadClassificado[],
  filtros: {
    dataInicio?: Date | null;
    dataFim?: Date | null;
    origens?: string[];
    bus?: string[];
    icps?: string[];
    semana?: number | null;
  }
): LeadClassificado[] {
  let resultado = [...leads];

  // Filtro de data (trabalhando em UTC para compatibilidade com timestamps ISO)
  if (filtros.dataInicio && filtros.dataFim) {
    // Quando ambas as datas estão presentes
    const dataInicioAjustada = new Date(filtros.dataInicio);
    dataInicioAjustada.setUTCHours(0, 0, 0, 0);

    const dataFimAjustada = new Date(filtros.dataFim);
    dataFimAjustada.setUTCHours(23, 59, 59, 999);

    resultado = resultado.filter(lead => {
      const dataLead = lead.dataHora instanceof Date ? lead.dataHora : new Date(lead.dataHora);
      return dataLead >= dataInicioAjustada && dataLead <= dataFimAjustada;
    });
  } else if (filtros.dataInicio) {
    // Apenas data início
    const dataInicioAjustada = new Date(filtros.dataInicio);
    dataInicioAjustada.setUTCHours(0, 0, 0, 0);

    resultado = resultado.filter(lead => {
      const dataLead = lead.dataHora instanceof Date ? lead.dataHora : new Date(lead.dataHora);
      return dataLead >= dataInicioAjustada;
    });
  } else if (filtros.dataFim) {
    // Apenas data fim
    const dataFimAjustada = new Date(filtros.dataFim);
    dataFimAjustada.setUTCHours(23, 59, 59, 999);

    resultado = resultado.filter(lead => {
      const dataLead = lead.dataHora instanceof Date ? lead.dataHora : new Date(lead.dataHora);
      return dataLead <= dataFimAjustada;
    });
  }

  // Filtro de semana (baseado no dia do mês)
  if (filtros.semana !== null && filtros.semana !== undefined && filtros.semana !== 0) {
    resultado = resultado.filter(lead => {
      const dataLead = lead.dataHora instanceof Date ? lead.dataHora : new Date(lead.dataHora);
      const dia = dataLead.getDate();

      if (filtros.semana === 1) return dia >= 1 && dia <= 7;
      if (filtros.semana === 2) return dia >= 8 && dia <= 14;
      if (filtros.semana === 3) return dia >= 15 && dia <= 21;
      if (filtros.semana === 4) return dia >= 22 && dia <= 28;
      if (filtros.semana === 5) return dia >= 29 && dia <= 31;

      return true;
    });
  }

  // Filtro de origem
  if (filtros.origens && filtros.origens.length > 0) {
    resultado = resultado.filter(lead => filtros.origens!.includes(lead.canal));
  }

  // Filtro de BU
  if (filtros.bus && filtros.bus.length > 0) {
    resultado = resultado.filter(lead => filtros.bus!.includes(lead.bu));
  }

  // Filtro de ICP
  if (filtros.icps && filtros.icps.length > 0) {
    resultado = resultado.filter(lead => {
      if (!lead.icp) return false;
      return filtros.icps!.includes(lead.icp);
    });
  }

  return resultado;
}
