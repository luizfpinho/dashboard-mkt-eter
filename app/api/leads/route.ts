import { NextResponse } from 'next/server';
import Papa from 'papaparse';
import { Lead } from '@/types/lead';

const SPREADSHEET_ID = '1eiImA4miDAgoGpUcxo20EbRmWsuMldY4LbrKTEARACg';
const GID = '996023627';

export async function GET() {
  try {
    // URL para exportar a planilha como CSV
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${GID}`;

    // Fetch da planilha
    const response = await fetch(csvUrl, {
      cache: 'no-store', // Sempre buscar dados frescos
      redirect: 'follow' // Seguir redirects
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar planilha: ${response.statusText}`);
    }

    const csvText = await response.text();

    // Parse do CSV
    const parseResult = Papa.parse<string[]>(csvText, {
      skipEmptyLines: true
    });

    if (parseResult.errors.length > 0) {
      console.error('Erros no parse do CSV:', parseResult.errors);
    }

    const rows = parseResult.data;

    // Verificar se há dados
    if (rows.length < 1) {
      return NextResponse.json([]);
    }

    // A planilha NÃO tem header, começar desde a primeira linha
    const dataRows = rows;

    // Mapear para objetos Lead
    const mappedLeads = dataRows
      .map((row, index) => {
        try {
          // IMPORTANTE: A planilha tem estruturas MUITO inconsistentes!
          // Há dois formatos:
          // FORMATO ANTIGO: coluna B (índice 1) vazia
          // FORMATO NOVO: coluna B (índice 1) tem email

          // Detectar formato: se coluna 1 está vazia, é formato antigo
          const isFormatoAntigo = !row[1] || row[1].trim() === '';

          let nome, email, telefone, faturamento, colaboradores, instagram;
          let dataHoraStr = '';
          let origem = '';
          let investimentoMarketing = '';

          if (isFormatoAntigo) {
            // FORMATO ANTIGO: shift de +1 (coluna B vazia)
            nome = row[0] || '';
            email = row[2] || '';
            telefone = row[3] || '';
            faturamento = row[4] || '';
            colaboradores = row[5] || '';
            instagram = row[6] || '';

            // Procurar data nos índices 11, 10 ou 9
            if (row[11] && row[11].match(/^\d{4}-\d{2}-\d{2}T/)) {
              dataHoraStr = row[11];
              investimentoMarketing = row[9] || '';
              origem = row[10] || '';
            } else if (row[10] && row[10].match(/^\d{4}-\d{2}-\d{2}T/)) {
              dataHoraStr = row[10];
              investimentoMarketing = row[8] || '';
              origem = row[9] || '';
            } else if (row[9] && row[9].match(/^\d{4}-\d{2}-\d{2}T/)) {
              dataHoraStr = row[9];
              investimentoMarketing = row[7] || '';
              origem = row[8] || '';
            }
          } else {
            // FORMATO NOVO: sem shift (coluna B tem email)
            nome = row[0] || '';
            email = row[1] || '';
            telefone = row[2] || '';
            faturamento = row[3] || '';
            colaboradores = row[4] || '';
            instagram = row[5] || '';

            // Procurar data nos índices 10, 9 ou 8
            if (row[10] && row[10].match(/^\d{4}-\d{2}-\d{2}T/)) {
              dataHoraStr = row[10];
              investimentoMarketing = row[8] || '';
              origem = row[9] || '';
            } else if (row[9] && row[9].match(/^\d{4}-\d{2}-\d{2}T/)) {
              dataHoraStr = row[9];
              investimentoMarketing = row[7] || '';
              origem = row[8] || '';
            } else if (row[8] && row[8].match(/^\d{4}-\d{2}-\d{2}T/)) {
              dataHoraStr = row[8];
              investimentoMarketing = row[6] || '';
              origem = row[7] || '';
            }
          }

          let dataHora = new Date();
          if (dataHoraStr) {
            dataHora = new Date(dataHoraStr);
            if (isNaN(dataHora.getTime())) {
              console.error(`Data inválida na linha ${index + 2}: ${dataHoraStr}`);
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
            dataHora
          };
        } catch (error) {
          console.error(`Erro ao processar linha ${index + 2}:`, error);
          return null;
        }
      });

    const leads = mappedLeads.filter((lead): lead is Lead => lead !== null && lead.email !== '');

    return NextResponse.json(leads);
  } catch (error) {
    console.error('Erro ao buscar leads:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados da planilha' },
      { status: 500 }
    );
  }
}
