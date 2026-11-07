/**
 * Formate un montant en Dinar Algérien (DA)
 * Ex: 1250000 -> "1 250 000,00 DA" ou "1 250 000 DA"
 */
export declare function formatCurrencyDA(amount: number | string | null | undefined, includeDecimals?: boolean): string;
/**
 * Formate une date au format JJ/MM/AAAA
 */
export declare function formatDateDZ(dateInput: Date | string | null | undefined): string;
/**
 * Formate une date avec heure 24h: JJ/MM/AAAA HH:mm
 */
export declare function formatDateTimeDZ(dateInput: Date | string | null | undefined): string;
/**
 * Calcule un pourcentage sécurisé
 */
export declare function calculatePercentage(part: number, total: number): number;
//# sourceMappingURL=utils.d.ts.map