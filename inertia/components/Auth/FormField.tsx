import { Box, FormControl, FormErrorMessage, Icon, IconButton, Input } from '@chakra-ui/react';
import { useField } from 'formik';
import { Eye, EyeSlash } from 'iconsax-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match, P } from 'ts-pattern';
import { withMask } from "use-mask-input";

type Props = {
  name: string;
  type: string;
  label?: string;
  placeholder?: string;
  mask?: string
  inputRef?: React.Ref<any>
};

export default function FormField({ name, ...props }: Props) {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  const [field, meta] = useField(name);

  return (
    <FormControl isInvalid={!!(meta.touched && meta.error)}>
      <Box className="relative border rounded-2xl px-4 py-1.5 border-secondary-300 focus-within:border-primary-500">
        {props.label && props.type !== 'password' && (
          <label className="text-xs leading-4 font-normal text-secondary-500">{props.label}</label>
        )}
        {match(props)
          .with({ type: 'password' }, () => (
            <>
              <Input
                rounded="full"
                type={show ? 'text' : props.type}
                placeholder={t(props.placeholder || '')}
                className="bg-white border-none leading-6 p-0 rounded-none font-normal text-base focus:outline-none focus:ring-0"
                {...field}
              />

              <IconButton
                aria-label="Show password"
                size="sm"
                variant="ghost"
                onClick={() => setShow(!show)}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10"
              >
                <Icon as={show ? Eye : EyeSlash} className="size-5 text-secondary-600" />
              </IconButton>
            </>
          ))
          .with({ mask: P.string }, () => (
            <Input
              rounded="full"
              type={props.type}
              placeholder={t(props.placeholder || '')}
              className="bg-white border-none p-0 h-fit leading-6 rounded-none font-normal text-base focus:outline-none focus:ring-0"
              {...field}
              ref={withMask(props.mask!)}
            />
          ))
          .otherwise(() => (
            <Input
              rounded="full"
              type={props.type}
              placeholder={t(props.placeholder || '')}
              className="bg-white border-none p-0 h-fit leading-6 rounded-none font-normal text-base focus:outline-none focus:ring-0"
              {...field}
            />
          ))}
      </Box>
      <FormErrorMessage className="px-4">{t(meta.error || '')}</FormErrorMessage>
    </FormControl>
  );
}
