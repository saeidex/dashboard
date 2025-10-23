import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/web/components/ui/badge";
import { Card, CardContent } from "@/web/components/ui/card";

import { dimensionsQueryOptions } from "../data/queries";
import { DimensionsActions } from "./dimensions-actions";

export function DimensionsGrid() {
  const { data: dimensions } = useQuery(dimensionsQueryOptions);

  if (!dimensions || dimensions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">No dimensions found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {dimensions.map(dimension => (
        <Card
          key={dimension.id}
          className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg"
        >
          <CardContent className="p-5 py-2">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <Badge variant="secondary" className="text-xs font-medium">
                  {dimension.unit}
                </Badge>
                <div className="opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <DimensionsActions dimension={dimension} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xl font-semibold text-foreground">
                  {dimension.length}
                  {" "}
                  ×
                  {dimension.width}
                  {" "}
                  ×
                  {dimension.height}
                </div>
                {dimension.description && (
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {dimension.description}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
