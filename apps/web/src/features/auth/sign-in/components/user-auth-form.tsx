import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2, LogIn } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { PasswordInput } from "@/web/components/password-input";
import { Button } from "@/web/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/web/components/ui/form";
import { Input } from "@/web/components/ui/input";
import { authClient } from "@/web/features/auth/lib/auth-client";
import { cn } from "@/web/lib/utils";
import { useAuthStore } from "@/web/stores/auth-store";

const formSchema = z.object({
  email: z.email({
    error: iss => (iss.input === "" ? "Please enter your email" : undefined),
  }),
  password: z
    .string()
    .min(1, "Please enter your password")
    .min(7, "Password must be at least 7 characters long"),
});

type UserAuthFormProps = {
  redirectTo?: string;
} & React.HTMLAttributes<HTMLFormElement>;

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const navigate = useNavigate();
  const auth = useAuthStore(state => state.auth);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    toast.promise(
      async () => {
        try {
          await authClient.signIn.email(values, {
            // throw: true,
            onError: (error) => {
              setIsLoading(false);
              // Flow 1: For 401 (unauthorized credentials), show error inline without redirect
              if (error.response.status === 401) {
                form.setError("email", { message: error.error.message });
                form.setFocus("email");
                throw error;
              }
              // Flow 1: For 403 (forbidden), show error inline without redirect
              if (error.response.status === 403) {
                throw navigate({ to: "/403", search: { from: "/sign-in" } });
              }
            },
            onSuccess: () => setIsLoading(false),
          });

          const { data: session } = await authClient.getSession();

          const isValidAdmin
            = session
              && session.user.role?.includes("admin")
              && !session.user.banned;

          if (!isValidAdmin) {
            throw navigate({ to: "/403", search: { from: "/sign-in" } });
          }

          auth.setUser(session.user);
          auth.setSession(session.session);

          return { name: session.user.name };
        }
        catch (error) {
          setIsLoading(false);
          throw error;
        }
      },
      {
        loading: "Signing in...",
        success: ({ name }) => {
          setIsLoading(false);

          // Redirect to the stored location or default to dashboard
          // The _authenticated route will handle admin permission checking
          const targetPath = redirectTo || "/";
          navigate({ to: targetPath, replace: true });

          return `Welcome back, ${name}!`;
        },
        error: "Failed to sign in. Please check your credentials.",
      },
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("grid gap-3", className)}
        {...props}
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="name@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="relative">
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
              <Link
                to="/forgot-password"
                className="text-muted-foreground absolute end-0 -top-0.5 text-sm font-medium hover:opacity-75"
              >
                Forgot password?
              </Link>
            </FormItem>
          )}
        />
        <Button className="mt-2" disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin" /> : <LogIn />}
          Sign in
        </Button>
      </form>
    </Form>
  );
}
