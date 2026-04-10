import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, ExternalLink, CreditCard, Link2, User, Shield } from "lucide-react";
import { authApi, stripeApi } from "../../services/api";
import useAuthStore from "../../store/authStore";

const planLabels = {
  free: "Gratuito",
  starter: "Starter",
  pro: "Pro",
  enterprise: "Enterprise",
};

const planColors = {
  free: "bg-slate-100 text-slate-700",
  starter: "bg-blue-100 text-blue-700",
  pro: "bg-indigo-100 text-indigo-700",
  enterprise: "bg-purple-100 text-purple-700",
};

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Perfil", icon: User },
    { id: "billing", label: "Assinatura", icon: CreditCard },
    { id: "integrations", label: "Integrações", icon: Link2 },
  ];

  // Profile form
  const { register: regProfile, handleSubmit: handleProfile, formState: { errors: profileErrors } } = useForm({
    defaultValues: { full_name: user?.full_name || "" },
  });

  // Pipedrive form
  const { register: regPipedrive, handleSubmit: handlePipedrive } = useForm({
    defaultValues: { pipedrive_api_token: user?.pipedrive_api_token || "" },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => authApi.updateMe(data),
    onSuccess: (res) => {
      setUser(res.data);
    },
  });

  const portalMutation = useMutation({
    mutationFn: () => stripeApi.portal(),
    onSuccess: (res) => {
      window.location.href = res.data.portal_url;
    },
  });

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configurações</h1>
        <p className="text-slate-500 text-sm">Gerencie seu perfil, assinatura e integrações.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.id
                ? "border-primary-600 text-primary-700"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile */}
      {activeTab === "profile" && (
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-slate-900">Informações do Perfil</h2>
          {updateMutation.isSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm">
              Perfil atualizado com sucesso!
            </div>
          )}
          <form
            onSubmit={handleProfile((d) => updateMutation.mutate(d))}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome completo</label>
              <input
                {...regProfile("full_name", { required: "Obrigatório" })}
                className="input"
              />
              {profileErrors.full_name && (
                <p className="text-red-500 text-xs mt-1">{profileErrors.full_name.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
              <input value={user?.email} disabled className="input bg-slate-50 cursor-not-allowed" />
            </div>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="btn-primary text-sm"
            >
              <Save className="w-4 h-4" />
              {updateMutation.isPending ? "Salvando..." : "Salvar alterações"}
            </button>
          </form>
        </div>
      )}

      {/* Billing */}
      {activeTab === "billing" && (
        <div className="card p-6 space-y-6">
          <h2 className="font-semibold text-slate-900">Assinatura</h2>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-slate-700">Plano atual</p>
              <span className={`badge mt-1 ${planColors[user?.plan] || planColors.free}`}>
                {planLabels[user?.plan] || "Gratuito"}
              </span>
            </div>
            {user?.stripe_customer_id && (
              <button
                onClick={() => portalMutation.mutate()}
                disabled={portalMutation.isPending}
                className="btn-secondary text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                {portalMutation.isPending ? "Aguarde..." : "Gerenciar assinatura"}
              </button>
            )}
          </div>
          {user?.plan === "free" && (
            <div className="bg-primary-50 border border-primary-100 rounded-lg p-4">
              <p className="text-sm font-medium text-primary-800 mb-2">Faça upgrade para desbloquear mais</p>
              <p className="text-sm text-primary-600 mb-3">
                Acesse leads ilimitados, cadências, integrações e aulas exclusivas.
              </p>
              <a href="/pricing" className="btn-primary text-sm">
                Ver planos <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      )}

      {/* Integrations */}
      {activeTab === "integrations" && (
        <div className="space-y-4">
          {/* Pipedrive */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Link2 className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Pipedrive</h3>
                <p className="text-xs text-slate-500">Sincronize leads e negociações</p>
              </div>
              {user?.pipedrive_api_token && (
                <span className="ml-auto badge bg-green-50 text-green-700">Conectado</span>
              )}
            </div>
            <form onSubmit={handlePipedrive((d) => updateMutation.mutate(d))}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  API Token do Pipedrive
                </label>
                <input
                  {...regPipedrive("pipedrive_api_token")}
                  className="input"
                  type="password"
                  placeholder="Insira seu token da API do Pipedrive"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Encontre em: Pipedrive → Configurações → API → Token pessoal
                </p>
              </div>
              <button type="submit" disabled={updateMutation.isPending} className="btn-primary text-sm">
                <Save className="w-4 h-4" /> Salvar token
              </button>
            </form>
          </div>

          {/* SendGrid info */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">SendGrid</h3>
                <p className="text-xs text-slate-500">Envio de e-mails das cadências</p>
              </div>
              <span className="ml-auto badge bg-green-50 text-green-700">Configurado</span>
            </div>
            <p className="text-sm text-slate-500">
              O SendGrid está configurado pelo administrador da plataforma.
              Os e-mails das suas cadências são enviados automaticamente.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
