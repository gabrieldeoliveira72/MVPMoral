# Intelligent Vulnerability Triage Tool - MVP

Ferramenta inteligente de triagem de vulnerabilidades que utiliza Machine Learning (BERT + Naive Bayes) e integração com API CVSS para filtrar falsos positivos do OWASP.

## 🎯 Objetivo

O OWASP Dependency-Check e outros scanners geram muitos alertas, incluindo falsos positivos. Esta ferramenta faz um **double-check** usando:

- **BERT**: Análise semântica do contexto e descrição da vulnerabilidade
- **Naive Bayes**: Classificação probabilística baseada em features
- **CVSS API**: Enriquecimento com dados oficiais do NVD (National Vulnerability Database)

## 🚀 Funcionalidades

- ✅ Upload de vulnerabilidades OWASP (formato JSON)
- ✅ Integração automática com API CVSS/NVD
- ✅ Análise com modelos ML (BERT + Naive Bayes)
- ✅ Filtragem de falsos positivos
- ✅ Priorização inteligente de vulnerabilidades
- ✅ Dashboard com estatísticas e resultados detalhados

## 📦 Tecnologias

- **Next.js 16.0.3** - Framework React
- **TypeScript 5.9.3** - Tipagem estática
- **Tailwind CSS 4** - Estilização
- **CVSS API** - Dados de vulnerabilidades
- **ML Models** - BERT e Naive Bayes (simulados - prontos para integração real)

## 🏃 Como Usar

### Instalação

```bash
npm install
```

### Desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

### Upload de Vulnerabilidades

1. Prepare um arquivo JSON com vulnerabilidades no formato OWASP
2. Use o botão "Selecionar arquivo JSON" ou "Usar dados de exemplo"
3. Clique em "Iniciar Triagem"
4. Veja os resultados com análise ML e dados CVSS

### Formato do JSON

```json
[
  {
    "id": "vuln-1",
    "name": "SQL Injection",
    "description": "Description of the vulnerability",
    "severity": "HIGH",
    "cwe": "CWE-89",
    "cve": "CVE-2024-12345",
    "file": "src/api/users.ts",
    "line": 42,
    "rule": "sql-injection",
    "message": "User input directly concatenated",
    "confidence": 0.85
  }
]
```

Veja `example-vulnerabilities.json` para um exemplo completo.

## 🧠 Modelos de Machine Learning

### BERT (Atual: Simulado)
- Analisa contexto semântico da descrição
- Identifica palavras-chave de ameaças reais vs falsos positivos
- **Treinamento**: Veja `ml-training/train_bert.py`
- **Integração**: Pronto para API Flask ou transformers.js

### Naive Bayes (Atual: Simulado)
- Classifica baseado em features (CVE, CWE, severidade, etc.)
- Calcula probabilidade de ser ameaça real
- **Treinamento**: Veja `ml-training/train_naive_bayes.py`
- **Integração**: Modelo salvo em `ml-training/models/naive_bayes.pkl`

### Como Treinar os Modelos

1. **Instale dependências**:
   ```bash
   cd ml-training
   pip install -r requirements.txt
   ```

2. **Prepare dados de treinamento**:
   - Use `data/training_data_example.csv` como exemplo
   - Ou colete dados reais com `collect_training_data.py`

3. **Treine Naive Bayes** (mais rápido):
   ```bash
   python train_naive_bayes.py
   ```

4. **Treine BERT** (mais preciso):
   ```bash
   python train_bert.py
   ```

5. **Integre os modelos**: Veja `ml-training/README.md` para detalhes

Veja `ml-training/QUICKSTART.md` para guia completo.

## 🔌 API Endpoints

### POST `/api/triage`
Processa lista de vulnerabilidades e retorna resultado da triagem.

**Request:**
```json
{
  "vulnerabilities": [...]
}
```

**Response:**
```json
{
  "total": 10,
  "realThreats": 7,
  "falsePositives": 3,
  "critical": 2,
  "high": 3,
  "medium": 2,
  "low": 0,
  "vulnerabilities": [...]
}
```

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── api/
│   │   └── triage/
│   │       └── route.ts          # API endpoint de triagem
│   ├── components/
│   │   └── VulnerabilityTriage.tsx  # Componente principal
│   ├── page.tsx                  # Página inicial
│   └── layout.tsx
├── lib/
│   ├── cvss-service.ts          # Integração com API CVSS
│   ├── ml-service.ts            # Modelos ML (BERT + Naive Bayes)
│   └── triage-service.ts        # Lógica de triagem
└── types/
    └── vulnerability.ts         # Tipos TypeScript
```

## 🔮 Próximos Passos

- [ ] Integrar modelo BERT real (transformers.js ou API Python)
- [ ] Treinar modelo Naive Bayes com dados históricos
- [ ] Adicionar cache para requisições CVSS
- [ ] Implementar histórico de análises
- [ ] Adicionar exportação de relatórios (PDF/CSV)
- [ ] Dashboard com gráficos e métricas avançadas

## 📝 Licença

Este é um projeto MVP para demonstração.
