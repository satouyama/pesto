import { PageProps } from '@/types';
import { AuthNavigationSidebar } from '@/utils/auth_navigation_sidebar';
import { formatRoleUrl } from '@/utils/format_role_url';
import { Button, Icon } from '@chakra-ui/react';
import { Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import NavItem from './NavItem';

// Sidebar items list
const sidebar = new AuthNavigationSidebar();

export default function SideNav({ isExpanded }: { isExpanded: boolean }) {
  const { t } = useTranslation();
  const {
    props: { branding, auth },
  } = usePage() as { props: PageProps };

  const active = window.location.pathname.split('/')[2];

  return (
    <div
      className={`${isExpanded ? 'max-w-80 min-w-80' : 'max-w-20 min-w-20 no-scrollbar'} h-screen w-full bg-white px-4 border-r border-black/10 overflow-y-scroll scrollbar transition-all duration-500`}
    >
      <div className="h-[76px] flex items-center justify-center">
        <Link
          href={formatRoleUrl('/dashboard', auth?.role.name)}
          className="flex items-center justify-center"
        >
          <img
            src={isExpanded ? branding?.business?.logo?.url : branding?.business?.favicon?.url}
            alt={branding?.business?.name}
            className="h-10"
          />
        </Link>
      </div>

      {auth &&
        sidebar.getSidebar(auth.roleId)?.map((group) =>
          !group?.groupTitle ? (
            <div key={group.id} className="flex flex-col gap-2 py-4 border-t border-black/5">
              {group?.items.map((item) => (
                <Button
                  key={item.id}
                  w="full"
                  as={Link}
                  href={formatRoleUrl(item.href || '', auth.role.name)}
                  data-menu-active={item.isActive(active)}
                  className={`${item.className}  ${isExpanded ? 'justify-between' : 'justify-center'} flex items-center transition-all duration-500 gap-2`}
                >
                  <Icon as={item.leftIcon} variant="Bold" size="20" />
                  {isExpanded && <span className="inline-block flex-1">{t(item.title)}</span>}
                  {isExpanded && item.rightIcon && <Icon as={item?.rightIcon} size="20" />}
                </Button>
              ))}
            </div>
          ) : (
            <div key={group.id}>
              <NavItem
                title={t(group.groupTitle)}
                isExpanded={isExpanded}
                nav={group.items.map((item) => ({
                  ...item,
                  name: t(item.title),
                  icon: <Icon as={item.leftIcon} variant="Bold" size="20" />,
                  link: formatRoleUrl(item.href || '', auth.role.name) || false,
                  subNav:
                    item.subItems &&
                    item.subItems?.map((subItem) => ({
                      ...subItem,
                      name: t(subItem.title),
                      link: formatRoleUrl(subItem.href || '', auth.role.name),
                    })),
                }))}
              />
            </div>
          )
        )}
    </div>
  );
}
