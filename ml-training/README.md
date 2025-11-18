# Treinamento de Modelos ML

Este diretório contém scripts e dados para treinar os modelos BERT e Naive Bayes.

## 📋 Pré-requisitos

```bash
pip install scikit-learn transformers torch pandas numpy
```

## 🎯 Estrutura

```
ml-training/
├── data/
│   ├── training_data.csv      # Dados de treinamento
│   └── test_data.csv          # Dados de teste
├── models/
│   ├── naive_bayes.pkl        # Modelo Naive Bayes treinado
│   └── bert_model/            # Modelo BERT fine-tuned
├── train_naive_bayes.py       # Script de treinamento Naive Bayes
├── train_bert.py              # Script de treinamento BERT
└── collect_training_data.py   # Script para coletar dados do histórico
```

## 📊 Coletando Dados de Treinamento

### Opção 1: Usar feedback do sistema

O sistema já coleta feedback automaticamente. Exporte os dados:

```bash
python collect_training_data.py
```

### Opção 2: Criar dataset manualmente

Crie um arquivo `data/training_data.csv` com as colunas:

```csv
name,description,severity,cve,cwe,file,is_real_threat
SQL Injection,User input directly concatenated,HIGH,CVE-2024-12345,CWE-89,src/api/users.ts,1
Deprecated Function,Using deprecated function in test file,LOW,,,tests/example.test.js,0
```

## 🚀 Treinando Naive Bayes

```bash
python train_naive_bayes.py
```

O modelo será salvo em `models/naive_bayes.pkl`

## 🤖 Treinando BERT

```bash
python train_bert.py
```

O modelo será salvo em `models/bert_model/`

## 📈 Métricas Esperadas

- **Naive Bayes**: 70-85% de acurácia
- **BERT**: 85-95% de acurácia

## 🔄 Integrando Modelos Treinados

Após treinar, os modelos podem ser integrados de duas formas:

1. **API Flask** (recomendado): Criar API Python que serve os modelos
2. **Transformers.js**: Usar modelos no JavaScript (mais limitado)

