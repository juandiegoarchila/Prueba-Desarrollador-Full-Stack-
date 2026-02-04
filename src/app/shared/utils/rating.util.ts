export const getStars = (rating: number): string[] => {
  const safeRating = Math.max(0, Math.min(5, rating));
  const fullStars = Math.floor(safeRating);
  const hasHalf = safeRating - fullStars >= 0.5;
  const stars: string[] = [];

  for (let i = 0; i < fullStars; i += 1) {
    stars.push('star');
  }

  if (hasHalf) {
    stars.push('star-half');
  }

  while (stars.length < 5) {
    stars.push('star-outline');
  }

  return stars;
};
