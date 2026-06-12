import type { DetailedHTMLProps, HTMLAttributes } from "react";

type StripePricingTableElement = DetailedHTMLProps<
  HTMLAttributes<HTMLElement>,
  HTMLElement
> & {
  "pricing-table-id": string;
  "publishable-key": string;
  "client-reference-id"?: string;
  "customer-session-client-secret"?: string;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "stripe-pricing-table": StripePricingTableElement;
    }
  }

  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        "stripe-pricing-table": StripePricingTableElement;
      }
    }
  }
}

export {};
