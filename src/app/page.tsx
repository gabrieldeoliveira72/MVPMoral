import VulnerabilityTriage from "./components/VulnerabilityTriage";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <main className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            MVP - Versão Beta
          </div>
          <h1 className="mb-4 text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl md:text-7xl">
            Intelligent Vulnerability
            <span className="block bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Triage Tool
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-300">
            Triagem inteligente com ML (BERT + Naive Bayes) e integração CVSS para filtrar falsos positivos do OWASP
          </p>
        </header>

        {/* Features Grid */}
        <div className="mb-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="group rounded-xl border border-gray-200 bg-white p-6 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-red-600 text-white">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              Análise com BERT e Naive Bayes
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Double-check com modelos ML (BERT + Naive Bayes) para detectar falsos positivos do OWASP
            </p>
          </div>

          <div className="group rounded-xl border border-gray-200 bg-white p-6 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              Integração CVSS
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Busca automática de dados CVSS da API NVD para enriquecer análise de vulnerabilidades
            </p>
          </div>

          <div className="group rounded-xl border border-gray-200 bg-white p-6 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              Dashboard em Tempo Real
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Visualização em tempo real de métricas e status das vulnerabilidades
            </p>
          </div>

          <div className="group rounded-xl border border-gray-200 bg-white p-6 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              Segurança Avançada
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Integração com scanners e ferramentas de segurança existentes
            </p>
          </div>

          <div className="group rounded-xl border border-gray-200 bg-white p-6 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              Processamento Rápido
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Análise e processamento em alta velocidade com Next.js 16
            </p>
          </div>

          <div className="group rounded-xl border border-gray-200 bg-white p-6 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              Relatórios Detalhados
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Geração automática de relatórios e documentação completa
            </p>
          </div>
        </div>

        {/* Triage Tool */}
        <div className="mb-16">
          <VulnerabilityTriage />
        </div>

        {/* Footer */}
        <footer className="mt-20 text-center text-gray-600 dark:text-gray-400">
          <p>
            Intelligent Vulnerability Triage Tool - MVP © 2025 | Construído com
            Next.js 16.0.3
          </p>
        </footer>
      </main>
    </div>
  );
}
