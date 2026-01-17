'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Metricas } from '@/types/lead';

interface TabelaConsolidadaProps {
  metricas: Metricas;
}

export function TabelaConsolidada({ metricas }: TabelaConsolidadaProps) {
  const taxaConsultoria =
    metricas.totalLeads > 0 ? ((metricas.consultoria / metricas.totalLeads) * 100).toFixed(2) : '0.00';

  const taxaAceleradora =
    metricas.totalLeads > 0 ? ((metricas.aceleradora / metricas.totalLeads) * 100).toFixed(2) : '0.00';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800">Consolidado</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium text-gray-700">Total de Leads</TableCell>
              <TableCell className="text-right font-bold">{metricas.totalLeads}</TableCell>
            </TableRow>

            <TableRow className="bg-green-50">
              <TableCell className="font-medium text-gray-700">
                Leads Qualificados Consultoria (&gt;=100k)
              </TableCell>
              <TableCell className="text-right font-bold text-green-700">
                {metricas.consultoria}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="pl-8 text-sm text-gray-600">
                Taxa de Leads Qualificados Consultoria
              </TableCell>
              <TableCell className="text-right text-sm font-semibold">{taxaConsultoria}%</TableCell>
            </TableRow>

            <TableRow className="bg-blue-50">
              <TableCell className="font-medium text-gray-700">
                Leads Qualificados Aceleradora (&gt;=10k)
              </TableCell>
              <TableCell className="text-right font-bold text-blue-700">
                {metricas.aceleradora}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="pl-8 text-sm text-gray-600">
                Taxa de Leads Qualificados Aceleradora
              </TableCell>
              <TableCell className="text-right text-sm font-semibold">{taxaAceleradora}%</TableCell>
            </TableRow>

            <TableRow className="bg-purple-50 border-t-2 border-gray-300">
              <TableCell className="font-bold text-lg text-gray-800">Total de MQL&apos;s</TableCell>
              <TableCell className="text-right font-bold text-lg text-purple-700">
                {metricas.totalMQLs}
              </TableCell>
            </TableRow>

            <TableRow className="bg-emerald-50">
              <TableCell className="font-bold text-gray-800">Taxa de Qualificação Geral</TableCell>
              <TableCell className="text-right font-bold text-emerald-700">
                {metricas.taxaQualificacao.toFixed(2)}%
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
