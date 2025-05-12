import { Charge, Customer, POSItem, POSItemAddon, POSItemVariant } from '@/types/pos_type';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface POSState {
  customer?: Customer;
  type: 'delivery' | 'dine_in' | 'pickup';
  paymentType: string;
  subTotal: number;
  discount: number;
  total: number;
  note: string;
  POSItems: POSItem[];
  POSCharges: Charge[];
  setNote: (note: string) => void;
  changeType: (type: 'delivery' | 'dine_in' | 'pickup', deliveryCharge: number) => void;
  addItemToPOS: (item: POSItem) => void;
  selectAddon: (
    addon: any,
    addonsSelected: POSItemAddon[],
    setAddonsSelected: (addonsSelected: POSItemAddon[]) => void
  ) => void;
  selectVariant: (
    variant: any,
    type: 'radio' | 'checkbox',
    variantsSelected: POSItemVariant[],
    setVariantsSelected: (variantsSelected: any[]) => void
  ) => void;
  setAddonQty: (
    addonId: number,
    qty: number,
    addonsSelected: POSItemAddon[],
    setAddonsSelected: (addonsSelected: POSItemAddon[]) => void
  ) => void;
  updateItemInPOS: (item: POSItem) => void;
  removeItemFromPOS: (item: POSItem) => void;
  setQuantity: (item: POSItem, quantity: number) => void;
  setDiscount: (discount: number, type: 'percentage' | 'amount') => void;
  changePaymentType: (paymentType: string) => void;
  calculate: () => void;
  resetPOS: () => void;
  setCustomer: (customer: Customer) => void;
}

