import {
  Button,
  ButtonGroup,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
} from '@chakra-ui/react';
import { Trash } from 'iconsax-react';
import { useTranslation } from 'react-i18next';

export default function BulkDeleteButton({
  onDelete,
}: {
  onDelete: (row?: any) => void;
}) {
  const { t } = useTranslation();

  return (
    <Popover>
      {({ onClose }) => (
        <>
          <PopoverTrigger>
            <Button variant="outline" colorScheme="red" leftIcon={<Trash />}>
              {t('Delete')}
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <PopoverHeader pt={4} fontWeight="bold" border="0">
              {t('Confirm delete')}
            </PopoverHeader>
            <PopoverArrow />
            <PopoverBody whiteSpace="normal">{t('Are you sure you want to delete?')}</PopoverBody>
            <PopoverFooter
              border="0"
              display="flex"
              alignItems="center"
              justifyContent="flex-end"
              pb={4}
            >
              <ButtonGroup size="sm">
                <Button
                  colorScheme="secondary"
                  className="bg-secondary-200 text-secondary-800 hover:bg-secondary-300"
                  onClick={onClose}
                >
                  {t('Cancel')}
                </Button>
                <Button
                  colorScheme="red"
                  className="bg-red-400 hover:bg-red-500"
                  onClick={onDelete}
                >
                  {t('Delete')}
                </Button>
              </ButtonGroup>
            </PopoverFooter>
          </PopoverContent>
        </>
      )}
    </Popover>
  );
}
