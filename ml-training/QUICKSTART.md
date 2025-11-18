# 🚀 Guia Rápido de Treinamento

## Passo 1: Instalar Dependências

```bash
cd ml-training
pip install -r requirements.txt
```

## Passo 2: Preparar Dados

### Opção A: Usar dados de exemplo
```bash
cp data/training_data_example.csv data/training_data.csv
```

### Opção B: Coletar dados reais
1. Use o sistema para analisar vulnerabilidades
2. Dê feedback nas análises (marcar como correto/incorreto)
3. Exporte o feedback do navegador:
   - Abra console (F12)
   - Execute: `localStorage.getItem('ml-feedback')`
   - Salve em `data/feedback.json`
4. Execute: `python collect_training_data.py`

## Passo 3: Treinar Naive Bayes (Mais Rápido)

```bash
python train_naive_bayes.py
```

**Tempo estimado**: 1-5 minutos  
**Dados mínimos**: 50 registros  
**Acurácia esperada**: 70-85%

## Passo 4: Treinar BERT (Mais Preciso)

```bash
python train_bert.py
```

**Tempo estimado**: 10-30 minutos (depende da GPU)  
**Dados mínimos**: 100-200 registros  
**Acurácia esperada**: 85-95%

## Passo 5: Integrar Modelos

Após treinar, você tem duas opções:

### Opção A: API Flask (Recomendado)
Criar API Python que serve os modelos treinados.

### Opção B: Transformers.js
Usar modelos diretamente no JavaScript (mais limitado).

## 📊 Dicas

- **Mais dados = Melhor modelo**: Colete pelo menos 100-200 exemplos
- **Balanceie os dados**: Tente ter ~50% ameaças reais e ~50% falsos positivos
- **Valide com dados novos**: Sempre teste com dados que não foram usados no treino
- **Itere**: Treine, teste, colete feedback, treine novamente

## 🐛 Problemas Comuns

**Erro: "Poucos dados"**
- Solução: Colete mais dados ou use os dados de exemplo

**Erro: "CUDA out of memory" (BERT)**
- Solução: Reduza `per_device_train_batch_size` no script

**Modelo com baixa acurácia**
- Solução: Colete mais dados balanceados e de qualidade