const usePOS = create<POSState>()(
  persist(
    (set, get) => ({
      customer: null,
      type: 'dine_in',
      paymentType: 'cash',
      subTotal: 0,
      discount: 0,
      total: 0,
      note: '',
      POSItems: [],
      POSCharges: [],
      setNote: (note: string) => set({ note }),
      changeType: (type: 'delivery' | 'dine_in' | 'pickup', deliveryCharge: number) => {
        if (type === 'delivery') {
          set((state) => ({
            type,
            POSCharges: [
              ...state.POSCharges,
              {
                id: 999,
                type: 'delivery',
                name: 'Delivery Charge',
                amount: deliveryCharge,
                amountType: 'amount',
                isAvailable: 1,
              },
            ],
          }));
        } else {
          set({ type, POSCharges: [] });
        }
        get().calculate();
      },
      changePaymentType: (paymentType: string) => set({ paymentType }),
      setDiscount: (discount: number, type: 'percentage' | 'amount') => {
        let discountAmount = 0;
        if (type === 'percentage') {
          discountAmount = (discount / 100) * get().subTotal;
        } else {
          discountAmount = discount;
        }
        set({ discount: discountAmount });
        get().calculate();
      },
      setCustomer: (customer: Customer) => set({ customer }),
      addItemToPOS: (item: POSItem) => {
        set((state) => {
          let POSItems = [...state.POSItems];
          const itemIndex = POSItems.findIndex((i) => JSON.stringify(i) === JSON.stringify(item));
          if (itemIndex !== -1) {
            POSItems[itemIndex].quantity += 1;
            POSItems[itemIndex].total =
              state.POSItems[itemIndex].quantity * state.POSItems[itemIndex].subTotal;
            return { POSItems };
          } else {
            POSItems = [...state.POSItems, item];
          }
          return { POSItems };
        });
        get().calculate();
      },
      selectAddon: (
        addon: any,
        addonsSelected: POSItemAddon[],
        setAddonsSelected: (addonsSelected: POSItemAddon[]) => void
      ) => {
        const index = addonsSelected.findIndex((a) => a.id === addon.id);
        let newAddonsSelected = [...addonsSelected];

        if (index === -1) {
          newAddonsSelected = [...addonsSelected, { ...addon, quantity: 1 }];
        } else {
          newAddonsSelected = newAddonsSelected.filter((a) => a.id !== addon.id);
        }
        setAddonsSelected(newAddonsSelected);
      },
      selectVariant: (
        variant: any,
        type: 'radio' | 'checkbox',
        variantsSelected: POSItemVariant[],
        setVariantsSelected: (variantsSelected: any[]) => void
      ) => {
        const index = variantsSelected.findIndex((v) => v.id === variant.id);
        let newVariantsSelected = [...variantsSelected];

        if (type === 'radio') {
          if (index === -1) {
            newVariantsSelected = [...variantsSelected, { ...variant, option: [variant.option] }];
          } else {
            newVariantsSelected[index] = { ...variant, option: [variant.option] };
          }
        } else {
          if (index === -1) {
            newVariantsSelected = [...variantsSelected, variant];
          } else {
            const optionIndex = newVariantsSelected[index].option.findIndex(
              (o: any) => o.id === variant.option?.[0].id
            );
            if (optionIndex === -1) {
              newVariantsSelected[index].option.push(variant.option?.[0]);
            } else {
              newVariantsSelected[index].option = newVariantsSelected[index].option.filter(
                (o: any) => o.id !== variant.option?.[0].id
              );
            }
          }
        }
        setVariantsSelected(newVariantsSelected);
      },
      setAddonQty: (
        addonId: number,
        qty: number,
        addonsSelected: POSItemAddon[],
        setAddonsSelected: (addonsSelected: POSItemAddon[]) => void
      ) => {
        const index = addonsSelected.findIndex((a) => a.id === addonId);
        let newAddonsSelected = [...addonsSelected];
        if (index !== -1) {
          newAddonsSelected[index].quantity = qty;
        }
        setAddonsSelected(newAddonsSelected);
      },
      updateItemInPOS: (updatedItem: POSItem) => {
        set((state) => {
          const updatedPOSItems = state.POSItems.map((item) =>
            item.id === updatedItem.id ? updatedItem : item
          );
          return {
            ...state,
            POSItems: updatedPOSItems,
          };
        });
        get().calculate();
      },
      removeItemFromPOS: (item: POSItem) => {
        set((state) => {
          const POSItems = state.POSItems.filter((i) => JSON.stringify(i) !== JSON.stringify(item));
          return { POSItems };
        });
        get().calculate();
      },
      setQuantity: (item: POSItem, quantity: number) => {
        set((state) => {
          const POSItems = state.POSItems.map((i) => {
            if (JSON.stringify(i) === JSON.stringify(item)) {
              i.quantity = quantity;
              i.total = i.quantity * i.subTotal;
            }
            return i;
          });
          return { POSItems };
        });
        get().calculate();
      },
      calculate: () => {
        set((state) => {
          // calculate sub total
          const subTotal = state.POSItems.reduce((acc, item) => acc + item.total, 0);
          const POSCharges: Charge[] = [];
          const deliveryCharge = state.POSCharges.find((charge) => charge.id === 999);
          if (deliveryCharge) POSCharges.push(deliveryCharge);
          // calculate charges
          state.POSItems.forEach((item) => {
            if (item.charges) {
              item.charges.forEach((charge) => {
                let totalCharge = 0;
                if (charge.amountType === 'percentage') {
                  const amount = (charge.amount / 100) * item.total;
                  totalCharge += amount;
                } else {
                  totalCharge += charge.amount * item.quantity;
                }
                const chargeIndex = POSCharges.findIndex((c) => c.id === charge.id);
                if (chargeIndex === -1) {
                  POSCharges.push({ ...charge, amount: totalCharge });
                } else {
                  POSCharges[chargeIndex].amount += totalCharge;
                }
              });
            }
          });
          const totalCharges = POSCharges.reduce((acc, charge) => acc + charge.amount, 0);
          const total = subTotal + totalCharges - state.discount;
          return { subTotal, total, POSCharges };
        });
      },
      resetPOS: () =>
        set({
          POSItems: [],
          POSCharges: [],
          subTotal: 0,
          discount: 0,
          total: 0,
          note: '',
          customer: null,
          type: 'dine_in',
          paymentType: 'cash',
        }),
    }),
    {
      name: 'pos-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);

export default usePOS;
