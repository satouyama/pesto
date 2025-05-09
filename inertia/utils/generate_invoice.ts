import { TFunction } from 'i18next';
import { toast } from 'sonner';

export const generateInvoice = async (
  orderId: number,
  t: TFunction<'translation', undefined>,
  isUser: boolean | undefined = false
) => {
  try {
    const response = await fetch(`/api${isUser ? '/user' : ''}/orders/${orderId}/generate-invoice`);
    if (!response.ok) {
      throw new Error('Failed to fetch invoice');
    }
    const invoiceHtml = await response.text();

    // Create an iframe to load the invoice
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    iframe.style.position = 'absolute';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';

    const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDocument) {
      iframeDocument.open();
      iframeDocument.write(invoiceHtml);
      iframeDocument.close();

      // Trigger the print dialog
      iframe.contentWindow?.print();

      // Remove the iframe after printing
      iframe.addEventListener('load', () => {
        setTimeout(() => {
          iframe.remove();
        }, 1000);
      });
    }
  } catch (error) {
    toast(t('Failed to generate the invoice. Please try again.'));
  }
};
