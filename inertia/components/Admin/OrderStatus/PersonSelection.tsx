import useDebounce from '@/hooks/useDebounce';
import fetcher from '@/lib/fetcher';
import {
  Box,
  Button,
  HStack,
  Icon,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spinner,
  Text,
} from '@chakra-ui/react';
import axios from 'axios';
import { ArrowDown2, Truck, User } from 'iconsax-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import useSWR from 'swr';

export default function PersonSelection({
  data,
  refresh,
}: {
  data: Record<string, any>;
  refresh: () => void;
}) {
  const { t } = useTranslation();
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState<Record<string, any>>(
    () => data.deliveryMan || {}
  );
  const [deliverySearch, setDeliverySearch] = React.useState('');

  const deliverySearchText = useDebounce(deliverySearch, 300);

  // fetch delivery persons
  const { data: deliveryPersons, isLoading } = useSWR(
    `/api/users?type=delivery&search=${deliverySearchText}`,
    fetcher
  );

  // update delivery person
  const updateDeliveryPerson = async (deliveryPersonId: number, orderId: number) => {
    try {
      const { data } = await axios.patch(`/api/orders/${orderId}`, {
        deliveryManId: deliveryPersonId,
      });

      if (data?.content?.id) {
        toast.success(t('Order updated successfully'));
        refresh();
      }
    } catch (e) {
      toast.error(t(e.response.data.message || 'Something went wrong'));
    }
  };

  useEffect(() => {
    setSelectedDeliveryPerson(data.deliveryMan || '');
  }, [data]);

  if (data.status !== 'processing') {
    return (
      <div className="flex-1 font-normal text-left border py-2 px-3 rounded-md border-secondary-200 bg-secondary-50">
        <HStack>
          <Icon as={data.status === 'on_delivery' ? Truck : User} size="sm" />
          <span>{selectedDeliveryPerson?.fullName}</span>
        </HStack>
      </div>
    );
  }

  return (
    <Menu>
      <HStack gap={0}>
        <MenuButton
          as={Button}
          size="md"
          variant="outline"
          onClick={(e) => e.stopPropagation()}
          color={selectedDeliveryPerson ? 'inherit' : 'secondary.400'}
          bg="white"
          fontWeight="normal"
          rightIcon={<ArrowDown2 />}
        >
          {selectedDeliveryPerson?.fullName || t('Select delivery man')}
        </MenuButton>
      </HStack>
      <MenuList className="p-1">
        {isLoading ? (
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
                    updateDeliveryPerson(user.id, data.id);
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
  );
}
