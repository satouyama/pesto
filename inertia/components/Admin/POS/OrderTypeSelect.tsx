import { PageProps } from '@/types';
import { Box, Flex, HStack, useRadio, useRadioGroup } from '@chakra-ui/react';
import { usePage } from '@inertiajs/react';
import { TickCircle } from 'iconsax-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// Radio button
const RadioButton = (props: any) => {
  const { getInputProps, getRadioProps } = useRadio(props);

  return (
    <Box as="label" data-disabled={!!props.disabled} className="data-[disabled=true]:hidden">
      <input {...getInputProps()} disabled={props.disabled} />
      <Box
        {...getRadioProps()}
        cursor="pointer"
        borderRadius="6px"
        bg="secondary.100"
        _hover={{
          bg: 'secondary.200',
        }}
        _checked={{
          'bg': 'primary.400',
          'color': 'white',
          '& svg': {
            display: 'inline-block',
            opacity: 1,
            transition: 'opacity 0.3s ease-in-out',
          },
          'width': 'auto',
        }}
        px={6}
        py={2.5}
        fontSize={18}
        fontWeight={600}
        lineHeight={7}
        transition="background-color 0.3s ease, color 0s ease"
        h="48px"
        className="select-none"
      >
        <HStack>
          <TickCircle
            variant="Bold"
            className="hidden opacity-0 transition-opacity duration-300 ease-in-out"
          />
          <span>{props.children}</span>
        </HStack>
      </Box>
    </Box>
  );
};

type OrderType = 'dine_in' | 'delivery' | 'pickup';

// render order type selection button group
export default function OrderTypeRadioGroup({
  defaultValue,
  onChange,
}: {
  defaultValue: string;
  onChange?: (nextValue: OrderType) => void;
}) {
  const { t } = useTranslation();
  const {
    props: { branding },
  } = usePage() as { props: PageProps };

  const options = [
    { label: 'Comer no local', value: 'dine_in', disabled: !branding?.business?.dineIn },
    { label: 'Delivery', value: 'delivery', disabled: !branding?.business?.delivery },
    { label: 'Pick-up', value: 'pickup', disabled: !branding?.business?.pickup },
  ];

  // Find the first non-disabled option
  const defaultOption = (options.find((option) => !option.disabled)?.value ||
    options[0].value) as OrderType;

  const { getRootProps, getRadioProps, setValue } = useRadioGroup({
    name: 'orderType',
    onChange,
    defaultValue: defaultOption,
  });

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  return (
    <Flex {...getRootProps({ className: 'flex-wrap gap-2' })}>
      {options.map((option) => (
        <RadioButton key={option.value} {...getRadioProps(option)}>
          {t(option.label)}
        </RadioButton>
      ))}
    </Flex>
  );
}
