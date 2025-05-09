import SignUpSchema from '@/schemas/SignUpSchema';
import { Button } from '@chakra-ui/react';
import axios from 'axios';
import { Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import FormField from './FormField';

export default function SignUp() {
  const { t } = useTranslation();

  // Fields configuration
  const fields = [
    { name: 'firstName', label: 'First name', type: 'text', placeholder: 'Enter your first name' },
    { name: 'lastName', label: 'Last name', type: 'text', placeholder: 'Enter your last name' },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'Enter your email' },
    { name: 'phoneNumber', label: 'Phone', type: 'tel', placeholder: 'Enter your phone' },
    { name: 'address', label: 'Address', type: 'text', placeholder: 'Enter your address' },
    { name: 'password', label: 'Password', type: 'password', placeholder: 'Enter password' },
    {
      name: 'confirmPassword',
      label: 'Confirm Password',
      type: 'password',
      placeholder: 'Re-enter password',
    },
  ];

  return (
    <Formik
      initialValues={{
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        address: '',
        phoneNumber: '',
        confirmPassword: '',
      }}
      onSubmit={async (values, actions) => {
        try {
          actions.setSubmitting(true);
          const { data } = await axios.post('/api/auth/register', values);
          if (data.success && data?.user?.id) {
            toast.success(t(data.message));
          }
        } catch (e) {
          toast.error(t(e.response.data.message) || t('Something went wrong'));
        } finally {
          actions.setSubmitting(false);
        }
      }}
      validationSchema={SignUpSchema}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-4">
          {fields.map((field) => (
            <FormField key={field.name} {...field} />
          ))}

          <div className="flex justify-end">
            <Button
              variant="solid"
              colorScheme="primary"
              isLoading={isSubmitting}
              type="submit"
              className="button-primary"
            >
              {t('Sign Up')}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
