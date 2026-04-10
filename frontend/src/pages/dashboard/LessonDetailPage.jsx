import { useEffect, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle, Clock, BookOpen } from "lucide-react";
import { lessonsApi } from "../../services/api";

export default function LessonDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: lesson, isLoading, isError } = useQuery({
    queryKey: ["lesson", slug],
    queryFn: () => lessonsApi.get(slug).then((r) => r.data),
  });

  const progressMutation = useMutation({
    mutationFn: ({ id, data }) => lessonsApi.updateProgress(id, data),
    onSuccess: () => queryClient.invalidateQueries(["lesson-progress"]),
  });

  const handleComplete = () => {
    if (lesson) {
      progressMutation.mutate({
        id: lesson.id,
        data: { progress_seconds: lesson.duration_seconds || 0, completed: true },
      });
    }
  };

  if (isLoading) return (
    <div className="p-6 text-center text-slate-400">Carregando aula...</div>
  );

  if (isError) return (
    <div className="p-6 text-center">
      <p className="text-slate-500 mb-4">Aula não encontrada ou acesso negado.</p>
      <Link to="/dashboard/lessons" className="btn-primary text-sm">Voltar às aulas</Link>
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/dashboard/lessons")} className="btn-ghost p-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Link to="/dashboard/lessons" className="hover:text-primary-600">Aulas</Link>
            <span>/</span>
            {lesson.category && <span>{lesson.category.name}</span>}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{lesson.title}</h1>
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 text-sm text-slate-500">
        {lesson.duration_seconds > 0 && (
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {Math.ceil(lesson.duration_seconds / 60)} min
          </span>
        )}
        {lesson.category && (
          <span className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            {lesson.category.name}
          </span>
        )}
      </div>

      {/* Video */}
      {lesson.video_url && (
        <div className="card overflow-hidden">
          <div className="aspect-video bg-slate-900">
            <iframe
              src={lesson.video_url}
              className="w-full h-full"
              allowFullScreen
              allow="autoplay; encrypted-media"
              title={lesson.title}
            />
          </div>
        </div>
      )}

      {/* Description */}
      {lesson.description && (
        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 mb-2">Sobre esta aula</h2>
          <p className="text-slate-600 text-sm leading-relaxed">{lesson.description}</p>
        </div>
      )}

      {/* Content */}
      {lesson.content && (
        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 mb-3">Conteúdo</h2>
          <div
            className="prose prose-sm max-w-none text-slate-700"
            dangerouslySetInnerHTML={{ __html: lesson.content }}
          />
        </div>
      )}

      {/* Complete button */}
      <div className="flex items-center justify-between">
        <Link to="/dashboard/lessons" className="btn-secondary text-sm">
          <ArrowLeft className="w-4 h-4" /> Voltar às aulas
        </Link>
        <button
          onClick={handleComplete}
          disabled={progressMutation.isPending}
          className="btn-primary text-sm"
        >
          <CheckCircle className="w-4 h-4" />
          {progressMutation.isPending ? "Salvando..." : "Marcar como concluída"}
        </button>
      </div>
    </div>
  );
}
