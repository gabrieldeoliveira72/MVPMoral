// Parser para formatos OWASP Dependency-Check

import type { OWASPVulnerability } from "@/types/vulnerability";

export class OWASPParser {
  /**
   * Parse JSON do OWASP Dependency-Check
   */
  parseJSON(data: any): OWASPVulnerability[] {
    const vulnerabilities: OWASPVulnerability[] = [];

    // Formato 1: Array direto de vulnerabilidades
    if (Array.isArray(data)) {
      return data.map((v, i) => this.normalizeVulnerability(v, i));
    }

    // Formato 2: Objeto com propriedade dependencies
    if (data.dependencies && Array.isArray(data.dependencies)) {
      data.dependencies.forEach((dep: any, depIndex: number) => {
        if (dep.vulnerabilities && Array.isArray(dep.vulnerabilities)) {
          dep.vulnerabilities.forEach((vuln: any, vulnIndex: number) => {
            vulnerabilities.push(
              this.normalizeVulnerability(
                {
                  ...vuln,
                  file: dep.filePath || dep.file,
                  package: dep.packages?.[0]?.id || dep.name,
                },
                depIndex * 1000 + vulnIndex
              )
            );
          });
        }
      });
    }

    // Formato 3: Objeto com propriedade vulnerabilities
    if (data.vulnerabilities && Array.isArray(data.vulnerabilities)) {
      return data.vulnerabilities.map((v: any, i: number) =>
        this.normalizeVulnerability(v, i)
      );
    }

    return vulnerabilities;
  }

  /**
   * Parse XML do OWASP Dependency-Check (simulado - em produção usaria xml2js)
   */
  async parseXML(xmlContent: string): Promise<OWASPVulnerability[]> {
    // TODO: Implementar parser XML real com xml2js
    // Por enquanto, tenta extrair dados básicos
    const vulnerabilities: OWASPVulnerability[] = [];
    
    // Regex simples para extrair CVE
    const cveRegex = /CVE-\d{4}-\d+/g;
    const cves = xmlContent.match(cveRegex) || [];

    cves.forEach((cve, index) => {
      vulnerabilities.push({
        id: `owasp-${index + 1}`,
        name: `Vulnerability ${cve}`,
        description: `Vulnerability detected: ${cve}`,
        severity: "HIGH",
        cve: cve,
      });
    });

    return vulnerabilities;
  }

  /**
   * Normaliza uma vulnerabilidade para o formato padrão
   */
  private normalizeVulnerability(vuln: any, index: number): OWASPVulnerability {
    return {
      id: vuln.id || vuln.name || `vuln-${index + 1}`,
      name: vuln.name || vuln.title || vuln.cve || `Vulnerability ${index + 1}`,
      description: vuln.description || vuln.summary || "",
      severity: this.normalizeSeverity(vuln.severity || vuln.cvssv3?.baseSeverity || "MEDIUM"),
      cwe: vuln.cwe || vuln.cweId,
      cve: vuln.cve || vuln.cveId,
      file: vuln.file || vuln.filePath || vuln.package,
      line: vuln.line || vuln.lineNumber,
      rule: vuln.rule || vuln.ruleId,
      message: vuln.message || vuln.description,
      confidence: vuln.confidence || vuln.cvssv3?.baseScore ? vuln.cvssv3.baseScore / 10 : undefined,
    };
  }

  /**
   * Normaliza severidade para formato padrão
   */
  private normalizeSeverity(severity: string): OWASPVulnerability["severity"] {
    const upper = severity.toUpperCase();
    if (upper.includes("CRITICAL") || upper.includes("CRITICAL")) return "CRITICAL";
    if (upper.includes("HIGH")) return "HIGH";
    if (upper.includes("MEDIUM") || upper.includes("MODERATE")) return "MEDIUM";
    if (upper.includes("LOW")) return "LOW";
    if (upper.includes("INFO") || upper.includes("INFORMATIONAL")) return "INFO";
    return "MEDIUM";
  }
}

export const owaspParser = new OWASPParser();

