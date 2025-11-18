// Serviço de Machine Learning para validação de vulnerabilidades
// Usa BERT e Naive Bayes para detectar falsos positivos

import type { MLPrediction, OWASPVulnerability } from "@/types/vulnerability";

export class MLService {
  /**
   * Análise usando BERT (simulado - em produção usaria transformers.js ou API Python)
   * Analisa o contexto e descrição da vulnerabilidade
   */
  async analyzeWithBERT(vuln: OWASPVulnerability): Promise<number> {
    // TODO: Integrar com modelo BERT real
    // Por enquanto, simula análise baseada em palavras-chave e contexto
    
    const text = `${vuln.name} ${vuln.description} ${vuln.message || ""}`.toLowerCase();
    
    // Palavras-chave que indicam ameaça real
    const realThreatIndicators = [
      "sql injection",
      "xss",
      "csrf",
      "authentication",
      "authorization",
      "password",
      "token",
      "session",
      "encryption",
      "deserialization",
      "command injection",
      "path traversal",
      "remote code execution",
      "privilege escalation",
      "buffer overflow",
    ];

    // Palavras-chave que indicam falso positivo
    const falsePositiveIndicators = [
      "deprecated",
      "unused",
      "test",
      "example",
      "todo",
      "comment",
      "documentation",
      "style",
      "formatting",
      "whitespace",
    ];

    let score = 0.5; // Score neutro inicial

    // Conta indicadores de ameaça real
    const realThreatCount = realThreatIndicators.filter((indicator) =>
      text.includes(indicator)
    ).length;

    // Conta indicadores de falso positivo
    const falsePositiveCount = falsePositiveIndicators.filter((indicator) =>
      text.includes(indicator)
    ).length;

    // Calcula score baseado na proporção
    if (realThreatCount > 0) {
      score += Math.min(realThreatCount * 0.15, 0.4);
    }

    if (falsePositiveCount > 0) {
      score -= Math.min(falsePositiveCount * 0.1, 0.3);
    }

    // Ajusta baseado na severidade reportada
    const severityWeight: Record<string, number> = {
      CRITICAL: 0.2,
      HIGH: 0.15,
      MEDIUM: 0.1,
      LOW: 0.05,
      INFO: -0.1,
    };

    score += severityWeight[vuln.severity] || 0;

    // Normaliza para 0-1
    return Math.max(0, Math.min(1, score));
  }

  /**
   * Análise usando Naive Bayes (simulado - em produção usaria biblioteca ML)
   * Classifica probabilidade de ser ameaça real vs falso positivo
   */
  async analyzeWithNaiveBayes(vuln: OWASPVulnerability): Promise<number> {
    // TODO: Integrar com modelo Naive Bayes real treinado
    // Por enquanto, usa heurísticas baseadas em características
    
    let probability = 0.5;

    // Features que aumentam probabilidade de ser real
    const features: Array<{ check: () => boolean; weight: number }> = [
      {
        check: () => !!vuln.cve,
        weight: 0.15, // CVE indica vulnerabilidade conhecida
      },
      {
        check: () => !!vuln.cwe,
        weight: 0.1, // CWE indica categoria conhecida
      },
      {
        check: () => (vuln.confidence || 0) > 0.7,
        weight: 0.1, // Alta confiança do scanner
      },
      {
        check: () => vuln.severity === "CRITICAL" || vuln.severity === "HIGH",
        weight: 0.15, // Severidade alta
      },
      {
        check: () => {
          const desc = (vuln.description || "").toLowerCase();
          return desc.includes("exploit") || desc.includes("attack") || desc.includes("vulnerable");
        },
        weight: 0.1,
      },
      {
        check: () => {
          // Verifica se está em arquivo de produção (não test, example, etc)
          const file = (vuln.file || "").toLowerCase();
          return !file.includes("test") && !file.includes("example") && !file.includes("spec");
        },
        weight: 0.1,
      },
    ];

    // Soma os pesos das features que são verdadeiras
    features.forEach((feature) => {
      if (feature.check()) {
        probability += feature.weight;
      }
    });

    // Normaliza para 0-1
    return Math.max(0, Math.min(1, probability));
  }

  /**
   * Análise combinada usando BERT e Naive Bayes
   * Retorna predição final com confiança
   */
  async predict(vuln: OWASPVulnerability): Promise<MLPrediction> {
    const [bertScore, naiveBayesScore] = await Promise.all([
      this.analyzeWithBERT(vuln),
      this.analyzeWithNaiveBayes(vuln),
    ]);

    // Combina os scores (média ponderada: BERT 60%, Naive Bayes 40%)
    const combinedScore = bertScore * 0.6 + naiveBayesScore * 0.4;
    const isRealThreat = combinedScore > 0.5;

    // Calcula confiança baseada na diferença entre os scores
    const scoreDiff = Math.abs(bertScore - naiveBayesScore);
    const confidence = Math.max(0.5, 1 - scoreDiff * 0.5);

    // Gera reasoning
    const reasoning = this.generateReasoning(
      vuln,
      bertScore,
      naiveBayesScore,
      combinedScore,
      isRealThreat
    );

    return {
      isRealThreat,
      confidence,
      bertScore,
      naiveBayesScore,
      reasoning,
    };
  }

  private generateReasoning(
    vuln: OWASPVulnerability,
    bertScore: number,
    naiveBayesScore: number,
    combinedScore: number,
    isRealThreat: boolean
  ): string {
    const reasons: string[] = [];

    if (vuln.cve) {
      reasons.push("CVE conhecida identificada");
    }

    if (bertScore > 0.7) {
      reasons.push("BERT indica alta probabilidade de ameaça real");
    } else if (bertScore < 0.3) {
      reasons.push("BERT sugere possível falso positivo");
    }

    if (naiveBayesScore > 0.7) {
      reasons.push("Naive Bayes confirma características de ameaça real");
    } else if (naiveBayesScore < 0.3) {
      reasons.push("Naive Bayes indica características de falso positivo");
    }

    if (Math.abs(bertScore - naiveBayesScore) < 0.2) {
      reasons.push("Modelos concordam (alta confiança)");
    } else {
      reasons.push("Modelos divergem (análise manual recomendada)");
    }

    if (combinedScore > 0.7) {
      reasons.push("Score combinado alto - investigação recomendada");
    } else if (combinedScore < 0.3) {
      reasons.push("Score combinado baixo - provável falso positivo");
    }

    return reasons.join(". ") + ".";
  }
}

export const mlService = new MLService();

