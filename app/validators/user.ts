import vine from '@vinejs/vine';
import { idsExist } from './rules/array.js';

export const userValidator = vine.compile(
  vine.object({
    roleId: vine.number().in([1, 2, 3, 4, 5, 6, 7]),
    firstName: vine.string().trim(),
    lastName: vine.string().trim(),
    email: vine
      .string()
      .trim()
      .email()
      .unique(async (db, value) => {
        const user = await db.from('users').where('email', value).first();
        return !user;
      }),
    password: vine
      .string()
      .trim()
      .minLength(8)
      .confirmed({
        confirmationField: 'confirmPassword',
      })
      .optional(),
    phoneNumber: vine.string().trim(),
    address: vine.string().trim(),
    isEmailVerified: vine.boolean().optional(),
    isSuspended: vine.boolean().optional(),
  })
);

export const userUpdateValidator = vine.compile(
  vine.object({
    roleId: vine.number().in([1, 2, 3, 4, 5, 6, 7]),
    firstName: vine.string().trim(),
    lastName: vine.string().trim(),
    email: vine.string().trim().email(),
    password: vine
      .string()
      .trim()
      .minLength(8)
      .confirmed({
        confirmationField: 'confirmPassword',
      })
      .nullable()
      .optional(),
    phoneNumber: vine.string().trim(),
    address: vine.string().trim(),
    isEmailVerified: vine.boolean().optional(),
    isSuspended: vine.boolean().optional(),
  })
);

export const userProfileUpdateValidator = vine.compile(
  vine.object({
    firstName: vine.string().trim().optional(),
    lastName: vine.string().trim().optional(),
    // email: vine.string().trim().email(),
    password: vine.string().trim().minLength(8).nullable().optional(),
    newPassword: vine
      .string()
      .trim()
      .minLength(8)
      .confirmed({
        confirmationField: 'confirmNewPassword',
      })
      .nullable()
      .optional(),
    phoneNumber: vine.string().trim().optional(),
    address: vine.string().trim().optional(),
    notificationSound: vine.boolean().optional(),
  })
);

export const customUpdateValidator = vine.compile(
  vine.object({
    isEmailVerified: vine.boolean().optional(),
    isSuspended: vine.boolean().optional(),
    roleId: vine.number().in([1, 2, 3, 4, 5, 6, 7]).optional(),
  })
);

export const bulkDeleteValidator = vine.compile(
  vine.object({
    ids: vine
      .array(vine.number())
      .distinct()
      .compact()
      .use(idsExist({ table: 'users', column: 'id' })),
  })
);

export const bulkCustomValidator = vine.compile(
  vine.object({
    ids: vine
      .array(vine.number())
      .distinct()
      .compact()
      .use(idsExist({ table: 'users', column: 'id' })),
    isEmailVerified: vine.boolean().optional(),
    isSuspended: vine.boolean().optional(),
    roleId: vine.number().in([1, 2, 3, 4, 5, 6, 7]).optional(),
  })
);
