import * as Yup from 'yup';

const AllowImageType = ['image/jpeg', 'image/png', 'image/jpg'];

const NewMenuItemSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  description: Yup.string().required('Description is required'),
  categoryId: Yup.string().required('Category ID is required'),
  foodType: Yup.string().required('Food type is required'),
  price: Yup.number().required('Price is required').positive('Price must be a positive number'),
  discount: Yup.number().min(0, 'Discount cannot be negative'),
  discountType: Yup.string().oneOf(['percentage', 'amount'], 'Invalid discount type'),
  isAvailable: Yup.boolean().required('Availability is required'),
  image: Yup.mixed()
    .required('Image is required')
    .test('fileType', 'Unsupported file format', (value: any) => {
      return value && AllowImageType.includes(value.type);
    }),
  chargeIds: Yup.array().of(Yup.string()).nullable(),
  addonIds: Yup.array().of(Yup.string()).nullable(),
  variantIds: Yup.array().of(Yup.string()).nullable(),
});

export default NewMenuItemSchema;
