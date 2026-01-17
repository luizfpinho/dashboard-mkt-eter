'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Eye, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface GeradorRelatorioProps {
  filtros: {
    dataInicio?: Date | null;
    dataFim?: Date | null;
    origem?: string;
    bu?: string;
    icp?: string;
  };
}

export default function GeradorRelatorio({ filtros }: GeradorRelatorioProps) {
  const [loading, setLoading] = useState(false);
  const [relatorio, setRelatorio] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [formato, setFormato] = useState<'markdown' | 'json'>('markdown');

  const gerarRelatorio = async () => {
    setLoading(true);
    try {
      const filtrosFormatados = {
        dataInicio: filtros.dataInicio?.toISOString().split('T')[0],
        dataFim: filtros.dataFim?.toISOString().split('T')[0],
        origem: filtros.origem,
        bu: filtros.bu,
        icp: filtros.icp
      };

      const response = await fetch('/api/relatorio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filtros: filtrosFormatados, formato })
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar relatório');
      }

      const data = await response.json();
      setRelatorio(data.relatorio);
      setShowPreview(true);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      alert('Erro ao gerar relatório. Verifique o console.');
    } finally {
      setLoading(false);
    }
  };

  const downloadRelatorio = () => {
    if (!relatorio) return;

    const extensao = formato === 'markdown' ? 'md' : 'json';
    const mimeType = formato === 'markdown' ? 'text/markdown' : 'application/json';
    const nomeArquivo = `relatorio-mqls-${new Date().toISOString().split('T')[0]}.${extensao}`;

    const blob = new Blob([relatorio], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copiarParaClipboard = () => {
    if (!relatorio) return;
    navigator.clipboard.writeText(relatorio);
    alert('Relatório copiado para a área de transferência!');
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Gerador de Relatórios
          </CardTitle>
          <CardDescription>
            Gere relatórios completos com base nos filtros aplicados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Formato do Relatório
              </label>
              <Select
                value={formato}
                onValueChange={(value: 'markdown' | 'json') => setFormato(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="markdown">Markdown (.md)</SelectItem>
                  <SelectItem value="json">JSON (.json)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={gerarRelatorio}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Gerar Relatório
                  </>
                )}
              </Button>

              {relatorio && (
                <Button
                  onClick={downloadRelatorio}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              )}
            </div>

            {filtros.dataInicio || filtros.dataFim || filtros.origem || filtros.bu || filtros.icp ? (
              <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
                <p className="font-semibold mb-1">Filtros ativos:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {filtros.dataInicio && filtros.dataFim && (
                    <li>
                      Período: {filtros.dataInicio.toLocaleDateString('pt-BR')} até{' '}
                      {filtros.dataFim.toLocaleDateString('pt-BR')}
                    </li>
                  )}
                  {filtros.origem && <li>Origem: {filtros.origem}</li>}
                  {filtros.bu && <li>BU: {filtros.bu}</li>}
                  {filtros.icp && <li>ICP: {filtros.icp}</li>}
                </ul>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
                Nenhum filtro aplicado. O relatório incluirá todos os dados disponíveis.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Prévia do Relatório</DialogTitle>
            <DialogDescription>
              Relatório gerado com sucesso. Você pode visualizar, copiar ou fazer download.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={downloadRelatorio} size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button onClick={copiarParaClipboard} variant="outline" size="sm">
                Copiar Texto
              </Button>
            </div>

            <div className="border rounded-lg p-4 bg-muted/50 max-h-[500px] overflow-auto">
              <pre className="text-xs whitespace-pre-wrap font-mono">
                {relatorio}
              </pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
