import LoginSchema from '@/schemas/LoginSchema';
import { Button, Checkbox } from '@chakra-ui/react';
import { Link, router } from '@inertiajs/react';
import axios from 'axios';
import { Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import FormField from './FormField';
import { ROLE } from '@/utils/platform_roles';

export default function Login() {
  const { t } = useTranslation();

  return (
    <Formik
      initialValues={{
        email: '',
        password: '',
        remember: false,
      }}
      onSubmit={async (values, actions) => {
        try {
          actions.setSubmitting(true);
          const { data } = await axios.post('/api/auth/login', values);
          if (!data.login && data.requiredVerification) {
            toast.success(t(data.message));
          }
          if (data.login && data.user) {
            switch (data?.user?.roleId) {
              case ROLE.ADMIN:
                router.visit('/admin/dashboard');
                break;

              case ROLE.MANAGER:
                router.visit('/manager/dashboard');
                break;

              case ROLE.POS:
                router.visit('/pos/pos');
                break;

              case ROLE.DISPLAY:
                router.visit('/display');
                break;

              case ROLE.KITCHEN:
                router.visit('/kitchen');
                break;

              case ROLE.CUSTOMER:
                router.visit('/');
                break;

              default:
                router.visit('/');
            }
          }
        } catch (e) {
          toast.error(t(e.response.data.message) || t('Invalid Credentials'));
        } finally {
          actions.setSubmitting(false);
        }
      }}
      validationSchema={LoginSchema}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-4">
          {/* Email */}
          <FormField
            name="email"
            type="email"
            label={t('Email')}
            placeholder={t('Enter your email')}
          />

          {/* Password */}

          <FormField
            name="password"
            type="password"
            label={t('Password')}
            placeholder={t('Enter password')}
          />

          <div className="flex justify-between items-center flex-wrap">
            <Checkbox
              colorScheme="primary"
              className="text-secondary-800 rounded whitespace-nowrap"
              defaultChecked
            >
              {t('Remember me')}
            </Checkbox>
            <Link
              href="/forgot-password"
              className="font-medium underline hover:text-primary-400 transition whitespace-nowrap"
            >
              {t('Forgot password?')}
            </Link>
          </div>
          <div className="flex justify-end">
            <Button
              variant="solid"
              colorScheme="primary"
              isLoading={isSubmitting}
              type="submit"
              className="button-primary"
            >
              {t('Login')}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
