import type { Root } from "react-dom/client";

import html2canvas from "html2canvas-pro";
import JsPDF from "jspdf";
import React, { useCallback, useRef } from "react";
import { createRoot } from "react-dom/client";
import { useReactToPrint } from "react-to-print";

import type { Order } from "@/web/features/orders/data/schema";

import { Invoice } from "@/web/features/orders/components/invoice";

let portalEl: HTMLElement | null = null;
let portalRoot: Root | null = null;

function ensurePortal() {
  if (!portalEl) {
    portalEl = document.createElement("div");
    portalEl.id = "invoice-print-portal";
    portalEl.style.position = "fixed";
    portalEl.style.top = "0";
    portalEl.style.left = "-9999px"; // keep off-screen but allow layout
    portalEl.style.width = "1000px"; // approximate invoice width for layout
    portalEl.style.pointerEvents = "none";
    portalEl.style.opacity = "0";
    portalEl.setAttribute("aria-hidden", "true");
    document.body.appendChild(portalEl);
  }
  if (!portalRoot && portalEl) {
    portalRoot = createRoot(portalEl);
  }
}

function clearPortal(options: { removeNode?: boolean } = {}) {
  if (portalRoot) {
    try {
      portalRoot.render(null);
      if (options.removeNode && portalEl) {
        portalRoot.unmount();
        portalRoot = null;
        if (portalEl.parentNode)
          portalEl.parentNode.removeChild(portalEl);
        portalEl = null;
      }
    }
    catch {
      // noop safeguard
    }
  }
}

export type UseOrderPrintOptions = {
  externalRef?: React.RefObject<HTMLDivElement | null>;
};

export type UseOrderPrintReturn = {
  printRef: React.RefObject<HTMLDivElement | null>;
  printOrder: (order: Order) => void;
  downloadOrderPdf: (order: Order) => void;
};

export function useOrderPrint({
  externalRef,
}: UseOrderPrintOptions = {}): UseOrderPrintReturn {
  const internalRef = useRef<HTMLDivElement | null>(null);
  const targetRef = externalRef ?? internalRef;

  const addMonochromeClass = useCallback(() => {
    targetRef.current?.classList.add("invoice-monochrome");
  }, [targetRef]);

  const removeMonochromeClass = useCallback(() => {
    targetRef.current?.classList.remove("invoice-monochrome");
  }, [targetRef]);

  const reactToPrint = useReactToPrint({
    contentRef: targetRef,
    pageStyle:
      "@page { size: A4; margin: 16mm; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }",
    onBeforePrint: async () => {
      addMonochromeClass();
    },
    onAfterPrint: () => {
      removeMonochromeClass();
      if (!externalRef)
        clearPortal();
    },
  });

  const printOrder = useCallback(
    (order: Order) => {
      if (externalRef) {
        void reactToPrint();
        return;
      }
      ensurePortal();
      if (!portalRoot)
        return;
      const Wrapper: React.FC = () =>
        React.createElement(Invoice, { order, printRef: targetRef, monochrome: true });
      if (portalRoot)
        portalRoot.render(React.createElement(Wrapper));
      requestAnimationFrame(() => void reactToPrint());
    },
    [externalRef, reactToPrint, targetRef],
  );

  const downloadOrderPdf = useCallback(
    async (order: Order) => {
      if (!externalRef) {
        ensurePortal();
        if (!portalRoot)
          return;
        const Wrapper: React.FC = () =>
          React.createElement(Invoice, { order, printRef: targetRef, monochrome: true });
        portalRoot.render(React.createElement(Wrapper));
        await new Promise(r =>
          requestAnimationFrame(() => requestAnimationFrame(r)),
        );
      }

      const el = targetRef.current;
      if (!el)
        return;

      void el.offsetHeight;

      addMonochromeClass();

      try {
        const canvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
        });
        const imgData = canvas.toDataURL("image/png");

        const pdf = new JsPDF({ orientation: "p", unit: "pt", format: "a4" });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pageWidth - 32; // small horizontal margin
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        const verticalMargin = 16;
        if (imgHeight <= pageHeight - verticalMargin * 2) {
          pdf.addImage(
            imgData,
            "PNG",
            verticalMargin,
            verticalMargin,
            imgWidth,
            imgHeight,
            undefined,
            "FAST",
          );
        }
        else {
          let renderedHeight = 0;
          const sliceHeight = pageHeight - verticalMargin * 2;
          const ratio = imgWidth / canvas.width;
          // We'll draw portions of the original canvas onto a temp canvas
          while (renderedHeight < imgHeight - 1) {
            const pageCanvas = document.createElement("canvas");
            pageCanvas.width = canvas.width;
            const remaining = imgHeight - renderedHeight;
            const targetDrawHeight = Math.min(sliceHeight, remaining);
            const pageChunkHeight = Math.min(
              targetDrawHeight / ratio,
              canvas.height
              - Math.floor((renderedHeight / imgHeight) * canvas.height),
            );
            pageCanvas.height = Math.ceil(pageChunkHeight);
            const ctx = pageCanvas.getContext("2d");
            if (ctx) {
              const sourceY = Math.floor(
                (renderedHeight / imgHeight) * canvas.height,
              );
              ctx.drawImage(
                canvas,
                0,
                sourceY,
                canvas.width,
                pageChunkHeight,
                0,
                0,
                canvas.width,
                pageChunkHeight,
              );
              const pageImg = pageCanvas.toDataURL("image/png");
              pdf.addImage(
                pageImg,
                "PNG",
                verticalMargin,
                verticalMargin,
                imgWidth,
                pageChunkHeight * ratio,
                undefined,
                "FAST",
              );
              renderedHeight += sliceHeight;
              if (renderedHeight < imgHeight - 1)
                pdf.addPage();
            }
            else {
              break;
            }
          }
        }

        pdf.save(`invoice-${order.id}.pdf`);
      }
      finally {
        removeMonochromeClass();
        if (!externalRef) {
          setTimeout(() => clearPortal(), 0);
        }
      }
    },
    [externalRef, targetRef, addMonochromeClass, removeMonochromeClass],
  );

  return { printRef: targetRef, printOrder, downloadOrderPdf };
}
