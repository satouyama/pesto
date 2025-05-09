import * as React from 'react';
import Layout from '@/components/common/Layout';
import useCategories from '@/data/use_categories';
import fetcher from '@/lib/fetcher';
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { FilterSearch, SearchNormal } from 'iconsax-react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import useDebounce from '@/hooks/useDebounce';
import { match, P } from 'ts-pattern';
import POSCheckoutForm from '@/components/Admin/POS/POSCheckoutForm';
import POSItem from '@/components/Admin/POS/POSItem';
import useWindowSize from '@/hooks/useWindowSize';

export default function POS() {
  const { t } = useTranslation();
  const [selectedCategoryId, setSelectedCategoryId] = React.useState('');
  const [categorySearchText, setCategorySearchText] = React.useState('');
  const [searchMenuItem, setSearchMenuItem] = React.useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();

  const windowSize = useWindowSize();

  const categorySearchedText = useDebounce(categorySearchText, 300);
  const searchedMenuItemText = useDebounce(searchMenuItem, 300);

  // fetch all categories
  const { categories, isLoading: isCategoryLoading } = useCategories(
    '/api/user/categories/global',
    {
      search: categorySearchedText,
    }
  );

  // fetch product list by selected category
  const { data: menuItems, isLoading: isMenuItemsLoading } = useSWR(
    () =>
      `/api/user/menu-items/global?category=${selectedCategoryId}&search=${searchedMenuItemText}&available=true`,
    fetcher
  );

  // render category filter list
  const renderCategoryFilterList = () => {
    const content = (
      <div className="@md:sticky top-0 left-0 inset-y-0 @md:max-w-[200px] w-full @[1300px]:h-[calc(100vh-76px)] space-y-3 p-3 bg-white @md:border-r border-black/10 overflow-y-auto">
        <div className="h-[86px] border-b border-black/10 space-y-2 flex flex-col justify-end pb-4">
          <span className="text-secondary-400 text-sm font-medium">{t('Categories')}</span>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchNormal size={18} />
            </InputLeftElement>
            <Input
              type="search"
              placeholder={t('Search')}
              className="bg-white"
              value={categorySearchText}
              onChange={(e) => setCategorySearchText(e.target.value)}
            />
          </InputGroup>
        </div>
        <div className="space-y-2">
          {/* Show category list */}
          {match({ isCategoryLoading, categories })
            // show loader when category is fetching or updating
            .with({ isCategoryLoading: true }, () => (
              <HStack justifyContent="center" py="2.5" fontSize="14px">
                <Spinner size="sm" />
                <Text className="text-secondary-500"> {t('Loading...')} </Text>
              </HStack>
            ))

            // if categories data exist render categories
            .with({ categories: P.not(P.nullish) }, ({ categories }) =>
              categories.length ? (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    colorScheme="secondary"
                    data-selected={selectedCategoryId === ''}
                    className="bg-gray-100 text-gray-700 hover:bg-gray-200 w-full data-[selected=true]:bg-primary-400 data-[selected=true]:text-white"
                    onClick={() => {
                      setSelectedCategoryId('');
                      setCategorySearchText('');
                      setSearchMenuItem('');
                    }}
                  >
                    {t('All items')}
                  </Button>

                  {categories.map((category: { id: number; name: string }) => (
                    <Button
                      key={category.id}
                      type="button"
                      variant="ghost"
                      colorScheme="secondary"
                      data-selected={selectedCategoryId === `${category.id}`}
                      className="bg-gray-100 text-gray-700 hover:bg-gray-200 w-full data-[selected=true]:bg-primary-400 data-[selected=true]:text-white"
                      onClick={() => {
                        setSelectedCategoryId(`${category.id}`);
                        setCategorySearchText('');
                        setSearchMenuItem('');
                      }}
                    >
                      {t(category.name)}
                    </Button>
                  ))}
                </>
              ) : (
                <Text color="secondary.500">{t('Empty category')}</Text>
              )
            )

            // show empty category statusflex-
            .otherwise(() => (
              <Text color="secondary.500">{t('Empty category')}</Text>
            ))}
        </div>
      </div>
    );

    // if window width greater than 1300px render categories as sidebar
    if (windowSize.width > 1300) {
      return content;
    }

    // if window width less than 1300px render categories as drawer
    return (
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        placement={windowSize.width < 900 ? 'bottom' : 'left'}
      >
        <DrawerOverlay />
        <DrawerContent
          className={`${windowSize.width < 900 ? 'rounded-t-2xl' : 'rounded-t-none'} px-0`}
        >
          <DrawerHeader>
            {t('Categories')}
            <DrawerCloseButton />
          </DrawerHeader>
          <DrawerBody className="max-h-[80vh] px-0">{content}</DrawerBody>
        </DrawerContent>
      </Drawer>
    );
  };

  // render POS product
  const renderPOSItems = (menuItems: any) => {
    const content = (
      <div className="p-3 w-full @container">
        <div className="@xs:h-[86px] flex @xs:items-end flex-col @xs:flex-row border-b gap-2 border-black/10 mb-3 pb-4">
          {windowSize.width <= 1300 && (
            <Button
              variant="outline"
              className="bg-white"
              onClick={onOpen}
              leftIcon={<FilterSearch />}
            >
              <span>{t('Category')}</span>
            </Button>
          )}
          <InputGroup className="flex-1">
            <InputLeftElement pointerEvents="none">
              <SearchNormal size={18} />
            </InputLeftElement>
            <Input
              type="search"
              placeholder={t('Search')}
              className="bg-white"
              value={searchMenuItem}
              onChange={(e) => setSearchMenuItem(e.target.value)}
            />
          </InputGroup>
        </div>

        {/* Render menu items */}
        {match({ menuItems, isMenuItemsLoading })
          // show loader when menu items is fetching or updating
          .with({ isMenuItemsLoading: true }, () => (
            <HStack height="200px" justifyContent="center">
              <Spinner size="sm" />
              <Text>{t('Loading...')}</Text>
            </HStack>
          ))

          // if menu items exist render menu items
          .with({ menuItems: P.array(P.not(P.nullish)) }, ({ menuItems }) =>
            menuItems.length ? (
              <div className="pos-menu-container">
                <div className="pos-menu-grid gap-4">
                  {menuItems?.map((item: any) => <POSItem key={item.id} {...item} />)}
                </div>
              </div>
            ) : (
              <Text color="secondary.500">{t('Empty items')}</Text>
            )
          )

          // show empty menu items status
          .otherwise(() => (
            <Text color="secondary.500">{t('Empty items')}</Text>
          ))}
      </div>
    );
    return content;
  };

  return (
    <Layout title={t('POS / Create new order')} enableDrawerSidebar={windowSize.width < 1200}>
      <div className="flex w-full @container">
        {renderCategoryFilterList()}
        <div className="flex w-full">
          {renderPOSItems(menuItems)}
          <POSCheckoutForm />
        </div>
      </div>
    </Layout>
  );
}
