export function formatPrice(amount:number):string {
    return new Intl.NumberFormat('es-EC', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
}

export function formatDate(iso:string): string {
    return new Intl.DateTimeFormat('es-EC', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(new Date(iso));
}

export function toNumber(value: string | number): number {
    return typeof value === 'number' ? value : Number(value);
}