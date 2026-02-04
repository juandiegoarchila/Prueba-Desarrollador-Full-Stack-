export const getDiscountPercent = (price: number, previousPrice?: number): number | null => {
  if (!previousPrice || previousPrice <= price) {
    return null;
  }

  const discount = Math.round((1 - price / previousPrice) * 100);
  return discount > 0 ? discount : null;
};
