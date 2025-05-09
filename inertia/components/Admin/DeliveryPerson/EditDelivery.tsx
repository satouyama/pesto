import { useRef } from 'react';
import axios from 'axios';
import { Form, Formik } from 'formik';
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
import { toast } from 'sonner';
import { BaseUserType } from '@/types/customer_type';
import NewCustomerSchema from '@/schemas/NewCustomerSchema';
import { Edit2 } from 'iconsax-react';
import { useTranslation } from 'react-i18next';
import FieldRenderer from '../FieldRenderer';

export default function EditDelivery({
  isIconButton,
  delivery,
  refresh,
}: {
  isIconButton?: boolean;
  delivery: BaseUserType;
  refresh: () => void;
}) {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef<HTMLButtonElement>(null);

  const { id, firstName, lastName, email, phoneNumber, address, isSuspended, isEmailVerified } =
    delivery || {};

  // Field items configuration
  const fieldItems = [
    {
      name: 'firstName',
      label: 'First name',
      type: 'text',
      placeholder: 'Delivery person first name',
    },
    {
      name: 'lastName',
      label: 'Last name',
      type: 'text',
      placeholder: 'Delivery person last name',
    },
    { name: 'email', label: 'Email address', type: 'email', placeholder: 'Email address' },
    { name: 'phoneNumber', label: 'Contact number', type: 'text', placeholder: 'Contact number' },
    { name: 'address', label: 'Address', type: 'text', placeholder: 'Address' },
    { name: 'isSuspended', label: 'Acc. Status', type: 'switch' },
    { name: 'isEmailVerified', label: 'Verify email', type: 'switch' },
  ];

  return (
    <>
      {isIconButton ? (
        <IconButton
          aria-label={t('Edit')}
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
          <DrawerHeader className="border-b border-black/5">
            {t('Edit delivery person')}
          </DrawerHeader>

          <Formik
            initialValues={{
              firstName: firstName ?? '',
              lastName: lastName ?? '',
              email: email ?? '',
              phoneNumber: phoneNumber ?? '',
              address: address ?? '',
              password: '',
              roleId: 7,
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
                  toast.success(t(data?.message) || t('Delivery person updated successfully'));
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
