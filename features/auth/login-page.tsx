"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "demo@meetingintel.ai",
      password: "demo123",
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      await login(values.email, values.password);
      router.push("/dashboard");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Login failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">Meeting Intel</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Welcome back</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Email"
            type="email"
            placeholder="demo@meetingintel.ai"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password")}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm text-slate-400">
          <span>Need an account?</span>
          <Link href="/register" className="font-medium text-cyan-400 hover:text-cyan-300">
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
}
