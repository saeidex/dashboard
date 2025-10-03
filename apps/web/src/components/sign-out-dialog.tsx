import { useLocation, useNavigate } from "@tanstack/react-router";

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
  const { auth } = useAuthStore();

  const handleSignOut = async () => {
    auth.reset();
    // Preserve current location for redirect after sign-in
    const currentPath = location.href;

    await authClient.signOut();

    navigate({
      to: "/sign-in",
      search: { redirect: currentPath },
      replace: true,
    });
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
