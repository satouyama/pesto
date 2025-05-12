import NewCustomerSchema from '@/schemas/NewCustomerSchema';
import { BaseUserType } from '@/types/customer_type';
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  IconButton,
  useDisclosure,
} from '@chakra-ui/react';
import axios from 'axios';
import { Form, Formik } from 'formik';
import { Edit2 } from 'iconsax-react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import FieldRenderer from '../FieldRenderer';

// Field items configuration
const fieldItems = [
  { name: 'firstName', label: 'Primeiro nome', type: 'text', placeholder: 'Customer first name' },
  { name: 'lastName', label: 'Sobrenome', type: 'text', placeholder: 'Customer last name' },
  { name: 'email', label: 'Endereço', type: 'email', placeholder: 'Email address' },
  { name: 'phoneNumber', label: 'Contact number', type: 'text', placeholder: 'Contact number' },
  { name: 'address', label: 'Address', type: 'text', placeholder: 'Address' },
  { name: 'isSuspended', label: 'Acc. Status', type: 'switch', placeholder: 'Suspended' },
  {
    name: 'isEmailVerified',
    label: 'Email verified',
    type: 'switch',
    placeholder: 'Email verified',
  },
];

export default function EditCustomer({
  isIconButton = false,
  customer,
  refresh,
}: {
  isIconButton?: boolean;
  customer: BaseUserType;
  refresh: () => void;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef<HTMLButtonElement>(null);
  const { t } = useTranslation();

  const { id, firstName, lastName, email, phoneNumber, address, isSuspended, isEmailVerified } =
    customer || {};

  return (
    <>
      {isIconButton ? (
        <IconButton
          aria-label="Edit"
          icon={<Edit2 size="18" />}
          colorScheme="blue"
          className="hover:bg-blue-100"
          variant="outline"
          onClick={onOpen}
        />
      ) : (
        <Button
          aria-label="Edit"
          rightIcon={<Edit2 size="18" />}
          colorScheme="blue"
          width="full"
          className="hover:bg-blue-100"
          variant="outline"
          onClick={onOpen}
        >
          {t('Edit')}
        </Button>
      )}
      <Drawer isOpen={isOpen} placement="right" size="md" onClose={onClose} finalFocusRef={btnRef}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader className="border-b border-black/5">{t('Edit customer')}</DrawerHeader>

          <Formik
            initialValues={{
              firstName: firstName ?? '',
              lastName: lastName ?? '',
              email: email ?? '',
              phoneNumber: phoneNumber ?? '',
              address: address ?? '',
              password: '',
              roleId: 6,
              isSuspended: !isSuspended,
              isEmailVerified: !!isEmailVerified,
            }}
            onSubmit={async (values, actions) => {
              try {
                actions.setSubmitting(true);
                const { data } = await axios.put(`/api/users/${id}`, {
                  ...values,
                  isSuspended: values.isSuspended ? 0 : 1,
                });
                if (data?.success) {
                  onClose();
                  refresh();
                  toast.success(t(data?.message) || 'Customer updated successfully');
                }
              } catch (e) {
                toast.error(t(e.response.data.message) || t('Something went wrong'));
              } finally {
                actions.setSubmitting(false);
              }
            }}
            validationSchema={NewCustomerSchema}
          >
            {({ isSubmitting, setFieldValue }) => (
              <Form>
                <DrawerBody className="space-y-4">
                  <div className="flex flex-col gap-5">
                    {fieldItems.map((item) => (
                      <FieldRenderer key={item.name} item={item} setFieldValue={setFieldValue} />
                    ))}
                  </div>
                </DrawerBody>
                <DrawerFooter
                  borderTopWidth="1px"
                  borderColor="secondary.200"
                  className="absolute bg-white w-full bottom-0"
                >
                  <Button variant="outline" w="full" mr={3} onClick={onClose}>
                    {t('Cancel')}
                  </Button>
                  <Button
                    variant="solid"
                    colorScheme="primary"
                    w="full"
                    type="submit"
                    isLoading={isSubmitting}
                    className="bg-primary-400 hover:bg-primary-500"
                  >
                    {t('Save')}
                  </Button>
                </DrawerFooter>
              </Form>
            )}
          </Formik>
        </DrawerContent>
      </Drawer>
    </>
  );
}
