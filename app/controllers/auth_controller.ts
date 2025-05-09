import User from '#models/user';
import type { HttpContext } from '@adonisjs/core/http';
import { registerValidator, resetPasswordValidator } from '#validators/auth';
import notification_service from '#services/notification_service';
import Token from '#models/token';
import ResetPasswordNotification from '#mails/reset_password_notification';
import mail from '@adonisjs/mail/services/main';
import useBranding from '#services/use_branding';
import VerifyEmailNotification from '#mails/verify_email_notification';
import { DateTime } from 'luxon';
import errorHandler from '#exceptions/error_handler';

export default class AuthController {
  async loginView({ inertia }: HttpContext) {
    return inertia.render('Auth/Auth');
  }

  async signupView({ inertia }: HttpContext) {
    return inertia.render('Auth/Auth');
  }

  async forgotPasswordView({ inertia }: HttpContext) {
    return inertia.render('Auth/ForgotPassword');
  }

  async newPasswordView({ inertia }: HttpContext) {
    return inertia.render('Auth/NewPassword');
  }

  async register({ logger, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(registerValidator);
      const user = await User.create(payload);
      await notification_service.sendNewRegistraionNotification(user);
      const token = await Token.generateVerifyEmailToken(user);
      const branding = await useBranding();
      await mail.sendLater(
        new VerifyEmailNotification(user, token, {
          business: branding.business,
          siteUrl: branding.siteUrl || '',
        })
      );

      return response.json({
        success: true,
        message:
          'Registration was successful. We sent a verification link to your email. Please check your email to verify your account.',
        user,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Registration Error');
    }
  }

  async verifyEmail({ request, inertia }: HttpContext) {
    try {
      const { token } = request.qs();
      if (!token) {
        throw new Error('Token is not provided');
      }
      const record = await Token.verify(token, 'VERIFY_EMAIL');
      if (!record) {
        throw new Error('Token is invalid');
      }
      const user = await User.find(record.userId);
      if (!user) {
        throw new Error('User is not found');
      }
      user.isEmailVerified = true;
      user.isSuspended = false;
      user.save();
      await record.delete();

      return inertia.render('VerifyEmail', {
        success: true,
        message: 'Your email has been verified successfully.',
      });
    } catch (error) {
      return inertia.render('VerifyEmail', {
        success: false,
        message: error.message || 'Something went wrong while verifying your email',
      });
    }
  }

  async login({ logger, auth, request, response }: HttpContext) {
    const { email, password, isRememberMe } = request.only(['email', 'password', 'isRememberMe']);
    try {
      const user = await User.findBy('email', email);
      if (!user) {
        return response.abort('Invalid credentials');
      }

      await User.verifyCredentials(email, password);
      const branding = await useBranding();
      if (branding.business.loginOnlyVerifiedEmail && !user.isEmailVerified) {
        const token = await user
          .related('tokens')
          .query()
          .where('type', 'VERIFY_EMAIL')
          .where('expiresAt', '>', DateTime.now().toSQL())
          .orderBy('createdAt', 'desc')
          .first();
        if (token) {
          await token.delete();
        }
        const newToken = await Token.generateVerifyEmailToken(user);
        await mail.sendLater(
          new VerifyEmailNotification(user, newToken, {
            business: branding.business,
            siteUrl: branding.siteUrl || '',
          })
        );
        return response.json({
          login: false,
          requiredVerification: true,
          message:
            'We sent a verification link to your email. Please check your email to verify your account.',
        });
      }

      if (user?.isSuspended) {
        return response.unauthorized({ success: false, message: 'Account is Suspended' });
      }

      await auth.use('web').login(user, !!isRememberMe);
      return response.json({ login: true, user });
    } catch (error) {
      errorHandler(error, response, logger, 'Login Error');
    }
  }

  async forgotPassword({ logger, request, response }: HttpContext) {
    try {
      const { email } = request.all();
      if (!email) {
        return response.badRequest({
          success: false,
          message: 'email is not found',
        });
      }
      const user = await User.findBy('email', email);
      if (!user) {
        return response.badRequest({ success: false, message: "Email doesn't exist" });
      }
      const token = await Token.generatePasswordResetToken(user);
      const branding = await useBranding();
      await mail.sendLater(
        new ResetPasswordNotification(user, token, {
          business: branding.business,
          siteUrl: branding.siteUrl || '',
        })
      );

      return response.json({ success: true, message: 'A verification link is sent to your mail' });
    } catch (error) {
      errorHandler(error, response, logger, 'Forgot password Error');
    }
  }

  async resetPassword({ logger, request, response }: HttpContext) {
    try {
      const { password, token } = await request.validateUsing(resetPasswordValidator);
      const record = await Token.verify(token, 'PASSWORD_RESET');
      if (!record) {
        return response.badRequest({ success: false, message: 'Token is invalid' });
      }
      const user = await User.find(record.userId);
      if (!user) {
        return response.badRequest({ success: false, message: 'User not found' });
      }
      user.password = password;
      user.save();
      await record.delete();

      return response.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
      errorHandler(error, response, logger, 'Reset password Error');
    }
  }

  async checkAuth({ auth, response }: HttpContext) {
    if (auth.user) {
      const user = await User.query().where('email', auth?.user?.email).preload('role').first();
      return response.json({ login: true, user });
    } else {
      return response.badRequest({ login: false });
    }
  }

  async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout();
    return response.json({ message: 'Logout successful' });
  }
}
