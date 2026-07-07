import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useLogin } from "@/hooks/useLogin";
import { useAuth } from "@/provider/AuthProvider";
import { saveAuth } from "@/lib/auth";
import axios from "axios";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginComponent = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { mutate: login, isPending } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (values: LoginFormValues) => {
    setServerError(null);
    login(
      { body: values },
      {
        onSuccess: (data) => {
          const token = data?.data?.accessToken;
          if (token) {
            const user = saveAuth(token);
            setUser(user);
          }
          navigate("/");
        },
        onError: (err) => {
          if (axios.isAxiosError(err)) {
            setServerError(
              err.response?.data?.message ?? "Invalid email or password.",
            );
          } else {
            setServerError("Something went wrong. Please try again.");
          }
        },
      },
    );
  };

  const handleAdmin = (values: LoginFormValues) => {
    setServerError(null);
    login(
      { body: values },
      {
        onSuccess: (data) => {
          const token = data?.data?.accessToken;
          console.log(data);
          if (token) {
            const user = saveAuth(token);
            setUser(user);
          }
          navigate("/");
        },
        onError: (err) => {
          if (axios.isAxiosError(err)) {
            console.log(err);
            setServerError(
              err.response?.data?.message ?? "Invalid email or password.",
            );
          } else {
            setServerError("Something went wrong. Please try again.");
          }
        },
      },
    );
  };
  return (
    <div className="w-full max-w-md">
      {/* Card */}
      <div className="bg-[#0f0f13] border border-white/10 rounded-2xl p-8 shadow-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
            E
          </div>
          <h1 className="text-2xl font-semibold text-white">Welcome back</h1>
          <p className="text-sm text-slate-400 mt-1">
            Sign in to your ERP account
          </p>
        </div>

        {/* Server error */}
        {serverError && (
          <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {serverError}
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            onClick={() =>
              handleAdmin({
                email: "admin@erp.com",
                password: "Admin@123",
              })
            }
            className="text-xs font-medium py-2 rounded-full flex items-center justify-center text-[#C3C0D8] border border-[#2C293D] gap-2 cursor-pointer hover:bg-white/5 transition-colors"
          >
            Admin
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            onClick={() =>
              handleAdmin({
                email: "manager@gmail.com",
                password: "Manager@123",
              })
            }
            className="text-xs font-medium py-2 rounded-full flex items-center justify-center text-[#C3C0D8] border border-[#2C293D] gap-2 cursor-pointer hover:bg-white/5 transition-colors"
          >
            Manager
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            onClick={() =>
              handleAdmin({
                email: "employee@gmail.com",
                password: "Employee@123",
              })
            }
            className="text-xs font-medium py-2 rounded-full flex items-center justify-center text-[#C3C0D8] border border-[#2C293D] gap-2 cursor-pointer hover:bg-white/5 transition-colors"
          >
            Employee
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Email</label>
            <input
              {...register("email")}
              type="email"
              placeholder="admin@erp.com"
              autoComplete="email"
              className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
            />
            {errors.email && (
              <p className="text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">
              Password
            </label>
            <div className="relative">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full px-3.5 py-2.5 pr-10 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-400">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors mt-2"
          >
            {isPending && <Loader2 size={16} className="animate-spin" />}
            {isPending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>

      <p className="text-center text-xs text-slate-600 mt-6">
        ERP System &copy; {new Date().getFullYear()}
      </p>
    </div>
  );
};

export default LoginComponent;
