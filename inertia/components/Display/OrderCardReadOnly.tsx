import { convertToCurrencyFormat } from '@/utils/currency_formatter';
import { OrderStatus, TOrderStatus } from '@/utils/order_status';
import { startCase } from '@/utils/string_formatter';
import { Badge, Box } from '@chakra-ui/react';
import { format } from 'date-fns';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

type Status =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'on_delivery'
  | 'delivered'
  | 'completed'
  | 'canceled'
  | 'returned';

type Data = Record<string, any> & {
  id: number;
  orderNumber: string;
  type: 'delivery' | 'dine_in' | 'pickup';
  grandTotal: number;
  status: Status;
};

const orderStatus = new OrderStatus();

export default function OrderCardReadOnly({ data }: { data: Data }) {
  const { t } = useTranslation();
  const [status, setStatus] = React.useState<TOrderStatus>(() =>
    orderStatus.getStatusDetails(data.status || 'pending')
  );

  React.useEffect(() => {
    setStatus(orderStatus.getStatusDetails(data.status));
  }, [data]);

  if (!data) return;

  const { orderNumber, type, grandTotal, orderItems, paymentStatus, createdAt } = data;

  return (
    <Box className="h-56 flex flex-col justify-between bg-white shadow-primary rounded-md p-4 select-none">
      <div className="flex items-start justify-between">
        <div>
          <Badge
            colorScheme={{ dine_in: 'cyan', delivery: 'primary', pickup: 'blue' }?.[type]}
            mb={1}
          >
            {t(startCase(type))}
          </Badge>
          <p className="text-secondary-600 font-bold mb-1">#{orderNumber}</p>
          <p className="text-secondary-400 text-sm">
            {format(new Date(createdAt), 'MMM dd, yyyy | hh:mm a')}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <Badge colorScheme={paymentStatus ? 'green' : 'orange'} mb={1}>
            {paymentStatus ? t('Paid') : t('Unpaid')}
          </Badge>
          <p className="text-secondary-600 font-bold mb-1">{convertToCurrencyFormat(grandTotal)}</p>
          <p className="text-secondary-400 text-sm">
            {orderItems.length} {orderItems.length > 1 ? t('Item(s)') : t('Item')}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Box
          color={status?.fgColor}
          borderColor={status?.fgColor}
          className="flex items-center justify-between border rounded-md py-2 h-10 px-4 font-semibold"
        >
          {t(status?.label)}
        </Box>
      </div>
    </Box>
  );
}
