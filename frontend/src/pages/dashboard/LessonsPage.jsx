import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { BookOpen, Play, Lock, CheckCircle, Clock, ChevronRight } from "lucide-react";
import { lessonsApi } from "../../services/api";
import useAuthStore from "../../store/authStore";

const planOrder = { free: 0, starter: 1, pro: 2, enterprise: 3 };

function formatDuration(secs) {
  if (!secs) return "—";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}min${s > 0 ? ` ${s}s` : ""}` : `${s}s`;
}

export default function LessonsPage() {
  const { user } = useAuthStore();
  const [activeCategory, setActiveCategory] = useState(null);

  const { data: categories } = useQuery({
    queryKey: ["lesson-categories"],
    queryFn: () => lessonsApi.categories().then((r) => r.data),
  });

  const { data: lessons } = useQuery({
    queryKey: ["lessons", activeCategory],
    queryFn: () => lessonsApi.list({ category_id: activeCategory }).then((r) => r.data),
  });

  const { data: progress } = useQuery({
    queryKey: ["lesson-progress"],
    queryFn: () => lessonsApi.myProgress().then((r) => r.data),
  });

  const progressMap = progress?.reduce((acc, p) => {
    acc[p.lesson_id] = p;
    return acc;
  }, {}) ?? {};

  const userLevel = planOrder[user?.plan?.toLowerCase()] ?? 0;

  const canAccess = (lesson) =>
    lesson.is_free || userLevel >= (planOrder[lesson.required_plan] ?? 1);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Biblioteca de Aulas</h1>
        <p className="text-slate-500 text-sm">
          Aprenda as melhores estratégias de follow-up e vendas.
        </p>
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveCategory(null)}
          className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !activeCategory
              ? "bg-primary-600 text-white"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          Todas
        </button>
        {categories?.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat.id
                ? "bg-primary-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Stats bar */}
      <div className="card p-4 flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <BookOpen className="w-4 h-4 text-primary-500" />
          <span>{lessons?.length ?? 0} aulas</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span>{Object.values(progressMap).filter((p) => p.completed).length} concluídas</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Clock className="w-4 h-4 text-blue-500" />
          <span>
            {formatDuration(lessons?.reduce((a, l) => a + (l.duration_seconds || 0), 0))} de conteúdo
          </span>
        </div>
      </div>

      {/* Lessons grid */}
      {!lessons?.length ? (
        <div className="card p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500">Nenhuma aula disponível nesta categoria</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lessons.map((lesson) => {
            const accessible = canAccess(lesson);
            const prog = progressMap[lesson.id];
            return (
              <div key={lesson.id} className={`card overflow-hidden flex flex-col ${!accessible ? "opacity-75" : ""}`}>
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gradient-to-br from-primary-600 to-indigo-700 flex items-center justify-center">
                  {lesson.thumbnail_url ? (
                    <img src={lesson.thumbnail_url} alt={lesson.title} className="w-full h-full object-cover" />
                  ) : (
                    <BookOpen className="w-12 h-12 text-white/40" />
                  )}
                  {prog?.completed && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="w-6 h-6 text-green-400 bg-white rounded-full" />
                    </div>
                  )}
                  {!accessible && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Lock className="w-8 h-8 text-white" />
                    </div>
                  )}
                  {prog && !prog.completed && prog.progress_seconds > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                      <div
                        className="h-full bg-primary-400"
                        style={{ width: `${Math.min(100, (prog.progress_seconds / (lesson.duration_seconds || 1)) * 100)}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      {lesson.is_free && (
                        <span className="badge bg-green-50 text-green-700 text-xs mb-1">Grátis</span>
                      )}
                      {!lesson.is_free && !accessible && (
                        <span className="badge bg-amber-50 text-amber-700 text-xs mb-1">
                          Plano {lesson.required_plan}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 shrink-0">
                      {formatDuration(lesson.duration_seconds)}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm mb-1 line-clamp-2">{lesson.title}</h3>
                  {lesson.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 flex-1 mb-3">{lesson.description}</p>
                  )}
                  {lesson.category && (
                    <p className="text-xs text-slate-400 mb-3">{lesson.category.name}</p>
                  )}
                  {accessible ? (
                    <Link
                      to={`/dashboard/lessons/${lesson.slug}`}
                      className="btn-primary w-full text-sm justify-center mt-auto"
                    >
                      <Play className="w-4 h-4" />
                      {prog?.completed ? "Rever aula" : prog?.progress_seconds > 0 ? "Continuar" : "Assistir"}
                    </Link>
                  ) : (
                    <Link to="/pricing" className="btn-secondary w-full text-sm justify-center mt-auto">
                      <Lock className="w-4 h-4" /> Fazer upgrade
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
