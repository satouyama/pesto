import AnalyticsCard from '@/components/Admin/Dashboard/AnalyticsCard';
import EarningReport from '@/components/Admin/Dashboard/EarningReport';
import OrderReport from '@/components/Admin/Dashboard/OrderReport';
import RecentOrdersTable from '@/components/Admin/Dashboard/RecentOrdersTable';
import RecentReservationsTable from '@/components/Admin/Dashboard/RecentReservationsTable';
import Layout from '@/components/common/Layout';
import fetcher from '@/lib/fetcher';
import { PageProps } from '@/types';
import { startCase } from '@/utils/string_formatter';
import { Button, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ArrowDown2,
  CloseCircle,
  PlayCricle,
  Refresh2,
  TickCircle,
  Timer,
  TruckFast,
} from 'iconsax-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

export default function Dashboard({ auth }: PageProps) {
  const { t } = useTranslation();
  const [timeframe, setTimeframe] = useState('today');

  // Fetch counting order data
  const { data, isLoading } = useSWR(`/api/orders/count/status?timeframe=${timeframe}`, fetcher);

  return (
    <Layout title={t('Dashboard')}>
      <div className="@container">
        <div className="grid grid-cols-1 @5xl:grid-cols-8 gap-6 p-6 @5xl:p-12">
          <div className="col-span-1 @5xl:col-span-2 justify-center flex flex-col">
            <h2 className="text-3xl font-semibold mb-2">
              {t('Hello')}, {auth?.fullName}
            </h2>
            <div className="flex items-center gap-2 text-lg">
              <span>{t('Today is')}</span>
              <span className="text-primary-400">{format(new Date(), 'iii, dd MMM', { locale: ptBR })}</span>
            </div>
          </div>

          <div className="col-span-1 @5xl:col-span-6">
            <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
              <h3 className="text-xl font-medium">{t('Order analytics')}</h3>
              <Menu placement="bottom-end">
                <MenuButton
                  as={Button}
                  className="text-sm font-normal bg-white border border-gray-200"
                  rightIcon={<ArrowDown2 size={16} />}
                >
                  {t(
                    `${startCase(timeframe) === 'Today' ? 'Today' : `This ${startCase(timeframe)}`}`
                  )}
                </MenuButton>
                <MenuList className="p-1">
                  <MenuItem onClick={() => setTimeframe('today')}>{t('Today')}</MenuItem>
                  <MenuItem onClick={() => setTimeframe('week')}>{t('This Week')}</MenuItem>
                  <MenuItem onClick={() => setTimeframe('month')}>{t('This Month')}</MenuItem>
                  <MenuItem onClick={() => setTimeframe('lifetime')}>{t('Lifetime')}</MenuItem>
                </MenuList>
              </Menu>
            </div>
            <div className="grid grid-cols-2 @md:grid-cols-2 @3xl:grid-cols-4 gap-3 mb-4">
              <AnalyticsCard
                size="large"
                title={t('Pending')}
                icon={<Timer variant="Bulk" size={24} className="text-primary-400" />}
                value={isLoading ? 0 : data?.data?.pending}
                link="/admin/order-status/pending"
              />
              <AnalyticsCard
                size="large"
                title={t('Processing')}
                icon={<PlayCricle variant="Bulk" size={24} className="text-green-500" />}
                value={isLoading ? 0 : data?.data?.processing}
                link="/admin/order-status/processing"
              />

              <AnalyticsCard
                size="large"
                title={t('Ready')}
                icon={<TickCircle variant="Bulk" size={24} className="text-purple-400" />}
                value={isLoading ? 0 : data?.data?.ready || 0}
                link="/admin/order-status/ready"
              />

              <AnalyticsCard
                size="large"
                title={t('Para entrega')}
                icon={<TruckFast variant="Bulk" size={24} className="text-blue-400" />}
                value={isLoading ? 0 : data?.data?.on_delivery}
                link="/admin/order-status/on-delivery"
              />
            </div>
            <div className="grid grid-cols-1 @md:grid-cols-2 @xl:grid-cols-3 gap-3">
              <AnalyticsCard
                size="small"
                title={t('Failed')}
                icon={<Refresh2 variant="Bulk" size={24} className="text-primary-400" />}
                value={isLoading ? 0 : data?.data?.failed || 0}
                link="/admin/order-status/failed"
              />
              <AnalyticsCard
                size="small"
                title={t('Cancelled')}
                icon={<CloseCircle variant="Bulk" size={24} className="text-red-400" />}
                value={isLoading ? 0 : data?.data?.canceled}
                link="/admin/order-status/cancelled"
              />
              <AnalyticsCard
                size="small"
                title={t('Completed')}
                icon={<TickCircle variant="Bulk" size={24} className="text-green-400" />}
                value={isLoading ? 0 : data?.data?.completed}
                link="/admin/order-status/completed"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Report Chart */}
      <section className="px-6 mb-6">
        <div className="grid grid-cols-6 lg:grid-cols-6 xl:grid-cols-12 gap-4">
          <div className="col-span-6">
            <OrderReport periodType="week" />
          </div>

          <div className="col-span-6">
            <EarningReport periodType="week" />
          </div>
        </div>
      </section>

      {/* Recent order table section */}
      <section className="px-6 pb-6">
        <div className="flex flex-col space-y-4">
          <h3 className="text-xl font-medium">{t('Recent Orders')}</h3>
          <RecentOrdersTable />
        </div>
      </section>

      {/* Recent reservations table section */}
      <section className="px-6 pb-6">
        <div className="flex flex-col space-y-4">
          <h3 className="text-xl font-medium">{t('Recent Reservations')}</h3>
          <RecentReservationsTable />
        </div>
      </section>
    </Layout>
  );
}
