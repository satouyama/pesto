import BusinessSetup from '#models/business_setup';
import User from '#models/user';
import env from '#start/env';
import { BaseMail } from '@adonisjs/mail';

export default class ResetPasswordNotification extends BaseMail {
  from = env.get('SMTP_USERNAME');
  subject = 'Reset Password';
  user: User;
  token: string;
  logo: string;
  url: string;
  appName: string;

  constructor(user: User, token: string, branding: { business: BusinessSetup; siteUrl: string }) {
    super();
    this.user = user;
    this.token = token;
    this.url = branding.siteUrl;
    this.appName = branding.business.name || '';
    this.logo = branding.siteUrl + branding?.business?.logo?.url || '';
  }

  /**
   * The "prepare" method is called automatically when
   * the email is sent or queued.
   */
  prepare() {
    this.message.to(this.user.email);
    this.message.from(this.from, this.appName);
    this.message.subject(this.subject);
    this.message.htmlView('emails/generic_email', {
      logo: this.logo,
      title: this.subject,
      body: `<h1>Hello ${this.user?.firstName},</h1>
    <p>Please click the link below to reset your password:</p>
    <p>Thanks.</p>`,
      action: true,
      actionText: 'Reset Now',
      actionUrl: this.url + '/new-password?token=' + this.token,
    });
  }
}
