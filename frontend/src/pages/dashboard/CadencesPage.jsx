import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Edit, Users, GitBranch, ToggleLeft, ToggleRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cadencesApi } from "../../services/api";

const stepTypeLabels = {
  email: "E-mail",
  call: "Ligação",
  linkedin: "LinkedIn",
  whatsapp: "WhatsApp",
  task: "Tarefa",
};

const stepTypeColors = {
  email: "bg-blue-100 text-blue-700",
  call: "bg-green-100 text-green-700",
  linkedin: "bg-indigo-100 text-indigo-700",
  whatsapp: "bg-emerald-100 text-emerald-700",
  task: "bg-yellow-100 text-yellow-700",
};

export default function CadencesPage() {
  const queryClient = useQueryClient();

  const { data: cadences, isLoading } = useQuery({
    queryKey: ["cadences"],
    queryFn: () => cadencesApi.list().then((r) => r.data),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => cadencesApi.update(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries(["cadences"]),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => cadencesApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries(["cadences"]),
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cadências</h1>
          <p className="text-slate-500 text-sm">{cadences?.length ?? 0} cadências criadas</p>
        </div>
        <Link to="/dashboard/cadences/new" className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> Nova cadência
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-400">Carregando...</div>
      ) : cadences?.length === 0 ? (
        <div className="card p-12 text-center">
          <GitBranch className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Nenhuma cadência</h3>
          <p className="text-slate-500 text-sm mb-6">
            Crie sua primeira cadência de follow-up para automatizar o contato com seus leads.
          </p>
          <Link to="/dashboard/cadences/new" className="btn-primary text-sm">
            <Plus className="w-4 h-4" /> Criar primeira cadência
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cadences.map((cadence) => (
            <div key={cadence.id} className="card p-5 hover:shadow-md transition-shadow flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">{cadence.name}</h3>
                  {cadence.description && (
                    <p className="text-slate-500 text-xs mt-0.5 line-clamp-2">{cadence.description}</p>
                  )}
                </div>
                <button
                  onClick={() => toggleMutation.mutate({ id: cadence.id, is_active: !cadence.is_active })}
                  className="ml-2 text-slate-400 hover:text-primary-600 transition-colors shrink-0"
                  title={cadence.is_active ? "Pausar" : "Ativar"}
                >
                  {cadence.is_active
                    ? <ToggleRight className="w-6 h-6 text-green-500" />
                    : <ToggleLeft className="w-6 h-6" />
                  }
                </button>
              </div>

              {/* Steps preview */}
              <div className="flex flex-wrap gap-1.5 mb-4 flex-1">
                {cadence.steps.slice(0, 6).map((step, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <span className={`badge text-xs ${stepTypeColors[step.step_type]}`}>
                      {stepTypeLabels[step.step_type]}
                    </span>
                    {i < Math.min(cadence.steps.length, 6) - 1 && (
                      <span className="text-slate-300 text-xs">→</span>
                    )}
                  </div>
                ))}
                {cadence.steps.length > 6 && (
                  <span className="text-xs text-slate-400">+{cadence.steps.length - 6} mais</span>
                )}
                {cadence.steps.length === 0 && (
                  <span className="text-xs text-slate-400 italic">Sem etapas</span>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <GitBranch className="w-3 h-3" /> {cadence.steps.length} etapas
                  </span>
                  <span className={`badge ${cadence.is_active ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                    {cadence.is_active ? "Ativa" : "Pausada"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Link
                    to={`/dashboard/cadences/${cadence.id}/edit`}
                    className="btn-ghost p-1.5 text-slate-500"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => {
                      if (confirm("Excluir esta cadência?")) deleteMutation.mutate(cadence.id);
                    }}
                    className="btn-ghost p-1.5 hover:text-red-600 text-slate-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
