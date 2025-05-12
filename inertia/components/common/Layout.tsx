import useWindowSize from '@/hooks/useWindowSize';
import { PageProps, User } from '@/types';
import {
  Container,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  Spinner,
} from '@chakra-ui/react';
import { Head, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';
import Header from './Header';
import SideNav from './SideNav';

export default function Layout({
  children,
  title,
  enableDrawerSidebar,
}: {
  children: React.ReactNode;
  title: string;
  enableDrawerSidebar?: boolean;
}) {
  const windowSize = useWindowSize();
  const [isWindowLoading, setIsWindowLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(windowSize.width > 768);

  const btnRef = React.useRef();
  const { mutate } = useSWRConfig();

  // page props
  const {
    props: { branding, auth },
  } = usePage() as { props: PageProps };

  // Set default sidebar and window loading
  useEffect(() => {
    if (localStorage.getItem('sidebar')) {
      setIsExpanded(localStorage.getItem('sidebar') === 'expanded');
      setIsWindowLoading(false);
    } else {
      setIsExpanded(windowSize.width > 768);
      setIsWindowLoading(false);
    }
  }, []);

  useEffect(() => {
    const subscribeToNotifications = async () => {
      const subscription = transmit.subscription(`users/${auth?.id}`);
      await subscription.create();

      subscription.onMessage((data: Record<string, string>) => {
        toast.message(data.title, {
          description: data.body,
          closeButton: true,
        });
        mutate((key: string) => key.startsWith('/notifications'));
      });
    };

    subscribeToNotifications();

    return () => {
      transmit.close();
    };
  }, [mutate]);

  // Toggle or update sidebar state
  const toggleSidebar = (state?: 'expanded' | 'collapsed') => {
    if (state) {
      localStorage.setItem('sidebar', state);
      setIsExpanded(state === 'expanded');
    } else {
      localStorage.setItem('sidebar', isExpanded ? 'collapsed' : 'expanded');
      setIsExpanded(!isExpanded);
    }
  };

  // return loading
  if (isWindowLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Spinner />
      </div>
    );
  }

  // console.log(branding?.business)

  return (
    <>
      <Head title={title + ' - ' + branding?.business?.name} />
      <Container maxW="100%" paddingX="0">
        <div className="h-screen flex">
          {windowSize.width < 768 || enableDrawerSidebar ? (
            <Drawer isOpen={isExpanded} onClose={() => toggleSidebar('collapsed')} placement="left">
              <DrawerOverlay />
              <DrawerContent>
                <DrawerBody className="overflow-hidden p-0">
                  {auth?.roleId !== 4 && auth?.roleId !== 5 && <SideNav isExpanded={true} />}
                </DrawerBody>
              </DrawerContent>
            </Drawer>
          ) : (
            auth?.roleId !== 4 && auth?.roleId !== 5 && <SideNav isExpanded={isExpanded} />
          )}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header
              title={title}
              user={auth as User}
              isExpanded={isExpanded}
              setIsExpanded={() => toggleSidebar()}
              ref={btnRef}
            />
            <div className="h-full box-border overflow-x-hidden overflow-y-auto">{children}</div>
          </div>
        </div>
      </Container>
    </>
  );
}
