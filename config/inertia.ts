import useBranding from '#services/use_branding';
import { defineConfig } from '@adonisjs/inertia';
import type { InferSharedProps } from '@adonisjs/inertia/types';

const inertiaConfig = defineConfig({
  /**
   * Path to the Edge view that will be used as the root view for Inertia responses
   */
  rootView: 'inertia_layout',

  /**
   * Data that should be shared with all rendered pages
   */
  sharedData: {
    branding: async () => {
      return await useBranding();
    },
    errors: (ctx) => ctx.session?.flashMessages.get('errors'),
    auth: async (ctx) => {
      if (await ctx.auth.check()) {
        const user = ctx.auth.user;
        await user?.load('role');

        return {
          id: user?.id,
          fullName: user?.fullName,
          firstName: user?.firstName,
          lastName: user?.lastName,
          email: user?.email,
          phoneNumber: user?.phoneNumber,
          address: user?.address,
          roleId: user?.roleId,
          role: user?.$preloaded?.role,
          isSuspended: Boolean(user?.isSuspended),
          isVerified: Boolean(user?.isEmailVerified),
          notificationSound: Boolean(user?.notificationSound),
        };
      }
      return null;
    },
  },

  /**
   * Options for the server-side rendering
   */
  ssr: {
    enabled: false,
    entrypoint: 'inertia/app/ssr.tsx',
  },
});

export default inertiaConfig;

declare module '@adonisjs/inertia/types' {
  export interface SharedProps extends InferSharedProps<typeof inertiaConfig> {}
}
