import Papa from 'papaparse';
import { Lead } from '@/types/lead';

export const SPREADSHEET_ID = '1eiImA4miDAgoGpUcxo20EbRmWsuMldY4LbrKTEARACg';
const GID = '996023627';

/**
 * Busca e faz parse do CSV do Google Sheets
 */
export async function fetchAndParseCsv(): Promise<string[][]> {
  const csvUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${GID}`;

  const response = await fetch(csvUrl, {
    cache: 'no-store',
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar planilha: ${response.statusText}`);
  }

  const csvText = await response.text();

  const parseResult = Papa.parse<string[]>(csvText, {
    skipEmptyLines: true,
  });

  if (parseResult.errors.length > 0) {
    console.error('Erros no parse do CSV:', parseResult.errors);
  }

  return parseResult.data;
}

/**
 * Encontra o indice da coluna de data/hora e extrai origem e investimento
 */
function extrairCamposDinamicos(
  row: string[],
  offsetInicio: number
): { dataHoraStr: string; origem: string; investimentoMarketing: string } {
  let dataHoraStr = '';
  let origem = '';
  let investimentoMarketing = '';

  // Procurar data nos indices relativos ao offset
  const indicesData = [offsetInicio + 4, offsetInicio + 3, offsetInicio + 2];

  for (const idx of indicesData) {
    if (row[idx] && row[idx].match(/^\d{4}-\d{2}-\d{2}T/)) {
      dataHoraStr = row[idx];
      investimentoMarketing = row[idx - 2] || '';
      origem = row[idx - 1] || '';
      break;
    }
  }

  return { dataHoraStr, origem, investimentoMarketing };
}

/**
 * Mapeia uma linha do CSV para um objeto Lead
 * Lida com dois formatos de planilha (antigo com coluna B vazia e novo)
 */
export function mapRowToLead(row: string[], index: number): Lead | null {
  try {
    const isFormatoAntigo = !row[1] || row[1].trim() === '';

    let nome: string;
    let email: string;
    let telefone: string;
    let faturamento: string;
    let colaboradores: string;
    let instagram: string;
    let offsetInicio: number;

    if (isFormatoAntigo) {
      nome = row[0] || '';
      email = row[2] || '';
      telefone = row[3] || '';
      faturamento = row[4] || '';
      colaboradores = row[5] || '';
      instagram = row[6] || '';
      offsetInicio = 7;
    } else {
      nome = row[0] || '';
      email = row[1] || '';
      telefone = row[2] || '';
      faturamento = row[3] || '';
      colaboradores = row[4] || '';
      instagram = row[5] || '';
      offsetInicio = 6;
    }

    const { dataHoraStr, origem, investimentoMarketing } =
      extrairCamposDinamicos(row, offsetInicio);

    let dataHora = new Date();
    if (dataHoraStr) {
      dataHora = new Date(dataHoraStr);
      if (isNaN(dataHora.getTime())) {
        console.error(`Data invalida na linha ${index + 1}: ${dataHoraStr}`);
        dataHora = new Date();
      }
    }

    return {
      nome,
      email,
      telefone,
      faturamento,
      colaboradores,
      instagram,
      investimentoMarketing,
      origem,
      dataHora,
    };
  } catch (error) {
    console.error(`Erro ao processar linha ${index + 1}:`, error);
    return null;
  }
}

/**
 * Busca leads do Google Sheets, faz parse do CSV e retorna array de Lead
 */
export async function fetchLeads(): Promise<Lead[]> {
  const rows = await fetchAndParseCsv();

  if (rows.length < 1) {
    return [];
  }

  return rows
    .map((row, index) => mapRowToLead(row, index))
    .filter((lead): lead is Lead => lead !== null && lead.email !== '');
}
