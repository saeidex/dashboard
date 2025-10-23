import { useLocation, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { ConfirmDialog } from "@/web/components/confirm-dialog";
import { useAuthStore } from "@/web/stores/auth-store";

import { authClient } from "../features/auth/lib/auth-client";

type SignOutDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const resetAuth = useAuthStore(state => state.reset);

  const handleSignOut = async () => {
    try {
      const { error } = await authClient.signOut({
        fetchOptions: {
          redirect: "manual",
        },
      });

      // Treat missing or expired sessions as already signed out.
      if (error && ![400, 401].includes(error.status)) {
        throw new Error(error.message || "Failed to sign out");
      }

      resetAuth();
      onOpenChange(false);

      const currentPath = location.href;
      navigate({
        to: "/sign-in",
        search: { redirect: currentPath },
        replace: true,
      });
    }
    catch (error) {
      toast.error((error as Error).message || "Sign out failed");
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Sign out"
      desc="Are you sure you want to sign out? You will need to sign in again to access your account."
      confirmText="Sign out"
      handleConfirm={handleSignOut}
      className="sm:max-w-sm"
    />
  );
}
