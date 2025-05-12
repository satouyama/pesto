import OrderCard from '@/components/Admin/ActiveOrders/OrderCard';
import OrderDetailsSidebar from '@/components/Admin/ActiveOrders/OrderDetailsSidebar';
import Layout from '@/components/common/Layout';
import useDebounce from '@/hooks/useDebounce';
import fetcher from '@/lib/fetcher';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from '@chakra-ui/react';
import { SearchNormal } from 'iconsax-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { match, P } from 'ts-pattern';

export default function ActiveOrders() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const searchedText = useDebounce(search, 300);
  const [orderId, setOrderId] = useState<number>();

  const {
    data: orderItems,
    isLoading,
    mutate,
    isValidating,
  } = useSWR(`/api/orders?search=${searchedText}&listType=active`, fetcher);

  const renderItem = (status: string) => {
    return (
      <div className="order-card-container">
        {match({ orderItems, isLoading })
          .with({ isLoading: true }, () => (
            <HStack height="200px" justifyContent="center">
              <Spinner size="sm" />
              <Text>{t('Loading...')}</Text>
            </HStack>
          ))
          .with({ orderItems: P.not(P.nullish) }, () => {
            const filteredItems = orderItems.filter((order: any) => order.status === status);

            if (!filteredItems.length)
              return <Text className="text-secondary-500"> {t('No orders available')} </Text>;

            return (
              <div className="order-card-grid">
                {filteredItems.map(
                  (item: any) =>
                    item.status === status && (
                      <OrderCard
                        key={item.id}
                        refresh={mutate}
                        onClick={(id) => {
                          setOrderId(id);
                          setIsOpen(true);
                        }}
                        data={item}
                      />
                    )
                )}
              </div>
            );
          })
          .otherwise(() => (
            <Text className="text-secondary-500"> {t('No orders available')} </Text>
          ))}
      </div>
    );
  };

  return (
    <Layout title={t('Active orders')}>
      <div className={`grid ${isOpen ? 'grid-cols-2' : 'grid-cols-1'} @container justify-between`}>
        <div className="h-[calc(100vh-76px)] w-full p-6 overflow-y-scroll">
          <Tabs>
            <div className="flex flex-col @3xl:flex-row @3xl:items-center justify-between gap-4">
              <div className="flex-1 max-w-full overflow-x-auto">
                <TabList className="flex whitespace-nowrap">
                  <Tab>{t('All')}</Tab>
                  <Tab>{t('Pending')}</Tab>
                  <Tab>{t('Processing')}</Tab>
                  <Tab>{t('Ready')}</Tab>
                  <Tab>{t('Para entrega')}</Tab>
                </TabList>
              </div>
              {!isOpen && (
                <div className="max-w-[300px]">
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <SearchNormal size={18} />
                    </InputLeftElement>
                    <Input
                      type="search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={t('Search')}
                      className="bg-white"
                    />
                  </InputGroup>
                </div>
              )}
            </div>

            <TabPanels>
              <TabPanel>
                <Accordion defaultIndex={[0, 1]} allowMultiple>
                  <AccordionItem border={0}>
                    <AccordionButton className="flex items-center justify-between border-b border-black/10">
                      <p className="font-medium pb-1">{t('Pending')}</p>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel className="px-1">{renderItem('pending')}</AccordionPanel>
                  </AccordionItem>
                  <AccordionItem border={0}>
                    <AccordionButton className="flex items-center justify-between border-b border-black/10">
                      <p className="font-medium pb-1">{t('Others')}</p>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel className="px-1 order-card-container">
                      {match({ orderItems, isLoading })
                        .with({ isLoading: true }, () => (
                          <HStack height="200px" justifyContent="center">
                            <Spinner size="sm" />
                            <Text>{t('Loading...')}</Text>
                          </HStack>
                        ))
                        .with({ orderItems: P.not(P.nullish) }, () => (
                          <div className="order-card-grid">
                            {orderItems.map(
                              (item: any) =>
                                item.status !== 'pending' && (
                                  <OrderCard
                                    key={item.id}
                                    refresh={() => mutate(orderItems)}
                                    onClick={(id) => {
                                      setOrderId(id);
                                      setIsOpen(true);
                                    }}
                                    data={item}
                                  />
                                )
                            )}
                          </div>
                        ))
                        .otherwise(() => (
                          <Text className="text-secondary-400"> {t('No pending orders')} </Text>
                        ))}
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
              </TabPanel>
              <TabPanel>{renderItem('pending')}</TabPanel>
              <TabPanel>{renderItem('processing')}</TabPanel>
              <TabPanel>{renderItem('ready')}</TabPanel>
              <TabPanel>{renderItem('on_delivery')}</TabPanel>
            </TabPanels>
          </Tabs>
        </div>

        {orderId && (
          <OrderDetailsSidebar
            isValidating={isValidating}
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            orderId={orderId}
            refresh={() => mutate(orderItems)}
          />
        )}
      </div>
    </Layout>
  );
}
