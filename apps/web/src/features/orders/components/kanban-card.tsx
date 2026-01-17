"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  CalendarDays,
  CreditCard,
  Factory,
  Layers,
  ShoppingBag,
  User,
} from "lucide-react";

import { Badge } from "@/web/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/web/components/ui/card";
import { Separator } from "@/web/components/ui/separator";
import { cn } from "@/web/lib/utils";

import type { Order } from "../data/schema";

type KanbanCardProps = {
  order: Order;
  isDragging?: boolean;
};

export function KanbanCard({ order, isDragging = false }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: order.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalItems = order.items.length;

  // Determine next milestone date
  const getNextMilestone = () => {
    const now = new Date();
    const milestones = [
      { date: order.sewingStartDate, label: "Sewing Start" },
      { date: order.sewingCompleteDate, label: "Sewing Complete" },
      { date: order.exFactoryDate, label: "Ex-Factory" },
      { date: order.portHandoverDate, label: "Port Handover" },
    ];

    for (const milestone of milestones) {
      if (milestone.date) {
        const mDate = new Date(milestone.date);
        if (mDate > now) {
          return { date: mDate, label: milestone.label };
        }
      }
    }
    return null;
  };

  const nextMilestone = getNextMilestone();

  // Payment status badge variant
  const paymentVariant = {
    paid: "default",
    partial: "secondary",
    unpaid: "destructive",
    refunded: "outline",
  }[order.paymentStatus] as "default" | "secondary" | "destructive" | "outline";

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group relative gap-2 cursor-grab overflow-hidden border-muted-foreground/10 bg-card transition-all hover:border-primary/20 hover:shadow-md",
        (isDragging || isSortableDragging) && "rotate-2 scale-105 border-primary shadow-xl ring-1 ring-primary",
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2.5">
        <div className="flex flex-col gap-1">
          <Link
            to="/orders/$customerId/$id"
            params={{ customerId: order.customerId, id: String(order.id) }}
            className="font-bold text-sm tracking-tight hover:text-primary hover:underline underline-offset-2"
          >
            ORD-
            {order.id}
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <User className="h-3 w-3" />
            <span className="truncate max-w-[140px]">
              {order.customer.name}
            </span>
          </div>
        </div>
        <Badge
          variant={paymentVariant}
          className="capitalize px-1.5 py-0 text-[10px] font-semibold h-5"
        >
          {order.paymentStatus}
        </Badge>
      </CardHeader>

      <Separator className="bg-muted/50" />

      <CardContent className="grid gap-2.5">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex gap-2.5 rounded-md bg-muted/40 p-1.5">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <ShoppingBag className="h-3 w-3" />
              Qty
            </span>
            <span className="font-semibold text-foreground">
              {totalQty.toLocaleString()}
            </span>
          </div>
          <div className="flex gap-2.5 rounded-md bg-muted/40 p-1.5">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Layers className="h-3 w-3" />
              Styles
            </span>
            <span className="font-semibold text-foreground">{totalItems}</span>
          </div>
        </div>

        {/* Factory & Milestone Info */}
        <div className="space-y-1.5 pt-0.5">
          {order.factory && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Factory className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate font-medium">{order.factory.name}</span>
            </div>
          )}

          {nextMilestone
            ? (
                <div className="flex items-center gap-2 text-xs">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                  <span className="text-muted-foreground truncate">
                    {nextMilestone.label}
                    :
                  </span>
                  <span className="font-medium ml-auto">
                    {format(nextMilestone.date, "MMM d")}
                  </span>
                </div>
              )
            : (
                <div className="flex items-center gap-2 text-xs opacity-50">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                  <span>No upcoming milestones</span>
                </div>
              )}
        </div>

        {/* Footer: Total */}
        <div className="mt-1 flex items-center justify-between border-t border-dashed pt-2.5">
          <div className="flex items-center gap-1.5">
            <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">
              Total
            </span>
          </div>
          <span className="font-bold text-sm tabular-nums tracking-tight">
            ৳
            {" "}
            {order.grandTotal.toLocaleString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
