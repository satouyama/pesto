import { convertToCurrencyFormat } from '@/utils/currency_formatter';
import { OrderStatus, TOrderStatus } from '@/utils/order_status';
import { startCase } from '@/utils/string_formatter';
import { Badge, Box, Button, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react';
import axios from 'axios';
import { ArrowDown2 } from 'iconsax-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import UpdateDeliveryPerson from './UpdateDeliveryPerson';
import { format } from 'date-fns';

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

export default function OrderCard({
  onClick,
  data,
  refresh,
}: {
  onClick: (id: number) => void;
  data: Data;
  refresh: () => void;
}) {
  const { t } = useTranslation();
  const [status, setStatus] = React.useState<TOrderStatus>(() =>
    orderStatus.getStatusDetails(data.status || 'pending')
  );

  React.useEffect(() => {
    setStatus(orderStatus.getStatusDetails(data.status));
  }, [data]);

  if (!data) return;

  const { id, orderNumber, type, grandTotal, orderItems, paymentStatus, createdAt } = data;

  // Update status
  const handleStatusChange = async (status: TOrderStatus) => {
    if (
      !data.deliveryManId &&
      data.type === 'delivery' &&
      (status.value === 'on_delivery' || status.value === 'completed')
    ) {
      toast.error(t('Select delivery person first'));
      return;
    }

    try {
      const { data } = await axios.patch(`/api/orders/${id}`, {
        status: status.value,
      });

      if (data?.content?.id) {
        toast.success(t('Order updated successfully'));
        refresh();
      }
    } catch (e) {
      toast.error(t(e.response.data.message || 'Something went wrong'));
    }
  };

  return (
    <Box
      onClick={() => onClick?.(id)}
      className="h-56 flex flex-col justify-between bg-white shadow-primary rounded-md p-4 cursor-pointer"
    >
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
        {status.value !== 'pending' && type === 'delivery' ? (
          <div className="flex items-center gap-4">
            <UpdateDeliveryPerson
              type={type}
              status={data.status}
              orderId={id}
              deliveryPerson={data.deliveryMan}
              refresh={refresh}
            />
          </div>
        ) : null}
        <Menu>
          <MenuButton
            as={Button}
            w="full"
            variant="outline"
            textAlign="left"
            colorScheme={status?.scheme}
            color={status?.fgColor}
            borderColor={status?.fgColor}
            rightIcon={<ArrowDown2 />}
            onClick={(e) => e.stopPropagation()}
          >
            {t(status?.label)}
          </MenuButton>
          <MenuList className="p-1">
            {orderStatus.all().map(
              (s) =>
                (!s.orderType || s.orderType === type) && (
                  <MenuItem
                    key={s.value}
                    color={s.fgColor}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(s);
                    }}
                  >
                    {t(s.label)}
                  </MenuItem>
                )
            )}
          </MenuList>
        </Menu>
      </div>
    </Box>
  );
}
