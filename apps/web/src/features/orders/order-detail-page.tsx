import { ArrowLeft, Download, Edit2, Printer } from "lucide-react";

import { Header } from "@/web/components/layout/header";
import { Main } from "@/web/components/layout/main";
import { Button } from "@/web/components/ui/button";
import { useOrderPrint } from "@/web/hooks/use-order-print";

import type { Order, OrderWithItemsAndCustomer } from "./data/schema";

import { Invoice } from "./components/invoice";
import { OrdersDialogs } from "./components/orders-dialogs";
import { OrdersProvider, useOrders } from "./components/orders-provider";

const PrimaryButtons = ({ order }: { order: Order }) => {
  const { setOpen, setCurrentRow } = useOrders();
  const { printOrder, downloadOrderPdf } = useOrderPrint();

  const handlePrint = () => printOrder(order);

  const handleDownload = () => {
    setCurrentRow(order);
    downloadOrderPdf(order);
  };

  return (
    <div className="hidden gap-2 md:flex">
      <Button variant="outline" onClick={() => window.history.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      <Button
        variant="secondary"
        onClick={() => {
          setCurrentRow(order);
          setOpen("edit");
        }}
      >
        Edit
        <Edit2 className="ml-2 h-4 w-4" />
      </Button>
      <Button
        variant="secondary"
        onClick={handleDownload}
      >
        Download
        <Download className="ml-2 h-4 w-4" />
      </Button>
      <Button onClick={handlePrint}>
        Print
        <Printer className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
};

export const OrderDetailPage = ({ order }: { order: OrderWithItemsAndCustomer }) => {
  return (
    <OrdersProvider>
      <Header fixed hideBreadcrumbs>
        <PrimaryButtons order={order} />
      </Header>

      <Main>
        <Invoice order={order} />
      </Main>

      <OrdersDialogs />
    </OrdersProvider>
  );
};
