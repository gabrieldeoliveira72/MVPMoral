// Serviço de triagem que combina CVSS e ML para classificar vulnerabilidades

import type {
  OWASPVulnerability,
  TriagedVulnerability,
  TriageResult,
} from "@/types/vulnerability";
import { cvssService } from "./cvss-service";
import { mlService } from "./ml-service";

export class TriageService {
  /**
   * Processa uma lista de vulnerabilidades do OWASP
   * Combina dados do CVSS com análise de ML para filtrar falsos positivos
   */
  async triageVulnerabilities(
    vulnerabilities: OWASPVulnerability[]
  ): Promise<TriageResult> {
    const triaged: TriagedVulnerability[] = [];

    // Processa cada vulnerabilidade
    for (const vuln of vulnerabilities) {
      const triagedVuln = await this.triageSingleVulnerability(vuln);
      triaged.push(triagedVuln);
    }

    // Ordena por prioridade (maior primeiro)
    triaged.sort((a, b) => b.priority - a.priority);

    // Calcula estatísticas
    const stats = this.calculateStats(triaged);

    return {
      total: vulnerabilities.length,
      ...stats,
      vulnerabilities: triaged,
    };
  }

  /**
   * Processa uma única vulnerabilidade
   */
  private async triageSingleVulnerability(
    vuln: OWASPVulnerability
  ): Promise<TriagedVulnerability> {
    // Busca dados do CVSS
    const cvssData = await cvssService.getCVSSForVulnerability(vuln);

    // Análise com ML
    const mlPrediction = await mlService.predict(vuln);

    // Determina severidade final e se deve investigar
    const { finalSeverity, shouldInvestigate, priority, triageReason } =
      this.determineFinalClassification(vuln, cvssData, mlPrediction);

    return {
      id: vuln.id,
      original: vuln,
      cvssData,
      mlPrediction,
      finalSeverity,
      priority,
      shouldInvestigate,
      triageReason,
    };
  }

  /**
   * Determina classificação final baseada em CVSS e ML
   */
  private determineFinalClassification(
    vuln: OWASPVulnerability,
    cvssData: any,
    mlPrediction: any
  ): {
    finalSeverity: TriagedVulnerability["finalSeverity"];
    shouldInvestigate: boolean;
    priority: number;
    triageReason: string;
  } {
    const reasons: string[] = [];
    let priority = 0;

    // Se ML indica falso positivo com alta confiança
    if (!mlPrediction.isRealThreat && mlPrediction.confidence > 0.7) {
      return {
        finalSeverity: "FALSE_POSITIVE",
        shouldInvestigate: false,
        priority: 0,
        triageReason: `Falso positivo detectado por ML (confiança: ${(mlPrediction.confidence * 100).toFixed(1)}%). ${mlPrediction.reasoning}`,
      };
    }

    // Combina CVSS score com ML prediction
    const cvssScore = cvssData.baseScore || 0;
    const mlScore = mlPrediction.isRealThreat
      ? mlPrediction.confidence
      : 1 - mlPrediction.confidence;

    // Score combinado (CVSS 70%, ML 30%)
    const combinedScore = cvssScore * 0.7 + mlScore * 10 * 0.3;

    // Determina severidade final
    let finalSeverity: TriagedVulnerability["finalSeverity"];
    if (combinedScore >= 9.0 || cvssData.baseSeverity === "CRITICAL") {
      finalSeverity = "CRITICAL";
      priority = 90 + Math.min(10, combinedScore - 9) * 10;
      reasons.push("CVSS crítico");
    } else if (combinedScore >= 7.0 || cvssData.baseSeverity === "HIGH") {
      finalSeverity = "HIGH";
      priority = 70 + Math.min(20, (combinedScore - 7) * 10);
      reasons.push("CVSS alto");
    } else if (combinedScore >= 4.0 || cvssData.baseSeverity === "MEDIUM") {
      finalSeverity = "MEDIUM";
      priority = 40 + Math.min(30, (combinedScore - 4) * 10);
      reasons.push("CVSS médio");
    } else if (combinedScore >= 1.0 || cvssData.baseSeverity === "LOW") {
      finalSeverity = "LOW";
      priority = 10 + Math.min(30, (combinedScore - 1) * 10);
      reasons.push("CVSS baixo");
    } else {
      finalSeverity = "INFO";
      priority = 5;
      reasons.push("CVSS muito baixo");
    }

    // Ajusta baseado em ML
    if (mlPrediction.isRealThreat && mlPrediction.confidence > 0.6) {
      priority += 10;
      reasons.push("ML confirma ameaça real");
    } else if (!mlPrediction.isRealThreat && mlPrediction.confidence > 0.6) {
      priority = Math.max(0, priority - 20);
      reasons.push("ML sugere possível falso positivo");
    }

    // Se tem CVE conhecida, aumenta prioridade
    if (vuln.cve) {
      priority += 5;
      reasons.push("CVE conhecida");
    }

    // Normaliza prioridade para 0-100
    priority = Math.max(0, Math.min(100, priority));

    const shouldInvestigate =
      (finalSeverity !== "FALSE_POSITIVE" as any) &&
      finalSeverity !== "INFO" &&
      priority > 30;

    return {
      finalSeverity,
      shouldInvestigate,
      priority: Math.round(priority),
      triageReason: reasons.join(". ") + ".",
    };
  }

  /**
   * Calcula estatísticas do resultado da triagem
   */
  private calculateStats(triaged: TriagedVulnerability[]) {
    const stats = {
      realThreats: 0,
      falsePositives: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    triaged.forEach((v) => {
      if (v.finalSeverity === "FALSE_POSITIVE") {
        stats.falsePositives++;
      } else {
        stats.realThreats++;
        switch (v.finalSeverity) {
          case "CRITICAL":
            stats.critical++;
            break;
          case "HIGH":
            stats.high++;
            break;
          case "MEDIUM":
            stats.medium++;
            break;
          case "LOW":
            stats.low++;
            break;
        }
      }
    });

    return stats;
  }
}

export const triageService = new TriageService();

