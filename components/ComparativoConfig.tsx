'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeftRight, Calendar } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface PeriodoComparativo {
  inicio: Date;
  fim: Date;
  label: string;
}

export interface ComparativoConfigProps {
  periodoAtual: {
    inicio: Date;
    fim: Date;
    label: string;
  };
  habilitado: boolean;
  onHabilitadoChange: (habilitado: boolean) => void;
  periodoComparativo: PeriodoComparativo | null;
  onPeriodoComparativoChange: (periodo: PeriodoComparativo | null) => void;
}

type TipoComparativo = 'periodo_anterior' | 'mes_anterior' | 'mesmo_mes_ano_anterior' | 'personalizado';

export function ComparativoConfig({
  periodoAtual,
  habilitado,
  onHabilitadoChange,
  periodoComparativo,
  onPeriodoComparativoChange,
}: ComparativoConfigProps) {
  const [tipoComparativo, setTipoComparativo] = useState<TipoComparativo>('periodo_anterior');
  const [dataInicioCustom, setDataInicioCustom] = useState<string>('');
  const [dataFimCustom, setDataFimCustom] = useState<string>('');

  // Calcular período comparativo baseado no tipo selecionado
  useEffect(() => {
    if (!habilitado) {
      onPeriodoComparativoChange(null);
      return;
    }

    let inicio: Date;
    let fim: Date;
    let label: string;

    const diffDays = Math.ceil(
      (periodoAtual.fim.getTime() - periodoAtual.inicio.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

    switch (tipoComparativo) {
      case 'periodo_anterior':
        // Período anterior com mesma duração
        inicio = subDays(periodoAtual.inicio, diffDays);
        fim = subDays(periodoAtual.fim, diffDays);
        label = `${format(inicio, 'dd/MM', { locale: ptBR })} a ${format(fim, 'dd/MM/yyyy', { locale: ptBR })}`;
        break;

      case 'mes_anterior':
        const mesAnterior = new Date(periodoAtual.inicio);
        mesAnterior.setMonth(mesAnterior.getMonth() - 1);
        inicio = startOfMonth(mesAnterior);
        fim = endOfMonth(mesAnterior);
        label = format(inicio, 'MMMM yyyy', { locale: ptBR });
        break;

      case 'mesmo_mes_ano_anterior':
        inicio = new Date(periodoAtual.inicio.getFullYear() - 1, periodoAtual.inicio.getMonth(), 1);
        fim = new Date(periodoAtual.inicio.getFullYear() - 1, periodoAtual.inicio.getMonth() + 1, 0);
        label = format(inicio, 'MMMM yyyy', { locale: ptBR });
        break;

      case 'personalizado':
        if (dataInicioCustom && dataFimCustom) {
          inicio = new Date(dataInicioCustom);
          fim = new Date(dataFimCustom);
          label = `${format(inicio, 'dd/MM', { locale: ptBR })} a ${format(fim, 'dd/MM/yyyy', { locale: ptBR })}`;
        } else {
          onPeriodoComparativoChange(null);
          return;
        }
        break;

      default:
        onPeriodoComparativoChange(null);
        return;
    }

    onPeriodoComparativoChange({ inicio, fim, label });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habilitado, tipoComparativo, periodoAtual.inicio, periodoAtual.fim, dataInicioCustom, dataFimCustom]);

  return (
    <Card className={habilitado ? 'border-primary' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4" />
            Análise Comparativa
          </CardTitle>
          <Switch
            checked={habilitado}
            onCheckedChange={onHabilitadoChange}
          />
        </div>
        <CardDescription>
          Comparar com período anterior na apresentação
        </CardDescription>
      </CardHeader>

      {habilitado && (
        <CardContent className="space-y-4">
          {/* Período Atual (readonly) */}
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Período Atual</p>
            <p className="font-medium">{periodoAtual.label}</p>
            <p className="text-xs text-muted-foreground">
              {format(periodoAtual.inicio, 'dd/MM/yyyy', { locale: ptBR })} a {format(periodoAtual.fim, 'dd/MM/yyyy', { locale: ptBR })}
            </p>
          </div>

          {/* Tipo de Comparação */}
          <div className="space-y-2">
            <Label>Comparar com</Label>
            <Select
              value={tipoComparativo}
              onValueChange={(v) => setTipoComparativo(v as TipoComparativo)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="periodo_anterior">
                  <div className="flex flex-col">
                    <span>Período Anterior</span>
                    <span className="text-xs text-muted-foreground">Mesma duração, datas anteriores</span>
                  </div>
                </SelectItem>
                <SelectItem value="mes_anterior">
                  <div className="flex flex-col">
                    <span>Mês Anterior</span>
                    <span className="text-xs text-muted-foreground">Mês completo anterior</span>
                  </div>
                </SelectItem>
                <SelectItem value="mesmo_mes_ano_anterior">
                  <div className="flex flex-col">
                    <span>Mesmo Mês (Ano Anterior)</span>
                    <span className="text-xs text-muted-foreground">Comparação year-over-year</span>
                  </div>
                </SelectItem>
                <SelectItem value="personalizado">
                  <div className="flex flex-col">
                    <span>Período Personalizado</span>
                    <span className="text-xs text-muted-foreground">Escolher datas manualmente</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Datas Personalizadas */}
          {tipoComparativo === 'personalizado' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data Início</Label>
                <Input
                  type="date"
                  value={dataInicioCustom}
                  onChange={(e) => setDataInicioCustom(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Data Fim</Label>
                <Input
                  type="date"
                  value={dataFimCustom}
                  onChange={(e) => setDataFimCustom(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Preview do Período Comparativo */}
          {periodoComparativo && (
            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Período de Comparação</p>
              <p className="font-medium text-blue-900 dark:text-blue-100">{periodoComparativo.label}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                {format(periodoComparativo.inicio, 'dd/MM/yyyy', { locale: ptBR })} a {format(periodoComparativo.fim, 'dd/MM/yyyy', { locale: ptBR })}
              </p>
            </div>
          )}

          {/* Indicador Visual */}
          <div className="flex items-center justify-center gap-4 py-2">
            <div className="text-center">
              <Calendar className="h-5 w-5 mx-auto text-muted-foreground" />
              <p className="text-xs mt-1">Anterior</p>
            </div>
            <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
            <div className="text-center">
              <Calendar className="h-5 w-5 mx-auto text-primary" />
              <p className="text-xs mt-1">Atual</p>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
