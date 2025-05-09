import router from '@adonisjs/core/services/router';
const AuthController = () => import('#controllers/auth_controller');
import { middleware } from '#start/kernel';

router.get('/login', [AuthController, 'loginView']);
router.get('/signup', [AuthController, 'signupView']);
router.get('/forgot-password', [AuthController, 'forgotPasswordView']);
router.get('/new-password', [AuthController, 'newPasswordView']);
router.get('/verify-email', [AuthController, 'verifyEmail']);

router
  .group(() => {
    router.post('/register', [AuthController, 'register']);
    router.post('/login', [AuthController, 'login']);
    router.get('/check', [AuthController, 'checkAuth']).use(middleware.auth({ guards: ['web'] }));
    router.post('/logout', [AuthController, 'logout']).use(middleware.auth({ guards: ['web'] }));
    router.post('/forgot-password', [AuthController, 'forgotPassword']);
    router.post('/reset-password', [AuthController, 'resetPassword']);
  })
  .prefix('/api/auth');
