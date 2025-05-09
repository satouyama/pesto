import CustomerLayout from '@/components/Customer/CustomerLayout';
import { Button } from '@chakra-ui/react';
import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

export default function Confirm() {
  const { t } = useTranslation();

  return (
    <CustomerLayout>
      <main className="bg-white h-[50vh] flex flex-col justify-center ">
        <div className="flex flex-col items-center justify-center text-center gap-2 px-4">
          <img src="/Done.svg" alt="Done" width={120} height={120} />

          <h2 className="text-2xl font-semibold text-center">{t('Your order has been placed!')}</h2>
          <p className="text-center mb-3">{t("Congratulations! We've received your order.")}</p>
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              as={Link}
              href="/"
              variant="outline"
              colorScheme="secondary"
              className="button-outline"
            >
              {t('Back to home')}
            </Button>
            <Button
              as={Link}
              href="/user/my-orders"
              variant="outline"
              colorScheme="secondary"
              className="button-outline"
            >
              {t('Track order')}
            </Button>
          </div>
        </div>
      </main>
    </CustomerLayout>
  );
}
