// Serviço para coletar feedback e melhorar modelos ML

import type { TriagedVulnerability } from "@/types/vulnerability";

export interface MLFeedback {
  vulnerabilityId: string;
  isCorrect: boolean;
  userClassification: "REAL_THREAT" | "FALSE_POSITIVE";
  comment?: string;
  timestamp: number;
}

class FeedbackService {
  private storageKey = "ml-feedback";

  /**
   * Salva feedback do usuário
   */
  saveFeedback(feedback: MLFeedback): void {
    if (typeof window === "undefined") return;

    try {
      const allFeedback = this.getAllFeedback();
      allFeedback.push(feedback);
      
      // Mantém apenas os últimos 1000 feedbacks
      if (allFeedback.length > 1000) {
        allFeedback.splice(0, allFeedback.length - 1000);
      }

      localStorage.setItem(this.storageKey, JSON.stringify(allFeedback));
    } catch (error) {
      console.error("Error saving feedback:", error);
    }
  }

  /**
   * Obtém todo o feedback
   */
  getAllFeedback(): MLFeedback[] {
    if (typeof window === "undefined") return [];

    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error reading feedback:", error);
      return [];
    }
  }

  /**
   * Obtém feedback para uma vulnerabilidade específica
   */
  getFeedbackForVulnerability(vulnerabilityId: string): MLFeedback | null {
    const allFeedback = this.getAllFeedback();
    return allFeedback.find((f) => f.vulnerabilityId === vulnerabilityId) || null;
  }

  /**
   * Calcula taxa de acerto do ML baseado em feedback
   */
  calculateMLAccuracy(): {
    total: number;
    correct: number;
    incorrect: number;
    accuracy: number;
  } {
    const feedbacks = this.getAllFeedback();
    
    if (feedbacks.length === 0) {
      return {
        total: 0,
        correct: 0,
        incorrect: 0,
        accuracy: 0,
      };
    }

    const correct = feedbacks.filter((f) => f.isCorrect).length;
    const incorrect = feedbacks.filter((f) => !f.isCorrect).length;

    return {
      total: feedbacks.length,
      correct,
      incorrect,
      accuracy: (correct / feedbacks.length) * 100,
    };
  }

  /**
   * Exporta feedback para análise
   */
  exportFeedback(): string {
    const feedbacks = this.getAllFeedback();
    return JSON.stringify(feedbacks, null, 2);
  }

  /**
   * Limpa todo o feedback
   */
  clearFeedback(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.storageKey);
    }
  }
}

export const feedbackService = new FeedbackService();

