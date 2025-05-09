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
import axios from 'axios';
import { Trash } from 'iconsax-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export default function DeleteReservation({
  isIconButton = false,
  id,
  refresh,
}: {
  isIconButton?: boolean;
  id: number;
  refresh: () => void;
}) {
  const { t } = useTranslation();

  const handleDeleteReservation = async () => {
    try {
      const { data } = await axios.delete(`/api/reservations/${id}`);
      if (data?.success) {
        toast.success(t(data?.message));
        refresh();
      }
    } catch (e) {
      toast.error(t(e.response.data.message) || t('Something went wrong'));
    }
  };

  return (
    <Popover>
      {({ onClose }) => (
        <>
          <PopoverTrigger>
            {isIconButton ? (
              <IconButton
                aria-label="Delete"
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
            <PopoverHeader pt={4} fontWeight="bold" border="0">
              {t('Delete reservation')}
            </PopoverHeader>
            <PopoverArrow />
            <PopoverBody whiteSpace="normal">
              {t('Are you sure you want to delete this reservation?')}
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
                  colorScheme="red"
                  className="bg-red-400 hover:bg-red-500"
                  onClick={handleDeleteReservation}
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
