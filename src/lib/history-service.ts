// Serviço para gerenciar histórico de análises

import type { TriageResult } from "@/types/vulnerability";
import { format } from "date-fns";

export interface AnalysisHistory {
  id: string;
  timestamp: number;
  date: string;
  result: TriageResult;
  fileName?: string;
}

class HistoryService {
  private storageKey = "vulnerability-triage-history";

  /**
   * Salva uma análise no histórico
   */
  saveAnalysis(result: TriageResult, fileName?: string): string {
    const history = this.getHistory();
    const id = `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const analysis: AnalysisHistory = {
      id,
      timestamp: Date.now(),
      date: format(new Date(), "dd/MM/yyyy HH:mm:ss"),
      result,
      fileName,
    };

    history.unshift(analysis); // Adiciona no início
    
    // Mantém apenas as últimas 50 análises
    if (history.length > 50) {
      history.splice(50);
    }

    this.setHistory(history);
    return id;
  }

  /**
   * Obtém todo o histórico
   */
  getHistory(): AnalysisHistory[] {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error reading history:", error);
      return [];
    }
  }

  /**
   * Obtém uma análise específica por ID
   */
  getAnalysis(id: string): AnalysisHistory | null {
    const history = this.getHistory();
    return history.find((a) => a.id === id) || null;
  }

  /**
   * Remove uma análise do histórico
   */
  deleteAnalysis(id: string): boolean {
    const history = this.getHistory();
    const filtered = history.filter((a) => a.id !== id);
    
    if (filtered.length === history.length) {
      return false; // Não encontrou
    }

    this.setHistory(filtered);
    return true;
  }

  /**
   * Limpa todo o histórico
   */
  clearHistory(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.storageKey);
    }
  }

  /**
   * Obtém estatísticas do histórico
   */
  getStats() {
    const history = this.getHistory();
    
    if (history.length === 0) {
      return {
        total: 0,
        totalVulnerabilities: 0,
        totalFalsePositives: 0,
        averageVulnerabilities: 0,
        averageFalsePositives: 0,
      };
    }

    const totalVulnerabilities = history.reduce(
      (sum, a) => sum + a.result.total,
      0
    );
    const totalFalsePositives = history.reduce(
      (sum, a) => sum + a.result.falsePositives,
      0
    );

    return {
      total: history.length,
      totalVulnerabilities,
      totalFalsePositives,
      averageVulnerabilities: Math.round(totalVulnerabilities / history.length),
      averageFalsePositives: Math.round(totalFalsePositives / history.length),
    };
  }

  private setHistory(history: AnalysisHistory[]): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(history));
      } catch (error) {
        console.error("Error saving history:", error);
        // Se exceder limite, remove as mais antigas
        if (error instanceof DOMException && error.name === "QuotaExceededError") {
          const reduced = history.slice(0, 25);
          localStorage.setItem(this.storageKey, JSON.stringify(reduced));
        }
      }
    }
  }
}

export const historyService = new HistoryService();

