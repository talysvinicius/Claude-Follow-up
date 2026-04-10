import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search, Plus, Trash2, Edit, ExternalLink, RefreshCw, ChevronLeft, ChevronRight, Filter
} from "lucide-react";
import { leadsApi, pipedriveApi } from "../../services/api";
import LeadModal from "../../components/ui/LeadModal";

const statusColors = {
  new: "bg-slate-100 text-slate-700",
  contacted: "bg-blue-100 text-blue-700",
  qualified: "bg-indigo-100 text-indigo-700",
  proposal: "bg-yellow-100 text-yellow-700",
  negotiation: "bg-orange-100 text-orange-700",
  won: "bg-green-100 text-green-700",
  lost: "bg-red-100 text-red-700",
};

const statusLabels = {
  new: "Novo", contacted: "Contatado", qualified: "Qualificado",
  proposal: "Proposta", negotiation: "Negociação", won: "Ganho", lost: "Perdido",
};

export default function LeadsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editLead, setEditLead] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["leads", page, search, statusFilter],
    queryFn: () =>
      leadsApi.list({ page, page_size: 20, search: search || undefined, status: statusFilter || undefined })
        .then((r) => r.data),
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => leadsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries(["leads"]),
  });

  const syncMutation = useMutation({
    mutationFn: () => pipedriveApi.syncPersons(50),
    onSuccess: () => {
      queryClient.invalidateQueries(["leads"]);
    },
  });

  const pushMutation = useMutation({
    mutationFn: (leadId) => pipedriveApi.pushLead(leadId),
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
          <p className="text-slate-500 text-sm">{data?.total ?? 0} leads no total</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
            className="btn-secondary text-sm gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${syncMutation.isPending ? "animate-spin" : ""}`} />
            Sync Pipedrive
          </button>
          <button
            onClick={() => { setEditLead(null); setShowModal(true); }}
            className="btn-primary text-sm"
          >
            <Plus className="w-4 h-4" /> Novo lead
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou empresa..."
              className="input pl-9"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              className="input w-auto"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="">Todos os status</option>
              {Object.entries(statusLabels).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Nome</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 hidden sm:table-cell">Empresa</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 hidden md:table-cell">E-mail</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 hidden lg:table-cell">Pipedrive</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    Carregando...
                  </td>
                </tr>
              ) : data?.items?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <p className="text-slate-500">Nenhum lead encontrado</p>
                    <button
                      onClick={() => { setEditLead(null); setShowModal(true); }}
                      className="btn-primary text-sm mt-3"
                    >
                      <Plus className="w-4 h-4" /> Adicionar lead
                    </button>
                  </td>
                </tr>
              ) : (
                data?.items?.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-900">
                          {lead.first_name} {lead.last_name}
                        </p>
                        <p className="text-xs text-slate-400 sm:hidden">{lead.company}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">
                      {lead.company || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600 hidden md:table-cell">
                      {lead.email}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${statusColors[lead.status]}`}>
                        {statusLabels[lead.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {lead.pipedrive_person_id ? (
                        <span className="badge bg-green-50 text-green-700">Sincronizado</span>
                      ) : (
                        <button
                          onClick={() => pushMutation.mutate(lead.id)}
                          disabled={pushMutation.isPending}
                          className="text-xs text-primary-600 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" /> Enviar
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setEditLead(lead); setShowModal(true); }}
                          className="btn-ghost p-1.5"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Excluir este lead?")) deleteMutation.mutate(lead.id);
                          }}
                          className="btn-ghost p-1.5 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.total > 20 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              {(page - 1) * 20 + 1}–{Math.min(page * 20, data.total)} de {data.total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-ghost p-1.5 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-slate-600">Página {page}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page * 20 >= data.total}
                className="btn-ghost p-1.5 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <LeadModal
          lead={editLead}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            queryClient.invalidateQueries(["leads"]);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}
