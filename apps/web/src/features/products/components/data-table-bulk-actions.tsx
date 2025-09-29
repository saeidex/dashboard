import type { Table } from "@tanstack/react-table";

import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { ArrowUpDown, CircleArrowUp, Download, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { DataTableBulkActions as BulkActionsToolbar } from "@/web/components/data-table";
import { Button } from "@/web/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/web/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/web/components/ui/tooltip";
import { sleep } from "@/web/lib/utils";

import type { Product } from "../data/schema.ts";

import { categoriesQueryOptions } from "../../product-categories/data/queries.ts";
import { statuses } from "../data/data";
import { queryKeys, updateProduct } from "../data/queries.ts";
import { ProductsMultiDeleteDialog } from "./products-multi-delete-dialog";

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>;
};

const route = getRouteApi("/_authenticated/products/");

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const queryClient = useQueryClient();
  const search = route.useSearch();
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions);

  const updateMutation = useMutation({
    mutationFn: updateProduct,
  });

  const handleBulkStatusChange = (status: string) => {
    const selectedProducts = selectedRows.map(row => row.original as Product);
    toast.promise(async () => {
      for (const product of selectedProducts) {
        await updateMutation.mutateAsync({ id: product.id, product: { status } });
      }
    }, {
      loading: "Updating status...",
      success: () => {
        table.resetRowSelection();
        queryClient.invalidateQueries(queryKeys.LIST_PRODUCTS(search));
        return `Status updated to "${status}" for ${selectedProducts.length} task${selectedProducts.length > 1 ? "s" : ""}.`;
      },
      error: "Error",
    });
    table.resetRowSelection();
  };

  const handleBulkCategoryChange = (categoryId: string) => {
    const selectedProducts = selectedRows.map(row => row.original as Product);
    toast.promise(async () => {
      for (const product of selectedProducts) {
        await updateMutation.mutateAsync({ id: product.id, product: { categoryId } });
      }
    }, {
      loading: "Updating category...",
      success: () => {
        table.resetRowSelection();
        queryClient.invalidateQueries(queryKeys.LIST_PRODUCTS(search));
        return `Category updated for ${selectedProducts.length} task${selectedProducts.length > 1 ? "s" : ""}.`;
      },
      error: "Error",
    });
    table.resetRowSelection();
  };

  const handleBulkExport = () => {
    const selectedProducts = selectedRows.map(row => row.original as Product);
    toast.promise(sleep(2000), {
      loading: "Exporting tasks...",
      success: () => {
        table.resetRowSelection();
        return `Exported ${selectedProducts.length} task${selectedProducts.length > 1 ? "s" : ""} to CSV.`;
      },
      error: "Error",
    });
    table.resetRowSelection();
  };

  return (
    <>
      <BulkActionsToolbar table={table} entityName="task">
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  aria-label="Update status"
                  title="Update status"
                >
                  <CircleArrowUp />
                  <span className="sr-only">Update status</span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Update status</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent sideOffset={14}>
            {statuses.map(status => (
              <DropdownMenuItem
                key={status.value}
                defaultValue={status.value}
                onClick={() => handleBulkStatusChange(status.value)}
              >
                {status.icon && (
                  <status.icon className="text-muted-foreground size-4" />
                )}
                {status.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  aria-label="Update category"
                  title="Update category"
                >
                  <ArrowUpDown />
                  <span className="sr-only">Update category</span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Update cateogry</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent sideOffset={14}>
            {categories.map(category => (
              <DropdownMenuItem
                key={category.id}
                defaultValue={category.id}
                onClick={() => handleBulkCategoryChange(category.id.toString())}
              >
                {category.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleBulkExport()}
              className="size-8"
              aria-label="Export tasks"
              title="Export tasks"
              disabled
            >
              <Download />
              <span className="sr-only">Export tasks</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Export tasks</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => setShowDeleteConfirm(true)}
              className="size-8"
              aria-label="Delete selected tasks"
              title="Delete selected tasks"
            >
              <Trash2 />
              <span className="sr-only">Delete selected tasks</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete selected tasks</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <ProductsMultiDeleteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        table={table}
      />
    </>
  );
}
