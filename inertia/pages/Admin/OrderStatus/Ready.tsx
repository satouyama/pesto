import Layout from '@/components/common/Layout';
import OrderStatus from '@/components/Admin/OrderStatus/OrderStatus';

export default function Ready() {
  return (
    <Layout title="Order status">
      <div className="p-6">
        <OrderStatus index={2} />
      </div>
    </Layout>
  );
}
