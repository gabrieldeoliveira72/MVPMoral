#!/usr/bin/env python3
"""
Script para coletar dados de treinamento do histórico e feedback do sistema
"""

import json
import csv
import os
from pathlib import Path

def collect_from_feedback():
    """Coleta dados do feedback do sistema (localStorage)"""
    # Em produção, isso viria de um banco de dados ou API
    # Por enquanto, você precisa exportar manualmente do navegador
    
    print("""
    Para coletar dados de feedback:
    
    1. Abra o console do navegador (F12)
    2. Execute: localStorage.getItem('ml-feedback')
    3. Copie o JSON e salve em data/feedback.json
    4. Execute este script novamente
    """)
    
    feedback_file = Path("data/feedback.json")
    if not feedback_file.exists():
        print(f"Arquivo {feedback_file} não encontrado.")
        return []
    
    with open(feedback_file, 'r') as f:
        feedbacks = json.load(f)
    
    return feedbacks

def collect_from_history():
    """Coleta dados do histórico de análises"""
    history_file = Path("data/history.json")
    if not history_file.exists():
        print(f"Arquivo {history_file} não encontrado.")
        return []
    
    with open(history_file, 'r') as f:
        history = json.load(f)
    
    training_data = []
    
    for analysis in history:
        for vuln in analysis.get('result', {}).get('vulnerabilities', []):
            original = vuln.get('original', {})
            ml_pred = vuln.get('mlPrediction', {})
            
            # Usa o feedback se disponível, senão usa a predição ML
            is_real_threat = ml_pred.get('isRealThreat', True)
            
            training_data.append({
                'name': original.get('name', ''),
                'description': original.get('description', ''),
                'severity': original.get('severity', 'MEDIUM'),
                'cve': original.get('cve', ''),
                'cwe': original.get('cwe', ''),
                'file': original.get('file', ''),
                'line': original.get('line', ''),
                'message': original.get('message', ''),
                'is_real_threat': 1 if is_real_threat else 0,
            })
    
    return training_data

def create_training_csv():
    """Cria arquivo CSV de treinamento"""
    os.makedirs("data", exist_ok=True)
    
    # Coleta dados
    history_data = collect_from_history()
    feedback_data = collect_from_feedback()
    
    # Combina dados
    all_data = history_data
    
    # Adiciona dados de feedback (se houver)
    if feedback_data:
        # Mapeia feedback para formato de treinamento
        # (implementar conforme necessário)
        pass
    
    # Salva CSV
    if all_data:
        csv_file = Path("data/training_data.csv")
        with open(csv_file, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=[
                'name', 'description', 'severity', 'cve', 'cwe', 
                'file', 'line', 'message', 'is_real_threat'
            ])
            writer.writeheader()
            writer.writerows(all_data)
        
        print(f"✅ Criado {csv_file} com {len(all_data)} registros")
    else:
        print("⚠️ Nenhum dado encontrado. Crie dados de exemplo primeiro.")

if __name__ == "__main__":
    create_training_csv()

