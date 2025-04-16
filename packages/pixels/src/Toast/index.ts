import { Toast } from '@heroui/toast';

import { addToast, toastVariants } from './addToast';
import ToastProvider from './ToastProvider';

export type { ToastProps, AddToastVariantProps } from './addToast';
export type { ToastProviderProps } from './ToastProvider';

export { addToast, Toast, ToastProvider, toastVariants };

export default addToast;
