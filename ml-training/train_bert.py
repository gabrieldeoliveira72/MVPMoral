#!/usr/bin/env python3
"""
Treina/fine-tune modelo BERT para classificar vulnerabilidades
"""

import pandas as pd
import torch
from transformers import (
    AutoTokenizer, 
    AutoModelForSequenceClassification,
    TrainingArguments,
    Trainer,
    EarlyStoppingCallback
)
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from datasets import Dataset
import os
from pathlib import Path

def load_data():
    """Carrega dados de treinamento"""
    data_file = Path("data/training_data.csv")
    
    if not data_file.exists():
        print("❌ Arquivo data/training_data.csv não encontrado!")
        print("Execute collect_training_data.py primeiro.")
        return None
    
    df = pd.read_csv(data_file)
    print(f"✅ Carregados {len(df)} registros")
    return df

def prepare_data(df):
    """Prepara dados para BERT"""
    # Combina texto
    df['text'] = (
        df['name'].fillna('') + ' [SEP] ' +
        df['description'].fillna('') + ' [SEP] ' +
        df['message'].fillna('')
    )
    
    # Limita tamanho do texto (BERT tem limite de 512 tokens)
    df['text'] = df['text'].str[:500]
    
    return df

def tokenize_function(examples, tokenizer, max_length=128):
    """Tokeniza textos"""
    return tokenizer(
        examples['text'],
        truncation=True,
        padding='max_length',
        max_length=max_length
    )

def compute_metrics(eval_pred):
    """Calcula métricas"""
    predictions, labels = eval_pred
    predictions = predictions.argmax(axis=-1)
    accuracy = accuracy_score(labels, predictions)
    return {'accuracy': accuracy}

def train_bert():
    """Treina modelo BERT"""
    print("🚀 Treinamento de BERT para Triagem de Vulnerabilidades\n")
    
    # Carrega dados
    df = load_data()
    if df is None:
        return
    
    if len(df) < 100:
        print(f"⚠️ Poucos dados ({len(df)}). BERT precisa de pelo menos 100-200 registros.")
        print("Continue mesmo assim? (s/n): ", end='')
        if input().lower() != 's':
            return
    
    # Prepara dados
    print("📝 Preparando dados...")
    df = prepare_data(df)
    
    # Divide em treino e validação
    train_df, val_df = train_test_split(
        df, test_size=0.2, random_state=42, stratify=df['is_real_threat']
    )
    
    print(f"📊 Treino: {len(train_df)} | Validação: {len(val_df)}")
    
    # Cria datasets
    train_dataset = Dataset.from_pandas(train_df[['text', 'is_real_threat']])
    val_dataset = Dataset.from_pandas(val_df[['text', 'is_real_threat']])
    
    # Carrega tokenizer e modelo
    print("🤖 Carregando modelo BERT...")
    model_name = "distilbert-base-uncased"  # Mais leve que BERT base
    
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSequenceClassification.from_pretrained(
        model_name,
        num_labels=2  # Ameaça real ou falso positivo
    )
    
    # Tokeniza
    print("📝 Tokenizando textos...")
    train_dataset = train_dataset.map(
        lambda x: tokenize_function(x, tokenizer),
        batched=True
    )
    val_dataset = val_dataset.map(
        lambda x: tokenize_function(x, tokenizer),
        batched=True
    )
    
    # Renomeia coluna
    train_dataset = train_dataset.rename_column('is_real_threat', 'labels')
    val_dataset = val_dataset.rename_column('is_real_threat', 'labels')
    
    # Configura treinamento
    training_args = TrainingArguments(
        output_dir="./models/bert_model",
        num_train_epochs=3,
        per_device_train_batch_size=16,
        per_device_eval_batch_size=16,
        warmup_steps=100,
        weight_decay=0.01,
        logging_dir='./logs',
        logging_steps=10,
        evaluation_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
        metric_for_best_model="accuracy",
        greater_is_better=True,
    )
    
    # Cria trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=val_dataset,
        compute_metrics=compute_metrics,
        callbacks=[EarlyStoppingCallback(early_stopping_patience=2)],
    )
    
    # Treina
    print("\n🔥 Iniciando treinamento...")
    trainer.train()
    
    # Avalia
    print("\n📈 Avaliando modelo...")
    eval_results = trainer.evaluate()
    print(f"✅ Acurácia na validação: {eval_results['eval_accuracy'] * 100:.2f}%")
    
    # Salva modelo final
    os.makedirs("models/bert_model", exist_ok=True)
    trainer.save_model("./models/bert_model")
    tokenizer.save_pretrained("./models/bert_model")
    
    print(f"\n💾 Modelo salvo em ./models/bert_model")
    
    # Testa com alguns exemplos
    print("\n🧪 Testando com exemplos...")
    test_texts = [
        "SQL Injection vulnerability in user input",
        "Deprecated function in test file",
    ]
    
    for text in test_texts:
        inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
        with torch.no_grad():
            outputs = model(**inputs)
            prediction = torch.nn.functional.softmax(outputs.logits, dim=-1)
            is_threat = prediction[0][1].item() > 0.5
            confidence = prediction[0][1].item() * 100
        
        print(f"  '{text[:50]}...'")
        print(f"    → {'Ameaça Real' if is_threat else 'Falso Positivo'} ({confidence:.1f}%)")
    
    print("\n✅ Treinamento concluído!")
    print("\n📝 Próximos passos:")
    print("  1. Integre o modelo na API Flask")
    print("  2. Teste com dados reais")
    print("  3. Fine-tune com mais dados se necessário")

if __name__ == "__main__":
    train_bert()

