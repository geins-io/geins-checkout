import type { PriceType } from '@geins/types';
export const usePrice = () => {
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
