import { create } from 'zustand';

export const useCheckoutStore = create((set) => ({
    deliveryAddress: '',
    deliveryDate: '',
    deliveryTime: '',
    setDeliveryInfo: (info) => set(info),
}));