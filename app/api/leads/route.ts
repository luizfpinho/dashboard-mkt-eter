import { NextResponse } from 'next/server';
import { fetchLeads } from '@/lib/csvParser';

export async function GET() {
  try {
    const leads = await fetchLeads();
    return NextResponse.json(leads);
  } catch (error) {
    console.error('Erro ao buscar leads:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados da planilha' },
      { status: 500 }
    );
  }
}
