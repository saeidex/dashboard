import { createFileRoute } from "@tanstack/react-router";

import { Header } from "@/web/components/layout/header";
import { ForbiddenError } from "@/web/features/errors/forbidden";
import { GeneralError } from "@/web/features/errors/general-error";
import { MaintenanceError } from "@/web/features/errors/maintenance-error";
import { NotFoundError } from "@/web/features/errors/not-found-error";
import { UnauthorisedError } from "@/web/features/errors/unauthorized-error";

export const Route = createFileRoute("/_authenticated/errors/$error")({
  component: RouteComponent,
});

function RouteComponent() {
  const { error } = Route.useParams();

  const errorMap: Record<string, React.ComponentType> = {
    "unauthorized": UnauthorisedError,
    "forbidden": ForbiddenError,
    "not-found": NotFoundError,
    "internal-server-error": GeneralError,
    "maintenance-error": MaintenanceError,
  };
  const ErrorComponent = errorMap[error] || NotFoundError;

  return (
    <>
      <Header fixed className="border-b" />
      <div className="flex-1 [&>div]:h-full">
        <ErrorComponent />
      </div>
    </>
  );
}
