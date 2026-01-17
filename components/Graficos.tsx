'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { LeadClassificado } from '@/types/lead';

interface GraficosProps {
  evolucao: { data: string; total: number; consultoria: number; aceleradora: number }[];
  distribuicaoBU: { name: string; value: number }[];
  distribuicaoConsultoriaICP: { name: string; value: number }[];
  distribuicaoAceleradoraICP: { name: string; value: number }[];
  distribuicaoCanal: { name: string; value: number }[];
}

const CORES_BU = {
  Consultoria: '#22c55e',
  Aceleradora: '#3b82f6',
  'Não Qualificado': '#6b7280'
};

const CORES_ICP = ['#10b981', '#3b82f6', '#8b5cf6'];

const CORES_CANAL = ['#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#6b7280'];

export function Graficos({
  evolucao,
  distribuicaoBU,
  distribuicaoConsultoriaICP,
  distribuicaoAceleradoraICP,
  distribuicaoCanal
}: GraficosProps) {
  return (
    <div className="space-y-6">
      {/* Gráfico 1: Evolução de MQLs por Dia */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução de MQLs por Dia</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={evolucao}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="data" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#8b5cf6"
                strokeWidth={2}
                name="Total MQLs"
              />
              <Line
                type="monotone"
                dataKey="consultoria"
                stroke="#22c55e"
                strokeWidth={2}
                name="Consultoria"
              />
              <Line
                type="monotone"
                dataKey="aceleradora"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Aceleradora"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico 2: Distribuição por BU */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Business Unit</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distribuicaoBU}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {distribuicaoBU.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CORES_BU[entry.name as keyof typeof CORES_BU] || '#6b7280'}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico 5: MQLs por Canal */}
        <Card>
          <CardHeader>
            <CardTitle>MQLs por Canal/Origem</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={distribuicaoCanal}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" name="MQLs">
                  {distribuicaoCanal.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CORES_CANAL[index % CORES_CANAL.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico 3: Distribuição por ICP (Consultoria) */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por ICP - Consultoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={distribuicaoConsultoriaICP} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Bar dataKey="value" name="MQLs" fill="#22c55e">
                  {distribuicaoConsultoriaICP.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CORES_ICP[index % CORES_ICP.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico 4: Distribuição por ICP (Aceleradora) */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por ICP - Aceleradora</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={distribuicaoAceleradoraICP} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Bar dataKey="value" name="MQLs" fill="#3b82f6">
                  {distribuicaoAceleradoraICP.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CORES_ICP[index % CORES_ICP.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
