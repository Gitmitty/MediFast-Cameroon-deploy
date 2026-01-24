# MediFast Cameroon - PRD (Product Requirements Document)

## Date de création: 24 Janvier 2026

---

## 1. Vision du Produit

**MediFast Cameroon** (MboaMed) est une Progressive Web App (PWA) de réservation de rendez-vous médicaux conçue pour les Camerounais, permettant de trouver des hôpitaux à proximité, vérifier les symptômes, et réserver des consultations.

### Objectif Principal
**RÉSERVATION DE RENDEZ-VOUS MÉDICAUX** - Pas une app de navigation.

---

## 2. User Personas

### Persona 1: Patient Urbain (Yaoundé/Douala)
- Âge: 25-45 ans
- Besoin: Trouver rapidement un médecin spécialiste
- Pain point: Longues files d'attente, difficultés à trouver le bon département

### Persona 2: Parent
- Âge: 30-50 ans
- Besoin: Rendez-vous pédiatrie pour enfants
- Pain point: Urgences médicales, besoin de clarté sur les prix

### Persona 3: Patient Rural
- Besoin: Accès à des soins via localisation GPS
- Pain point: Distance, coût des consultations

---

## 3. Architecture Technique

### Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Shadcn UI
- **Backend**: Firebase (Firestore, Auth)
- **Routing**: React Router DOM
- **State**: React Context + TanStack Query
- **PWA**: Service Worker pour offline

### Structure des Données Firebase

```
/users/{userId}
  - email
  - fullName
  - phone
  - createdAt

/bookings/{bookingId}
  - userId
  - userEmail
  - userName
  - hospitalId
  - hospitalName
  - doctorId
  - doctorName
  - department
  - date
  - time
  - status: pending | confirmed | cancelled | completed | expired
  - queueNumber
  - fee
  - expressCare
  - patientName
  - patientRelation
  - createdAt
  - updatedAt
```

---

## 4. Ce qui a été implémenté ✅

### Session 24 Jan 2026

#### 4.1 Système de Réservation (P0)
- ✅ Service `bookingService.ts` avec Firebase
- ✅ Création de réservations avec vérification des créneaux
- ✅ Prévention double-booking
- ✅ Annulation avec logique de remboursement (>24h)
- ✅ Historique des rendez-vous par utilisateur

#### 4.2 Page Urgence - Géolocalisation Réelle (P0)
- ✅ Haversine formula pour calcul de distance
- ✅ Tri des hôpitaux par proximité
- ✅ Affichage distance en km + temps estimé
- ✅ Départements réels par hôpital
- ✅ Boutons: Appeler / Naviguer (Google Maps) / Réserver RDV

#### 4.3 Vérificateur de Symptômes Intelligent (P0)
- ✅ Base de données symptômes FR/EN
- ✅ Recommandation de départements
- ✅ Niveaux de sévérité (Urgent/Modéré/Léger)
- ✅ Hôpitaux recommandés basés sur:
  - Localisation utilisateur
  - Départements correspondants
  - Distance triée

#### 4.4 Prix Réels Cameroun (P1)
- ✅ Consultation générale: 5 000 FCFA
- ✅ Spécialiste: 7 000 FCFA
- ✅ Professeur: 15 000 FCFA
- ✅ Visite domicile: 10 000 FCFA
- ✅ Urgence/Nuit: jusqu'à 15 000 FCFA

#### 4.5 Corrections Navigation (P1)
- ✅ Remplacement `setCurrentPage()` par `navigate()`
- ✅ Data-testid sur tous éléments interactifs
- ✅ Bottom navigation visible sur toutes les pages

#### 4.6 Page Profile (P2)
- ✅ Infos utilisateur depuis Firebase
- ✅ Historique des rendez-vous
- ✅ RDV à venir vs passés
- ✅ Bouton déconnexion

---

## 5. Backlog Priorisé

### P0 - Critique (Prochaine session)
- [ ] Intégration paiement (Mobile Money MTN/Orange)
- [ ] Notifications SMS/Email de rappel
- [ ] Tests end-to-end avec utilisateur réel

### P1 - Important
- [ ] Système de notation médecins
- [ ] Chat avec médecin
- [ ] Upload ordonnances/documents médicaux
- [ ] Téléconsultation vidéo

### P2 - Nice to have
- [ ] Multi-langue complète (ajout langues locales)
- [ ] Mode hors-ligne amélioré
- [ ] Intégration assurance maladie
- [ ] Historique médical complet

---

## 6. Métriques de Succès

- Taux de conversion inscription → réservation: >30%
- Temps moyen pour trouver un hôpital: <30 secondes
- Taux d'annulation: <15%
- Note app store: >4.5/5

---

## 7. Contraintes Techniques

- PWA fonctionnelle sur réseaux lents (2G/3G)
- Support navigateurs: Chrome, Safari, Firefox (mobile prioritaire)
- Pas de dépendance à Google Maps API payante (utilise OpenStreetMap/OSRM)
- Firebase gratuit tier (10K écritures/jour)

---

## 8. Déploiement

- **Production**: Vercel (auto-deploy depuis GitHub)
- **URL**: https://medi-fast-cameroon-six.vercel.app/
- **GitHub**: https://github.com/AmIMaybeAnOrange/MediFast-Cameroon

---

## 9. Prochaines Actions

1. **Tester avec vrais utilisateurs** à Yaoundé
2. **Intégrer Mobile Money** pour paiement
3. **Ajouter SMS de confirmation** (Twilio ou local provider)
4. **Optimiser performance** (lazy loading, code splitting)
