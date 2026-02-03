import { CartItem } from './cart-item.model';

export interface Order {
    id: string;
    userId: string;
    items: CartItem[];
    total: number;
    date: Date;
    status: 'pending' | 'synced' | 'completed';
}
