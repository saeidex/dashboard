import React, { useCallback, useRef } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { useReactToPrint } from 'react-to-print'
import { Invoice } from '../components/invoice'
import type { Order } from '../data/schema'

let portalEl: HTMLElement | null = null
let portalRoot: Root | null = null

function ensurePortal() {
  if (!portalEl) {
    portalEl = document.createElement('div')
    portalEl.id = 'invoice-print-portal'
    portalEl.style.position = 'fixed'
    portalEl.style.inset = '0'
    portalEl.style.width = '0'
    portalEl.style.height = '0'
    portalEl.style.overflow = 'hidden'
    portalEl.style.zIndex = '-1'
    portalEl.setAttribute('aria-hidden', 'true')
    document.body.appendChild(portalEl)
  }
  if (!portalRoot && portalEl) {
    portalRoot = createRoot(portalEl)
  }
}

export interface UseOrderPrintOptions {
  externalRef?: React.RefObject<HTMLDivElement | null>
}

export interface UseOrderPrintReturn {
  printRef: React.RefObject<HTMLDivElement | null>
  printOrder: (order: Order) => void
}

export function useOrderPrint({
  externalRef,
}: UseOrderPrintOptions = {}): UseOrderPrintReturn {
  const internalRef = useRef<HTMLDivElement | null>(null)
  const targetRef = externalRef ?? internalRef

  const reactToPrint = useReactToPrint({
    contentRef: targetRef,
    pageStyle:
      '@page { size: A4; margin: 16mm; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }',
  })

  const printOrder = useCallback(
    (order: Order) => {
      if (externalRef) {
        void reactToPrint()
        return
      }
      ensurePortal()
      if (!portalRoot) return
      const Wrapper: React.FC = () =>
        React.createElement(Invoice, { order, printRef: targetRef })
      if (portalRoot) portalRoot.render(React.createElement(Wrapper))
      requestAnimationFrame(() => void reactToPrint())
    },
    [externalRef, reactToPrint, targetRef]
  )

  return { printRef: targetRef, printOrder }
}
