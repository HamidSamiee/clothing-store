const farsiDigits: string[] = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toPersianNumbersWithComma(n: number | string): string {
    const numWithComma = numberWithComma(n);
    const persianNumber = toPersianNumbers(numWithComma);
    return persianNumber;
}

function numberWithComma(x: number | string): string {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function toPersianNumbers(n: number | string): string {
    return n.toString().replace(/\d/g, (x) => farsiDigits[parseInt(x)]);
}