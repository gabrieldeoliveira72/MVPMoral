// Serviço para exportação de relatórios (PDF e CSV)

import type { TriageResult, TriagedVulnerability } from "@/types/vulnerability";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

export class ExportService {
  /**
   * Exporta resultado para PDF
   */
  exportToPDF(result: TriageResult, fileName?: string): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    // Título
    doc.setFontSize(20);
    doc.text("Relatório de Triagem de Vulnerabilidades", margin, 30);

    // Data
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm:ss")}`,
      margin,
      40
    );

    // Estatísticas
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Resumo", margin, 55);

    doc.setFontSize(10);
    const statsY = 65;
    doc.text(`Total de Vulnerabilidades: ${result.total}`, margin, statsY);
    doc.text(`Ameaças Reais: ${result.realThreats}`, margin, statsY + 7);
    doc.text(`Falsos Positivos: ${result.falsePositives}`, margin, statsY + 14);
    doc.text(`Críticas: ${result.critical}`, margin, statsY + 21);
    doc.text(`Altas: ${result.high}`, margin, statsY + 28);
    doc.text(`Médias: ${result.medium}`, margin, statsY + 35);
    doc.text(`Baixas: ${result.low}`, margin, statsY + 42);

    // Tabela de vulnerabilidades
    const tableData = result.vulnerabilities.map((v: TriagedVulnerability) => [
      v.original.name,
      v.finalSeverity,
      v.cvssData?.baseScore.toFixed(1) || "N/A",
      v.mlPrediction.isRealThreat ? "Sim" : "Não",
      v.priority.toString(),
      v.shouldInvestigate ? "Sim" : "Não",
    ]);

    autoTable(doc, {
      startY: statsY + 50,
      head: [
        [
          "Vulnerabilidade",
          "Severidade",
          "CVSS",
          "Ameaça Real",
          "Prioridade",
          "Investigar",
        ],
      ],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [220, 53, 69] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    // Detalhes de cada vulnerabilidade
    let yPos = (doc as any).lastAutoTable.finalY + 20;
    result.vulnerabilities.slice(0, 10).forEach((v: TriagedVulnerability, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`${index + 1}. ${v.original.name}`, margin, yPos);

      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      yPos += 7;
      doc.text(`Severidade: ${v.finalSeverity}`, margin, yPos);
      yPos += 5;
      doc.text(`CVSS: ${v.cvssData?.baseScore.toFixed(1) || "N/A"}`, margin, yPos);
      yPos += 5;
      doc.text(
        `BERT: ${(v.mlPrediction.bertScore * 100).toFixed(1)}% | Naive Bayes: ${(v.mlPrediction.naiveBayesScore * 100).toFixed(1)}%`,
        margin,
        yPos
      );
      yPos += 5;
      doc.text(`Prioridade: ${v.priority}/100`, margin, yPos);
      yPos += 5;
      if (v.original.file) {
        doc.text(`Arquivo: ${v.original.file}${v.original.line ? `:${v.original.line}` : ""}`, margin, yPos);
        yPos += 5;
      }
      doc.text(`Razão: ${v.triageReason}`, margin, yPos);
      yPos += 10;
    });

    // Salva o PDF
    const finalFileName = fileName
      ? `${fileName.replace(/\.[^/.]+$/, "")}_triage.pdf`
      : `vulnerability_triage_${format(new Date(), "yyyy-MM-dd_HH-mm-ss")}.pdf`;
    
    doc.save(finalFileName);
  }

  /**
   * Exporta resultado para CSV
   */
  exportToCSV(result: TriageResult, fileName?: string): void {
    const headers = [
      "ID",
      "Nome",
      "Descrição",
      "Severidade Original",
      "Severidade Final",
      "CVSS Score",
      "CVSS Severity",
      "BERT Score",
      "Naive Bayes Score",
      "É Ameaça Real",
      "Confiança ML",
      "Prioridade",
      "Investigar",
      "CVE",
      "CWE",
      "Arquivo",
      "Linha",
      "Razão da Triagem",
    ];

    const rows = result.vulnerabilities.map((v: TriagedVulnerability) => [
      v.id,
      v.original.name,
      v.original.description || "",
      v.original.severity,
      v.finalSeverity,
      v.cvssData?.baseScore.toFixed(2) || "",
      v.cvssData?.baseSeverity || "",
      (v.mlPrediction.bertScore * 100).toFixed(2),
      (v.mlPrediction.naiveBayesScore * 100).toFixed(2),
      v.mlPrediction.isRealThreat ? "Sim" : "Não",
      (v.mlPrediction.confidence * 100).toFixed(2),
      v.priority.toString(),
      v.shouldInvestigate ? "Sim" : "Não",
      v.original.cve || "",
      v.original.cwe || "",
      v.original.file || "",
      v.original.line?.toString() || "",
      v.triageReason,
    ]);

    // Cria CSV
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((cell) => {
            const cellStr = String(cell || "");
            // Escapa vírgulas e aspas
            if (cellStr.includes(",") || cellStr.includes('"') || cellStr.includes("\n")) {
              return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
          })
          .join(",")
      ),
    ].join("\n");

    // Adiciona BOM para Excel
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    const finalFileName = fileName
      ? `${fileName.replace(/\.[^/.]+$/, "")}_triage.csv`
      : `vulnerability_triage_${format(new Date(), "yyyy-MM-dd_HH-mm-ss")}.csv`;

    link.download = finalFileName;
    link.click();
    URL.revokeObjectURL(url);
  }
}

export const exportService = new ExportService();

