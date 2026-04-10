import { Link } from "react-router-dom";
import {
  ArrowRight, Zap, Users, BarChart3, Mail, Link2, CheckCircle, Star, TrendingUp, Shield
} from "lucide-react";

const features = [
  {
    icon: <Zap className="w-6 h-6 text-primary-600" />,
    title: "Cadências Automáticas",
    desc: "Crie sequências de follow-up com e-mails, ligações e tarefas. Automatize e nunca perca um lead.",
  },
  {
    icon: <Users className="w-6 h-6 text-primary-600" />,
    title: "Gestão de Leads",
    desc: "Tabela inteligente com filtros, status e pipeline visual. Saiba exatamente onde cada lead está.",
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-primary-600" />,
    title: "Analytics em Tempo Real",
    desc: "Dashboards com métricas de abertura, cliques, respostas e conversões por cadência.",
  },
  {
    icon: <Mail className="w-6 h-6 text-primary-600" />,
    title: "SendGrid Integrado",
    desc: "Envie e-mails personalizados com rastreamento de abertura e cliques via SendGrid.",
  },
  {
    icon: <Link2 className="w-6 h-6 text-primary-600" />,
    title: "Pipedrive Sync",
    desc: "Sincronize leads e negociações do Pipedrive em um clique. Bi-direcional.",
  },
  {
    icon: <TrendingUp className="w-6 h-6 text-primary-600" />,
    title: "Biblioteca de Aulas",
    desc: "Acesse aulas exclusivas sobre vendas, cold outreach e estratégias de follow-up.",
  },
];

const testimonials = [
  {
    name: "Ana Souza",
    role: "SDR na Startup XYZ",
    text: "Triplicamos o número de respostas nos primeiros 30 dias. A automação de cadências é incrível.",
    stars: 5,
  },
  {
    name: "Carlos Lima",
    role: "Head of Sales",
    text: "A integração com Pipedrive salvou horas por semana. Nosso time ama a ferramenta.",
    stars: 5,
  },
  {
    name: "Mariana Costa",
    role: "Account Executive",
    text: "O editor visual de cadências é o melhor que já usei. Intuitivo e poderoso.",
    stars: 5,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900">FollowUp SaaS</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-600">
            <Link to="/#features" className="hover:text-primary-600 transition-colors">Funcionalidades</Link>
            <Link to="/pricing" className="hover:text-primary-600 transition-colors">Preços</Link>
            <Link to="/#testimonials" className="hover:text-primary-600 transition-colors">Depoimentos</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-secondary text-sm">Entrar</Link>
            <Link to="/register" className="btn-primary text-sm">Começar grátis</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 text-white py-24 lg:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0zNHY2aDZ2LTZoLTZ6bTAgMTJ2Nmg2di02aC02em0wIDEydjZoNnYtNmgtNnptMCAxMnY2aDZ2LTZoLTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Novo: Editor visual de cadências 2.0
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-6">
            Automatize seus
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"> follow-ups</span>
            <br />e venda mais
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto mb-10">
            Crie cadências inteligentes, sincronize com Pipedrive, envie e-mails pelo SendGrid e acompanhe
            cada lead com análises em tempo real.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="btn-primary text-base px-8 py-3 shadow-lg shadow-primary-500/30">
              Começar grátis por 14 dias <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/pricing" className="btn text-white border border-white/30 hover:bg-white/10 text-base px-8 py-3">
              Ver planos
            </Link>
          </div>
          <p className="text-sm text-slate-400 mt-4">Sem cartão de crédito • Cancele quando quiser</p>
        </div>
      </section>

      {/* Logos */}
      <section className="py-12 border-b border-slate-100 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-slate-500 mb-8">Integra nativamente com as ferramentas que você já usa</p>
          <div className="flex flex-wrap items-center justify-center gap-10 text-slate-400 font-semibold text-lg">
            <span className="opacity-60 hover:opacity-100 transition-opacity">Pipedrive</span>
            <span className="opacity-60 hover:opacity-100 transition-opacity">SendGrid</span>
            <span className="opacity-60 hover:opacity-100 transition-opacity">Stripe</span>
            <span className="opacity-60 hover:opacity-100 transition-opacity">LinkedIn</span>
            <span className="opacity-60 hover:opacity-100 transition-opacity">WhatsApp</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Tudo que você precisa para vender mais
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Uma plataforma completa para gerenciar leads, criar cadências e acompanhar resultados.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="card p-6 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard preview */}
      <section className="py-16 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Dashboard intuitivo e completo</h2>
            <p className="text-slate-500">Acompanhe KPIs, leads e cadências em um só lugar.</p>
          </div>
          <div className="card p-1 shadow-2xl border-slate-200">
            <div className="bg-slate-900 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-slate-500 text-xs ml-2">FollowUp SaaS — Dashboard</span>
              </div>
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { label: "Total de Leads", value: "1.247", delta: "+12%" },
                  { label: "Cadências Ativas", value: "8", delta: "+3" },
                  { label: "E-mails Enviados", value: "3.891", delta: "+24%" },
                  { label: "Taxa de Resposta", value: "18.4%", delta: "+2.1%" },
                ].map((stat, i) => (
                  <div key={i} className="bg-slate-800 rounded-lg p-3">
                    <p className="text-slate-400 text-xs">{stat.label}</p>
                    <p className="text-white font-bold text-xl mt-1">{stat.value}</p>
                    <p className="text-green-400 text-xs">{stat.delta}</p>
                  </div>
                ))}
              </div>
              <div className="bg-slate-800 rounded-lg p-3 h-32 flex items-end justify-around gap-1">
                {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                  <div key={i} className="flex-1 bg-primary-500 rounded-sm opacity-80"
                    style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Amado por times de vendas</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="card p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(t.stars)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{t.name}</p>
                  <p className="text-slate-500 text-xs">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-3xl mx-auto px-4 text-center text-white">
          <Shield className="w-12 h-12 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Pronto para vender mais?</h2>
          <p className="text-primary-100 mb-8 text-lg">
            Junte-se a centenas de times de vendas que usam o FollowUp SaaS.
          </p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-white text-primary-600 font-semibold px-8 py-3 rounded-lg hover:bg-slate-100 transition-colors">
            Começar grátis <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 bg-primary-600 rounded flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">FollowUp SaaS</span>
          </div>
          <p className="text-sm">© 2024 FollowUp SaaS. Todos os direitos reservados.</p>
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <Link to="/pricing" className="hover:text-white transition-colors">Preços</Link>
            <a href="#" className="hover:text-white transition-colors">Privacidade</a>
            <a href="#" className="hover:text-white transition-colors">Termos</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
