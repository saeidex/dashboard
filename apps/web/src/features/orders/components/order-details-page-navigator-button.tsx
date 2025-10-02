import { useNavigate } from "@tanstack/react-router";

import { LongText } from "@/web/components/long-text";

export const OrderDetailsPageNavigatorButton = ({ id }: { id: string }) => {
  const navigate = useNavigate();

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
