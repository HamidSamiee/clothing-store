
export default function toLocaleDateShort(date: string | Date): string {
    return new Date(date).toLocaleDateString("fa-IR");
}