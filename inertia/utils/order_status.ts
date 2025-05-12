export type TOrderStatus = {
  label: string;
  value: string;
  scheme: string;
  fgColor: string;
  bgColor: string;
  next: string | null;
  prev: string | null;
};


export const OrderTypeMap = {
  dine_in: 'comer no local',
  delivery: 'entrega',
  pickup: 'retirada',
} as const


export const OrderPaymentTypeMap = {
  cash: 'dinheiro',
  card: 'cartao',
  paypal: 'paypal',
  stripe: 'stripe',
  paid: 'pago'
} as const


export type OrderTypeKey = keyof typeof OrderTypeMap

export type OrderOrderPaymentTypeKey = keyof typeof OrderPaymentTypeMap

export function mapOrderTypeStatus(raw: string): string {
  const key = (raw as OrderTypeKey) in OrderTypeMap
    ? (raw as OrderTypeKey)
    : 'delivery'

  return OrderTypeMap[key]
}

export function mapPaymentType(raw: string): string {
  const key = (raw as OrderOrderPaymentTypeKey) in OrderPaymentTypeMap
    ? (raw as OrderOrderPaymentTypeKey)
    : 'cash'

  return OrderPaymentTypeMap[key]
}
export class OrderStatus {
  orderStatus = new Map(
    Object.entries({
      pending: {
        label: 'Pending',
        value: 'pending',
        scheme: 'primary',
        fgColor: 'var(--color-primary-500)',
        bgColor: 'var(--color-primary-100)',
        next: 'confirmed',
        prev: null,
      },
      processing: {
        label: 'Processing',
        value: 'processing',
        scheme: 'blue',
        fgColor: 'var(--color-blue-500)',
        bgColor: 'var(--color-blue-100)',
        next: 'on_delivery',
        prev: 'confirmed',
      },
      ready: {
        label: 'Ready',
        value: 'ready',
        scheme: 'purple',
        fgColor: 'var(--color-purple-500)',
        bgColor: 'var(--color-purple-100)',
        next: 'processing',
        prev: 'pending',
      },
      on_delivery: {
        label: 'On Delivery',
        value: 'on_delivery',
        scheme: 'teal',
        fgColor: 'var(--color-teal-500)',
        bgColor: 'var(--color-teal-100)',
        orderType: 'delivery',
        next: 'completed',
        prev: 'processing',
      },
      completed: {
        label: 'Completed',
        value: 'completed',
        scheme: 'green',
        fgColor: 'var(--color-green-500)',
        bgColor: 'var(--color-green-100)',
        next: null,
        prev: 'on_delivery',
      },
      failed: {
        label: 'Failed',
        value: 'failed',
        scheme: 'red',
        fgColor: 'var(--color-cyan-500)',
        bgColor: 'var(--color-cyan-100)',
        next: null,
        prev: null,
      },
      canceled: {
        label: 'Cancelled',
        value: 'canceled',
        scheme: 'red',
        fgColor: 'var(--color-red-500)',
        bgColor: 'var(--color-red-100)',
        next: null,
        prev: null,
      },
    })
  );

  all() {
    return Array.from(this.orderStatus.values());
  }

  // get status details
  getStatusDetails(status: string): any {
    return this.orderStatus.get(status);
  }

  // Get all previous statuses for the given status
  getAllPreviousStatuses(currentStatus: string) {
    const previousStatuses = [];
    let current = this.orderStatus.get(currentStatus);

    while (current && current.prev) {
      const prevStatus = this.orderStatus.get(current.prev);
      if (prevStatus) {
        previousStatuses.unshift(prevStatus);
      }
      current = prevStatus;
    }

    return previousStatuses;
  }

  // get status timeline
  getStatusTimeline(currentStatus: string) {
    const current = this.orderStatus.get(currentStatus);
    if (!current) return [];

    const previous = this.getAllPreviousStatuses(currentStatus);
    const next = current.next ? [this.orderStatus.get(current.next)] : [];

    const global = [this.orderStatus.get('canceled'), this.orderStatus.get('returned')];

    return [...previous, current, ...next, ...global];
  }
}
