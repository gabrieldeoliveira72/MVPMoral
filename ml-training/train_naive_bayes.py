#!/usr/bin/env python3
"""
Treina modelo Naive Bayes para classificar vulnerabilidades
"""

import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import pickle
import os
from pathlib import Path

def load_data():
    """Carrega dados de treinamento"""
    data_file = Path("data/training_data.csv")
    
    if not data_file.exists():
        print("❌ Arquivo data/training_data.csv não encontrado!")
        print("Execute collect_training_data.py primeiro ou crie o arquivo manualmente.")
        return None
    
    df = pd.read_csv(data_file)
    print(f"✅ Carregados {len(df)} registros")
    return df

def extract_features(df):
    """Extrai features do dataset"""
    # Combina texto para análise
    df['text'] = (
        df['name'].fillna('') + ' ' +
        df['description'].fillna('') + ' ' +
        df['message'].fillna('')
    )
    
    # Features categóricas
    df['has_cve'] = df['cve'].notna().astype(int)
    df['has_cwe'] = df['cwe'].notna().astype(int)
    
    # Mapeia severidade para numérico
    severity_map = {
        'CRITICAL': 4,
        'HIGH': 3,
        'MEDIUM': 2,
        'LOW': 1,
        'INFO': 0
    }
    df['severity_numeric'] = df['severity'].map(severity_map).fillna(2)
    
    # Verifica se está em arquivo de teste
    df['is_test_file'] = df['file'].str.contains('test|spec|example', case=False, na=False).astype(int)
    
    return df

def train_model(df):
    """Treina modelo Naive Bayes"""
    print("\n🔧 Preparando dados...")
    
    # Extrai features
    df = extract_features(df)
    
    # Separa features e target
    X_text = df['text'].values
    y = df['is_real_threat'].values
    
    # Vectoriza texto
    print("📝 Vectorizando texto...")
    vectorizer = TfidfVectorizer(
        max_features=1000,
        stop_words='english',
        ngram_range=(1, 2),
        min_df=2
    )
    X_text_vectorized = vectorizer.fit_transform(X_text)
    
    # Features adicionais
    X_additional = df[['has_cve', 'has_cwe', 'severity_numeric', 'is_test_file']].values
    
    # Combina features
    from scipy.sparse import hstack
    X = hstack([X_text_vectorized, X_additional])
    
    # Divide em treino e teste
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"📊 Treino: {len(X_train)} | Teste: {len(X_test)}")
    
    # Treina modelo
    print("\n🤖 Treinando Naive Bayes...")
    model = MultinomialNB(alpha=1.0)
    model.fit(X_train, y_train)
    
    # Avalia
    print("\n📈 Avaliando modelo...")
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"\n✅ Acurácia: {accuracy * 100:.2f}%")
    print("\n📊 Relatório de Classificação:")
    print(classification_report(y_test, y_pred, target_names=['Falso Positivo', 'Ameaça Real']))
    
    # Salva modelo e vectorizer
    os.makedirs("models", exist_ok=True)
    
    model_file = Path("models/naive_bayes.pkl")
    vectorizer_file = Path("models/vectorizer.pkl")
    
    with open(model_file, 'wb') as f:
        pickle.dump(model, f)
    
    with open(vectorizer_file, 'wb') as f:
        pickle.dump(vectorizer, f)
    
    print(f"\n💾 Modelo salvo em {model_file}")
    print(f"💾 Vectorizer salvo em {vectorizer_file}")
    
    return model, vectorizer, accuracy

def main():
    print("🚀 Treinamento de Naive Bayes para Triagem de Vulnerabilidades\n")
    
    df = load_data()
    if df is None:
        return
    
    # Verifica se tem dados suficientes
    if len(df) < 50:
        print(f"⚠️ Poucos dados ({len(df)}). Recomendado: pelo menos 50-100 registros.")
        print("Continue mesmo assim? (s/n): ", end='')
        if input().lower() != 's':
            return
    
    # Verifica balanceamento
    real_threats = df['is_real_threat'].sum()
    false_positives = len(df) - real_threats
    
    print(f"\n📊 Distribuição:")
    print(f"  Ameaças Reais: {real_threats} ({real_threats/len(df)*100:.1f}%)")
    print(f"  Falsos Positivos: {false_positives} ({false_positives/len(df)*100:.1f}%)")
    
    if real_threats < 10 or false_positives < 10:
        print("⚠️ Dataset desbalanceado. Considere coletar mais dados.")
    
    # Treina
    model, vectorizer, accuracy = train_model(df)
    
    print("\n✅ Treinamento concluído!")
    print("\n📝 Próximos passos:")
    print("  1. Integre o modelo na API Flask ou no Next.js")
    print("  2. Teste com dados reais")
    print("  3. Colete mais feedback para melhorar o modelo")

if __name__ == "__main__":
    main()

