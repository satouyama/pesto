import { Text } from '@chakra-ui/react';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';

export default function Clock() {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDate(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Text as="p" noOfLines={1} className="font-bold">
      {format(date, 'h:mm a')}
    </Text>
  );
}
