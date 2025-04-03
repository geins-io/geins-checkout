import type { PriceType } from '@geins/types';
/**
 * A composable function for managing price-related operations.
 *
 * @returns {UsePriceComposable} An object containing state and methods for price management.
 *
 * @property {Ref<boolean>} vatIncluded - Reactive boolean indicating if VAT is included in prices.
 * @property {(price: PriceType) => string} getSellingPrice - Method to get the formatted selling price.
 * @property {(price: PriceType) => string} getRegularPrice - Method to get the formatted regular price.
 */
export const usePrice = (): UsePriceComposable => {
  const vatIncluded = useState<boolean>('vat-included');

  const getSellingPrice = (price: PriceType) => {
    return vatIncluded.value ? price.sellingPriceIncVatFormatted : price.sellingPriceExVatFormatted;
  };

  const getRegularPrice = (price: PriceType) => {
    return vatIncluded.value ? price.regularPriceIncVatFormatted : price.regularPriceExVatFormatted;
  };

  return {
    vatIncluded,
    getSellingPrice,
    getRegularPrice,
  };
};
