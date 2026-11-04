import { CURRENCY } from './constants.js';

/**
 * Formate un montant en Dinar Algérien (DA)
 * Ex: 1250000 -> "1 250 000,00 DA" ou "1 250 000 DA"
 */
export function formatCurrencyDA(amount: number | string | null | undefined, includeDecimals = true): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return `0 ${CURRENCY}`;
  }
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  const formatted = new Intl.NumberFormat('fr-DZ', {
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  }).format(num);

  return `${formatted} ${CURRENCY}`;
}

/**
 * Formate une date au format JJ/MM/AAAA
 */
export function formatDateDZ(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return '-';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '-';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Formate une date avec heure 24h: JJ/MM/AAAA HH:mm
 */
export function formatDateTimeDZ(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return '-';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '-';

  const dateStr = formatDateDZ(date);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${dateStr} ${hours}:${minutes}`;
}

/**
 * Calcule un pourcentage sécurisé
 */
export function calculatePercentage(part: number, total: number): number {
  if (!total || total <= 0) return 0;
  const ratio = (part / total) * 100;
  return Math.min(100, Math.max(0, Math.round(ratio * 10) / 10));
}
