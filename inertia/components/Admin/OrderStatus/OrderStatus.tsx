import { Flex, HStack, Spinner, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { Link } from '@inertiajs/react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import BulkUpdateOrder from './BulkUpdateOrder';

const PendingTable = React.lazy(() => import('./PendingTable'));
const ReadyOrderTable = React.lazy(() => import('./ReadyOrderTable'));
const ProcessingTable = React.lazy(() => import('./ProcessingTable'));
const OnDeliveryTable = React.lazy(() => import('./OnDeliveryTable'));
const CompletedTable = React.lazy(() => import('./CompletedTable'));
const CancelledTable = React.lazy(() => import('./CancelledTable'));
const FailedTable = React.lazy(() => import('./FailedTable'));

// Suspense
const Suspense = ({ children }: { children: React.ReactNode }) => {
  return (
    <React.Suspense
      fallback={
        <HStack className="flex items-center justify-center h-32 bg-white">
          <Spinner />
        </HStack>
      }
    >
      {children}
    </React.Suspense>
  );
};

export default function OrderStatus({ index }: { index: number }) {
  const { t } = useTranslation();
  const [selectedRow, setSelectedRow] = React.useState<Record<string, any>[]>([]);

  return (
    <div className="@container">
      <Tabs defaultIndex={index} isLazy>
        <Flex justify="space-between" className="h-12 flex-wrap gap-y-1.5 gap-x-4">
          {!selectedRow.length ? (
            <div className="w-full overflow-x-auto">
              <TabList className="flex whitespace-nowrap">
                <Tab as={Link} href="/admin/order-status/pending">
                  {t('Pending')}
                </Tab>
                <Tab as={Link} href="/admin/order-status/processing">
                  {t('Processing')}
                </Tab>
                <Tab as={Link} href="/admin/order-status/ready">
                  {t('Ready')}
                </Tab>
                <Tab as={Link} href="/admin/order-status/on-delivery">
                  {t('On delivery')}
                </Tab>
                <Tab as={Link} href="/admin/order-status/completed">
                  {t('Completed')}
                </Tab>
                <Tab as={Link} href="/admin/order-status/failed">
                  {t('Failed')}
                </Tab>
                <Tab as={Link} href="/admin/order-status/cancelled">
                  {t('Cancelled')}
                </Tab>
              </TabList>
            </div>
          ) : (
            <BulkUpdateOrder rows={selectedRow} />
          )}
        </Flex>

        <TabPanels>
          <TabPanel>
            <Suspense>
              <PendingTable setSelectedRow={(rows) => setSelectedRow(rows)} />
            </Suspense>
          </TabPanel>
          <TabPanel>
            <Suspense>
              <ProcessingTable setSelectedRow={(rows) => setSelectedRow(rows)} />
            </Suspense>
          </TabPanel>
          <TabPanel>
            <Suspense>
              <ReadyOrderTable setSelectedRow={(rows) => setSelectedRow(rows)} />
            </Suspense>
          </TabPanel>
          <TabPanel>
            <Suspense>
              <OnDeliveryTable setSelectedRow={(rows) => setSelectedRow(rows)} />
            </Suspense>
          </TabPanel>
          <TabPanel>
            <Suspense>
              <CompletedTable setSelectedRow={(rows) => setSelectedRow(rows)} />
            </Suspense>
          </TabPanel>
          <TabPanel>
            <Suspense>
              <FailedTable setSelectedRow={(rows) => setSelectedRow(rows)} />
            </Suspense>
          </TabPanel>
          <TabPanel>
            <Suspense>
              <CancelledTable setSelectedRow={(rows) => setSelectedRow(rows)} />
            </Suspense>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
}
