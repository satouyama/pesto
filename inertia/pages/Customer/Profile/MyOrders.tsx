import ProfileLayout from '@/components/Customer/Profile/ProfileLayout';
import fetcher from '@/lib/fetcher';
import { convertToCurrencyFormat } from '@/utils/currency_formatter';
import { generateInvoice } from '@/utils/generate_invoice';
import { OrderStatus } from '@/utils/order_status';
import { startCase } from '@/utils/string_formatter';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Badge,
  Box,
  Button,
  Divider,
  HStack,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { DocumentDownload } from 'iconsax-react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

const orderStatus = new OrderStatus();

// Order toggler
const OrderBox = ({ order }: { order: Record<string, any> }) => {
  const { t } = useTranslation();

  if (!order) return null;

  const status = orderStatus.getStatusDetails(order.status);

  return (
    <HStack as="span" flex="1" textAlign="left" className="flex-wrap">
      <HStack className="gap-10 flex-1">
        {[
          { label: t('Order no'), value: order.orderNumber },
          { label: t('Items'), value: order.orderItems?.length },
          { label: t('Total'), value: convertToCurrencyFormat(order.grandTotal) },
        ].map((item, index) => (
          <Box key={index}>
            <Text as="p" className="text-sm font-normal leading-5 text-secondary-400">
              {t(item.label)}
            </Text>
            <Text
              className={`${item.label === 'Total' ? 'font-semibold' : 'font-medium'} text-base text-secondary-600 whitespace-nowrap`}
            >
              {item.value}
            </Text>
          </Box>
        ))}
        <Badge
          colorScheme={order.paymentStatus ? 'green' : 'orange'}
          className="rounded-full px-4 py-1.5 text-sm leading-5 font-medium capitalize"
        >
          {t(order.paymentStatus ? 'Paid' : 'Unpaid')}
        </Badge>
      </HStack>

      <HStack className="gap-2">
        <Button
          as="div"
          size="sm"
          className="rounded-full px-4 py-1 text-sm leading-5 font-medium capitalize"
          onClick={() => generateInvoice(order.id, t, true)}
          leftIcon={<DocumentDownload size={16} variant="Bulk" />}
        >
          {t('Invoice')}
        </Button>
        <Badge className="rounded-full px-4 py-1.5 text-sm leading-5 font-medium capitalize">
          {t(startCase(order.type))}
        </Badge>
        <Badge
          className="rounded-full px-4 py-1.5 text-sm leading-5 font-medium capitalize"
          color={status.fgColor}
          background={status.bgColor}
        >
          {t(status.label)}
        </Badge>
      </HStack>
    </HStack>
  );
};

