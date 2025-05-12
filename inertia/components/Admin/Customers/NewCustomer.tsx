import NewCustomerSchema from '@/schemas/NewCustomerSchema';
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import axios from 'axios';
import { Form, Formik } from 'formik';
import { Add } from 'iconsax-react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import FieldRenderer from '../FieldRenderer';

// Field items configuration
const fieldItems = [
  { name: 'firstName', label: 'First name', type: 'text', placeholder: 'Customer first name' },
  { name: 'lastName', label: 'Last name', type: 'text', placeholder: 'Customer last name' },
  { name: 'email', label: 'Email address', type: 'email', placeholder: 'Email address' },
  { name: 'phoneNumber', label: 'Contact number', type: 'text', placeholder: 'Contact number' },
  { name: 'address', label: 'Address', type: 'text', placeholder: 'Address' },
];

export default function NewCustomer({ refresh }: { refresh: () => void }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef<HTMLButtonElement>(null);
  const { t } = useTranslation();

  return (
    <>
      <Button
        variant="solid"
        colorScheme="primary"
        className="bg-primary-400 hover:bg-primary-500"
        rightIcon={<Add />}
        onClick={onOpen}
      >
        {t('Create new customer')}
      </Button>
      <Drawer isOpen={isOpen} placement="right" size="md" onClose={onClose} finalFocusRef={btnRef}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader className="border-b border-black/5">
            {t('Create new customer')}
          </DrawerHeader>

          <Formik
            initialValues={{
              firstName: '',
              lastName: '',
              email: '',
              phoneNumber: '',
              address: '',
              roleId: 6,
              isEmailVerified: true,
            }}
            onSubmit={async (values, actions) => {
              try {
                actions.setSubmitting(true);
                const { data } = await axios.post('/api/users', values);
                if (data?.success) {
                  onClose();
                  refresh();
                  toast.success(t(data?.message) || t('Customer created successfully'));
                }
              } catch (e) {
                toast.error(t(e.response.data.message) || t('Something went wrong'));
              } finally {
                actions.setSubmitting(false);
              }
            }}
            validationSchema={NewCustomerSchema}
          >
            {({ isSubmitting }) => (
              <Form>
                <DrawerBody>
                  <div className="flex flex-col gap-5">
                    {fieldItems.map((item) => (
                      <FieldRenderer key={item.name} item={item} />
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
                    rightIcon={<Add />}
                  >
                    {t('Create')}
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
