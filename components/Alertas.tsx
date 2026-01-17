'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, AlertTriangle, TrendingDown } from 'lucide-react';
import { Metricas, Metas } from '@/types/lead';

interface AlertasProps {
  metricas: Metricas;
  metas?: Metas;
  comparativoSemanal?: {
    variacao: number;
    percentual: number;
  };
}

interface Alerta {
  tipo: 'critico' | 'atencao' | 'sucesso' | 'info';
  mensagem: string;
  icone: React.ReactNode;
}

export function Alertas({ metricas, metas, comparativoSemanal }: AlertasProps) {
  const metasPadrao: Metas = {
    consultoriaTotal: 20,
    aceleradoraTotal: 38,
    total: 57
  };

  const metasAtivas = metas || metasPadrao;
  const alertas: Alerta[] = [];

  // Alerta: Taxa de qualificação baixa
  if (metricas.taxaQualificacao < 40) {
    alertas.push({
      tipo: 'critico',
      mensagem: `Taxa de qualificação CRÍTICA: ${metricas.taxaQualificacao.toFixed(2)}% (abaixo de 40%)`,
      icone: <AlertCircle className="w-5 h-5" />
    });
  }

  // Alerta: Meta não atingida - Consultoria
  if (metricas.consultoria < metasAtivas.consultoriaTotal) {
    const faltam = metasAtivas.consultoriaTotal - metricas.consultoria;
    alertas.push({
      tipo: 'atencao',
      mensagem: `Meta Consultoria: Faltam ${faltam} MQLs para atingir a meta de ${metasAtivas.consultoriaTotal}`,
      icone: <AlertTriangle className="w-5 h-5" />
    });
  } else {
    alertas.push({
      tipo: 'sucesso',
      mensagem: `Meta Consultoria ATINGIDA: ${metricas.consultoria}/${metasAtivas.consultoriaTotal} MQLs`,
      icone: <CheckCircle className="w-5 h-5" />
    });
  }

  // Alerta: Meta não atingida - Aceleradora
  if (metricas.aceleradora < metasAtivas.aceleradoraTotal) {
    const faltam = metasAtivas.aceleradoraTotal - metricas.aceleradora;
    alertas.push({
      tipo: 'atencao',
      mensagem: `Meta Aceleradora: Faltam ${faltam} MQLs para atingir a meta de ${metasAtivas.aceleradoraTotal}`,
      icone: <AlertTriangle className="w-5 h-5" />
    });
  } else {
    alertas.push({
      tipo: 'sucesso',
      mensagem: `Meta Aceleradora ATINGIDA: ${metricas.aceleradora}/${metasAtivas.aceleradoraTotal} MQLs`,
      icone: <CheckCircle className="w-5 h-5" />
    });
  }

  // Alerta: Comparativo semanal (queda)
  if (comparativoSemanal && comparativoSemanal.percentual < -20) {
    alertas.push({
      tipo: 'critico',
      mensagem: `Queda SIGNIFICATIVA vs semana anterior: ${comparativoSemanal.percentual.toFixed(1)}%`,
      icone: <TrendingDown className="w-5 h-5" />
    });
  }

  // Alerta: Total de MQLs vs Meta
  if (metricas.totalMQLs < metasAtivas.total) {
    const faltam = metasAtivas.total - metricas.totalMQLs;
    const percentual = ((metricas.totalMQLs / metasAtivas.total) * 100).toFixed(1);
    alertas.push({
      tipo: 'atencao',
      mensagem: `Meta Total: ${metricas.totalMQLs}/${metasAtivas.total} MQLs (${percentual}%) - Faltam ${faltam}`,
      icone: <AlertTriangle className="w-5 h-5" />
    });
  } else {
    const excesso = metricas.totalMQLs - metasAtivas.total;
    alertas.push({
      tipo: 'sucesso',
      mensagem: `Meta Total SUPERADA: ${metricas.totalMQLs}/${metasAtivas.total} MQLs (+${excesso})`,
      icone: <CheckCircle className="w-5 h-5" />
    });
  }

  const getAlertaEstilo = (tipo: string) => {
    switch (tipo) {
      case 'critico':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'atencao':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'sucesso':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getIconeCor = (tipo: string) => {
    switch (tipo) {
      case 'critico':
        return 'text-red-600';
      case 'atencao':
        return 'text-orange-600';
      case 'sucesso':
        return 'text-green-600';
      default:
        return 'text-blue-600';
    }
  };

  if (alertas.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Alertas e Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alertas.map((alerta, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 p-4 rounded-lg border-2 ${getAlertaEstilo(alerta.tipo)}`}
            >
              <div className={getIconeCor(alerta.tipo)}>{alerta.icone}</div>
              <p className="flex-1 font-medium">{alerta.mensagem}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
