import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Zap, Eye, EyeOff } from "lucide-react";
import { authApi } from "../services/api";
import useAuthStore from "../store/authStore";

const schema = z.object({
  full_name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

export default function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const registerMutation = useMutation({
    mutationFn: ({ full_name, email, password }) => authApi.register({ full_name, email, password }),
    onSuccess: (res) => {
      const { access_token, refresh_token, user } = res.data;
      setAuth(user, access_token, refresh_token);
      navigate("/dashboard");
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-white mb-6">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <span className="font-bold text-2xl">FollowUp SaaS</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Criar conta grátis</h1>
          <p className="text-slate-400 mt-2">
            Já tem conta?{" "}
            <Link to="/login" className="text-primary-400 hover:underline">
              Entrar
            </Link>
          </p>
        </div>

        <div className="card p-8">
          {registerMutation.isError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm mb-6">
              {registerMutation.error?.response?.data?.detail || "Erro ao criar conta"}
            </div>
          )}
          <form onSubmit={handleSubmit((d) => registerMutation.mutate(d))} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome completo</label>
              <input {...register("full_name")} placeholder="João Silva" className="input" />
              {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
              <input {...register("email")} type="email" placeholder="seu@email.com" className="input" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  className="input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar senha</label>
              <input
                {...register("confirmPassword")}
                type="password"
                placeholder="••••••••"
                className="input"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="btn-primary w-full py-2.5 mt-2"
            >
              {registerMutation.isPending ? "Criando conta..." : "Criar conta grátis"}
            </button>
          </form>
          <p className="text-xs text-slate-400 text-center mt-4">
            Ao criar uma conta você concorda com nossos{" "}
            <a href="#" className="underline">Termos de Uso</a> e{" "}
            <a href="#" className="underline">Política de Privacidade</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
