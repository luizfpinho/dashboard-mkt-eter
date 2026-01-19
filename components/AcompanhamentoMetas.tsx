'use client';

import { Metricas } from '@/types/lead';
import { InfoMes } from '@/types/metas';
import {
  METAS_MENSAIS,
  calcularStatusMeta,
  calcularRitmo,
  getIconeBU,
  getMensagemRitmo,
  getNomeMes
} from '@/lib/metas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Circle, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface AcompanhamentoMetasProps {
  metricas: Metricas;
  mesAtual: InfoMes;
}

export default function AcompanhamentoMetas({ metricas, mesAtual }: AcompanhamentoMetasProps) {
  // Calcular status para cada BU
  const metaConsultoria = METAS_MENSAIS.find(m => m.bu === 'Consultoria')!;
  const metaAceleradora = METAS_MENSAIS.find(m => m.bu === 'Aceleradora')!;

  const statusConsultoria = calcularStatusMeta(metricas.consultoria, metaConsultoria);
  const statusAceleradora = calcularStatusMeta(metricas.aceleradora, metaAceleradora);

  // Calcular ritmo
  const ritmoConsultoria = calcularRitmo(metricas.consultoria, metaConsultoria.metaBase, mesAtual);
  const ritmoAceleradora = calcularRitmo(metricas.aceleradora, metaAceleradora.metaBase, mesAtual);

  // Determinar ritmo geral (pior dos dois)
  const ritmoGeral = ritmoConsultoria.status === 'atrasado' || ritmoAceleradora.status === 'atrasado'
    ? (ritmoConsultoria.percentualDiferenca < ritmoAceleradora.percentualDiferenca ? ritmoConsultoria : ritmoAceleradora)
    : (ritmoConsultoria.percentualDiferenca > ritmoAceleradora.percentualDiferenca ? ritmoConsultoria : ritmoAceleradora);

  const mensagemRitmo = getMensagemRitmo(ritmoGeral, mesAtual);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📊 Acompanhamento de Metas - {getNomeMes(mesAtual.mes)}/{mesAtual.ano}
          <span className="text-sm font-normal text-muted-foreground ml-auto">
            Dia {mesAtual.diaAtual} de {mesAtual.diasNoMes}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Consultoria */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getIconeBU('Consultoria')}</span>
              <div>
                <h3 className="font-semibold">Consultoria</h3>
                <p className="text-sm text-muted-foreground">Peso: {metaConsultoria.peso}% | Meta: {metaConsultoria.metaBase} MQLs</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{statusConsultoria.mqls}/{statusConsultoria.metaBase}</p>
              <p className="text-sm text-muted-foreground">{statusConsultoria.percentualAtual}%</p>
            </div>
          </div>

          {/* Barra de progresso */}
          <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ease-out bg-gradient-to-r ${getCorGradiente(statusConsultoria.cor)}`}
              style={{ width: `${Math.min(statusConsultoria.progressoBarra, 100)}%` }}
            />
            {/* Marcadores de níveis */}
            <div className="absolute inset-0 flex items-center">
              {metaConsultoria.niveis.map((nivel, idx) => {
                const posicao = (nivel.mqls / metaConsultoria.metaBase) * 100;
                if (posicao <= 100) {
                  return (
                    <div
                      key={idx}
                      className="absolute top-0 bottom-0 w-px bg-white/50"
                      style={{ left: `${posicao}%` }}
                    />
                  );
                }
                return null;
              })}
            </div>
          </div>

          {/* Níveis */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {statusConsultoria.nivelAtual ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium">
                    Nível: {statusConsultoria.nivelAtual.percentualMeta}% ✓
                  </span>
                </>
              ) : (
                <>
                  <Circle className="h-4 w-4 text-gray-400" />
                  <span className="text-muted-foreground">Nenhum nível atingido</span>
                </>
              )}
            </div>
            <div className="text-muted-foreground">
              {statusConsultoria.proximoNivel ? (
                <>
                  Próximo: {statusConsultoria.proximoNivel.percentualMeta}% (faltam {statusConsultoria.faltamParaProximo} MQLs)
                </>
              ) : (
                <>Meta máxima superada! 🎉</>
              )}
            </div>
          </div>
        </div>

        {/* Aceleradora */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getIconeBU('Aceleradora')}</span>
              <div>
                <h3 className="font-semibold">Aceleradora</h3>
                <p className="text-sm text-muted-foreground">Peso: {metaAceleradora.peso}% | Meta: {metaAceleradora.metaBase} MQLs</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{statusAceleradora.mqls}/{statusAceleradora.metaBase}</p>
              <p className="text-sm text-muted-foreground">{statusAceleradora.percentualAtual}%</p>
            </div>
          </div>

          {/* Barra de progresso */}
          <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ease-out bg-gradient-to-r ${getCorGradiente(statusAceleradora.cor)}`}
              style={{ width: `${Math.min(statusAceleradora.progressoBarra, 100)}%` }}
            />
            {/* Marcadores de níveis */}
            <div className="absolute inset-0 flex items-center">
              {metaAceleradora.niveis.map((nivel, idx) => {
                const posicao = (nivel.mqls / metaAceleradora.metaBase) * 100;
                if (posicao <= 100) {
                  return (
                    <div
                      key={idx}
                      className="absolute top-0 bottom-0 w-px bg-white/50"
                      style={{ left: `${posicao}%` }}
                    />
                  );
                }
                return null;
              })}
            </div>
          </div>

          {/* Níveis */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {statusAceleradora.nivelAtual ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium">
                    Nível: {statusAceleradora.nivelAtual.percentualMeta}% ✓
                  </span>
                </>
              ) : (
                <>
                  <Circle className="h-4 w-4 text-gray-400" />
                  <span className="text-muted-foreground">Nenhum nível atingido</span>
                </>
              )}
            </div>
            <div className="text-muted-foreground">
              {statusAceleradora.proximoNivel ? (
                <>
                  Próximo: {statusAceleradora.proximoNivel.percentualMeta}% (faltam {statusAceleradora.faltamParaProximo} MQLs)
                </>
              ) : (
                <>Meta máxima superada! 🎉</>
              )}
            </div>
          </div>
        </div>

        {/* Indicador de Ritmo Geral */}
        <div className={`p-4 rounded-lg border-2 flex items-start gap-3 ${getEstiloRitmo(mensagemRitmo.tipo)}`}>
          <span className="text-2xl">{mensagemRitmo.icone}</span>
          <div className="flex-1">
            <p className="font-medium">{mensagemRitmo.texto}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                {ritmoConsultoria.status === 'adiantado' && <TrendingUp className="h-4 w-4 text-green-600" />}
                {ritmoConsultoria.status === 'atrasado' && <TrendingDown className="h-4 w-4 text-red-600" />}
                {ritmoConsultoria.status === 'no-prazo' && <Minus className="h-4 w-4 text-blue-600" />}
                <span>Consultoria: {ritmoConsultoria.percentualDiferenca > 0 ? '+' : ''}{ritmoConsultoria.percentualDiferenca.toFixed(0)}%</span>
              </div>
              <div className="flex items-center gap-1">
                {ritmoAceleradora.status === 'adiantado' && <TrendingUp className="h-4 w-4 text-green-600" />}
                {ritmoAceleradora.status === 'atrasado' && <TrendingDown className="h-4 w-4 text-red-600" />}
                {ritmoAceleradora.status === 'no-prazo' && <Minus className="h-4 w-4 text-blue-600" />}
                <span>Aceleradora: {ritmoAceleradora.percentualDiferenca > 0 ? '+' : ''}{ritmoAceleradora.percentualDiferenca.toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Retorna classes Tailwind para o gradiente da barra baseado na cor
 */
function getCorGradiente(cor: string): string {
  const gradientes: Record<string, string> = {
    red: 'from-red-400 to-red-600',
    orange: 'from-orange-400 to-orange-600',
    yellow: 'from-yellow-400 to-yellow-600',
    lime: 'from-lime-400 to-lime-600',
    green: 'from-green-400 to-green-600',
    emerald: 'from-emerald-400 to-emerald-600',
    teal: 'from-teal-400 to-teal-600'
  };
  return gradientes[cor] || 'from-gray-400 to-gray-600';
}

/**
 * Retorna classes Tailwind para o estilo do card de ritmo
 */
function getEstiloRitmo(tipo: 'sucesso' | 'atencao' | 'critico'): string {
  const estilos: Record<string, string> = {
    sucesso: 'bg-green-50 border-green-200 text-green-800',
    atencao: 'bg-blue-50 border-blue-200 text-blue-800',
    critico: 'bg-red-50 border-red-200 text-red-800'
  };
  return estilos[tipo] || 'bg-gray-50 border-gray-200 text-gray-800';
}
