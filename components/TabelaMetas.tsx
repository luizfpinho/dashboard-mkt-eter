'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Metricas, Metas } from '@/types/lead';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface TabelaMetasProps {
  metricas: Metricas;
  metas?: Metas;
}

export function TabelaMetas({ metricas, metas }: TabelaMetasProps) {
  const metasPadrao: Metas = {
    consultoriaTotal: 20,
    aceleradoraTotal: 38,
    total: 57
  };

  const metasAtivas = metas || metasPadrao;

  const atingiuMeta = (realizado: number, meta: number) => realizado >= meta;

  const calcularPercentual = (realizado: number, meta: number) => {
    return meta > 0 ? ((realizado / meta) * 100).toFixed(1) : '0.0';
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800">
          Meta de Leads Marketing
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50%]">Métrica</TableHead>
              <TableHead className="text-center">Meta de MQLs</TableHead>
              <TableHead className="text-center">MQLs Adquiridos</TableHead>
              <TableHead className="text-center">%</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Consultoria */}
            <TableRow className="bg-green-50 hover:bg-green-100">
              <TableCell className="font-semibold">Leads Qualificados Consultoria</TableCell>
              <TableCell className="text-center font-medium">
                {metasAtivas.consultoriaTotal}
              </TableCell>
              <TableCell className="text-center font-bold text-green-700">
                {metricas.consultoria}
              </TableCell>
              <TableCell className="text-center">
                {calcularPercentual(metricas.consultoria, metasAtivas.consultoriaTotal)}%
              </TableCell>
              <TableCell className="text-center">
                {atingiuMeta(metricas.consultoria, metasAtivas.consultoriaTotal) ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-orange-500 mx-auto" />
                )}
              </TableCell>
            </TableRow>

            {/* Consultoria ICP1 */}
            <TableRow className="bg-white">
              <TableCell className="pl-8 text-sm text-gray-600">└─ Consultoria ICP1</TableCell>
              <TableCell className="text-center text-sm text-gray-500">-</TableCell>
              <TableCell className="text-center text-sm">{metricas.consultoriaICP1}</TableCell>
              <TableCell className="text-center text-sm">-</TableCell>
              <TableCell></TableCell>
            </TableRow>

            {/* Consultoria ICP2 */}
            <TableRow className="bg-white">
              <TableCell className="pl-8 text-sm text-gray-600">└─ Consultoria ICP2</TableCell>
              <TableCell className="text-center text-sm text-gray-500">-</TableCell>
              <TableCell className="text-center text-sm">{metricas.consultoriaICP2}</TableCell>
              <TableCell className="text-center text-sm">-</TableCell>
              <TableCell></TableCell>
            </TableRow>

            {/* Consultoria ICP3 */}
            <TableRow className="bg-white">
              <TableCell className="pl-8 text-sm text-gray-600">└─ Consultoria ICP3</TableCell>
              <TableCell className="text-center text-sm text-gray-500">-</TableCell>
              <TableCell className="text-center text-sm">{metricas.consultoriaICP3}</TableCell>
              <TableCell className="text-center text-sm">-</TableCell>
              <TableCell></TableCell>
            </TableRow>

            {/* Aceleradora */}
            <TableRow className="bg-blue-50 hover:bg-blue-100">
              <TableCell className="font-semibold">Leads Qualificados Aceleradora</TableCell>
              <TableCell className="text-center font-medium">
                {metasAtivas.aceleradoraTotal}
              </TableCell>
              <TableCell className="text-center font-bold text-blue-700">
                {metricas.aceleradora}
              </TableCell>
              <TableCell className="text-center">
                {calcularPercentual(metricas.aceleradora, metasAtivas.aceleradoraTotal)}%
              </TableCell>
              <TableCell className="text-center">
                {atingiuMeta(metricas.aceleradora, metasAtivas.aceleradoraTotal) ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-orange-500 mx-auto" />
                )}
              </TableCell>
            </TableRow>

            {/* Aceleradora ICP1 */}
            <TableRow className="bg-white">
              <TableCell className="pl-8 text-sm text-gray-600">└─ Aceleradora ICP1</TableCell>
              <TableCell className="text-center text-sm text-gray-500">-</TableCell>
              <TableCell className="text-center text-sm">{metricas.aceleradoraICP1}</TableCell>
              <TableCell className="text-center text-sm">-</TableCell>
              <TableCell></TableCell>
            </TableRow>

            {/* Aceleradora ICP2 */}
            <TableRow className="bg-white">
              <TableCell className="pl-8 text-sm text-gray-600">└─ Aceleradora ICP2</TableCell>
              <TableCell className="text-center text-sm text-gray-500">-</TableCell>
              <TableCell className="text-center text-sm">{metricas.aceleradoraICP2}</TableCell>
              <TableCell className="text-center text-sm">-</TableCell>
              <TableCell></TableCell>
            </TableRow>

            {/* Aceleradora ICP3 */}
            <TableRow className="bg-white">
              <TableCell className="pl-8 text-sm text-gray-600">└─ Aceleradora ICP3</TableCell>
              <TableCell className="text-center text-sm text-gray-500">-</TableCell>
              <TableCell className="text-center text-sm">{metricas.aceleradoraICP3}</TableCell>
              <TableCell className="text-center text-sm">-</TableCell>
              <TableCell></TableCell>
            </TableRow>

            {/* Total */}
            <TableRow className="bg-gray-100 hover:bg-gray-200 border-t-2 border-gray-300">
              <TableCell className="font-bold text-lg">TOTAL DE MQLs</TableCell>
              <TableCell className="text-center font-bold text-lg">
                {metasAtivas.total}
              </TableCell>
              <TableCell className="text-center font-bold text-lg text-purple-700">
                {metricas.totalMQLs}
              </TableCell>
              <TableCell className="text-center font-bold">
                {calcularPercentual(metricas.totalMQLs, metasAtivas.total)}%
              </TableCell>
              <TableCell className="text-center">
                {atingiuMeta(metricas.totalMQLs, metasAtivas.total) ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-orange-500 mx-auto" />
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
