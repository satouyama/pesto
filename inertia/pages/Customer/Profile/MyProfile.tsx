import ProfileLayout from '@/components/Customer/Profile/ProfileLayout';
import useAuth from '@/data/use_auth';
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Icon,
  IconButton,
  Input,
  Spinner,
} from '@chakra-ui/react';
import axios from 'axios';
import { Field, Form, Formik } from 'formik';
import { Eye, EyeSlash } from 'iconsax-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const FIELD_LIST = [
  {
    id: '3b07e15c-f596-4fc4-977d-3aaaeee49669',
    groupTitle: 'Personal information',
    items: [
      {
        name: 'firstName',
        label: 'First name',
        type: 'text',
        placeholder: 'Enter your first name',
      },
      { name: 'lastName', label: 'Last name', type: 'text', placeholder: 'Enter your last name' },
      {
        name: 'email',
        label: 'Email',
        type: 'email',
        placeholder: 'Enter your email',
        readOnly: true,
      },
      { name: 'phoneNumber', label: 'Phone', type: 'tel', placeholder: 'Enter your phone number' },
    ],
  },

  {
    id: '538e037c-4a44-4966-ad82-a80475f60717',
    groupTitle: 'Delivery address',
    items: [{ name: 'address', label: 'Address', type: 'text', placeholder: 'Enter your address' }],
  },
];

const PASSWORD_FIELD = [
  {
    id: 'c37bbf72-178d-4232-9d24-d5e21bfbf437',
    groupTitle: 'Password',
    items: [
      {
        name: 'password',
        label: 'Current password',
        type: 'password',
        placeholder: 'Enter your current password',
      },
      {
        name: 'newPassword',
        label: 'New password',
        type: 'password',
        placeholder: 'Enter your new password',
      },
      {
        name: 'confirmPassword',
        label: 'Confirm password',
        type: 'password',
        placeholder: 'Confirm new password',
      },
    ],
  },
];

export default function MyProfile() {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);

  const { data: auth, isLoading, mutate } = useAuth();

  if (isLoading) {
    return (
      <ProfileLayout>
        <div className="w-full h-full flex items-center justify-center">
          <Spinner />
        </div>
      </ProfileLayout>
    );
  }

  return (
    <ProfileLayout>
      <div className="w-full max-w-[900px] mx-auto">
        <div className="w-full px-6 pb-10">
          <Formik
            initialValues={{
              firstName: auth?.user?.firstName || '',
              lastName: auth?.user?.lastName || '',
              email: auth?.user?.email || '',
              phoneNumber: auth?.user?.phoneNumber || '',
              address: auth?.user?.address || '',
              password: '',
              newPassword: '',
              confirmPassword: '',
            }}
            onSubmit={async (values, actions) => {
              try {
                const { data, status } = await axios.put('/api/users/profile/update', values);
                if ((data?.success && status === 200) || status === 201) {
                  mutate();
                  toast.success(t('Profile updated successfully'));
                }
              } catch (error) {
                toast.error(t(error.response.data.message || 'Something went wrong'));
              } finally {
                actions.setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting }) => (
              <Form className="flex gap-4 w-full">
                <div className="w-full">
                  {FIELD_LIST.map((group) => (
                    <div key={group.id} className="w-full py-4 flex flex-col gap-y-2">
                      <h3 className="text-base font-normal">{t(group.groupTitle)}</h3>
                      {group.items.map((item) => (
                        <Field name={item.name} key={item.name}>
                          {({ field, meta }: { field: any; meta: any }) => (
                            <FormControl isInvalid={!!(meta.touched && meta.error)}>
                              <Box
                                data-label={!item.label}
                                className={`relative border rounded-2xl px-4 py-1.5 border-secondary-300 data-[label=true]:py-4 ${item.readOnly && 'text-secondary-500 opacity-70'}`}
                              >
                                {item.label && (
                                  <FormLabel className="m-0 text-secondary-500 text-xs leading-5 font-normal">
                                    {t(item.label)}
                                  </FormLabel>
                                )}
                                <Input
                                  rounded="full"
                                  type={item.type === 'password' && show ? 'text' : item.type}
                                  placeholder={t(item.placeholder)}
                                  readOnly={item.readOnly}
                                  className="bg-white border-none p-0 h-fit rounded-none font-normal text-base"
                                  {...field}
                                />

                                {item.type === 'password' && (
                                  <IconButton
                                    aria-label="Show password"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setShow(!show)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10"
                                  >
                                    <Icon
                                      as={show ? Eye : EyeSlash}
                                      className="size-5 text-secondary-600"
                                    />
                                  </IconButton>
                                )}
                              </Box>

                              <FormErrorMessage>{t(meta.error) || ''}</FormErrorMessage>
                            </FormControl>
                          )}
                        </Field>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="w-full flex flex-col items-end">
                  {PASSWORD_FIELD.map((group) => (
                    <div key={group.id} className="w-full py-4 flex flex-col gap-y-2">
                      <h3 className="text-base font-normal">{t(group.groupTitle)}</h3>
                      {group.items.map((item) => (
                        <Field name={item.name} key={item.name}>
                          {({ field, meta }: { field: any; meta: any }) => (
                            <FormControl isInvalid={!!(meta.touched && meta.error)}>
                              <Box
                                data-label={!item.label}
                                className="relative border rounded-2xl px-4 py-1.5 border-secondary-300 data-[label=true]:py-4"
                              >
                                {item.label && (
                                  <FormLabel className="m-0 text-secondary-500 text-xs leading-5 font-normal">
                                    {t(item.label)}
                                  </FormLabel>
                                )}
                                <Input
                                  rounded="full"
                                  type={item.type === 'password' && show ? 'text' : item.type}
                                  placeholder={t(item.placeholder)}
                                  className="bg-white border-none p-0 h-fit rounded-none font-normal text-base"
                                  {...field}
                                />

                                {item.type === 'password' && (
                                  <IconButton
                                    aria-label="Show password"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setShow(!show)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10"
                                  >
                                    <Icon
                                      as={show ? Eye : EyeSlash}
                                      className="size-5 text-secondary-600"
                                    />
                                  </IconButton>
                                )}
                              </Box>

                              <FormErrorMessage>{t(meta.error) || ''}</FormErrorMessage>
                            </FormControl>
                          )}
                        </Field>
                      ))}
                    </div>
                  ))}
                  <Button
                    className="bg-secondary-700 text-white rounded-full px-4 py-2.5 hover:bg-secondary-900 text-sm font-medium"
                    type="submit"
                    disabled={isSubmitting}
                    isLoading={isSubmitting}
                  >
                    {t('UPDATE PROFILE')}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </ProfileLayout>
  );
}
