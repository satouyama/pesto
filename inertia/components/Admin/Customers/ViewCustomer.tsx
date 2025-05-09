import {
  Badge,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { Copy, Eye } from 'iconsax-react';
import useUserSingle from '@/data/use_user_single';
import handleCopy from '@/utils/handle_copy';
import { useRef } from 'react';
import DeleteCustomer from './DeleteCustomer';
import EditCustomer from './EditCustomer';
import { CustomerType } from '@/types/customer_type';
import { useTranslation } from 'react-i18next';

type ViewCustomerProps = {
  customer: CustomerType;
  refresh: () => void;
};

export default function ViewCustomer({ customer, refresh }: ViewCustomerProps) {
  const { data } = useUserSingle(customer?.id);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef<HTMLButtonElement>(null);
  const { t } = useTranslation();

  const { fullName, email, phoneNumber, address, isSuspended } = data || {};

  return (
    <>
      <Button
        variant="outline"
        colorScheme="secondary"
        className="border-secondary-200 text-secondary-800 hover:bg-secondary-100"
        rightIcon={<Eye />}
        onClick={onOpen}
      >
        {t('View')}
      </Button>
      <Drawer isOpen={isOpen} placement="right" size="md" onClose={onClose} finalFocusRef={btnRef}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerBody py="6">
            <div className="p-8 space-y-6 shadow-primary rounded-md mb-7">
              {/* Full name */}
              <div className="border-b border-black/5 pb-6 space-y-1">
                <span className="text-secondary-500 text-sm font-medium">{t('Customer name')}</span>
                <h2 className="text-3xl font-bold text-secondary-700">{fullName}</h2>
                <Badge colorScheme={isSuspended ? 'red' : 'green'}>
                  {t(isSuspended ? 'Suspended' : 'Active')}
                </Badge>
              </div>

              {[
                // same view: email and contact-number render
                { title: 'Email', value: email },
                { title: 'Contact number', value: phoneNumber },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <span className="text-secondary-500 text-sm font-medium">{t(item.title)}</span>
                    <p className="text-lg text-secondary-700 font-medium">{item.value}</p>
                  </div>
                  <Button
                    variant="outline"
                    rightIcon={<Copy size={16} />}
                    onClick={() => handleCopy(item.value)}
                  >
                    {t('Copy')}
                  </Button>
                </div>
              ))}

              {/* Address */}
              <div>
                <span className="text-secondary-500 text-sm font-medium">{t('Address')}</span>
                <p className="text-lg text-secondary-700 font-medium">{address}</p>
              </div>
            </div>
          </DrawerBody>
          <DrawerFooter
            borderTopWidth="1px"
            borderColor="secondary.200"
            className="absolute bg-white w-full bottom-0"
          >
            <Button variant="outline" w="full" mr={3} onClick={onClose}>
              {t('Close')}
            </Button>
            <DeleteCustomer id={data?.id} refresh={refresh} />
            <EditCustomer customer={data} refresh={refresh} />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
