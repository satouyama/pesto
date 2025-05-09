/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router';
import { HttpContext } from '@adonisjs/core/http';
import transmit from '@adonisjs/transmit/services/main';
import { middleware } from '#start/kernel';

// Importing route files
import '../app/routes/auth_route.js';
import '../app/routes/addon_route.js';
import '../app/routes/category_route.js';
import '../app/routes/charge_route.js';
import '../app/routes/coupon_route.js';
import '../app/routes/menu_item_route.js';
import '../app/routes/reservation_route.js';
import '../app/routes/schedule_route.js';
import '../app/routes/user_route.js';
import '../app/routes/variant_route.js';
import '../app/routes/translation_route.js';
import '../app/routes/order_route.js';
import '../app/routes/report_route.js';
import '../app/routes/business_setup_route.js';
import '../app/routes/notification_route.js';
import '../app/routes/payment_route.js';
import '../app/routes/webhook_route.js';
import '../app/routes/promotion_route.js';
import '../app/routes/settings_route.js';
import '../app/routes/payment_method_route.js';
import '../app/routes/page_route.js';

// Customer routes
router.group(() => {
  router.on('/foods').renderInertia('Customer/Foods').use(middleware.maintenance());
  router
    .on('/foods/search')
    .renderInertia('Customer/SearchFoodList', {
      queries: (route: HttpContext) => route.request.qs(),
    })
    .use(middleware.maintenance());
  router
    .on('/foods/:categoryName/:category')
    .renderInertia('Customer/CategoryFoodList', {
      params: (route: Record<string, string>) => route.params,
    })
    .use(middleware.maintenance());
});

// User routes
router
  .group(() => {
    router.on('/checkout').renderInertia('Customer/Checkout');
    router.on('/my-profile').renderInertia('Customer/Profile/MyProfile');
    router.on('/my-orders').renderInertia('Customer/Profile/MyOrders');
  })
  .prefix('/user')
  .use(middleware.auth({ guards: ['web'] }))
  .use(middleware.role({ guards: ['customer'] }))
  .use(middleware.maintenance());

// Admin routes
router
  .group(() => {
    router.on('/').renderInertia('Admin/Dashboard');
    router.on('/dashboard').renderInertia('Admin/Dashboard');
    router.on('/customers').renderInertia('Admin/Customers');
    router.on('/delivery-person').renderInertia('Admin/DeliveryPerson');
    router.on('/employees').renderInertia('Admin/Employees');
    router.on('/create-reservation').renderInertia('Admin/Reservations/CreateReservation');
    router.on('/active-reservations').renderInertia('Admin/Reservations/ActiveReservations');
    router.on('/reservation-history').renderInertia('Admin/Reservations/ReservationHistory');
    router.on('/order-history').renderInertia('Admin/OrderHistory');
    router.on('/active-orders').renderInertia('Admin/ActiveOrders');
    router.on('/categories').renderInertia('Admin/Categories');
    router.on('/addon-items').renderInertia('Admin/AddonItems');
    router.on('/tax-and-charges').renderInertia('Admin/TaxAndCharges');
    router.on('/order-status/pending').renderInertia('Admin/OrderStatus/Pending');
    router.on('/order-status/ready').renderInertia('Admin/OrderStatus/Ready');
    router.on('/order-status/processing').renderInertia('Admin/OrderStatus/Processing');
    router.on('/order-status/on-delivery').renderInertia('Admin/OrderStatus/OnDelivery');
    router.on('/order-status/completed').renderInertia('Admin/OrderStatus/Completed');
    router.on('/order-status/failed').renderInertia('Admin/OrderStatus/Failed');
    router.on('/order-status/cancelled').renderInertia('Admin/OrderStatus/Cancelled');
    router.on('/settings').renderInertia('Admin/BusinessSetup');
    router.on('/menu-items').renderInertia('Admin/MenuItems');
    router.on('/pos').renderInertia('Admin/POS');
    router.on('/earning-report').renderInertia('Admin/Reports/EarningReport');
    router.on('/order-report').renderInertia('Admin/Reports/OrderReports');
    router.on('/promotions').renderInertia('Admin/Promotions');
  })
  .prefix('/admin')
  .use([middleware.auth({ guards: ['web'] }), middleware.role({ guards: ['admin'] })]);

