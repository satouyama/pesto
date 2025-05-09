import CustomerLayout from '@/components/Customer/CustomerLayout';
import { SmsNotification } from 'iconsax-react';
import { useTranslation } from 'react-i18next';

export default function VerifyEmail(props: { success: boolean; message: string }) {
  const { t } = useTranslation();
  const success = props.success;
  const message = props.message;

  return (
    <CustomerLayout>
      <div className="md:h-[calc(100vh-80px)] pt-14 px-4">
        <div className="max-w-[600px] mx-auto bg-white py-12 px-8 md:px-16 rounded-2xl shadow-auth">
          {success ? (
            <div className="flex flex-col items-center justify-center text-center gap-2">
              <SmsNotification size={164} className="text-primary-400" variant="Bulk" />
              <h2 className="text-2xl font-semibold text-center">{t('Verification success')}</h2>
              <p className="text-center">{t(message)}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center gap-2">
              <SmsNotification size={164} className="text-primary-400" variant="Bulk" />
              <h2 className="text-2xl font-semibold text-center">{t('Verification Failed')}</h2>
              <p className="text-center">{t(message)}</p>
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}
