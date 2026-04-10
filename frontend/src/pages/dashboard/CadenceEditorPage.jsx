import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors
} from "@dnd-kit/core";
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable, arrayMove
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus, Save, ArrowLeft, GripVertical, Trash2, Mail, Phone, Linkedin, MessageCircle, CheckSquare, ChevronDown, ChevronUp
} from "lucide-react";
import { cadencesApi } from "../../services/api";

const STEP_TYPES = [
  { value: "email", label: "E-mail", icon: Mail, color: "text-blue-600 bg-blue-50" },
  { value: "call", label: "Ligação", icon: Phone, color: "text-green-600 bg-green-50" },
  { value: "linkedin", label: "LinkedIn", icon: Linkedin, color: "text-indigo-600 bg-indigo-50" },
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle, color: "text-emerald-600 bg-emerald-50" },
  { value: "task", label: "Tarefa", icon: CheckSquare, color: "text-yellow-600 bg-yellow-50" },
];

function SortableStep({ step, index, onChange, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: step._id });
  const [expanded, setExpanded] = useState(true);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const typeInfo = STEP_TYPES.find((t) => t.value === step.step_type) || STEP_TYPES[0];

  return (
    <div ref={setNodeRef} style={style} className="card border border-slate-200">
      {/* Step header */}
      <div className="flex items-center gap-3 p-3 cursor-pointer select-none" onClick={() => setExpanded(!expanded)}>
        <button
          {...attributes}
          {...listeners}
          className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-5 h-5" />
        </button>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${typeInfo.color}`}>
          <typeInfo.icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-800 text-sm">Etapa {index + 1}</span>
            <span className="text-xs text-slate-500">• {typeInfo.label}</span>
            {step.delay_days > 0 && (
              <span className="text-xs text-slate-400">• Dia {step.delay_days}</span>
            )}
          </div>
          {step.subject && (
            <p className="text-xs text-slate-500 truncate">{step.subject}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="btn-ghost p-1 hover:text-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>

      {/* Step body */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Tipo</label>
              <select
                value={step.step_type}
                onChange={(e) => onChange({ ...step, step_type: e.target.value })}
                className="input text-sm"
              >
                {STEP_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Enviar no dia</label>
              <input
                type="number"
                min={0}
                value={step.delay_days}
                onChange={(e) => onChange({ ...step, delay_days: parseInt(e.target.value) || 0 })}
                className="input text-sm"
                placeholder="0"
              />
            </div>
          </div>

          {(step.step_type === "email") && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Assunto do e-mail</label>
                <input
                  value={step.subject || ""}
                  onChange={(e) => onChange({ ...step, subject: e.target.value })}
                  className="input text-sm"
                  placeholder="Ex: Ei {{first_name}}, tenho algo para você!"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Corpo do e-mail</label>
                <textarea
                  value={step.body || ""}
                  onChange={(e) => onChange({ ...step, body: e.target.value })}
                  className="input text-sm resize-none"
                  rows={5}
                  placeholder="Olá {{first_name}},&#10;&#10;Espero que esteja bem..."
                />
                <p className="text-xs text-slate-400 mt-1">
                  Use {"{{first_name}}"}, {"{{last_name}}"}, {"{{company}}"} para personalizar.
                </p>
              </div>
            </>
          )}

          {step.step_type !== "email" && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Descrição / Roteiro</label>
              <textarea
                value={step.body || ""}
                onChange={(e) => onChange({ ...step, body: e.target.value })}
                className="input text-sm resize-none"
                rows={3}
                placeholder="Descreva o que fazer nesta etapa..."
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

let _id = 1;
const newStep = () => ({
  _id: String(_id++),
  step_type: "email",
  delay_days: 0,
  subject: "",
  body: "",
  order: 0,
});

export default function CadenceEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState([]);

  const { data: cadence } = useQuery({
    queryKey: ["cadence", id],
    queryFn: () => cadencesApi.get(id).then((r) => r.data),
    enabled: isEdit,
  });

  useEffect(() => {
    if (cadence) {
      setName(cadence.name);
      setDescription(cadence.description || "");
      setSteps(cadence.steps.map((s) => ({ ...s, _id: String(_id++) })));
    }
  }, [cadence]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const saveMutation = useMutation({
    mutationFn: (data) =>
      isEdit ? cadencesApi.update(id, data) : cadencesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["cadences"]);
      navigate("/dashboard/cadences");
    },
  });

  const handleDragEnd = ({ active, over }) => {
    if (active.id !== over?.id) {
      setSteps((items) => {
        const oldIndex = items.findIndex((i) => i._id === active.id);
        const newIndex = items.findIndex((i) => i._id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSave = () => {
    const stepsPayload = steps.map((s, i) => ({
      order: i,
      step_type: s.step_type,
      delay_days: s.delay_days,
      subject: s.subject || null,
      body: s.body || null,
      template_data: null,
    }));
    saveMutation.mutate({ name, description, steps: stepsPayload });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/dashboard/cadences")} className="btn-ghost p-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">
            {isEdit ? "Editar Cadência" : "Nova Cadência"}
          </h1>
          <p className="text-slate-500 text-sm">Editor visual de sequência de follow-up</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saveMutation.isPending || !name.trim()}
          className="btn-primary"
        >
          <Save className="w-4 h-4" />
          {saveMutation.isPending ? "Salvando..." : "Salvar"}
        </button>
      </div>

      {saveMutation.isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
          {saveMutation.error?.response?.data?.detail || "Erro ao salvar cadência"}
        </div>
      )}

      {/* Info */}
      <div className="card p-5 space-y-4">
        <h2 className="font-medium text-slate-900">Informações</h2>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nome da cadência *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            placeholder="Ex: Prospecção Outbound B2B"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input resize-none"
            rows={2}
            placeholder="Descreva o objetivo desta cadência..."
          />
        </div>
      </div>

      {/* Steps */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900">
            Etapas <span className="text-slate-400 font-normal">({steps.length})</span>
          </h2>
          <button
            onClick={() => setSteps([...steps, newStep()])}
            className="btn-secondary text-sm"
          >
            <Plus className="w-4 h-4" /> Adicionar etapa
          </button>
        </div>

        {steps.length === 0 ? (
          <div className="card border-2 border-dashed border-slate-200 p-10 text-center">
            <p className="text-slate-500 text-sm mb-4">
              Nenhuma etapa adicionada. Comece adicionando a primeira etapa da cadência.
            </p>
            <button
              onClick={() => setSteps([newStep()])}
              className="btn-primary text-sm"
            >
              <Plus className="w-4 h-4" /> Adicionar primeira etapa
            </button>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={steps.map((s) => s._id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {steps.map((step, i) => (
                  <SortableStep
                    key={step._id}
                    step={step}
                    index={i}
                    onChange={(updated) =>
                      setSteps(steps.map((s) => (s._id === updated._id ? updated : s)))
                    }
                    onDelete={() => setSteps(steps.filter((s) => s._id !== step._id))}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Visual timeline preview */}
      {steps.length > 0 && (
        <div className="card p-5">
          <h3 className="font-medium text-slate-900 mb-4">Linha do tempo</h3>
          <div className="flex items-center gap-0 overflow-x-auto pb-2">
            {steps.map((step, i) => {
              const typeInfo = STEP_TYPES.find((t) => t.value === step.step_type) || STEP_TYPES[0];
              return (
                <div key={step._id} className="flex items-center shrink-0">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${typeInfo.color}`}>
                      <typeInfo.icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs text-slate-500 mt-1">Dia {step.delay_days}</span>
                    <span className="text-xs text-slate-400">{typeInfo.label}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-12 h-0.5 bg-slate-200 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
