import DataTable from '@/components/common/DataTable';
import useTableData from '@/data/use_table_data';
import { convertToCurrencyFormat } from '@/utils/currency_formatter';
import { mapOrderTypeStatus, mapPaymentType, OrderStatus } from '@/utils/order_status';
import { startCase } from '@/utils/string_formatter';
import { Badge, Button, Menu, MenuButton, MenuItem, MenuList, Switch } from '@chakra-ui/react';
import { SortingState } from '@tanstack/react-table';
import axios from 'axios';
import { ArrowDown2 } from 'iconsax-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

// order status
const orderStatus = new OrderStatus();

export default function RecentOrdersTable() {
  const { t } = useTranslation();
  const [sorting, setSorting] = useState<SortingState>([]);

  // fetch all pending orders
  const { items, isLoading, refresh } = useTableData('/api/orders', {
    page: 1,
    limit: 10,
  });

  // update order
  const updateOrder = async (id: number, formData: Record<string, any>) => {
    try {
      const { data } = await axios.patch(`/api/orders/${id}`, formData);
      if (data?.content?.id) {
        toast.success(t('Order updated successfully'));
        refresh();
      }
    } catch (e) {
      toast.error(t(e.response.data.message || 'Something went wrong'));
    }
  };

  return (
    <div className="[&>div]:rounded-xl">
      <DataTable
        data={items.filter(
          (item: any) => !['completed', 'failed', 'canceled'].includes(item.status)
        )}
        sorting={sorting}
        setSorting={setSorting}
        isLoading={isLoading}
        structure={[
          {
            accessorKey: 'id',
            id: 'id',
            header: () => t('SL'),
            cell: (info) => info.row.index + 1,
          },
          {
            accessorKey: 'orderNumber',
            id: 'orderId',
            header: () => t('Order No'),
            cell: ({ row }) => <span className="font-bold">{row.original.orderNumber}</span>,
          },
          {
            accessorKey: 'createdAt',
            id: 'createdAt',
            header: () => t('Created On'),
            cell: ({ row }) => (
              <div>
                {new Date(row.original.createdAt)
                  .toLocaleString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })
                  .replace(',', ' -')}
              </div>
            ),
          },
          {
            accessorKey: 'user.fullName',
            id: 'userFullName',
            header: () => t('Customer name'),
            cell: ({ row }) => <div>{row.original?.user?.fullName || 'Guest'}</div>,
          },
          {
            accessorKey: 'type',
            id: 'type',
            header: () => t('Type'),
            cell: ({ row }) => {
              const colorScheme = {
                dine_in: 'teal',
                delivery: 'primary',
                pickup: 'blue',
              };

              return (
                <Badge
                  variant="solid"
                  colorScheme={
                    colorScheme[row.original.type as keyof typeof colorScheme] || 'secondary'
                  }
                >
                  {t(mapOrderTypeStatus(row.original.type?.replace('_', '-')))}
                </Badge>
              );
            },
          },
          {
            accessorKey: 'grandTotal',
            id: 'grandTotal',
            header: () => t('Total'),
            cell: ({ row }) => (
              <p className="font-bold">{convertToCurrencyFormat(row.original.grandTotal)}</p>
            ),
          },
          {
            accessorKey: 'paymentType',
            id: 'paymentType',
            header: () => t('Payment'),
            cell: ({ row }) => (
              <Badge
                variant="subtle"
                colorScheme={row.original.paymentType === 'cash' ? 'primary' : 'blue'}
              >
                {t(mapPaymentType(row.original.paymentType))}
              </Badge>
            ),
          },
          {
            accessorKey: 'paymentStatus',
            id: 'paymentStatus',
            header: () => t('Paid'),
            cell: ({ row }) => (
              <Switch
                defaultChecked={row.original.paymentStatus}
                colorScheme="green"
                size="lg"
                onChange={(e) => updateOrder(row.original.id, { paymentStatus: e.target.checked })}
              />
            ),
          },
          {
            accessorKey: 'status',
            id: 'status',
            header: () => t('Status'),
            cell: ({ row }) => (
              <Menu>
                <MenuButton
                  as={Button}
                  variant="outline"
                  size="sm"
                  colorScheme={orderStatus.getStatusDetails(row.original.status)?.scheme}
                  borderColor={orderStatus.getStatusDetails(row.original.status)?.fgColor}
                  color={orderStatus.getStatusDetails(row.original.status)?.fgColor}
                  rightIcon={<ArrowDown2 />}
                  onClick={(e) => e.stopPropagation()}
                >
                  {t(startCase(row.original.status))}
                </MenuButton>
                <MenuList className="p-1">
                  {orderStatus.all().map(
                    (s) =>
                      (!s.orderType || s.orderType === row.original.type) && (
                        <MenuItem
                          key={s.value}
                          color={s.fgColor}
                          onClick={(e) => {
                            e.stopPropagation();
                            updateOrder(row.original.id, { status: s.value });
                          }}
                        >
                          {t(s.label)}
                        </MenuItem>
                      )
                  )}
                </MenuList>
              </Menu>
            ),
          },
        ]}
      />
    </div>
  );
}
