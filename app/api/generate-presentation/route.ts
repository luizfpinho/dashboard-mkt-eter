import { NextRequest, NextResponse } from 'next/server';

const GAMMA_API_KEY = process.env.GAMMA_API_KEY || 'sk-gamma-YKQypboIARKmLjP5kynYW30xmeuLdVdO8TuNfi4SkvY';
const GAMMA_API_BASE = 'https://public-api.gamma.app/v1.0';

interface GammaRequestBody {
  prompt: string;
  config: {
    format: string;
    numCards: number;
    cardSplit: string;
    textMode: string;
    themeId: string;
    dimensions: string;
    textAmount: string;
    tone: string;
    audience: string;
    language: string;
    imageSource: string;
    imageModel: string;
    imageStyle: string;
    exportAs: string;
    workspaceAccess: string;
    externalAccess: string;
    additionalInstructions: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: GammaRequestBody = await request.json();
    const { prompt, config } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt é obrigatório' },
        { status: 400 }
      );
    }

    // Construir payload completo para o Gamma
    const gammaPayload: any = {
      inputText: prompt,
      textMode: config.textMode || 'generate',
      format: config.format || 'presentation',
      numCards: Math.min(config.numCards || 10, 15),
      cardSplit: config.cardSplit || 'auto',
      themeId: config.themeId || 'Chisel',
      additionalInstructions: config.additionalInstructions ||
        'Criar apresentação profissional de relatório de marketing. Use gráficos e visualizações de dados. Números em destaque.',
      exportAs: config.exportAs || 'pptx',
      textOptions: {
        amount: config.textAmount || 'medium',
        tone: config.tone || 'professional, executive, data-driven',
        audience: config.audience || 'gestores de marketing, diretores, C-level',
        language: config.language || 'pt-br',
      },
      imageOptions: {
        source: config.imageSource || 'aiGenerated',
      },
      cardOptions: {
        dimensions: config.dimensions || '16x9',
      },
      sharingOptions: {
        workspaceAccess: config.workspaceAccess || 'view',
        externalAccess: config.externalAccess || 'view',
      },
    };

    // Adicionar opções de imagem apenas se for AI Generated
    if (config.imageSource === 'aiGenerated') {
      gammaPayload.imageOptions.model = config.imageModel || 'imagen-4-pro';
      gammaPayload.imageOptions.style = config.imageStyle || 'corporate';
    }

    console.log('Enviando para Gamma:', JSON.stringify(gammaPayload, null, 2));

    // 1. Iniciar geração no Gamma
    const initResponse = await fetch(`${GAMMA_API_BASE}/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': GAMMA_API_KEY,
      },
      body: JSON.stringify(gammaPayload),
    });

    if (!initResponse.ok) {
      const errorText = await initResponse.text();
      console.error('Erro ao iniciar geração:', initResponse.status, errorText);
      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { message: errorText };
      }
      return NextResponse.json(
        { error: error.message || error.error || 'Erro ao iniciar geração' },
        { status: initResponse.status }
      );
    }

    const initData = await initResponse.json();
    const generationId = initData.generationId;

    console.log('Geração iniciada:', generationId);

    // 2. Polling para aguardar conclusão (max 180s para PDF, 150s para PPTX)
    // Aumentado para suportar apresentações complexas com AI images
    const maxAttempts = config.exportAs === 'pdf' ? 90 : 75;
    const intervalMs = 2000;

    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, intervalMs));

      // Log apenas a cada 10 tentativas para reduzir ruído
      if (i % 10 === 0 || i === maxAttempts - 1) {
        console.log(`Tentativa ${i + 1}/${maxAttempts} - verificando status...`);
      }

      const statusResponse = await fetch(`${GAMMA_API_BASE}/generations/${generationId}`, {
        method: 'GET',
        headers: {
          'X-API-KEY': GAMMA_API_KEY,
          'Accept': 'application/json',
        },
      });

      if (!statusResponse.ok) {
        console.error('Erro ao verificar status:', statusResponse.status);
        continue;
      }

      const statusData = await statusResponse.json();

      // Log apenas mudanças de status
      if (i === 0 || statusData.status !== 'in_progress') {
        console.log('Status:', statusData.status);
      }

      if (statusData.status === 'completed') {
        console.log('Geração concluída com sucesso!');
        return NextResponse.json({
          success: true,
          generationId: statusData.generationId,
          gammaUrl: statusData.gammaUrl,
          pdfUrl: statusData.pdfUrl,
          pptxUrl: statusData.pptxUrl,
          credits: statusData.credits,
          config: {
            numSlides: config.numCards,
            theme: config.themeId,
            format: config.format,
            exportAs: config.exportAs,
          },
        });
      }

      if (statusData.status === 'failed') {
        console.error('Geração falhou:', statusData.error);
        return NextResponse.json(
          { error: statusData.error || 'Geração falhou' },
          { status: 500 }
        );
      }
    }

    // Timeout - mas a geração pode ter completado, vamos verificar uma última vez
    console.log('Timeout atingido - fazendo verificação final...');
    try {
      const finalCheck = await fetch(`${GAMMA_API_BASE}/generations/${generationId}`, {
        method: 'GET',
        headers: {
          'X-API-KEY': GAMMA_API_KEY,
          'Accept': 'application/json',
        },
      });

      if (finalCheck.ok) {
        const finalData = await finalCheck.json();
        if (finalData.status === 'completed') {
          console.log('Geração concluída na verificação final!');
          return NextResponse.json({
            success: true,
            generationId: finalData.generationId,
            gammaUrl: finalData.gammaUrl,
            pdfUrl: finalData.pdfUrl,
            pptxUrl: finalData.pptxUrl,
            credits: finalData.credits,
            config: {
              numSlides: config.numCards,
              theme: config.themeId,
              format: config.format,
              exportAs: config.exportAs,
            },
          });
        }
      }
    } catch (e) {
      console.error('Erro na verificação final:', e);
    }

    // Se realmente deu timeout, retornar erro
    console.log('Timeout - geração ainda em andamento');
    return NextResponse.json({
      success: false,
      error: 'A geração está demorando mais que o esperado. Por favor, tente novamente em alguns minutos.',
      generationId: generationId,
    }, { status: 504 });

  } catch (error) {
    console.error('Erro na API de geração:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// Endpoint para verificar status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const generationId = searchParams.get('generationId');

  if (!generationId) {
    return NextResponse.json(
      { error: 'generationId é obrigatório' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`${GAMMA_API_BASE}/generations/${generationId}`, {
      method: 'GET',
      headers: {
        'X-API-KEY': GAMMA_API_KEY,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Erro ao verificar status' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao verificar status' },
      { status: 500 }
    );
  }
}
