import {
  Add,
  Bag2,
  Box,
  Box2,
  Chart,
  Clock,
  Diagram,
  Home2,
  Icon,
  LanguageSquare,
  Mask,
  MenuBoard,
  Note1,
  Personalcard,
  Profile2User,
  ReceiptDisscount,
  Reserve,
  Setting2,
  Setting4,
  SmsStar,
  Task,
  UserOctagon,
} from 'iconsax-react';
import { ROLE } from './platform_roles';

type SidebarItem = {
  id: string;
  key: string;
  title: string;
  href?: string;
  leftIcon: Icon;
  rightIcon?: Icon;
  isActive: (currentPath: string) => boolean;
  className?: string;
  role: number[];
  subItems?: {
    id: string;
    key: string;
    title: string;
    href: string;
  }[];
};

export const AUTH_SIDEBAR: {
  id: string;
  groupTitle: string;
  items: SidebarItem[];
}[] = [
  // Dashboard, POS, and Reservation
  {
    id: '21f89c8b-9b75-43fd-98da-21d42759b64f',
    groupTitle: '',
    items: [
      {
        id: '7878ac55-123e-4657-a30a-b6c40ee54ae4',
        key: 'dashboard',
        title: 'Dashboard',
        href: '/dashboard',
        leftIcon: Home2,
        isActive: (currentPath: string) => currentPath === 'dashboard' || currentPath === '',
        className:
          'border border-dashed border-secondary-800 bg-transparent text-secondary-800 hover:bg-secondary-800 hover:text-white data-[menu-active=true]:bg-secondary-800 data-[menu-active=true]:text-white',
        role: [ROLE.ADMIN, ROLE.MANAGER],
      },
      {
        id: '6a5e0df1-7853-4f2a-82b1-fc7d6708c655',
        key: 'pos',
        title: 'POS',
        href: '/pos',
        leftIcon: Bag2,
        rightIcon: Add,
        isActive: (currentPath: string) => currentPath === 'pos',
        className:
          'border border-dashed border-primary-500 bg-transparent text-primary-500 hover:bg-primary-400 hover:text-white data-[menu-active=true]:bg-primary-400 data-[menu-active=true]:text-white',
        role: [ROLE.ADMIN, ROLE.MANAGER, ROLE.POS],
      },
      {
        id: 'dbbe3758-94b9-4ced-a5bb-0ec6203ac24a',
        key: 'reservation',
        title: 'Reservation',
        href: '/create-reservation',
        leftIcon: Reserve,
        rightIcon: Add,
        isActive: (currentPath: string) => currentPath === 'create-reservation',
        className:
          'border border-dashed border-purple-500 bg-transparent text-purple-500 hover:bg-purple-500 hover:text-white data-[menu-active=true]:bg-purple-500 data-[menu-active=true]:text-white',
        role: [ROLE.ADMIN, ROLE.MANAGER, ROLE.POS],
      },
    ],
  },

  // order management
  {
    id: 'ca75cba5-cbe1-42cd-a600-f1186269dcdd',
    groupTitle: 'Order management',
    items: [
      {
        id: '3a4ae8f6-56a2-4386-8b14-24b27356f303',
        key: 'active-orders',
        title: 'Active orders',
        href: '/active-orders',
        leftIcon: Box,
        isActive: (currentPath: string) => currentPath === 'active-orders',
        role: [ROLE.ADMIN, ROLE.MANAGER, ROLE.POS, ROLE.KITCHEN],
      },
      {
        id: 'e4272e5e-9aae-412d-a7b8-45237d5a795c',
        key: 'order-status',
        title: 'Order status',
        href: '',
        leftIcon: Box2,
        isActive: (currentPath: string) => currentPath === 'order-status',
        role: [ROLE.ADMIN, ROLE.MANAGER, ROLE.POS],
        subItems: [
          {
            id: '561df19c-b02d-4068-ab38-060ae11c7775',
            key: 'pending',
            title: 'Pending',
            href: '/order-status/pending',
          },
          {
            id: '1d435727-50f1-427a-9075-fec634db83e2',
            key: 'processing',
            title: 'Processing',
            href: '/order-status/processing',
          },
          {
            id: 'f24addb0-4d9e-4812-8421-1f29567a92ed',
            key: 'ready',
            title: 'Ready',
            href: '/order-status/ready',
          },
          {
            id: '153bf18d-ec97-497f-be2e-187a9ba94b58',
            key: 'on-delivery',
            title: 'On Delivery',
            href: '/order-status/on-delivery',
          },
          {
            id: '22a82448-a12e-4573-a36f-750d665dd38b',
            key: 'completed',
            title: 'Completed',
            href: '/order-status/completed',
          },
          {
            id: '22a23453-a12e-2343-a36f-234d345dd39c',
            key: 'failed',
            title: 'Failed',
            href: '/order-status/failed',
          },
          {
            id: 'c6ffe17c-d3fa-47b2-81b8-14ee42f4bc15',
            key: 'cancelled',
            title: 'Cancelled',
            href: '/order-status/cancelled',
          },
        ],
      },
      {
        id: '029de673-6702-49de-9433-b6a9e92a9d02',
        key: 'order-history',
        title: 'Order history',
        leftIcon: Clock,
        href: '/order-history',
        isActive: (currentPath: string) => currentPath === 'order-history',
        role: [ROLE.ADMIN, ROLE.MANAGER, ROLE.POS],
      },
      {
        id: 'c11305cc-5c98-40f9-b57f-4f990e6b7ef6',
        key: 'active-reservations',
        title: 'Active reservations',
        leftIcon: Note1,
        href: '/active-reservations',
        isActive: (currentPath: string) => currentPath === 'active-reservations',
        role: [ROLE.ADMIN, ROLE.MANAGER, ROLE.POS],
      },
      {
        id: 'ef143a62-a316-43f0-9b51-0abda87e62c7',
        key: 'reservation-history',
        title: 'Reservation history',
        leftIcon: Clock,
        href: '/reservation-history',
        isActive: (currentPath: string) => currentPath === 'reservation-history',
        role: [ROLE.ADMIN, ROLE.MANAGER, ROLE.POS],
      },
    ],
  },

  // Menu management
  {
    id: '8286adc5-dfc0-4468-8135-380f987e08d2',
    groupTitle: 'Menu management',
    items: [
      {
        id: '26c7db50-af48-4a63-8dd0-913ab3b3283a',
        key: 'menu-items',
        title: 'Menu items',
        href: '/menu-items',
        leftIcon: MenuBoard,
        isActive: (currentPath: string) => currentPath === 'menu-items',
        role: [ROLE.ADMIN, ROLE.MANAGER],
      },
      {
        id: '16284ffb-6061-41ce-8957-6b529fb1b53c',
        key: 'addon-items',
        title: 'Add-on items',
        href: '/addon-items',
        leftIcon: Mask,
        isActive: (currentPath: string) => currentPath === 'addon-items',
        role: [ROLE.ADMIN, ROLE.MANAGER],
      },
      {
        id: '8d63ec3f-f992-4b22-bf46-f0df22a60252',
        key: 'categories',
        title: 'Categories',
        href: '/categories',
        leftIcon: Task,
        isActive: (currentPath: string) => currentPath === 'categories',
        role: [ROLE.ADMIN, ROLE.MANAGER],
      },
      {
        id: 'ca0ebdb0-e7c8-4907-8bba-c5cfc63b9e84',
        key: 'tax-and-charges',
        title: 'Tax and charges',
        href: '/tax-and-charges',
        leftIcon: ReceiptDisscount,
        isActive: (currentPath: string) => currentPath === 'tax-and-charges',
        role: [ROLE.ADMIN, ROLE.MANAGER],
      },
    ],
  },

  // Promotions
  {
    id: 'b5d36312-d872-4edc-a04e-5ae22e259154',
    groupTitle: 'Promotions',
    items: [
      {
        id: '365b6611-2e15-40a8-8ab5-cd909f1b8ef5',
        key: 'promotions',
        title: 'Promotions',
        href: '/promotions',
        leftIcon: SmsStar,
        isActive: (currentPath: string) => currentPath === 'promotions',
        role: [ROLE.ADMIN, ROLE.MANAGER],
      },
    ],
  },

  // Report and analysis
  {
    id: '84567b4e-a0fe-4316-98e7-02bf9f423f36',
    groupTitle: 'Report and analysis',
    items: [
      {
        id: '365b6611-2e15-40a8-8ab5-cd909f1b8ef5',
        key: 'earning-report',
        title: 'Earning report',
        href: '/earning-report',
        leftIcon: Chart,
        isActive: (currentPath: string) => currentPath === 'earning-report',
        role: [ROLE.ADMIN, ROLE.MANAGER],
      },
      {
        id: '21e236ae-61f2-46e5-aaee-43156f57d359',
        key: 'order-report',
        title: 'Order report',
        href: '/order-report',
        leftIcon: Diagram,
        isActive: (currentPath: string) => currentPath === 'order-report',
        role: [ROLE.ADMIN, ROLE.MANAGER],
      },
    ],
  },

  // User management
  {
    id: '95a79762-4e9c-4363-975c-1abb759cf37d',
    groupTitle: 'User management',
    items: [
      {
        id: '4e461862-3296-4f94-8090-ef563fa6b90b',
        key: 'customers',
        title: 'Customers',
        href: '/customers',
        leftIcon: Profile2User,
        isActive: (currentPath: string) => currentPath === 'customers',
        role: [ROLE.ADMIN, ROLE.MANAGER],
      },

      {
        id: '49382a59-a27a-42e6-b058-cf05614a53d8',
        key: 'delivery-person',
        title: 'Delivery person',
        href: '/delivery-person',
        leftIcon: UserOctagon,
        isActive: (currentPath: string) => currentPath === 'delivery-person',
        role: [ROLE.ADMIN, ROLE.MANAGER],
      },
      {
        id: 'a7d23ce4-e838-4384-ab8f-a548c78e3d21',
        key: 'employees',
        href: '/employees',
        title: 'Employees',
        leftIcon: Personalcard,
        isActive: (currentPath: string) => currentPath === 'employees',
        role: [ROLE.ADMIN, ROLE.MANAGER],
      },
    ],
  },

  // System
  {
    id: '4557596d-740c-4490-8943-b1b25f474d8e',
    groupTitle: 'System',
    items: [
      {
        id: 'f41cfd57-b651-43da-a2e1-2fa93a460643',
        key: 'languages',
        title: 'Languages',
        href: '/languages',
        leftIcon: LanguageSquare,
        isActive: (currentPath: string) => currentPath === 'languages',
        role: [ROLE.ADMIN],
      },
      {
        id: 'de2d5559-c10f-41f0-ba01-02870d066dde',
        key: 'payment-methods',
        title: 'Payment Methods',
        href: '/payment-methods',
        leftIcon: Setting4,
        isActive: (currentPath: string) => currentPath === 'payment-methods',
        role: [ROLE.ADMIN],
      },
      {
        id: 'afeabe34-6fc3-437c-8142-013dd1d34f8d',
        key: 'settings',
        title: 'Settings',
        href: '/settings',
        leftIcon: Setting2,
        isActive: (currentPath: string) => currentPath === 'settings',
        role: [ROLE.ADMIN],
      },
    ],
  },
];

export class AuthNavigationSidebar {
  getSidebar(role: number) {
    return AUTH_SIDEBAR.map((group) => {
      const items = group.items.filter((item) => item.role.includes(role));
      return items.length > 0 ? { ...group, items } : null;
    }).filter((group): group is NonNullable<typeof group> => group !== null);
  }
}
