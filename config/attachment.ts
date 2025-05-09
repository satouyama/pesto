import { defineConfig } from '@jrmc/adonis-attachment';

export default defineConfig({
  converters: [
    {
      key: 'thumbnail',
      converter: () => import('@jrmc/adonis-attachment/converters/image_converter'),
      options: {
        resize: 300,
      },
    },
    {
      key: 'orginal',
      converter: () => import('@jrmc/adonis-attachment/converters/image_converter'),
      options: {},
    },
  ],
});
