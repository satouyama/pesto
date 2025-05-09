import axios from 'axios';
import {
  Button,
  ButtonGroup,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
} from '@chakra-ui/react';
import { Trash } from 'iconsax-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export default function DeleteOrder({
  isIconButton = false,
  id,
  refresh,
  onClose,
}: {
  isIconButton: boolean;
  id: number;
  refresh: () => void;
  onClose?: () => void;
}) {
  const { t } = useTranslation();

  const onDelete = async () => {
    try {
      const { data, status } = await axios.delete(`/api/orders/${id}`);
      if (status === 200) {
        toast.success(data.message);
        refresh();
        if (onClose) onClose();
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(t('Something went wrong'));
      }
    }
  };

  return (
    <Popover>
      {({ onClose }) => (
        <>
          <PopoverTrigger>
            {isIconButton ? (
              <IconButton
                aria-label={t('Delete')}
                icon={<Trash size="18" />}
                colorScheme="red"
                className="hover:bg-red-100"
                variant="outline"
              />
            ) : (
              <Button variant="outline" w="full" colorScheme="red" mr={3}>
                {t('Delete')}
              </Button>
            )}
          </PopoverTrigger>
          <PopoverContent>
            <PopoverArrow />
            <PopoverHeader pt={4} fontWeight="bold" border="0">
              {t('Delete order')}
            </PopoverHeader>
            <PopoverBody whiteSpace="normal">
              {t('Are you sure you want to delete this order?')}
            </PopoverBody>
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
                  type="button"
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
