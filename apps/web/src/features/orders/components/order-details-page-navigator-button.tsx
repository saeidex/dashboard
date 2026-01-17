import { useNavigate } from "@tanstack/react-router";

import { LongText } from "@/web/components/long-text";

export const OrderDetailsPageNavigatorButton = (props: {
  id: string;
  customerId: string;
}) => {
  const navigate = useNavigate();

  return (
    <span
      onClick={() =>
        navigate({
          from: "/orders",
          to: "/orders/$customerId/$id",
          params: { customerId: props.customerId, id: props.id },
        })}
      className="cursor-pointer"
    >
      <LongText className="max-w-40 ps-3 font-mono">{props.id}</LongText>
    </span>
  );
};
