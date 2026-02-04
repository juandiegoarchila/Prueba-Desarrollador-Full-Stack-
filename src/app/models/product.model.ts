export interface Product {
    id: number;
    name: string;
    price: number;
    previousPrice?: number;
    discountPercent?: number;
    rating?: number;
    description: string;
    imageUrl: string;
}
