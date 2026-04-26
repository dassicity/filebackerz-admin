"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { signIn } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/store/auth-store";
import { cn } from "@/lib/utils";

export function AdminLoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await signIn(data);

      const role = response.user.role;
      if (role !== "admin" && role !== "superadmin") {
        toast.error("This account is not authorized for the admin console.");
        setIsLoading(false);
        return;
      }

      setAuth(response);
      toast.success("Welcome back");
      router.replace("/overview");
    } catch (error) {
      const err = error as {
        response?: { status?: number; data?: { error?: string } };
      };
      const status = err.response?.status;
      const message = err.response?.data?.error;

      if (status === 401) {
        toast.error("Invalid credentials");
      } else if (status === 403) {
        toast.error(message ?? "Not authorized");
      } else if (status === 423) {
        toast.error("Account is temporarily locked. Try again later.");
      } else {
        toast.error(message ?? "Sign-in failed. Please try again.");
      }
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="admin-email">Email</Label>
        <Input
          id="admin-email"
          type="email"
          autoComplete="email"
          placeholder="admin@filebackerz.com"
          disabled={isLoading}
          {...register("email")}
          className={cn(
            errors.email && "border-destructive focus-visible:ring-destructive",
          )}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="admin-password">Password</Label>
        <div className="relative">
          <Input
            id="admin-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            disabled={isLoading}
            {...register("password")}
            className={cn(
              "pr-10",
              errors.password &&
                "border-destructive focus-visible:ring-destructive",
            )}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Superadmin access required. All sign-ins are logged.
      </p>
    </form>
  );
}
