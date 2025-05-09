import axios from 'axios';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { match } from 'ts-pattern';
import {
  Text,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Button,
  Switch,
  Badge,
  Flex,
  Divider,
  Textarea,
  HStack,
  Spinner,
  Box,
  Input,
  useDisclosure,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  DrawerBody,
  DrawerFooter,
} from '@chakra-ui/react';
import { ArrowDown2, Eye } from 'iconsax-react';
import fetcher from '@/lib/fetcher';
import { startCase } from '@/utils/string_formatter';
import { convertToCurrencyFormat } from '@/utils/currency_formatter';
import OrderItemList from '@/components/Admin/ActiveOrders/OrderItemList';
import { toast } from 'sonner';
import PrintInvoice from '@/components/common/PrintInvoice';
import { OrderStatus, TOrderStatus } from '@/utils/order_status';
import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import DiscountTypeRadioGroup from '../POS/DiscountTypeSelect';

const orderStatus = new OrderStatus();

type OrderType = 'dine_in' | 'delivery' | 'pickup';
type PaymentType = 'cash' | 'card';

// Order details sidebar component
export default function OrderPreviewButton({
  orderId,
  refresh,
}: {
  orderId: number;
  refresh: () => void;
}) {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [status, setStatus] = React.useState<TOrderStatus>(orderStatus.getStatusDetails('pending'));
  const [customerNote, setCustomerNote] = React.useState('');
  const [orderType, setOrderType] = React.useState<OrderType>();
  const [paymentType, setPaymentType] = React.useState<PaymentType>();
  const [paymentStatus, setPaymentStatus] = React.useState<boolean>();
  const [deliveryDate, setDeliveryDate] = React.useState('');
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [calculatedDiscount, setCalculatedDiscount] = React.useState(0);
  const [discount, setDiscount] = React.useState<{
    type: 'percentage' | 'amount';
    value: number;
    show: boolean;
  }>({
    type: 'amount',
    value: 0,
    show: false,
  });

  const {
    props: { branding },
  } = usePage() as { props: PageProps };

  const btnRef = React.useRef<HTMLButtonElement>(null);

  // fetch order data
  const {
    data: orderItem,
    isLoading,
    mutate,
  } = useSWR(() => (orderId && isOpen ? `/api/orders/${orderId}` : null), fetcher);

  // Initialize states function
  const initStates = React.useCallback(() => {
    if (!isLoading && orderItem) {
      setDiscount({
        show: false,
        type: 'amount',
        value: orderItem.manualDiscount,
      });
      setCalculatedDiscount(orderItem.manualDiscount);
      setStatus(orderStatus.getStatusDetails(orderItem.status)!);
      setOrderType(orderItem.type);
      setCustomerNote(orderItem.customerNote ?? '');
      setPaymentType(orderItem.paymentType);
      setDeliveryDate(new Date(orderItem.deliveryDate).toISOString().split('T')[0]);
      setPaymentStatus(orderItem.paymentStatus);
    }
  }, [orderItem, isLoading]);

  // Initialize states
  React.useEffect(() => {
    initStates();
  }, [initStates]);

  // Update Order
  const updateOrder = async (orderItem: any) => {
    const formattedData = {
      userId: orderItem.userId,
      type: orderType,
      manualDiscount: calculatedDiscount,
      discountType: discount.type,
      paymentType: paymentType,
      customerNote: customerNote,
      paymentStatus: paymentStatus,
      deliveryDate: deliveryDate,
      status: status.value,
    };

    setIsUpdating(true);

    try {
      const { data } = await axios.put(`/api/orders/${orderItem.id}`, formattedData);

      if (data?.content?.id) {
        toast.success(t('Order updated successfully'));
        mutate(orderItem);
        refresh();
      }
    } catch (e) {
      toast.error(t(e.response.data.message) || t('Something went wrong'));
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <Button
        onClick={onOpen}
        variant="outline"
        colorScheme="secondary"
        className="border-secondary-200 text-secondary-800 hover:bg-secondary-100"
        rightIcon={<Eye />}
      >
        {t('View')}
      </Button>
      <Drawer
        isOpen={isOpen}
        placement="right"
        size="lg"
        onClose={() => {
          onClose();
        }}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent className="@container">
          <DrawerBody className="p-0 px-4">
            <div className="w-full bg-white">
              {match({ orderItem, isLoading })
                // is loading
                .with({ isLoading: true }, () => (
                  <HStack className="mt-6 mx-4">
                    <Spinner size="sm" />
                    <Text className="text-secondary-500"> {t('Loading...')} </Text>
                  </HStack>
                ))

                // if order not found
                .with({ orderItem: null, isLoading: false }, () => (
                  <Text className="py-6 px-4 text-secondary-500"> {t('Order not found')} </Text>
                ))

                // render order details
                .otherwise(({ orderItem }) => (
                  <>
                    <div className="px-4 py-6">
                      <div className="order-details-container">
                        <Text as="h3" className="font-medium text-xl text-secondary-600 mb-6">
                          {t('Order details')}
                        </Text>

                        {/* Order details */}
                        <div className="order-details-grid md:gap-[30px]">
                          {/* Order Number */}
                          <div className="lg:w-fit flex flex-col gap-1 pb-[30px] lg:border-b border-black/5">
                            <Text className="text-base font-normal text-secondary-400">
                              {t('Order number')}
                            </Text>
                            <Text as="h3" className="text-secondary-600 text-xl font-semibold">
                              {orderItem?.orderNumber}
                            </Text>
                          </div>

                          {/* Order Type */}
                          <div className="md:w-fit flex flex-col gap-1 pb-[30px] border-b border-black/5">
                            <Text className="text-base font-normal text-secondary-400">
                              {t('Order type')}
                            </Text>

                            <Menu matchWidth>
                              <MenuButton
                                as={Button}
                                variant="outline"
                                rightIcon={<ArrowDown2 />}
                                onClick={(e) => e.stopPropagation()}
                                className="text-left"
                              >
                                {t(startCase(orderType))}
                              </MenuButton>
                              <MenuList className="p-1">
                                {['dine_in', 'delivery', 'pickup'].map((item) => (
                                  <MenuItem
                                    key={item}
                                    isDisabled={Boolean(
                                      !branding?.business?.[
                                        item as keyof (typeof branding)['business']
                                      ]
                                    )}
                                    onClick={() => setOrderType(item as OrderType)}
                                  >
                                    {t(startCase(item))}
                                  </MenuItem>
                                ))}
                              </MenuList>
                            </Menu>
                          </div>

                          {/* Order Status */}
                          <div className="md:w-fit flex flex-col gap-1 pb-[30px] border-b border-black/5">
                            <Text className="text-base font-normal text-secondary-400">
                              {t('Status')}
                            </Text>

                            <Menu matchWidth>
                              <MenuButton
                                as={Button}
                                variant="outline"
                                color={status?.fgColor}
                                borderColor={status?.fgColor}
                                rightIcon={<ArrowDown2 />}
                                onClick={(e) => e.stopPropagation()}
                                className="text-left"
                              >
                                {t(status?.label)}
                              </MenuButton>
                              <MenuList className="p-1">
                                {orderStatus.all().map(
                                  (s) =>
                                    (!s.orderType || orderType === s.orderType) && (
                                      <MenuItem
                                        key={s.value}
                                        color={s.fgColor}
                                        onClick={() => setStatus(s)}
                                      >
                                        {t(s.label)}
                                      </MenuItem>
                                    )
                                )}
                              </MenuList>
                            </Menu>
                          </div>

                          {/* Delivery date */}
                          <div className="md:w-fit flex flex-col gap-1">
                            <Text className="text-base font-normal text-secondary-400">
                              {t('Delivery date')}
                            </Text>
                            <Text as="h3" className="text-secondary-600 text-xl font-semibold">
                              {new Date(orderItem?.deliveryDate).toLocaleDateString()}
                            </Text>
                          </div>

                          {/* Payment method */}
                          <div className="md:w-fit flex flex-col gap-1">
                            <Text className="text-base font-normal text-secondary-400">
                              {t('Payment method')}
                            </Text>

                            <Menu matchWidth>
                              <MenuButton
                                as={Button}
                                variant="outline"
                                rightIcon={<ArrowDown2 />}
                                onClick={(e) => e.stopPropagation()}
                                className="text-left"
                              >
                                {t(startCase(paymentType))}
                              </MenuButton>
                              <MenuList className="p-1">
                                {['cash', 'card'].map((item) => (
                                  <MenuItem
                                    key={item}
                                    onClick={() => setPaymentType(item as PaymentType)}
                                  >
                                    {t(startCase(item))}
                                  </MenuItem>
                                ))}
                              </MenuList>
                            </Menu>
                          </div>

                          {/* Payment Status */}
                          <div className="md:w-fit flex flex-col gap-1">
                            <Text className="text-base font-normal text-secondary-400">
                              {t('Payment status')}
                            </Text>
                            <Flex
                              justifyContent="space-between"
                              className="text-secondary-600 text-xl font-semibold"
                            >
                              {paymentStatus !== undefined && (
                                <Switch
                                  colorScheme="green"
                                  defaultChecked={paymentStatus}
                                  onChange={(e) => setPaymentStatus(e.target.checked)}
                                />
                              )}
                              <Badge
                                variant="solid"
                                colorScheme="green"
                                size="sm"
                                className="py-0 leading-5 min-h-fit"
                              >
                                {t(paymentStatus ? 'PAID' : 'UNPAID')}
                              </Badge>
                            </Flex>
                          </div>
                        </div>
                      </div>

                      <Divider className="border-black/5" />

                      {/* User note */}
                      <div className="mt-3 mb-4">
                        <div className="flex flex-col space-y-2">
                          <Text className="text-base font-normal text-secondary-400">
                            {t('Order note')}
                          </Text>
                          <Textarea
                            value={customerNote}
                            onChange={(e) => setCustomerNote(e.target.value)}
                            placeholder={t('Write customer note')}
                          />
                        </div>
                      </div>

                      {/* Order items */}
                      <OrderItemList items={orderItem?.orderItems} />

                      <div className="mt-4 flex flex-col gapy-2 [&>div]:border-b [&>div]:border-black/5 [&>div]:py-1 [&>div]:px-4">
                        {/* Subtotal */}
                        <div className="grid grid-cols-[1fr,150px] text-lg">
                          <div> {t('Subtotal')}: </div>
                          <h4 className="font-medium text-right">
                            {convertToCurrencyFormat(orderItem?.total)}
                          </h4>
                        </div>

                        {/* Vat/Tax */}
                        <div className="grid grid-cols-[1fr,150px] text-lg">
                          <div> {t('Vat/Tax')}: </div>
                          <h4 className="font-medium text-right">
                            {convertToCurrencyFormat(orderItem?.totalTax)}
                          </h4>
                        </div>

                        {/* Service charge */}
                        <div className="grid grid-cols-[1fr,150px] text-lg">
                          <div> {t('Service charge')}: </div>
                          <h4 className="font-medium text-right">
                            {convertToCurrencyFormat(orderItem?.totalCharges)}
                          </h4>
                        </div>

                        {/* Discount */}
                        <Box
                          as="div"
                          className="grid grid-cols-[1fr,100px] border-b py-1.5 border-black/5 text-lg"
                        >
                          <Box className="flex flex-wrap @xs:flex-nowrap items-center gap-3">
                            {t('Extra Discount')}:
                            {!discount.show && (
                              <Button
                                size="sm"
                                className="px-3"
                                onClick={() => setDiscount({ ...discount, show: true })}
                              >
                                {t(discount.value === 0 ? 'Add Discount' : 'Edit Discount')}
                              </Button>
                            )}
                            {discount.show && (
                              <Button
                                size="sm"
                                className="px-3"
                                onClick={() => {
                                  setDiscount({ ...discount, value: 0, show: false });
                                }}
                              >
                                {t('Remove Discount')}
                              </Button>
                            )}
                          </Box>
                          <Text fontWeight={500} textAlign="right">
                            - {convertToCurrencyFormat(calculatedDiscount)}
                          </Text>
                        </Box>
                        {discount.show && (
                          <Box as="div" className="grid grid-cols-[1fr,100px] gap-4 pt-2">
                            <HStack className="flex gap-3">
                              <HStack>
                                <DiscountTypeRadioGroup
                                  onChange={(value) =>
                                    setDiscount((prev) => ({
                                      ...prev,
                                      type: value as 'amount' | 'percentage',
                                    }))
                                  }
                                />
                              </HStack>
                              <Input
                                type="number"
                                value={discount.value}
                                onChange={(e) =>
                                  setDiscount((prev) => ({ ...prev, value: +e.target.value }))
                                }
                                placeholder={t('Add discount')}
                                onFocus={(e) => e.target.select()}
                              />
                            </HStack>
                            <Button
                              variant="outline"
                              colorScheme="blue"
                              type="button"
                              onClick={() => {
                                setDiscount((prev) => ({ ...prev, show: false }));
                                if (discount.type === 'percentage') {
                                  setCalculatedDiscount(orderItem.total * discount.value * 0.01);
                                } else setCalculatedDiscount(discount.value);
                              }}
                            >
                              {t('Update')}
                            </Button>
                          </Box>
                        )}
                      </div>
                    </div>
                  </>
                ))}
            </div>
          </DrawerBody>

          <DrawerFooter className="p-0">
            {/* Footer actions */}
            <Box
              pt="2"
              pb="4"
              shadow="0px 1px 2px 0px rgba(0, 0, 0, 0.06),0px -1px 3px 0px rgba(0, 0, 0, 0.1)"
              className="w-full bg-white z-10 flex flex-col gap-5 px-4 @md:px-8"
            >
              <div className="grid grid-cols-[1fr,150px] text-lg px-4">
                <div> {t('Grand total')}: </div>
                <h4 className="font-bold text-right">
                  {convertToCurrencyFormat(orderItem?.grandTotal)}
                </h4>
              </div>
              <Divider className="border-black/5" />

              <HStack className="w-full px-4">
                <Button onClick={onClose} variant="outline" className="flex-1">
                  {t('Close')}
                </Button>

                <PrintInvoice orderId={orderItem?.id} />

                <Button
                  type="button"
                  onClick={() => updateOrder(orderItem)}
                  colorScheme="blue"
                  className="flex-1"
                  isLoading={isUpdating}
                >
                  {t('Update')}
                </Button>
              </HStack>
            </Box>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
