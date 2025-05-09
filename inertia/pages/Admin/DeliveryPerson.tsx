import { useEffect, useState } from 'react';
import { Badge } from '@chakra-ui/react';
import { SortingState } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import useDebounce from '@/hooks/useDebounce';
import Layout from '@/components/common/Layout';
import DataTable from '@/components/common/DataTable';
import DeleteDelivery from '@/components/Admin/DeliveryPerson/DeleteDelivery';
import EditDelivery from '@/components/Admin/DeliveryPerson/EditDelivery';
import NewDelivery from '@/components/Admin/DeliveryPerson/NewDelivery';
import CustomerBulkUpdateBar from '@/components/Admin/Customers/CustomerBulkUpdateBar';
import ViewDelivery from '@/components/Admin/DeliveryPerson/ViewDelivery';
import FilterCustomer from '@/components/Admin/Customers/FilterCustomer';
import ToolBar from '@/components/Admin/ToolBar';
import useTableData from '@/data/use_table_data';

// filter options types
type FilterOptions = Partial<{
  emailVerified: string;
  suspended: string;
}>;

export default function DeliveryPerson() {
  const { t } = useTranslation();
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filter, setFilter] = useState<FilterOptions>({});
  const [selectedRows, setSelectedRows] = useState<Record<string, any>[]>([]);
  const [bulkAvailability, setBulkAvailability] = useState<boolean>(false);

  const searchedText = useDebounce(searchQuery, 300);

  const { items, meta, isLoading, refresh, isValidating } = useTableData('/api/users', {
    search: searchedText,
    page,
    limit,
    type: 'delivery',
    ...filter,
  });

  // reset selected row
  useEffect(() => {
    if (!isValidating && !items.length) {
      setSelectedRows([]);
    }
  }, [isValidating]);

  return (
    <Layout title={t('Delivery person')}>
      <div className="p-6">
        <ToolBar
          bulkAction={{
            isBulkAction: !!selectedRows.length,
            BulkUpdateBar: () => (
              <CustomerBulkUpdateBar
                rows={selectedRows}
                reset={() => setSelectedRows([])}
                available={bulkAvailability}
                setAvailable={setBulkAvailability}
              />
            ),
          }}
          filter={<FilterCustomer filter={filter} setFilter={setFilter} />}
          AddNew={() => <NewDelivery refresh={refresh} />}
          exportUrl="/api/users/export/all?type=delivery"
          setSearchQuery={setSearchQuery}
        />
        <DataTable
          data={items}
          isLoading={isLoading}
          sorting={sorting}
          setSorting={setSorting}
          getRowId={(row: any) => row.id}
          enableMultiRowSelection
          onRowSelection={setSelectedRows}
          pagination={{
            total: meta?.total,
            page,
            setPage,
            limit,
            setLimit,
          }}
          structure={[
            {
              accessorKey: 'checkbox',
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
              accessorKey: 'fullName',
              header: () => t('Customer name'),
            },
            {
              accessorKey: 'email',
              header: () => t('Email'),
            },
            {
              accessorKey: 'phoneNumber',
              header: () => t('Contact number'),
            },
            {
              accessorKey: 'isSuspended',
              header: () => t('Acc. Status'),
              cell: ({ row }) => (
                <Badge colorScheme={row.original?.isSuspended ? 'red' : 'green'}>
                  {row.original?.isSuspended ? t('Suspended') : t('Active')}
                </Badge>
              ),
            },
            {
              accessorKey: 'isEmailVerified',
              header: () => t('Email status'),
              cell: ({ row }) => (
                <Badge colorScheme={row.original?.isEmailVerified ? 'green' : 'red'}>
                  {row.original?.isEmailVerified ? t('Verified') : t('Unverified')}
                </Badge>
              ),
            },
            {
              accessorKey: 'actions',
              header: () => t('Actions'),
              cell: ({ row }) => (
                <div className="flex gap-2">
                  <ViewDelivery delivery={row.original} refresh={refresh} />
                  <DeleteDelivery isIconButton id={row.original.id} refresh={refresh} />
                  <EditDelivery isIconButton delivery={row.original} refresh={refresh} />
                </div>
              ),
            },
          ]}
        />
      </div>
    </Layout>
  );
}
