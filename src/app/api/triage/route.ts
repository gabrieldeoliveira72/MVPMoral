// API Route para processar triagem de vulnerabilidades

import { NextRequest, NextResponse } from "next/server";
import { triageService } from "@/lib/triage-service";
import type { OWASPVulnerability } from "@/types/vulnerability";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const vulnerabilities: OWASPVulnerability[] = body.vulnerabilities;

    if (!Array.isArray(vulnerabilities)) {
      return NextResponse.json(
        { error: "vulnerabilities deve ser um array" },
        { status: 400 }
      );
    }

    // Valida formato básico
    for (const vuln of vulnerabilities) {
      if (!vuln.id || !vuln.name || !vuln.severity) {
        return NextResponse.json(
          { error: "Vulnerabilidade inválida: id, name e severity são obrigatórios" },
          { status: 400 }
        );
      }
    }

    // Processa triagem
    const result = await triageService.triageVulnerabilities(vulnerabilities);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in triage API:", error);
    return NextResponse.json(
      { error: "Erro ao processar triagem", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "API de Triagem de Vulnerabilidades",
    endpoints: {
      POST: "/api/triage - Processa lista de vulnerabilidades OWASP",
    },
  });
}

