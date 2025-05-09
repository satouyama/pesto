import useWindowSize from '@/hooks/useWindowSize';
import { convertToCurrencyFormat } from '@/utils/currency_formatter';
import { startCase } from '@/utils/string_formatter';
import {
  Badge,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { Eye } from 'iconsax-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeleteMenuItem from './DeleteMenuItem';
import EditMenuItem from './EditMenuItem';

export default function ViewMenuItem({
  menuItem,
  refresh,
}: {
  menuItem: Record<string, any>;
  refresh: () => void;
}) {
  const { t } = useTranslation();
  const btnRef = useRef<HTMLButtonElement>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const windowSize = useWindowSize();

  return (
    <>
      <Box>
        <Button
          variant="outline"
          colorScheme="secondary"
          className="border-secondary-200 text-secondary-800 hover:bg-secondary-100"
          rightIcon={<Eye />}
          onClick={onOpen}
        >
          {t('View')}
        </Button>
      </Box>

      <Drawer
        isOpen={isOpen}
        placement={windowSize.width < 640 ? 'bottom' : 'right'}
        size="md"
        onClose={onClose}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent className="h-[80%] sm:h-auto rounded-t-xl sm:rounded-t-none">
          <DrawerHeader className="border-b border-black/5">
            {t('Menu item')}
            <DrawerCloseButton className="sm:hidden" />
          </DrawerHeader>
          <DrawerBody>
            <div className="flex flex-col gap-5 px-4 py-6">
              <div>
                <img
                  src={menuItem.image.url}
                  alt={menuItem.name}
                  className="w-full rounded-md aspect-[3/2]"
                />
              </div>

              {/* Item name */}
              <div className="flex flex-col gap-2">
                <Text as="p" className="text-secondary-500">
                  {t('Item name')}
                </Text>
                <Text as="h5" className="font-semibold">
                  {menuItem.name}
                </Text>
              </div>

              <div className="flex flex-col gap-2">
                <Text as="p" className="text-secondary-500">
                  {t('Price')}
                </Text>
                <Text as="h5" className="font-semibold">
                  {convertToCurrencyFormat(menuItem.price)}
                </Text>
              </div>

              {/* Discount and discount type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Text className="text-secondary-500">{t('Discount')}</Text>
                  <Text as="h5" fontSize="lg" fontWeight="semibold">
                    {menuItem.discountType === 'amount'
                      ? `$ ${menuItem.discount}`
                      : `${menuItem.discount}%`}
                  </Text>
                </div>

                <div className="flex flex-col gap-2">
                  <Text className="text-secondary-500">{t('Discount type')}</Text>
                  <Badge
                    size="lg"
                    variant="solid"
                    colorScheme={menuItem.discountType === 'percentage' ? 'primary' : 'blue'}
                    className="w-fit"
                  >
                    {t(menuItem.discountType)}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Food type */}
                <div className="flex flex-col gap-2">
                  <Text as="p" className="text-secondary-500">
                    {t('Food type')}
                  </Text>
                  <div className="flex items-center gap-2">
                    <Badge
                      size="lg"
                      variant="solid"
                      colorScheme={menuItem.foodType === 'veg' ? 'green' : 'primary'}
                      className="w-fit"
                    >
                      {startCase(menuItem.foodType)}
                    </Badge>
                    {menuItem.foodType === 'veg' ? (
                      <img src="/mark.svg" alt="Vag" />
                    ) : (
                      <img src="/non-veg-mark.svg" alt="Non veg" />
                    )}
                  </div>
                </div>

                {/* Addon status */}
                <div className="flex flex-col gap-2">
                  <Text as="p" className="text-secondary-500">
                    {t('Addons')}
                  </Text>
                  <Badge
                    size="lg"
                    variant="solid"
                    colorScheme={menuItem.addons ? 'blue' : 'primary'}
                    className="w-fit"
                  >
                    {t(menuItem.addons ? 'YES' : 'NO')}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Text as="p" className="text-secondary-500">
                  {t('Applicable charges')}
                </Text>

                {menuItem.charges?.length ? (
                  <ul className="list-disc list-inside">
                    {menuItem.charges?.map((charge: any) => (
                      <li key={charge.id}> {t(charge.name)} </li>
                    ))}
                  </ul>
                ) : (
                  <Badge variant="subtle" colorScheme="green" className="w-fit">
                    {t('No charge applicable')}
                  </Badge>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Text className="text-secondary-500">{t('Discount')}</Text>
                <Text as="p" className="text-base">
                  {isExpanded ? menuItem.description : menuItem.description.slice(0, 100)}
                  {menuItem.description.length > 100 ? (isExpanded ? '' : '...') : null}
                </Text>

                {menuItem.description.length > 100 ? (
                  <Button
                    variant="link"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-fit text-sm font-normal"
                  >
                    {t(isExpanded ? 'Show less' : 'Show more')}
                  </Button>
                ) : null}
              </div>
            </div>
          </DrawerBody>

          <DrawerFooter
            borderTopWidth="1px"
            borderColor="secondary.200"
            className="bg-white w-full"
          >
            <Button variant="outline" w="full" mr={3} onClick={onClose}>
              {t('Close')}
            </Button>
            <DeleteMenuItem id={menuItem?.id} refresh={refresh} />
            <EditMenuItem editData={menuItem} refresh={refresh} />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
