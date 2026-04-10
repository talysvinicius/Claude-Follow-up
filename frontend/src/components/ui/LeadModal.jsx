import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { X } from "lucide-react";
import { leadsApi } from "../../services/api";

const schema = z.object({
  first_name: z.string().min(1, "Obrigatório"),
  last_name: z.string().min(1, "Obrigatório"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  status: z.string().default("new"),
  notes: z.string().optional(),
});

export default function LeadModal({ lead, onClose, onSuccess }) {
  const isEdit = !!lead;
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: lead || { status: "new" },
  });

  const mutation = useMutation({
    mutationFn: (data) => isEdit ? leadsApi.update(lead.id, data) : leadsApi.create(data),
    onSuccess,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900">
            {isEdit ? "Editar lead" : "Novo lead"}
          </h2>
          <button onClick={onClose} className="btn-ghost p-1.5">
            <X className="w-5 h-5" />
          </button>
        </div>

        {mutation.isError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm mb-4">
            {mutation.error?.response?.data?.detail || "Erro ao salvar lead"}
          </div>
        )}

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome *</label>
              <input {...register("first_name")} className="input" placeholder="João" />
              {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sobrenome *</label>
              <input {...register("last_name")} className="input" placeholder="Silva" />
              {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">E-mail *</label>
            <input {...register("email")} type="email" className="input" placeholder="joao@empresa.com" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
              <input {...register("phone")} className="input" placeholder="+55 11 99999-9999" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select {...register("status")} className="input">
                <option value="new">Novo</option>
                <option value="contacted">Contatado</option>
                <option value="qualified">Qualificado</option>
                <option value="proposal">Proposta</option>
                <option value="negotiation">Negociação</option>
                <option value="won">Ganho</option>
                <option value="lost">Perdido</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Empresa</label>
              <input {...register("company")} className="input" placeholder="Empresa LTDA" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cargo</label>
              <input {...register("position")} className="input" placeholder="CEO" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notas</label>
            <textarea {...register("notes")} className="input resize-none" rows={3} placeholder="Observações sobre o lead..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1">
              {mutation.isPending ? "Salvando..." : isEdit ? "Salvar" : "Criar lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
