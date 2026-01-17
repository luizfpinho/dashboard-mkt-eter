'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface MatrizCruzadaProps {
  matriz: Record<string, Record<string, number>>;
}

export function MatrizCruzada({ matriz }: MatrizCruzadaProps) {
  const origens = Object.keys(matriz).sort();
  const colunas = [
    'Consultoria-ICP1',
    'Consultoria-ICP2',
    'Consultoria-ICP3',
    'Aceleradora-ICP1',
    'Aceleradora-ICP2',
    'Aceleradora-ICP3'
  ];

  const totaisPorColuna: Record<string, number> = {};
  colunas.forEach(col => {
    totaisPorColuna[col] = 0;
  });

  origens.forEach(origem => {
    colunas.forEach(col => {
      totaisPorColuna[col] += matriz[origem][col] || 0;
    });
  });

  const formatarColuna = (coluna: string) => {
    const [bu, icp] = coluna.split('-');
    const buAbrev = bu === 'Consultoria' ? 'C' : 'A';
    return `${buAbrev}-${icp}`;
  };

  const getCelulaCor = (valor: number) => {
    if (valor === 0) return 'bg-gray-50 text-gray-400';
    if (valor <= 5) return 'bg-blue-50 text-blue-700';
    if (valor <= 10) return 'bg-blue-100 text-blue-800';
    if (valor <= 20) return 'bg-blue-200 text-blue-900';
    return 'bg-blue-300 text-blue-950 font-bold';
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Matriz Origem × BU × ICP</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 bg-white z-10 font-bold">Origem</TableHead>
              {colunas.map(col => (
                <TableHead key={col} className="text-center text-xs">
                  {formatarColuna(col)}
                </TableHead>
              ))}
              <TableHead className="text-center font-bold bg-gray-100">TOTAL</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {origens.map(origem => {
              const totalLinha = colunas.reduce(
                (sum, col) => sum + (matriz[origem][col] || 0),
                0
              );

              return (
                <TableRow key={origem}>
                  <TableCell className="sticky left-0 bg-white z-10 font-semibold">
                    {origem}
                  </TableCell>
                  {colunas.map(col => {
                    const valor = matriz[origem][col] || 0;
                    return (
                      <TableCell
                        key={col}
                        className={`text-center ${getCelulaCor(valor)}`}
                      >
                        {valor}
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-center font-bold bg-gray-100">
                    {totalLinha}
                  </TableCell>
                </TableRow>
              );
            })}

            {/* Linha de Total */}
            <TableRow className="bg-gray-200 font-bold border-t-2 border-gray-400">
              <TableCell className="sticky left-0 bg-gray-200 z-10">TOTAL</TableCell>
              {colunas.map(col => (
                <TableCell key={col} className="text-center">
                  {totaisPorColuna[col]}
                </TableCell>
              ))}
              <TableCell className="text-center text-lg">
                {Object.values(totaisPorColuna).reduce((a, b) => a + b, 0)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
