'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { LeadClassificado } from '@/types/lead';
import { useState, useMemo } from 'react';
import { format } from 'date-fns';

interface TabelaLeadsProps {
  leads: LeadClassificado[];
}

export function TabelaLeads({ leads }: TabelaLeadsProps) {
  const [busca, setBusca] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [ordenacao, setOrdenacao] = useState<{
    campo: keyof LeadClassificado;
    ordem: 'asc' | 'desc';
  }>({ campo: 'dataHora', ordem: 'desc' });

  const itensPorPagina = 20;

  // Filtrar por busca
  const leadsFiltrados = useMemo(() => {
    if (!busca) return leads;

    const buscaLower = busca.toLowerCase();
    return leads.filter(
      lead =>
        lead.nome.toLowerCase().includes(buscaLower) ||
        lead.email.toLowerCase().includes(buscaLower) ||
        lead.faturamento.toLowerCase().includes(buscaLower) ||
        lead.bu.toLowerCase().includes(buscaLower) ||
        (lead.icp && lead.icp.toLowerCase().includes(buscaLower)) ||
        lead.canal.toLowerCase().includes(buscaLower)
    );
  }, [leads, busca]);

  // Ordenar
  const leadsOrdenados = useMemo(() => {
    return [...leadsFiltrados].sort((a, b) => {
      const valorA = a[ordenacao.campo];
      const valorB = b[ordenacao.campo];

      if (valorA === null || valorB === null) return 0;

      let comparacao = 0;
      if (valorA < valorB) comparacao = -1;
      if (valorA > valorB) comparacao = 1;

      return ordenacao.ordem === 'asc' ? comparacao : -comparacao;
    });
  }, [leadsFiltrados, ordenacao]);

  // Paginar
  const totalPaginas = Math.ceil(leadsOrdenados.length / itensPorPagina);
  const leadsPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * itensPorPagina;
    return leadsOrdenados.slice(inicio, inicio + itensPorPagina);
  }, [leadsOrdenados, paginaAtual]);

  const handleOrdenar = (campo: keyof LeadClassificado) => {
    setOrdenacao(prev => ({
      campo,
      ordem: prev.campo === campo && prev.ordem === 'asc' ? 'desc' : 'asc'
    }));
  };

  const exportarCSV = () => {
    const headers = ['Nome', 'Email', 'Telefone', 'Faturamento', 'BU', 'ICP', 'Canal', 'Data'];
    const rows = leadsFiltrados.map(lead => [
      lead.nome,
      lead.email,
      lead.telefone,
      lead.faturamento,
      lead.bu,
      lead.icp || '',
      lead.canal,
      format(lead.dataHora, 'dd/MM/yyyy HH:mm')
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leads_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`;
    link.click();
  };

  const getBadgeBU = (bu: string) => {
    const cores = {
      Consultoria: 'bg-green-100 text-green-800',
      Aceleradora: 'bg-blue-100 text-blue-800',
      'Não Qualificado': 'bg-gray-100 text-gray-600'
    };
    return cores[bu as keyof typeof cores] || cores['Não Qualificado'];
  };

  const getBadgeICP = (icp: string | null) => {
    if (!icp) return 'bg-gray-100 text-gray-400';

    const cores = {
      ICP1: 'bg-emerald-100 text-emerald-700',
      ICP2: 'bg-blue-100 text-blue-700',
      ICP3: 'bg-purple-100 text-purple-700'
    };
    return cores[icp as keyof typeof cores] || 'bg-gray-100 text-gray-400';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle>Leads Detalhados ({leadsFiltrados.length} total)</CardTitle>
          <div className="flex gap-3">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por nome, email, BU, ICP..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={exportarCSV}>
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleOrdenar('nome')}
                >
                  Nome {ordenacao.campo === 'nome' && (ordenacao.ordem === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleOrdenar('email')}
                >
                  Email {ordenacao.campo === 'email' && (ordenacao.ordem === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead>Faturamento</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleOrdenar('bu')}
                >
                  BU {ordenacao.campo === 'bu' && (ordenacao.ordem === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleOrdenar('icp')}
                >
                  ICP {ordenacao.campo === 'icp' && (ordenacao.ordem === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleOrdenar('canal')}
                >
                  Origem {ordenacao.campo === 'canal' && (ordenacao.ordem === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleOrdenar('dataHora')}
                >
                  Data {ordenacao.campo === 'dataHora' && (ordenacao.ordem === 'asc' ? '↑' : '↓')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leadsPaginados.map((lead, index) => (
                <TableRow key={`${lead.email}-${index}`} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{lead.nome}</TableCell>
                  <TableCell className="text-sm text-gray-600">{lead.email}</TableCell>
                  <TableCell className="text-sm max-w-xs truncate" title={lead.faturamento}>
                    {lead.faturamento}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getBadgeBU(lead.bu)}`}>
                      {lead.bu}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getBadgeICP(lead.icp)}`}
                    >
                      {lead.icp || '-'}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">{lead.canal}</TableCell>
                  <TableCell className="text-sm">
                    {format(lead.dataHora, 'dd/MM/yyyy HH:mm')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">
              Página {paginaAtual} de {totalPaginas}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaginaAtual(prev => Math.max(1, prev - 1))}
                disabled={paginaAtual === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaginaAtual(prev => Math.min(totalPaginas, prev + 1))}
                disabled={paginaAtual === totalPaginas}
              >
                Próxima
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
