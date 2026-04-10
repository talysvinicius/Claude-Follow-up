import { useQuery } from "@tanstack/react-query";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from "recharts";
import { Users, GitBranch, Mail, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { leadsApi, cadencesApi } from "../../services/api";
import { Link } from "react-router-dom";
import useAuthStore from "../../store/authStore";

const emailData = [
  { day: "Seg", sent: 40, opened: 28, replied: 8 },
  { day: "Ter", sent: 55, opened: 35, replied: 12 },
  { day: "Qua", sent: 48, opened: 30, replied: 9 },
  { day: "Qui", sent: 70, opened: 52, replied: 18 },
  { day: "Sex", sent: 62, opened: 44, replied: 15 },
  { day: "Sáb", sent: 20, opened: 12, replied: 3 },
  { day: "Dom", sent: 15, opened: 8, replied: 2 },
];

const COLORS = ["#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function DashboardHome() {
  const { user } = useAuthStore();
  const { data: statsData } = useQuery({
    queryKey: ["leads-stats"],
    queryFn: () => leadsApi.stats().then((r) => r.data),
  });
  const { data: cadences } = useQuery({
    queryKey: ["cadences"],
    queryFn: () => cadencesApi.list().then((r) => r.data),
  });

  const stats = [
    {
      label: "Total de Leads",
      value: statsData?.total ?? "—",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      delta: "+12%",
      up: true,
    },
    {
      label: "Cadências Ativas",
      value: cadences?.filter((c) => c.is_active).length ?? "—",
      icon: GitBranch,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      delta: "+3",
      up: true,
    },
    {
      label: "E-mails (7 dias)",
      value: emailData.reduce((a, b) => a + b.sent, 0),
      icon: Mail,
      color: "text-purple-600",
      bg: "bg-purple-50",
      delta: "+18%",
      up: true,
    },
    {
      label: "Taxa de Resposta",
      value: "18.4%",
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
      delta: "-1.2%",
      up: false,
    },
  ];

  const statusPieData = statsData
    ? Object.entries(statsData)
        .filter(([k]) => k !== "total")
        .map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Bom dia, {user?.full_name?.split(" ")[0]}!
        </h1>
        <p className="text-slate-500 text-sm mt-1">Aqui está um resumo da sua conta.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span className={`flex items-center gap-0.5 text-xs font-medium ${stat.up ? "text-green-600" : "text-red-500"}`}>
                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.delta}
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-slate-500 text-xs mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Area chart */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-semibold text-slate-900 mb-1">Atividade de E-mails (7 dias)</h2>
          <p className="text-slate-500 text-xs mb-4">Enviados, abertos e respondidos</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={emailData}>
              <defs>
                <linearGradient id="sent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="opened" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
              <Area type="monotone" dataKey="sent" stroke="#6366f1" fill="url(#sent)" name="Enviados" strokeWidth={2} />
              <Area type="monotone" dataKey="opened" stroke="#06b6d4" fill="url(#opened)" name="Abertos" strokeWidth={2} />
              <Area type="monotone" dataKey="replied" stroke="#10b981" fill="none" name="Respondidos" strokeWidth={2} strokeDasharray="4 2" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 mb-1">Status dos Leads</h2>
          <p className="text-slate-500 text-xs mb-4">Distribuição por etapa</p>
          {statusPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {statusPieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">
              Sem dados de leads
            </div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Cadences list */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Cadências Recentes</h2>
            <Link to="/dashboard/cadences" className="text-xs text-primary-600 hover:underline">
              Ver todas
            </Link>
          </div>
          {cadences?.length ? (
            <div className="space-y-3">
              {cadences.slice(0, 5).map((c) => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{c.name}</p>
                    <p className="text-xs text-slate-500">{c.steps.length} etapas</p>
                  </div>
                  <span className={`badge ${c.is_active ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                    {c.is_active ? "Ativa" : "Pausada"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-500 text-sm">Nenhuma cadência criada</p>
              <Link to="/dashboard/cadences/new" className="btn-primary text-sm mt-3 inline-flex">
                Criar cadência
              </Link>
            </div>
          )}
        </div>

        {/* Bar chart - leads por mês */}
        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 mb-1">Leads por Mês</h2>
          <p className="text-slate-500 text-xs mb-4">Novos leads adicionados</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[
              { mes: "Jan", leads: 12 }, { mes: "Fev", leads: 19 }, { mes: "Mar", leads: 28 },
              { mes: "Abr", leads: 35 }, { mes: "Mai", leads: 41 }, { mes: "Jun", leads: 38 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="leads" fill="#6366f1" radius={[4, 4, 0, 0]} name="Leads" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
