import type { Row } from "@tanstack/react-table";

import { useNavigate } from "@tanstack/react-router";

import { LongText } from "@/web/components/long-text";

import type { Order } from "../data/schema";

type OrderDetailsPageNavigatorButtonProps = {
  row: Row<Order>;
};

export const OrderDetailsPageNavigatorButton = ({ row }: OrderDetailsPageNavigatorButtonProps) => {
  const navigate = useNavigate();
  const id = row.original.id;

  return (
    <span
      onClick={() =>
        navigate({
          to: "/orders/$id",
          params: { id },
        })}
      className="cursor-pointer"
    >
      <LongText className="max-w-40 ps-3 font-mono">
        {id}
      </LongText>
    </span>
  );
};
