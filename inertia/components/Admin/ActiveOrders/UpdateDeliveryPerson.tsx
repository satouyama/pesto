import axios from 'axios';
import fetcher from '@/lib/fetcher';
import {
  Button,
  HStack,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { toast } from 'sonner';
import useSWR from 'swr';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowDown2, Truck, User } from 'iconsax-react';

export default function UpdateDeliveryPerson({
  type,
  status,
  deliveryPerson,
  orderId,
  refresh,
}: {
  type: string;
  status: string;
  orderId: number;
  deliveryPerson?: {
    fullName: string;
    id: number;
  };
  refresh?: () => void;
}) {
  const { t } = useTranslation();
  const [isDeliveryPersonUpdating, setIsDeliveryPersonUpdating] = useState(false);

  // fetch delivery person
  const { data, isLoading } = useSWR(
    () => type === 'delivery' && '/api/users?type=delivery',
    fetcher
  );

  // update delivery person
  const updateDeliveryPerson = async (deliveryPersonId: number) => {
    setIsDeliveryPersonUpdating(true);

    try {
      const { data } = await axios.patch(`/api/orders/${orderId}`, {
        deliveryManId: deliveryPersonId,
      });

      if (data?.content?.id) {
        toast.success(t('Delivery person updated successfully'));
        refresh?.();
      }
    } catch (e) {
      toast.error(t(e.response.data.message || 'Something went wrong'));
    } finally {
      setIsDeliveryPersonUpdating(false);
    }
  };

  // if status pending return null
  if (status === 'pending') return null;

  // if status processing or confirmed return select delivery person
  if (status !== 'processing' && status !== 'ready') {
    return (
      <div className="flex-1 font-normal text-left border py-2 px-3 rounded-md border-secondary-200 bg-secondary-50">
        <HStack>
          <Icon as={status === 'on_delivery' ? Truck : User} size="sm" />
          <span>{deliveryPerson?.fullName}</span>
        </HStack>
      </div>
    );
  }

  return (
    <Menu matchWidth>
      <HStack className="flex-1 w-full gap-0">
        <MenuButton
          as={Button}
          variant="outline"
          className="flex-1 rounded-r-none"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex-1 text-left">
            {isDeliveryPersonUpdating ? (
              <span className="text-secondary-400"> {t('Loading...')} </span>
            ) : (
              deliveryPerson?.fullName || (
                <span className="text-secondary-400 font-normal">
                  {t('Select delivery person')}
                </span>
              )
            )}
          </div>
        </MenuButton>
        <div className="border border-secondary-200 bg-secondary-100 h-10 text-secondary-400 w-10 p-0 flex items-center justify-center rounded-r-md">
          <ArrowDown2 size={16} />
        </div>
      </HStack>

      <MenuList className="p-1">
        {isLoading ? (
          <HStack justifyContent="center" py="2.5">
            <Spinner size="sm" />
            <Text className="text-secondary-500"> {t('Loading...')} </Text>
          </HStack>
        ) : data?.length === 0 ? (
          <Text>{t("Delivery person isn't available")}</Text>
        ) : (
          data?.map((user: { id: number; fullName: string }) => (
            <MenuItem
              key={user.id}
              onClick={(e) => {
                e.stopPropagation();
                updateDeliveryPerson(user.id);
              }}
            >
              {t(user.fullName)}
            </MenuItem>
          ))
        )}
      </MenuList>
    </Menu>
  );
}