// Manager route
router
  .group(() => {
    router.on('/').renderInertia('Admin/Dashboard');
    router.on('/dashboard').renderInertia('Admin/Dashboard');
    router.on('/customers').renderInertia('Admin/Customers');
    router.on('/delivery-person').renderInertia('Admin/DeliveryPerson');
    router.on('/employees').renderInertia('Admin/Employees');
    router.on('/create-reservation').renderInertia('Admin/Reservations/CreateReservation');
    router.on('/active-reservations').renderInertia('Admin/Reservations/ActiveReservations');
    router.on('/reservation-history').renderInertia('Admin/Reservations/ReservationHistory');
    router.on('/order-history').renderInertia('Admin/OrderHistory');
    router.on('/active-orders').renderInertia('Admin/ActiveOrders');
    router.on('/categories').renderInertia('Admin/Categories');
    router.on('/addon-items').renderInertia('Admin/AddonItems');
    router.on('/tax-and-charges').renderInertia('Admin/TaxAndCharges');
    router.on('/order-status/pending').renderInertia('Admin/OrderStatus/Pending');
    router.on('/order-status/ready').renderInertia('Admin/OrderStatus/Ready');
    router.on('/order-status/processing').renderInertia('Admin/OrderStatus/Processing');
    router.on('/order-status/on-delivery').renderInertia('Admin/OrderStatus/OnDelivery');
    router.on('/order-status/completed').renderInertia('Admin/OrderStatus/Completed');
    router.on('/order-status/failed').renderInertia('Admin/OrderStatus/Failed');
    router.on('/order-status/cancelled').renderInertia('Admin/OrderStatus/Cancelled');
    router.on('/menu-items').renderInertia('Admin/MenuItems');
    router.on('/pos').renderInertia('Admin/POS');
    router.on('/earning-report').renderInertia('Admin/Reports/EarningReport');
    router.on('/order-report').renderInertia('Admin/Reports/OrderReports');
    router.on('/promotions').renderInertia('Admin/Promotions');
  })
  .prefix('/manager')
  .use([middleware.auth({ guards: ['web'] }), middleware.role({ guards: ['manager'] })]);

// POS route
router
  .group(() => {
    router.on('/create-reservation').renderInertia('Admin/Reservations/CreateReservation');
    router.on('/active-reservations').renderInertia('Admin/Reservations/ActiveReservations');
    router.on('/reservation-history').renderInertia('Admin/Reservations/ReservationHistory');
    router.on('/order-history').renderInertia('Admin/OrderHistory');
    router.on('/active-orders').renderInertia('Admin/ActiveOrders');
    router.on('/order-status/pending').renderInertia('Admin/OrderStatus/Pending');
    router.on('/order-status/ready').renderInertia('Admin/OrderStatus/Ready');
    router.on('/order-status/processing').renderInertia('Admin/OrderStatus/Processing');
    router.on('/order-status/on-delivery').renderInertia('Admin/OrderStatus/OnDelivery');
    router.on('/order-status/delivered').renderInertia('Admin/OrderStatus/Delivered');
    router.on('/order-status/failed').renderInertia('Admin/OrderStatus/Failed');
    router.on('/order-status/cancelled').renderInertia('Admin/OrderStatus/Cancelled');
    router.on('/order-status/returned').renderInertia('Admin/OrderStatus/Returned');
    router.on('/pos').renderInertia('Admin/POS');
  })
  .prefix('/pos')
  .use([middleware.auth({ guards: ['web'] }), middleware.role({ guards: ['pos'] })]);

// Display route
router
  .on('/display')
  .renderInertia('Display/ActiveOrders')
  .use([middleware.auth({ guards: ['web'] }), middleware.role({ guards: ['display'] })]);

// Kitchen route
router
  .on('/kitchen')
  .renderInertia('Kitchen/ActiveOrders')
  .use([middleware.auth({ guards: ['web'] }), middleware.role({ guards: ['kitchen'] })]);

transmit.registerRoutes((route) => {
  if (route.getPattern() === '__transmit/events') {
    route.middleware(middleware.auth());
    return;
  }
});
