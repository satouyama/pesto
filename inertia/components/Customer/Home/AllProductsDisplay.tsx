import Empty from '@/components/common/Empty';
import useTableData from '@/data/use_table_data';
import { BaseMenuItem } from '@/types/customer_type';
import { HStack, IconButton, Link, Spinner } from '@chakra-ui/react';
import { ArrowLeft, ArrowLeft2, ArrowRight2 } from 'iconsax-react';
import Pagination from 'rc-pagination';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ProductItem from './ProductItem';

const PAGE_SIZE = 20;

export default function AllProductsDisplay() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);

  // fetch products data
  const { items, isLoading, meta } = useTableData('/api/user/menu-items/global', {
    page,
    limit: PAGE_SIZE,
  });
  console.log("display")

  // loading
  if (isLoading) {
    return (
      <div className="py-10 container">
        <HStack className="justify-center">
          <Spinner />
        </HStack>
      </div>
    );
  }

  return (
    <div className="py-10">
      <div className="container">
        <div className="flex items-center gap-4 py-9">
          <IconButton
            as={Link}
            href="/"
            aria-label="left arrow"
            className="rounded-full min-w-12 min-h-12 bg-transparent border border-secondary-200"
          >
            <ArrowLeft />
          </IconButton>
          <h2 className="text-2xl">{t('All menu items')}</h2>
        </div>

        {items?.length ? (
          <div className="@container w-full">
            <div className="grid grid-cols-1 @sm:grid-cols-2 @3xl:grid-cols-3 @5xl:grid-cols-4 @7xl:grid-cols-5 gap-4">
              {items?.map((item: BaseMenuItem) => <ProductItem key={item.id} {...item} />)}
            </div>

            <div className="flex justify-end flex-row items-center gap-2">
              <Pagination
                showTotal={(total, range) =>
                  t('Showing {{start}}-{{end}} of {{total}}', {
                    start: range[0],
                    end: range[1],
                    total,
                  })
                }
                current={meta.currentPage}
                total={meta.total}
                pageSize={meta.perPage}
                hideOnSinglePage
                onChange={(page) => setPage(page)}
                className="flex justify-between flex-row items-center gap-2"
                prevIcon={<ArrowLeft2 size="18" />}
                nextIcon={<ArrowRight2 size="18" />}
              />
            </div>
          </div>
        ) : (
          <Empty />
        )}
      </div>
    </div>
  );
}
