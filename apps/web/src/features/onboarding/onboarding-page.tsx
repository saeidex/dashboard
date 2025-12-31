import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/web/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/web/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/web/components/ui/form";
import { Input } from "@/web/components/ui/input";
import apiClient from "@/web/lib/api-client";

const formSchema = z
  .object({
    name: z.string().min(1, "Please enter your full name"),
    email: z.email({
      error: iss =>
        iss.input === "" ? "Please enter your email" : undefined,
    }),
    password: z.string(),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  })

  .refine(
    (data) => {
      if (!data.password)
        return true;
      return data.password.length > 0;
    },
    {
      message: "Password is required.",
      path: ["password"],
    },
  )
  .refine(
    ({ password }) => {
      if (!password)
        return true;
      return password.length >= 8;
    },
    {
      message: "Password must be at least 8 characters long.",
      path: ["password"],
    },
  )
  .refine(
    ({ password }) => {
      if (!password)
        return true;
      return /[a-z]/.test(password);
    },
    {
      message: "Password must contain at least one lowercase letter.",
      path: ["password"],
    },
  )
  .refine(
    ({ password }) => {
      if (!password)
        return true;
      return /[A-Z]/.test(password);
    },
    {
      message: "Password must contain at least one uppercase letter.",
      path: ["password"],
    },
  )
  .refine(
    ({ password }) => {
      if (!password)
        return true;
      return /\d/.test(password);
    },
    {
      message: "Password must contain at least one number.",
      path: ["password"],
    },
  )
  .refine(
    ({ password, confirmPassword }) => {
      if (!password)
        return true;
      return password === confirmPassword;
    },
    {
      message: "Passwords don't match.",
      path: ["confirmPassword"],
    },
  );
type FormValues = z.infer<typeof formSchema>;

export function OnboardingPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await apiClient.api.onboarding["create-admin"].$post({
        json: {
          name: values.name,
          email: values.email,
          password: values.password,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create admin user");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Admin account created successfully!");
      // Redirect to sign-in page after successful onboarding
      setTimeout(() => {
        navigate({ to: "/" });
      }, 1000);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      await createMutation.mutateAsync(values);
    }
    finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Welcome to takumitex</CardTitle>
          <CardDescription>
            Let's set up your admin account to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ebrahim Khalil"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="admin@example.com"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      This will be your admin login email
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Must be at least 8 characters long
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                Create Admin Account
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
