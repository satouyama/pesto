import axios from 'axios';
import { Button, FormControl, FormErrorMessage, HStack, IconButton, Input } from '@chakra-ui/react';
import { Field, Form, Formik } from 'formik';
import { Minus } from 'iconsax-react';
import { toast } from 'sonner';
import NewCustomerSchema from '@/schemas/NewCustomerSchema';
import { useTranslation } from 'react-i18next';

export default function CustomerInsertForm({
  close,
  onSubmit,
}: {
  close: () => void;
  onSubmit?: (res: any) => void;
}) {
  const { t } = useTranslation();

  // field items
  const fieldItems = [
    { name: 'firstName', label: '', type: 'text', placeholder: 'First name' },
    { name: 'lastName', label: '', type: 'text', placeholder: 'Last name' },
    { name: 'email', label: '', type: 'email', placeholder: 'Email address' },
    { name: 'phoneNumber', label: '', type: 'text', placeholder: 'Contact number' },
    { name: 'address', label: '', type: 'text', placeholder: 'Address' },
  ];

  return (
    <Formik
      initialValues={{
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        address: '',
      }}
      validationSchema={NewCustomerSchema}
      onSubmit={async (values, actions) => {
        actions.setSubmitting(true);

        const formData = {
          ...values,
          roleId: 6,
          address: values.address,
        };

        try {
          const { data } = await axios.post('/api/users', formData);
          if (data?.success) {
            onSubmit?.(data);
            toast.success(t(data?.message) || t('Customer created successfully'));
          }
        } catch (e) {
          toast.error(t(e.response.data.message) || t('Something went wrong'));
        } finally {
          actions.setSubmitting(false);
          actions.resetForm();
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form className="flex flex-col gap-2">
          {fieldItems.map((item) => (
            <Field key={item.name} name={item.name}>
              {({ field, meta }: any) => (
                <FormControl isInvalid={meta.errors && meta.touched}>
                  <HStack gap="0">
                    <Input
                      {...field}
                      type={item.type}
                      placeholder={t(item.placeholder)}
                      roundedRight={item.name === 'firstName' ? 0 : 'auto'}
                    />
                    {item.name === 'firstName' && (
                      <IconButton
                        type="button"
                        aria-label="Minus"
                        roundedLeft="0"
                        border="1px"
                        borderColor="secondary.200"
                        onClick={() => close?.()}
                      >
                        <Minus />
                      </IconButton>
                    )}
                  </HStack>
                  <FormErrorMessage>{t(meta.errors)}</FormErrorMessage>
                </FormControl>
              )}
            </Field>
          ))}

          <Button
            type="submit"
            colorScheme="primary"
            className="bg-primary-400 hover:bg-primary-500"
            isLoading={isSubmitting}
          >
            {t('Create new customer')}
          </Button>
        </Form>
      )}
    </Formik>
  );
}