// Render MyOrders component
export default function MyOrders() {
  const { data, isLoading } = useSWR('/api/user/orders', fetcher);
  const { t } = useTranslation();

  const joinedVariantNames = (variants: any[]) => {
    const variantSize = variants.length;

    return variants
      ?.map(
        (variant, index) =>
          variant.variantOptions.map((opt: any) => opt.name).join(', ') +
          (index + 1 === variantSize ? '' : ' | ')
      )
      .join('');
  };

  const joinedAddonNames = (addons: any[]) => {
    return addons.map((addon) => addon.name + ' x ' + addon.quantity).join(', ');
  };

  return (
    <ProfileLayout>
      <div className="px-4 w-full h-full flex justify-center max-w-[900px] mx-auto">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <Spinner />
          </div>
        ) : data.length === 0 ? null : (
          <Accordion allowToggle className="w-full flex flex-col gap-y-4">
            {data?.map((order: Record<string, any>) => (
              <AccordionItem
                key={order.id}
                className="border-secondary-100 p-4 shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.06),0px_4px_6px_-1px_rgba(0,0,0,0.1)] rounded-2xl"
              >
                <AccordionButton className="rounded-2xl px-0 bg-white hover:bg-white flex items-center gap-8 focus-visible:outline-0 focus-visible:shadow-none">
                  <OrderBox order={order} />
                  <AccordionIcon className="hidden sm:block" />
                </AccordionButton>

                <AccordionPanel className="px-0">
                  <Box
                    border="1px"
                    borderColor="secondary.200"
                    className="rounded-md flex-1 shadow-[0_1px_2px_rgba(0,0,0,6%),0_1px_3px_rgba(0,0,0,10%)] w-full overflow-x-auto"
                  >
                    <Table variant="simple">
                      <Thead className="[&>tr>th]:border-none">
                        <Tr>
                          <Th className="w-full">{t('ITEMS')}</Th>
                          <Th className="w-[120px]">{t('QTY')}</Th>
                          <Th className="w-[120px]">{t('PRICE')}</Th>
                          <Th className="w-[120px]">{t('TOTAL')}</Th>
                        </Tr>
                      </Thead>

                      <Tbody className="[&>tr>td]:border-none">
                        {order.orderItems?.length ? (
                          order?.orderItems?.map((item: Record<string, any>) => (
                            <Tr
                              key={item.id}
                              fontSize={14}
                              lineHeight={5}
                              fontWeight={400}
                              className="odd:bg-secondary-50"
                            >
                              <Td className="w-full pl-6 pr-1.5">
                                <HStack className="flex-1">
                                  <Box className="flex-1 flex items-center gap-6">
                                    <div className="w-[60px] h-[40px] rounded aspect-[3/2] relative">
                                      <img
                                        src={item?.menuItem?.image?.url}
                                        alt={item.name}
                                        width={60}
                                        height={40}
                                        className="w-[60px] h-[40px] rounded aspect-[3/2] object-cover"
                                        onError={(e) =>
                                          (e.currentTarget.src = '/default_fallback.png')
                                        }
                                      />
                                    </div>
                                    <div className="flex-1 text-sm">
                                      <Text noOfLines={1} fontWeight={500}>
                                        {t(item.name)}
                                      </Text>
                                      <Popover trigger="hover">
                                        <PopoverTrigger>
                                          <Text noOfLines={1}>
                                            {item?.variants &&
                                              joinedVariantNames(JSON.parse(item?.variants))}
                                            {JSON.parse(item.addons).length > 0 && ' | '}
                                            {joinedAddonNames(JSON.parse(item?.addons))}
                                          </Text>
                                        </PopoverTrigger>
                                        <PopoverContent className="p-4">
                                          <Text as="h3" fontWeight={600} color="secondary.500">
                                            {t('Variants')}
                                          </Text>
                                          {JSON.parse(item.variants).map((variant: any) => (
                                            <ul
                                              key={variant.id}
                                              className="list-disc list-inside mb-2"
                                            >
                                              <li>{variant.name}</li>
                                              <ul className="list-inside list-[circle] ml-4">
                                                {variant.variantOptions.map((opt: any) => (
                                                  <li key={opt.id}> {t(opt.name)} </li>
                                                ))}
                                              </ul>
                                            </ul>
                                          ))}

                                          <Divider className="border-black/5" />

                                          {!!JSON.parse(item.addons).length && (
                                            <>
                                              <Text
                                                as="h3"
                                                fontWeight={600}
                                                color="secondary.500"
                                                mt="4"
                                              >
                                                {t('Addons')}
                                              </Text>
                                              {JSON.parse(item.addons).map((addon: any) => (
                                                <ul
                                                  key={addon.id}
                                                  className="list-disc list-inside mb-2"
                                                >
                                                  <li>
                                                    {t(addon.name)} ( {t('QTY: ')} {addon.quantity}{' '}
                                                    )
                                                  </li>
                                                </ul>
                                              ))}
                                            </>
                                          )}
                                        </PopoverContent>
                                      </Popover>
                                    </div>
                                  </Box>
                                </HStack>
                              </Td>
                              <Td className="p-0 text-center font-medium">{item.quantity}</Td>
                              <Td isNumeric className="px-2">
                                {convertToCurrencyFormat(item?.price)}
                              </Td>
                              <Td isNumeric className="pl-2 pr-6">
                                {convertToCurrencyFormat(item?.grandPrice ?? 0)}
                              </Td>
                            </Tr>
                          ))
                        ) : (
                          <Tr>
                            <Td colSpan={4} className="border-none">
                              <Text className="text-secondary-500 font-medium text-sm">
                                {t('No items have been added yet.')}
                              </Text>
                            </Td>
                          </Tr>
                        )}
                      </Tbody>
                    </Table>
                  </Box>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </ProfileLayout>
  );
}
