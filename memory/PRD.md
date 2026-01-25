# MediFast Cameroon - PRD (Product Requirements Document)

## Date de création: 24 Janvier 2026
## Dernière mise à jour: 24 Janvier 2026

---

## 1. Vision du Produit

**MediFast Cameroon** (MboaMed) est une Progressive Web App (PWA) de réservation de rendez-vous médicaux conçue pour les Camerounais.

### Objectif Principal
**RÉSERVATION DE RENDEZ-VOUS MÉDICAUX** - Pas une app de navigation.

---

## 2. Ce qui a été implémenté ✅

### Session 24 Jan 2026 - Mise à jour

#### ✅ PWA Configuration Complète
- `manifest.json` avec icônes et shortcuts
- Service Worker (`sw.js`) pour cache offline
- Page offline (`offline.html`) avec numéro d'urgence
- Meta tags PWA dans `index.html`

#### ✅ Upload Photo Profil
- Upload vers Firebase Storage
- Validation taille (max 5MB) et type (images)
- Mise à jour automatique du profil

#### ✅ Modification Profil Complet
- Nom, téléphone, WhatsApp
- Groupe sanguin (A+, A-, B+, B-, AB+, AB-, O+, O-)
- Allergies (ajout/suppression)
- Conditions chroniques (ajout/suppression)
- Sauvegarde dans Firebase Firestore

#### ✅ Services Firebase
- `userService.ts` : gestion profil utilisateur
- `bookingService.ts` : gestion réservations
- Firebase Storage pour photos

#### ✅ Système de Tarification
- Consultation générale: 5 000 FCFA
- Spécialiste: 7 000 FCFA
- Professeur: 15 000 FCFA
- Visite domicile: +10 000 FCFA
- Suppléments nuit/férié

#### ✅ Page Urgence
- 29 établissements avec géolocalisation
- Tri par distance
- Filtres (Hôpital, Clinique, Centre de Santé)
- Bouton appel 222

---

## 3. Ce qui n'est PAS implémenté ❌

### ❌ SMS de Confirmation
- Le message "Vous recevrez un SMS" est affiché mais **aucun SMS n'est envoyé**
- Nécessite intégration Twilio ou autre provider SMS
- Coût: ~0.05€ par SMS

### ❌ Paiement Mobile Money Réel
- Le flux de paiement MTN/Orange Money est **simulé**
- Nécessite partenariat avec MTN MoMo API ou Orange Money API
- Les APIs sont disponibles mais requièrent un compte marchand

---

## 4. Architecture Technique

### Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Shadcn UI
- **Backend**: Firebase (Firestore, Auth, Storage)
- **PWA**: Service Worker + Manifest

### Structure des Fichiers Clés
```
/app/
├── index.html (avec PWA meta tags)
├── public/
│   ├── manifest.json
│   ├── sw.js (Service Worker)
│   ├── offline.html
│   └── icons/ (icônes PWA)
└── src/
    ├── components/
    │   ├── ProfilePage.tsx (avec upload photo)
    │   ├── BookAppointment.tsx
    │   ├── PaymentPage.tsx
    │   └── ...
    ├── services/
    │   ├── userService.ts (NEW)
    │   ├── bookingService.ts
    │   └── paymentService.ts (MOCKED)
    ├── config/
    │   └── pricing.ts
    └── lib/
        └── firebase.ts
```

---

## 5. Connexion avec GitHub

L'application a été développée sur le GitHub d'un ami. Pour synchroniser:

### Option 1: Être ajouté comme collaborateur
1. L'ami va sur son repo → Settings → Collaborators
2. Ajoute votre username GitHub
3. Vous pouvez ensuite push directement

### Option 2: Fork + Pull Request
1. Fork le repo vers votre compte
2. Utilisez "Save to GitHub" sur Emergent
3. Créez une Pull Request vers le repo original

### Option 3: Transfert de propriété
1. Settings → Transfer ownership
2. Transférer vers votre compte

---

## 6. Prochaines Actions

### P0 - Critique
- [ ] Intégration SMS réelle (Twilio recommandé)
- [ ] Intégration Mobile Money réelle (MTN MoMo API)
- [ ] Tests avec vrais utilisateurs

### P1 - Important
- [ ] Notifications push
- [ ] Rappels de rendez-vous
- [ ] Chat avec médecin

### P2 - Nice to have
- [ ] Téléconsultation vidéo
- [ ] Multi-langue (langues locales)
- [ ] Mode hors-ligne complet
