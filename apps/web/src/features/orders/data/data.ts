import type { ProductionStage } from "@/api/db/schema/orders";

export const orderStatusValues = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
] as const;

export const paymentStatusValues = [
  "unpaid",
  "partial",
  "paid",
  "refunded",
] as const;

export const paymentMethodValues = [
  "cash",
  "card",
  "bank-transfer",
  "mobile-wallet",
] as const;

export const OwnerInfo = {
  name: "Takumitex Sourcing Hub",
  address: "House-73F, Road-12B, Sector-10, Uttara",
  city: "Dhaka-1230, Bangladesh",
  email: "surjo@takumitex.com",
  phone: "+8801633317047",
};

export const PRODUCTION_STAGES: {
  id: ProductionStage;
  label: string;
  color: string;
}[] = [
  { id: "orderConfirmDate", label: "Confirmed", color: "bg-slate-500" },
  { id: "accessoriesInhouseDate", label: "Accessories Inhouse", color: "bg-blue-500" },
  { id: "fabricEtd", label: "China Fabric ETD", color: "bg-green-500" },
  { id: "fabricEta", label: "China Fabric ETA", color: "bg-yellow-500" },
  { id: "fabricInhouseDate", label: "Fabric Inhouse", color: "bg-purple-500" },
  { id: "ppSampleDate", label: "PP Sample", color: "bg-pink-500" },
  { id: "fabricTestDate", label: "Fabric Test Inspection", color: "bg-indigo-500" },
  { id: "shippingSampleDate", label: "Shipping Sample", color: "bg-red-500" },
  { id: "sewingStartDate", label: "Sewing Start", color: "bg-orange-500" },
  { id: "sewingCompleteDate", label: "Sewing Complete", color: "bg-teal-500" },
  { id: "inspectionStartDate", label: "Ken2 Inspection Start", color: "bg-cyan-500" },
  { id: "inspectionEndDate", label: "Ken2 Inspection Finished", color: "bg-lime-500" },
  { id: "exFactoryDate", label: "Ex Factory", color: "bg-emerald-500" },
  { id: "portHandoverDate", label: "Port Handover", color: "bg-violet-500" },
];
