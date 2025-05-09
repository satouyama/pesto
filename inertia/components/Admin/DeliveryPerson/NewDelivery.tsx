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
  useDisclosure,
} from '@chakra-ui/react';
import { Add } from 'iconsax-react';
import { toast } from 'sonner';
import NewCustomerSchema from '@/schemas/NewCustomerSchema';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import FieldRenderer from '../FieldRenderer';

// Field items configuration
const fieldItems = [
  {
    name: 'firstName',
    label: 'First name',
    type: 'text',
    placeholder: 'Delivery person first name',
  },
  { name: 'lastName', label: 'Last name', type: 'text', placeholder: 'Delivery person last name' },
  { name: 'email', label: 'Email address', type: 'email', placeholder: 'Email address' },
  { name: 'phoneNumber', label: 'Contact number', type: 'text', placeholder: 'Contact number' },
  { name: 'address', label: 'Address', type: 'text', placeholder: 'Address' },
];

export default function NewDelivery({ refresh }: { refresh: () => void }) {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <Button
        variant="solid"
        colorScheme="primary"
        className="bg-primary-400 hover:bg-primary-500"
        rightIcon={<Add />}
        onClick={onOpen}
      >
        {t('Create new')}
      </Button>
      <Drawer isOpen={isOpen} placement="right" size="md" onClose={onClose} finalFocusRef={btnRef}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader className="border-b border-black/5">
            {t('Create new delivery person')}
          </DrawerHeader>

          <Formik
            initialValues={{
              firstName: '',
              lastName: '',
              email: '',
              phoneNumber: '',
              address: '',
              roleId: 7,
              isEmailVerified: true,
            }}
            onSubmit={async (values, actions) => {
              try {
                actions.setSubmitting(true);
                const { data } = await axios.post('/api/users', values);
                if (data?.success) {
                  onClose();
                  refresh();
                  toast.success(t('Delivery person created successfully'));
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
                <DrawerBody>
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
