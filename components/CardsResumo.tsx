'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, Building2, GraduationCap, TrendingUp } from 'lucide-react';
import { Metricas } from '@/types/lead';

interface CardsResumoProps {
  metricas: Metricas;
}

export function CardsResumo({ metricas }: CardsResumoProps) {
  const cards = [
    {
      titulo: 'Total de Leads',
      valor: metricas.totalLeads,
      icone: Users,
      cor: 'text-blue-600',
      bgCor: 'bg-blue-50'
    },
    {
      titulo: 'Total de MQLs',
      valor: metricas.totalMQLs,
      icone: Target,
      cor: 'text-purple-600',
      bgCor: 'bg-purple-50'
    },
    {
      titulo: 'Consultoria',
      valor: metricas.consultoria,
      icone: Building2,
      cor: 'text-green-600',
      bgCor: 'bg-green-50'
    },
    {
      titulo: 'Aceleradora',
      valor: metricas.aceleradora,
      icone: GraduationCap,
      cor: 'text-blue-600',
      bgCor: 'bg-blue-50'
    },
    {
      titulo: 'Taxa de Qualificação',
      valor: `${metricas.taxaQualificacao.toFixed(2)}%`,
      icone: TrendingUp,
      cor: 'text-emerald-600',
      bgCor: 'bg-emerald-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {cards.map((card, index) => {
        const Icon = card.icone;
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {card.titulo}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgCor}`}>
                <Icon className={`w-5 h-5 ${card.cor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{card.valor}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
