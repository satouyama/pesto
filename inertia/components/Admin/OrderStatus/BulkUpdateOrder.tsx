import useTableData from '@/data/use_table_data';
import useDebounce from '@/hooks/useDebounce';
import { OrderStatus, TOrderStatus } from '@/utils/order_status';
import { startCase } from '@/utils/string_formatter';
import {
  Box,
  Button,
  HStack,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Spinner,
  Switch,
  Text,
} from '@chakra-ui/react';
import axios from 'axios';
import { t } from 'i18next';
import { ArrowDown2 } from 'iconsax-react';
import React from 'react';
import { toast } from 'sonner';
import { mutate } from 'swr';

const orderStatus = new OrderStatus();

export default function BulkUpdateOrder({ rows }: { rows: Record<string, any>[] }) {
  const [status, setStatus] = React.useState<TOrderStatus>();
  const [paymentStatus, setPaymentStatus] = React.useState<boolean>();
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = React.useState<Record<string, any>>();
  const [deliverySearch, setDeliverySearch] = React.useState('');

  const deliverySearchText = useDebounce(deliverySearch, 300);

  // Get delivery persons
  const { items: deliveryPersons, isLoading: isDeliveryPersonsLoading } = useTableData(
    '/api/users',
    {
      search: deliverySearchText,
      page: 1,
      limit: 20,
      type: 'delivery',
    }
  );

  const hasDeliveryTypeOrders = !!rows?.some((row: any) => row.type === 'delivery');

  // Update bulk payment status or order status
  const updateBulkStatus = async (formData: Record<string, any>) => {
    if (
      'status' in formData &&
      hasDeliveryTypeOrders &&
      (formData.status === 'on_delivery' || formData.status === 'completed')
    ) {
      const hasUnassignedOrder = rows.some((row: any) => !row.deliveryManId);
      if (hasUnassignedOrder) {
        toast.error(t('Select delivery man first'));
        return;
      }
    }

    try {
      const { data } = await axios.patch('/api/orders/bulk/update', {
        ids: rows.map((row: any) => row.id),
        ...formData,
      });

      if (data?.success) {
        toast.success(t('Order updated successfully'));
        await mutate((key: string) => key.startsWith('/api/orders'));
      } else {
        toast.error(t('Failed to update order'));
      }
    } catch (e: any) {
      const errorMessage = e?.response?.data?.message || t('Something went wrong');
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex-wrap lg:flex-nowrap items-center gap-4 ml-auto flex">
      {/* Payment status */}
      <HStack gap={3}>
        <Text color="secondary.400" className="whitespace-nowrap">
          {t('Payment status')}
        </Text>
        <Switch
          colorScheme="green"
          size="lg"
          isChecked={paymentStatus}
          onChange={(e) => {
            const checked = e.target.checked;
            setPaymentStatus(checked);
            updateBulkStatus({ paymentStatus: checked });
          }}
        />
      </HStack>

      {/* Delivery person */}
      {hasDeliveryTypeOrders && (
        <Menu matchWidth>
          <MenuButton
            as={Button}
            variant="outline"
            rightIcon={<ArrowDown2 />}
            onClick={(e) => e.stopPropagation()}
            color={selectedDeliveryPerson ? 'inherit' : ''}
          >
            {selectedDeliveryPerson?.fullName || t('Select delivery man')}
          </MenuButton>
          <MenuList className="p-1">
            {isDeliveryPersonsLoading ? (
              <HStack color="secondary.400">
                <Spinner size="sm" />
                <Text fontSize="sm" color="secondary.400" py={2} px={3}>
                  {t('Loading...')}
                </Text>
              </HStack>
            ) : deliveryPersons.length ? (
              <>
                <Box className="pb-1 border-b border-black/5">
                  <Input
                    type="search"
                    placeholder="Search delivery man"
                    onChange={(e) => setDeliverySearch(e.target.value)}
                  />
                </Box>

                {deliveryPersons?.map(
                  (user: Record<string, any> & { id: number; fullName: string }) => (
                    <MenuItem
                      key={user.id}
                      onClick={() => {
                        setSelectedDeliveryPerson(
                          deliveryPersons.find((person: any) => person.id === user.id)
                        );
                        updateBulkStatus({ deliveryManId: user.id });
                      }}
                    >
                      {user.fullName}
                    </MenuItem>
                  )
                )}
              </>
            ) : (
              <Text fontSize="sm" color="secondary.400" py={2} px={3}>
                {t('No delivery man available')}
              </Text>
            )}
          </MenuList>
        </Menu>
      )}

      <Menu>
        <MenuButton
          as={Button}
          variant="outline"
          rightIcon={<ArrowDown2 />}
          color={status ? status?.fgColor : ''}
          borderColor={status?.fgColor}
        >
          {status ? t(startCase(status?.label)) : t('Status')}
        </MenuButton>
        <MenuList className="p-1 min-w-[250px]">
          <MenuOptionGroup
            value={status?.value || ''}
            onChange={(value) => {
              setStatus(orderStatus.getStatusDetails(value as string));
              updateBulkStatus({ status: value as string });
            }}
          >
            {orderStatus.all().map((status: TOrderStatus) =>
              !hasDeliveryTypeOrders && status.value === 'on_delivery' ? null : (
                <MenuItemOption
                  key={status.value}
                  value={status.value}
                  color={status.fgColor}
                  icon={null}
                >
                  {t(status.label)}
                </MenuItemOption>
              )
            )}
          </MenuOptionGroup>
        </MenuList>
      </Menu>
    </div>
  );
}
