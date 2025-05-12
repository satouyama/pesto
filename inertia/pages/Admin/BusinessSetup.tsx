import BusinessInfo from '@/components/Admin/BusinessSetup/BusinessInfo';
import OpenHours from '@/components/Admin/BusinessSetup/OpenHours';
import PlatformSetup from '@/components/Admin/BusinessSetup/PlatformSetup';
import SiteSettings from '@/components/Admin/BusinessSetup/SiteSettings';
import ThemeColors from '@/components/Admin/BusinessSetup/ThemeColors';
import Layout from '@/components/common/Layout';
import fetcher from '@/lib/fetcher';
import { Flex, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

export default function BusinessSetup() {
  const { t } = useTranslation();
  const { data, isLoading, mutate } = useSWR('/api/business-setup/detail', fetcher);

  return (
    <Layout title={t('Settings')}>
      <div className="p-4 sm:p-6 relative @container">
        <Tabs>
          <Flex className="justify-between w-full overflow-x-auto">
            <TabList className="whitespace-nowrap ">
              <Tab>{t('Informações do negocio')}</Tab>
              <Tab>{t('Configuração da plataforma')}</Tab>
              <Tab>{t('Configurações de site')}</Tab>
              <Tab>{t('Horário de funcionamento')}</Tab>
              <Tab>{t('Cores e thema')}</Tab>
            </TabList>
          </Flex>

          <TabPanels>
            <TabPanel>
              <BusinessInfo
                isLoading={isLoading}
                businessInfo={data}
                refresh={() => mutate(data)}
              />
            </TabPanel>
            <TabPanel>
              <PlatformSetup
                isLoading={isLoading}
                businessInfo={data}
                refresh={() => mutate(data)}
              />
            </TabPanel>

            <TabPanel>
              <SiteSettings
                isLoading={isLoading}
                businessInfo={data}
                refresh={() => mutate(data)}
              />
            </TabPanel>

            <TabPanel>
              <OpenHours />
            </TabPanel>

            <TabPanel>
              <ThemeColors />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </Layout>
  );
}
