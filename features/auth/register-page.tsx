"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

const registerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "Alex Morgan",
      email: "alex@meetingintel.ai",
      password: "demo123",
    },
  });

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    try {
      await registerUser(values.name, values.email, values.password);
      router.push("/dashboard");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Registration failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">Meeting Intel</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Create account</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input label="Full name" placeholder="Alex Morgan" error={errors.name?.message} {...register("name")} />
          <Input label="Email" type="email" placeholder="alex@example.com" error={errors.email?.message} {...register("email")} />
          <Input label="Password" type="password" placeholder="••••••••" error={errors.password?.message} {...register("password")} />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm text-slate-400">
          <span>Already have an account?</span>
          <Link href="/login" className="font-medium text-cyan-400 hover:text-cyan-300">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
