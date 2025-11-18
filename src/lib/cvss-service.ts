// Serviço para integração com API CVSS

import type { CVSSData, OWASPVulnerability } from "@/types/vulnerability";
import { cache } from "./cache";

const CVSS_API_BASE = "https://services.nvd.nist.gov/rest/json/cves/2.0";

export class CVSSService {
  /**
   * Busca dados do CVSS para uma CVE específica
   */
  async getCVSSData(cve: string): Promise<CVSSData | null> {
    // Verifica cache primeiro
    const cacheKey = `cvss:${cve}`;
    const cached = cache.get<CVSSData>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // API do NVD (National Vulnerability Database)
      const response = await fetch(
        `${CVSS_API_BASE}?cveId=${cve}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        console.warn(`CVSS API error for ${cve}: ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      
      if (!data.vulnerabilities || data.vulnerabilities.length === 0) {
        return null;
      }

      const vuln = data.vulnerabilities[0].cve;
      const metrics = vuln.metrics?.cvssMetricV31?.[0] || vuln.metrics?.cvssMetricV30?.[0] || vuln.metrics?.cvssMetricV2?.[0];

      if (!metrics) {
        return null;
      }

      const cvssData: CVSSData = {
        version: metrics.cvssData?.version || "3.1",
        vectorString: metrics.cvssData?.vectorString || "",
        baseScore: metrics.cvssData?.baseScore || 0,
        baseSeverity: this.mapSeverity(metrics.cvssData?.baseSeverity),
        exploitabilityScore: metrics.exploitabilityScore,
        impactScore: metrics.impactScore,
        attackVector: metrics.cvssData?.attackVector,
        attackComplexity: metrics.cvssData?.attackComplexity,
        privilegesRequired: metrics.cvssData?.privilegesRequired,
        userInteraction: metrics.cvssData?.userInteraction,
        scope: metrics.cvssData?.scope,
        confidentialityImpact: metrics.cvssData?.confidentialityImpact,
        integrityImpact: metrics.cvssData?.integrityImpact,
        availabilityImpact: metrics.cvssData?.availabilityImpact,
      };

      // Salva no cache (24 horas)
      cache.set(cacheKey, cvssData, 24 * 60 * 60 * 1000);

      return cvssData;
    } catch (error) {
      console.error(`Error fetching CVSS data for ${cve}:`, error);
      return null;
    }
  }

  /**
   * Calcula score CVSS baseado na severidade do OWASP
   */
  estimateCVSSFromOWASP(vuln: OWASPVulnerability): CVSSData {
    // Mapeamento aproximado de severidade OWASP para CVSS
    const severityMap: Record<string, { score: number; severity: CVSSData["baseSeverity"] }> = {
      CRITICAL: { score: 9.0, severity: "CRITICAL" },
      HIGH: { score: 7.0, severity: "HIGH" },
      MEDIUM: { score: 5.0, severity: "MEDIUM" },
      LOW: { score: 3.0, severity: "LOW" },
      INFO: { score: 0.0, severity: "NONE" },
    };

    const mapping = severityMap[vuln.severity] || severityMap.MEDIUM;

    return {
      version: "3.1",
      vectorString: "",
      baseScore: mapping.score,
      baseSeverity: mapping.severity,
    };
  }

  /**
   * Busca CVSS data para uma vulnerabilidade
   * Tenta buscar pela CVE, se não encontrar, estima baseado na severidade OWASP
   */
  async getCVSSForVulnerability(vuln: OWASPVulnerability): Promise<CVSSData> {
    if (vuln.cve) {
      const cvssData = await this.getCVSSData(vuln.cve);
      if (cvssData) {
        return cvssData;
      }
    }

    // Se não encontrou CVE ou não tem CVE, estima baseado na severidade
    return this.estimateCVSSFromOWASP(vuln);
  }

  private mapSeverity(severity?: string): CVSSData["baseSeverity"] {
    if (!severity) return "MEDIUM";
    const upper = severity.toUpperCase();
    if (upper.includes("CRITICAL")) return "CRITICAL";
    if (upper.includes("HIGH")) return "HIGH";
    if (upper.includes("MEDIUM")) return "MEDIUM";
    if (upper.includes("LOW")) return "LOW";
    return "NONE";
  }
}

export const cvssService = new CVSSService();

