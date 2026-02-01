import { browser } from '$app/environment';

class CartStore {
    items = $state([]);
    isOpen = $state(false);

    constructor() {
        if (browser) {
            const stored = localStorage.getItem('arimbi_cart');
            if (stored) {
                this.items = JSON.parse(stored);
            }
        }
    }

    addItem(item) {
        // item should have { id, name, price, ... } and optionally type ('product' | 'bundle')
        const itemType = item.type || 'product';

        const existing = this.items.find((i: any) =>
            i.id === item.id && (i.type || 'product') === itemType
        );

        if (existing) {
            existing.quantity += 1;
        } else {
            this.items.push({ ...item, quantity: 1, type: itemType });
        }
        this.save();
    }

    removeItem(itemId, type = 'product') {
        this.items = this.items.filter((i: any) => !(i.id === itemId && (i.type || 'product') === type));
        this.save();
    }

    updateQuantity(itemId, delta, type = 'product') {
        const item = this.items.find((i: any) => i.id === itemId && (i.type || 'product') === type);
        if (item) {
            item.quantity += delta;
            if (item.quantity <= 0) {
                this.removeItem(itemId, type);
            } else {
                this.save();
            }
        }
    }

    clear() {
        this.items = [];
        this.save();
    }

    save() {
        if (browser) {
            localStorage.setItem('arimbi_cart', JSON.stringify(this.items));
        }
    }

    get total() {
        return this.items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    }

    get totalItems() {
        return this.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
    }

    toggle() {
        this.isOpen = !this.isOpen;
    }

    open() {
        this.isOpen = true;
    }

    close() {
        this.isOpen = false;
    }
}

export const cart = new CartStore();
