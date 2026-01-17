'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ComparativoSemanal as ComparativoSemanalType } from '@/types/lead';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ComparativoSemanalProps {
  comparativo: ComparativoSemanalType[];
}

export function ComparativoSemanal({ comparativo }: ComparativoSemanalProps) {
  const getVariacaoIcone = (percentual: number) => {
    if (percentual > 5) {
      return <TrendingUp className="w-5 h-5 text-green-600" />;
    } else if (percentual < -5) {
      return <TrendingDown className="w-5 h-5 text-red-600" />;
    } else {
      return <Minus className="w-5 h-5 text-gray-400" />;
    }
  };

  const getVariacaoCor = (percentual: number) => {
    if (percentual > 5) return 'text-green-700 bg-green-50';
    if (percentual < -5) return 'text-red-700 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  const formatarNumero = (num: number) => {
    return num >= 0 ? `+${num}` : num.toString();
  };

  const formatarPercentual = (num: number) => {
    return num >= 0 ? `+${num.toFixed(1)}%` : `${num.toFixed(1)}%`;
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Comparativo Semanal</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Métrica</TableHead>
              <TableHead className="text-center">Semana Anterior</TableHead>
              <TableHead className="text-center">Semana Atual</TableHead>
              <TableHead className="text-center">Variação</TableHead>
              <TableHead className="text-center">%</TableHead>
              <TableHead className="text-center">Tendência</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comparativo.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.metrica}</TableCell>
                <TableCell className="text-center">{item.semanaAnterior}</TableCell>
                <TableCell className="text-center font-semibold">{item.semanaAtual}</TableCell>
                <TableCell className={`text-center font-medium ${getVariacaoCor(item.percentual)}`}>
                  {formatarNumero(item.variacao)}
                </TableCell>
                <TableCell className={`text-center font-bold ${getVariacaoCor(item.percentual)}`}>
                  {formatarPercentual(item.percentual)}
                </TableCell>
                <TableCell className="text-center flex justify-center">
                  {getVariacaoIcone(item.percentual)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
