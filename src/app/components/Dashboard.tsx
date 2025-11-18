"use client";

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { TriageResult } from "@/types/vulnerability";

interface DashboardProps {
  result: TriageResult;
}

const COLORS = {
  CRITICAL: "#dc2626",
  HIGH: "#ea580c",
  MEDIUM: "#eab308",
  LOW: "#3b82f6",
  INFO: "#6b7280",
  FALSE_POSITIVE: "#10b981",
};

export default function Dashboard({ result }: DashboardProps) {
  // Dados para gráfico de pizza (severidade)
  const severityData = [
    { name: "Críticas", value: result.critical, color: COLORS.CRITICAL },
    { name: "Altas", value: result.high, color: COLORS.HIGH },
    { name: "Médias", value: result.medium, color: COLORS.MEDIUM },
    { name: "Baixas", value: result.low, color: COLORS.LOW },
    { name: "Info", value: result.total - result.realThreats - result.falsePositives, color: COLORS.INFO },
    { name: "Falsos Positivos", value: result.falsePositives, color: COLORS.FALSE_POSITIVE },
  ].filter((item) => item.value > 0);

  // Dados para gráfico de barras (distribuição)
  const distributionData = [
    { name: "Críticas", value: result.critical },
    { name: "Altas", value: result.high },
    { name: "Médias", value: result.medium },
    { name: "Baixas", value: result.low },
    { name: "Falsos Positivos", value: result.falsePositives },
  ];

  // Dados para gráfico de ML (confiança)
  const mlData = result.vulnerabilities
    .filter((v) => v.mlPrediction.isRealThreat)
    .map((v) => ({
      name: v.original.name.substring(0, 20) + "...",
      bert: (v.mlPrediction.bertScore * 100).toFixed(1),
      naiveBayes: (v.mlPrediction.naiveBayesScore * 100).toFixed(1),
      confidence: (v.mlPrediction.confidence * 100).toFixed(1),
    }))
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
        Dashboard de Análise
      </h3>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Gráfico de Pizza - Distribuição por Severidade */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <h4 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Distribuição por Severidade
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={severityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Barras - Distribuição */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <h4 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Distribuição de Vulnerabilidades
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={distributionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de ML - Top 10 Ameaças Reais */}
      {mlData.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <h4 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Top 10 Ameaças Reais - Scores ML
          </h4>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={mlData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="bert" fill="#8b5cf6" name="BERT Score (%)" />
              <Bar dataKey="naiveBayes" fill="#ec4899" name="Naive Bayes (%)" />
              <Bar dataKey="confidence" fill="#10b981" name="Confiança (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Métricas Resumidas */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-gradient-to-br from-red-500 to-red-600 p-4 text-white">
          <div className="text-sm opacity-90">Taxa de Falsos Positivos</div>
          <div className="text-2xl font-bold">
            {result.total > 0
              ? ((result.falsePositives / result.total) * 100).toFixed(1)
              : 0}
            %
          </div>
        </div>
        <div className="rounded-lg bg-gradient-to-br from-green-500 to-green-600 p-4 text-white">
          <div className="text-sm opacity-90">Taxa de Ameaças Reais</div>
          <div className="text-2xl font-bold">
            {result.total > 0
              ? ((result.realThreats / result.total) * 100).toFixed(1)
              : 0}
            %
          </div>
        </div>
        <div className="rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 p-4 text-white">
          <div className="text-sm opacity-90">Vulnerabilidades Críticas</div>
          <div className="text-2xl font-bold">{result.critical}</div>
        </div>
        <div className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-4 text-white">
          <div className="text-sm opacity-90">Prioridade Média</div>
          <div className="text-2xl font-bold">
            {result.vulnerabilities.length > 0
              ? Math.round(
                  result.vulnerabilities.reduce(
                    (sum, v) => sum + v.priority,
                    0
                  ) / result.vulnerabilities.length
                )
              : 0}
          </div>
        </div>
      </div>
    </div>
  );
}

