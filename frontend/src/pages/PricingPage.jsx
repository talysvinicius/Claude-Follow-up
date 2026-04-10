import { Link } from "react-router-dom";
import { CheckCircle, Zap, ArrowLeft } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { stripeApi } from "../services/api";

const plans = [
  {
    name: "Free",
    price: "R$0",
    period: "/mês",
    description: "Para explorar a plataforma",
    plan: null,
    features: [
      "Até 50 leads",
      "1 cadência ativa",
      "100 e-mails/mês",
      "Dashboard básico",
      "Acesso às aulas gratuitas",
    ],
    cta: "Começar grátis",
    highlight: false,
  },
  {
    name: "Starter",
    price: "R$149",
    period: "/mês",
    description: "Para times pequenos que estão crescendo",
    plan: "starter",
    features: [
      "Até 500 leads",
      "5 cadências ativas",
      "2.000 e-mails/mês",
      "Integração Pipedrive",
      "Analytics avançado",
      "Todas as aulas",
      "Suporte por e-mail",
    ],
    cta: "Assinar Starter",
    highlight: false,
  },
  {
    name: "Pro",
    price: "R$349",
    period: "/mês",
    description: "Para times de vendas em expansão",
    plan: "pro",
    features: [
      "Leads ilimitados",
      "Cadências ilimitadas",
      "10.000 e-mails/mês",
      "Integração Pipedrive + webhooks",
      "Analytics completo + exportação",
      "Todas as aulas + novas",
      "Suporte prioritário",
      "API access",
    ],
    cta: "Assinar Pro",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Sob consulta",
    period: "",
    description: "Para grandes organizações",
    plan: "enterprise",
    features: [
      "Tudo do Pro",
      "SSO / SAML",
      "SLA dedicado",
      "Onboarding personalizado",
      "Gerente de sucesso",
      "Infraestrutura dedicada",
    ],
    cta: "Falar com vendas",
    highlight: false,
  },
];

export default function PricingPage() {
  const checkoutMutation = useMutation({
    mutationFn: (plan) => stripeApi.checkout(plan),
    onSuccess: (res) => {
      window.location.href = res.data.checkout_url;
    },
  });

  const handleSelect = (plan) => {
    if (!plan) {
      window.location.href = "/register";
      return;
    }
    const token = localStorage.getItem("access_token");
    if (!token) {
      window.location.href = `/register?plan=${plan}`;
      return;
    }
    checkoutMutation.mutate(plan);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900">FollowUp SaaS</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-secondary text-sm">Entrar</Link>
            <Link to="/register" className="btn-primary text-sm">Começar grátis</Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary-600 mb-6">
            <ArrowLeft className="w-4 h-4" /> Voltar ao início
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Planos e preços</h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Comece gratuitamente e escale conforme seu time cresce. Cancele quando quiser.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`card p-6 flex flex-col relative ${
                plan.highlight ? "ring-2 ring-primary-500 shadow-lg shadow-primary-100" : ""
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="badge bg-primary-600 text-white px-3 py-1">Mais popular</span>
                </div>
              )}
              <div className="mb-6">
                <h3 className="font-bold text-slate-900 text-lg mb-1">{plan.name}</h3>
                <p className="text-slate-500 text-sm mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
                  <span className="text-slate-500 text-sm">{plan.period}</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSelect(plan.plan)}
                disabled={checkoutMutation.isPending}
                className={plan.highlight ? "btn-primary w-full" : "btn-secondary w-full"}
              >
                {checkoutMutation.isPending && checkoutMutation.variables === plan.plan
                  ? "Aguarde..."
                  : plan.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-12 text-sm text-slate-500">
          <p>Todos os planos incluem SSL, backups automáticos e 99.9% de uptime.</p>
          <p className="mt-2">Dúvidas? <a href="mailto:hello@followupsaas.com" className="text-primary-600 hover:underline">Fale conosco</a></p>
        </div>
      </div>
    </div>
  );
}
