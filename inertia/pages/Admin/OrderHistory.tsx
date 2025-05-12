import FilterOrderHistory from '@/components/Admin/OrderHistory/FilterOrderHistory';
import ViewOrder from '@/components/Admin/OrderHistory/ViewOrder';
import ToolBar from '@/components/Admin/ToolBar';
import DataTable from '@/components/common/DataTable';
import Layout from '@/components/common/Layout';
import useTableData from '@/data/use_table_data';
import useDebounce from '@/hooks/useDebounce';
import { convertToCurrencyFormat } from '@/utils/currency_formatter';
import { mapPaymentType, OrderStatus } from '@/utils/order_status';
import { Badge, Box, HStack, Text } from '@chakra-ui/react';
import { SortingState } from '@tanstack/react-table';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// filter options types
type FilterOptions = Partial<{
  status: string;
}>;

// status class instance
const orderStatus = new OrderStatus();

export default function OrderHistory() {
  const { t } = useTranslation();
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filter, setFilter] = useState<FilterOptions>({});

  const searchedText = useDebounce(searchQuery, 300);

  // fetch all pending orders
  const { items, isLoading, meta } = useTableData('/api/orders', {
    page,
    limit,
    search: searchedText,
    listType: 'history',
    ...filter,
  });

  return (
    <Layout title={t('Order history')}>
      <div className="p-6">
        <ToolBar
          filter={<FilterOrderHistory filter={filter} setFilter={setFilter} />}
          exportUrl="/api/orders/export/all?listType=history"
          setSearchQuery={setSearchQuery}
        />
        <div>
          <DataTable
            data={items}
            sorting={sorting}
            setSorting={setSorting}
            isLoading={isLoading}
            pagination={{
              total: meta?.total,
              page: meta?.currentPage,
              limit: meta?.perPage,
              setPage,
              setLimit,
            }}
            structure={[
              {
                accessorKey: 'id',
                id: 'id',
                header: () => t('SL'),
                cell: (info) => info.row.index + 1,
              },
              {
                accessorKey: 'orderNumber',
                id: 'orderNumber',
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
                      {t(row.original.type?.replace('_', '-'))}
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
                cell: ({ row }) => {
                  return (
                    <HStack>
                      <Badge
                        variant="solid"
                        colorScheme={Boolean(row.original.paymentStatus) ? 'green' : 'secondary'}
                      >
                        {Boolean(row.original.paymentStatus) ? 'pago' : 'não pago'}
                      </Badge>
                      <Badge
                        variant="subtle"
                        colorScheme={row.original.paymentType === 'cash' ? 'primary' : 'blue'}
                      >
                        {t(mapPaymentType(row.original.paymentType))}
                      </Badge>
                    </HStack>
                  );
                },
              },
              {
                accessorKey: 'status',
                id: 'status',
                header: () => t('Status'),
                cell: ({ row }) => {
                  const status = orderStatus.getStatusDetails(row.original.status);
                  return (
                    <Box
                      className="flex items-center justify-center w-fit gap-2 py-1 rounded-md  px-3"
                      border="1px"
                      borderColor={status.fgColor}
                    >
                      <Text className="font-semibold text-sm" color={status.fgColor}>
                        {t(status?.label)}
                      </Text>
                    </Box>
                  );
                },
              },

              {
                accessorKey: '',
                id: 'action',
                header: () => t('Action'),
                cell: ({ row }) => <ViewOrder orderId={row.original.id} />,
              },
            ]}
          />
        </div>
      </div>
    </Layout>
  );
}
