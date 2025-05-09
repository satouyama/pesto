import axios from 'axios';
import DataTable from '@/components/common/DataTable';
import useTableData from '@/data/use_table_data';
import { convertToCurrencyFormat } from '@/utils/currency_formatter';
import { Badge, HStack, Switch, Text } from '@chakra-ui/react';
import { SortingState } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeleteOrder from './DeleteOrder';
import PersonSelection from './PersonSelection';
import UpdateOrderStatus from './UpdateOrderStatus';
import OrderPreviewButton from './ViewPreviewButton';
import { toast } from 'sonner';

export default function ProcessingTable({
  setSelectedRow,
}: {
  setSelectedRow: (rows: Record<string, any>[]) => void;
}) {
  const { t } = useTranslation();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // fetch all pending orders
  const { items, isLoading, refresh, meta, isValidating } = useTableData('/api/orders', {
    page,
    limit,
    status: 'processing',
  });

  // reset selected rows
  useEffect(() => {
    if (!isValidating && items.length === 0) {
      setSelectedRow([]);
    }
  }, [isValidating]);

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
    <DataTable
      data={items}
      sorting={sorting}
      setSorting={setSorting}
      isLoading={isLoading}
      onRowSelection={setSelectedRow}
      enableMultiRowSelection
      getRowId={(row) => row.id}
      pagination={{
        total: meta?.total,
        page: meta?.currentPage,
        limit: meta?.perPage,
        setPage,
        setLimit,
      }}
      structure={[
        {
          accessorKey: 'checkbox',
          id: 'checkbox',
          enableSorting: false,
          header: ({ table }) => (
            <input
              type="checkbox"
              checked={table?.getIsAllRowsSelected()}
              onChange={table?.getToggleAllRowsSelectedHandler()}
              className="accent-primary-500 cursor-pointer scale-110"
            />
          ),
          cell: ({ row }) => (
            <input
              type="checkbox"
              checked={row?.getIsSelected()}
              onChange={row?.getToggleSelectedHandler()}
              className="accent-primary-500 cursor-pointer scale-110"
            />
          ),
        },
        {
          accessorKey: 'id',
          header: () => t('SL'),
          cell: (info) => info.row.index + 1,
        },
        {
          accessorKey: 'orderNumber',
          header: () => t('Order No'),
          cell: ({ row }) => <span className="font-bold">{row.original.orderNumber}</span>,
        },
        {
          accessorKey: 'createdAt',
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
          header: () => t('Customer name'),
          cell: ({ row }) => <div>{row.original?.user?.fullName || 'Guest'}</div>,
        },
        {
          accessorKey: 'type',
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
          header: () => t('Total'),
          cell: ({ row }) => (
            <p className="font-bold">{convertToCurrencyFormat(row.original.grandTotal)}</p>
          ),
        },
        {
          accessorKey: 'paymentType',
          header: () => t('Payment'),
          cell: ({ row }) => (
            <Badge
              variant="subtle"
              colorScheme={row.original.paymentType === 'cash' ? 'primary' : 'blue'}
            >
              {t(row.original.paymentType)}
            </Badge>
          ),
        },
        {
          accessorKey: 'paymentStatus',
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
          header: () => t('Status'),
          cell: ({ row }) => (
            <UpdateOrderStatus
              orderId={row.original.id}
              status={row.original.status}
              refresh={refresh}
              type={row.original.type}
              isDeliveryPersonSelected={Boolean(row.original.deliveryManId)}
            />
          ),
        },
        {
          accessorKey: 'deliveryPerson.fullName',
          header: () => t('Delivery person'),
          cell: ({ row }) => {
            if (row.original.type !== 'delivery') return <Text color="secondary.400">N/A</Text>;
            return <PersonSelection refresh={refresh} data={row.original} />;
          },
        },
        {
          accessorKey: 'action',
          header: () => t('Action'),
          cell: ({ row }) => (
            <HStack gap={2}>
              <OrderPreviewButton orderId={row.original.id} refresh={refresh} />
              <DeleteOrder isIconButton id={row.original.id} refresh={refresh} />
            </HStack>
          ),
        },
      ]}
    />
  );
}
