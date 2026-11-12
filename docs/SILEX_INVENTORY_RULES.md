# SILEX ERP — Règles de Gestion des Stocks, Multi-Magasins et Inventaires

**Version :** 1.0.0 (Phase 4)  
**Date :** Novembre 2026  
**Société :** SARL SILEX SERVICES  

---

## 1. Organisation Multi-Magasins & Typologie des Dépôts

SARL Silex Services exploite un réseau logistique industriel à trois niveaux hiérarchiques :

### 1.1 Magasin Central d'Arzew & Base Logistique (`MAG-01`)
- **Rôle** : Hub d'approvisionnement national et plateforme de stockage lourd.
- **Capacité** : 3 500 m² (racks couverts et aire extérieure pour spools et tubes).
- **Stocks hébergés** : Matières premières stockables (tubes acier ASTM A106, coudes WPB, brides forgées), équipements sous pression, outillage collectif lourd (groupes électrogènes, compresseurs, vireurs).

### 1.2 Dépôt Régional Skikda RA1K (`MAG-02`)
- **Rôle** : Base de soutien opérationnel pour les interventions à l'Est algérien (Raffinerie Skikda, complexe CP1K, port méthanier).
- **Capacité** : 1 800 m².
- **Stocks hébergés** : Consommables de soudage (baguettes E7018, fils TIG), gaz industriels (Argon, Azote), raccords rapides, pièces de rechange courantes.

### 1.3 Magasins Chantiers Mobiles / Bases de Vie Sud (`MAG-03`)
- **Rôle** : Conteneurs magasins 40 pieds aménagés et sécurisés déployés au pied des unités industrielles (Hassi Messaoud, Tin Fouyé Tabankort).
- **Stocks hébergés** : Stock tampon dédié au chantier pour alimentation quotidienne des monteurs-tuyauteurs et soudeurs.

---

## 2. Règles de Valorisation des Stocks

Les stocks de Silex Services sont valorisés selon la méthode du **Prix Moyen Pondéré (PMP)** à chaque entrée :

$$\text{Nouveau PMP} = \frac{(\text{Stock Ancien} \times \text{PMP Ancien}) + (\text{Quantité Reçue} \times \text{Prix Achat HT})}{\text{Stock Ancien} + \text{Quantité Reçue}}$$

- Toutes les valorisations sont tenues en **Dinars Algériens (DZD)** arrondis au Dinar le plus proche (aucun float binaire imprécis).
- La sortie vers chantier est valorisée au PMP en vigueur au moment de la sortie.

---

## 3. Gestion Rigoureuse des Rebuts et Non-Conformités

Lors de la réception d'une commande fournisseur :
1. **Ségrégation Immédiate** : Les pièces déclarées non conformes lors du contrôle d'entrée (`rejectedQuantity`) sont physiquement étiquetées avec un carton rouge de non-conformité et placées en **zone de quarantaine**.
2. **Exclusion Comptable** : Ces pièces sont comptabilisées sur le Bon de Réception (`BR-YYYY-NNN`) avec le motif de rejet, mais **ne sont en aucun cas incrémentées dans le stock disponible (`currentStock`)**.
3. **Maintien du Reliquat Commande** : La commande fournisseur (`BC-YYYY-NNNN`) conserve la quantité rejetée dans son reliquat restant (`remainingQuantity`). Le fournisseur demeure contractuellement tenu de livrer des pièces de remplacement conformes.

---

## 4. Sessions d'Inventaire Physique et Traitement des Écarts

### 4.1 Fréquence & Périodicité
- **Inventaire Général Annuel** : Réalisé en fin d'exercice comptable (décembre) sur l'ensemble des dépôts.
- **Inventaires Tournants Périodiques** : Réalisés mensuellement ou trimestriellement sur des familles ciblées à forte rotation (consommables de soudage, outillage portatif).

### 4.2 Procédure d'Ajustement
- **Interdiction d'ajustement unilatéral** : Aucun magasinier ni chef d'atelier ne peut modifier manuellement le niveau de stock d'un article.
- **Traçabilité des Mouvements** : Toute régularisation validée par la DG génère un mouvement officiel de type `INVENTORY_ADJUSTMENT` avec référence documentaire de la session (`INV-YYYY-NNN`).
- **Écritures de Clôture** : La valeur totale de l'écart (`totalVarianceValueDA`) est consolidée dans le rapport annuel transmis au commissaire aux comptes et au module Finance.
