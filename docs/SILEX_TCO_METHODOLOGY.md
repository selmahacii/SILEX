# SILEX ERP — Méthodologie Mathématique du Comparateur TCO Multicritères

**Version :** 1.0.0 (Phase 4)  
**Date :** Novembre 2026  
**Société :** SARL SILEX SERVICES  

---

## 1. Principes Fondamentaux du TCO Industriel

Le coût total de possession (*Total Cost of Ownership* - TCO) ne se limite pas au seul prix facial d'achat proposé par un fournisseur. Dans les métiers à haut risque technique (arrêts d'usines pétrochimiques, tuyauterie haute pression, épreuves sous gaz corrosifs), les critères de conformité métallurgique, de respect des délais et de qualité prévalent :

- Un retard de livraison de tubes vapeur de 5 jours peut bloquer le redémarrage d'une raffinerie entière (pénalités clients pouvant atteindre plusieurs millions de dinars par jour).
- Une défaillance matière due à l'absence de certificat de conformité CCPU 3.1 EN 10204 expose l'entreprise à un rejet total des soudures lors des tirs radiographiques CND par le bureau de contrôle Sonatrach.

---

## 2. Pondération Standard des Critères

Le système applique par défaut la matrice de pondération suivante (configurable par la Direction Générale) :

| Critère | Pondération ($W_i$) | Directionnalité | Formule de Normalisation (Score sur 100) |
|---|---|---|---|
| **Coût Global HT** | $35\%$ | À minimiser | $S_{\text{coût}} = \frac{\text{MinPrice}}{\text{Price}_i} \times 100$ |
| **Délai de Livraison** | $20\%$ | À minimiser | $S_{\text{délai}} = \frac{\text{MinLeadTime}}{\text{LeadTime}_i} \times 100$ |
| **Conformité Technique** | $25\%$ | À maximiser | $S_{\text{tech}} = \text{TechnicalRating}_i$ |
| **Assurance Qualité & Certificats** | $10\%$ | À maximiser | $S_{\text{qual}} = \text{QualityRating}_i$ |
| **Garantie Constructeur** | $10\%$ | À maximiser | $S_{\text{gar}} = \min\left(100, \frac{\text{WarrantyMonths}_i}{24} \times 100\right)$ |

---

## 3. Critères Éliminatoires Stricts (Filtre Bloquant)

Avant tout calcul de scoring pondéré, chaque offre passe par une batterie de critères éliminatoires paramétrables :

$$\text{Si } \text{mandatoryCcpuRequired} = \text{true} \text{ et } \text{hasCcpu31} = \text{false} \implies \begin{cases} \text{isEliminated} = \text{true} \\ \text{overallTcoScore} = 0 \\ \text{rank} = 99 \end{cases}$$

Une offre éliminée ne peut en aucun cas être sélectionnée par le système ni convertie en bon de commande, quel que soit son prix facial (même s'il s'agit de l'offre la moins chère du marché).

---

## 4. Calcul du Score Global Pondéré

Pour chaque offre valide non éliminée :

$$\text{OverallScore}_i = (S_{\text{coût}} \times 0.35) + (S_{\text{délai}} \times 0.20) + (S_{\text{tech}} \times 0.25) + (S_{\text{qual}} \times 0.10) + (S_{\text{gar}} \times 0.10)$$

L'offre obtenant le score le plus élevé est classée **Rang 1** et fait l'objet de la recommandation officielle soumise à l'arbitrage de la Direction Générale.
