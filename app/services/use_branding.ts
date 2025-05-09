import BusinessSetup from '#models/business_setup';
import Setting from '#models/setting';

const useBranding = async () => {
  const business = await BusinessSetup.query().firstOrFail();
  const branding = await Setting.query()
    .where({
      key: 'branding',
    })
    ?.firstOrFail();

  const theme = await Setting.query()
    .where({
      key: 'theme',
    })
    ?.firstOrFail();

  return {
    business,
    siteUrl: branding?.value1,
    langs: branding?.value5,
    theme: theme.value6 ? JSON.parse(theme.value6) : null,
  };
};

export default useBranding;
