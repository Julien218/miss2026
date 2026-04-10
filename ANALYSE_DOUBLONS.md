# Analyse des Doublons - Miss & Mister Dour

**Date:** 16 février 2026  
**Pages analysées:** 47 fichiers dans `client/src/pages/`

---

## 📊 Résumé Exécutif

**Doublons identifiés:** 6 catégories majeures  
**Lignes de code dupliquées estimées:** ~1200 lignes  
**Potentiel de réduction:** 40-50% via composants réutilisables

---

## 1. 🎨 PageHeader Pattern (5 occurrences)

**Pages concernées:**
- Calendar.tsx
- Choreographer.tsx
- Settings.tsx
- Notifications.tsx
- Photographer.tsx

**Code dupliqué:**
```tsx
<div>
  <h1 className="text-4xl font-playfair font-bold bg-gradient-to-r from-[#D4AF37] to-[#B8941E] bg-clip-text text-transparent">
    {title}
  </h1>
  <p className="text-[#8B7355]/70">{description}</p>
</div>
```

**Solution:** Créer `<PageHeader title description actionButton? />`

---

## 2. 🔍 FilterBar Pattern (3 occurrences)

**Pages concernées:**
- Notifications.tsx (typeFilter)
- Photographer.tsx (categoryFilter, statusFilter)
- Calendar.tsx (potentiel)

**Code dupliqué:**
```tsx
<div className="flex items-center gap-4">
  <Filter className="w-5 h-5 text-[#D4AF37]" />
  <span className="font-medium text-[#8B7355]">Filtres:</span>
  <Select value={filter} onValueChange={setFilter}>
    <SelectTrigger className="w-[200px] border-[#D4AF37]/30">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {/* Options */}
    </SelectContent>
  </Select>
</div>
```

**Solution:** Créer `<FilterBar filters={[{label, value, options}]} />`

---

## 3. 🃏 DataCard Pattern (estimé 10+ occurrences)

**Pages concernées:**
- Calendar.tsx (event cards)
- Choreographer.tsx (choreography cards)
- Photographer.tsx (photo cards)
- Candidates.tsx (candidate cards)
- Gallery.tsx (gallery cards)

**Code dupliqué:**
```tsx
<div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-[#D4AF37]/20 overflow-hidden hover:scale-105 transition-transform duration-300">
  <div className="p-6 space-y-3">
    {/* Content */}
  </div>
</div>
```

**Solution:** Créer `<DataCard variant="default|compact|image" hover children />`

---

## 4. 🏷️ StatusBadge Pattern (estimé 8+ occurrences)

**Pages concernées:**
- Photographer.tsx (pending/approved/rejected)
- Notifications.tsx (info/success/warning/error)
- Calendar.tsx (upcoming/past)
- Candidates.tsx (active/inactive)

**Code dupliqué:**
```tsx
switch (status) {
  case "pending":
    return <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">En attente</span>;
  case "approved":
    return <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Approuvée</span>;
  // ...
}
```

**Solution:** Créer `<StatusBadge status variant="success|warning|error|info" />`

---

## 5. 👁️ ViewToggle Pattern (2 occurrences)

**Pages concernées:**
- Photographer.tsx (grid/list)
- Gallery.tsx (potentiel grid/list)

**Code dupliqué:**
```tsx
const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

<div className="flex gap-2">
  <Button
    variant={viewMode === "grid" ? "default" : "outline"}
    onClick={() => setViewMode("grid")}
  >
    <Grid3x3 className="w-4 h-4" />
  </Button>
  <Button
    variant={viewMode === "list" ? "default" : "outline"}
    onClick={() => setViewMode("list")}
  >
    <List className="w-4 h-4" />
  </Button>
</div>
```

**Solution:** Créer `useViewMode()` hook + `<ViewToggle value onChange />`

---

## 6. 📭 EmptyState Pattern (estimé 6+ occurrences)

**Pages concernées:**
- Photographer.tsx ("Aucune photo")
- Calendar.tsx ("Aucun événement")
- Notifications.tsx ("Aucune notification")
- Candidates.tsx ("Aucun candidat")

**Code dupliqué:**
```tsx
<div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-[#D4AF37]/20 p-12 text-center">
  <Icon className="w-16 h-16 text-[#D4AF37] mx-auto mb-4" />
  <h3 className="text-xl font-playfair text-[#8B7355] mb-2">{title}</h3>
  <p className="text-[#8B7355]/70">{description}</p>
</div>
```

**Solution:** Créer `<EmptyState icon title description action? />`

---

## 7. 🎭 Dialog Pattern (estimé 5+ occurrences)

**Pages concernées:**
- Photographer.tsx (upload dialog)
- Choreographer.tsx (create choreography dialog)
- Calendar.tsx (create event dialog)
- Candidates.tsx (register candidate dialog)

**Code dupliqué:**
```tsx
const [isDialogOpen, setIsDialogOpen] = useState(false);

<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
  <DialogTrigger asChild>
    <Button>Action</Button>
  </DialogTrigger>
  <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-sm border-[#D4AF37]/20">
    <DialogHeader>
      <DialogTitle className="text-2xl font-playfair text-[#8B7355]">{title}</DialogTitle>
    </DialogHeader>
    {/* Form */}
  </DialogContent>
</Dialog>
```

**Solution:** Créer `useDialog()` hook + `<FormDialog title trigger children />`

---

## 📈 Plan d'Action Recommandé

### Phase 1: Composants UI Réutilisables (Priorité Haute)
1. `PageHeader.tsx` - Header unifié avec titre gradient or
2. `DataCard.tsx` - Card générique glassmorphism
3. `StatusBadge.tsx` - Badges de statut colorés
4. `EmptyState.tsx` - État vide avec icône et CTA
5. `FilterBar.tsx` - Barre de filtres avec Select
6. `ViewToggle.tsx` - Toggle grid/list

### Phase 2: Hooks Personnalisés (Priorité Moyenne)
1. `useViewMode.ts` - Gestion grid/list avec localStorage
2. `useDialog.ts` - Gestion open/close state
3. `useFilters.ts` - Gestion filtres avec query params
4. `usePagination.ts` - Pagination avec limit/offset

### Phase 3: Refactorisation Pages (Priorité Haute)
1. Photographer.tsx (-200 lignes estimées)
2. Calendar.tsx (-150 lignes estimées)
3. Choreographer.tsx (-180 lignes estimées)
4. Notifications.tsx (-120 lignes estimées)
5. Settings.tsx (-100 lignes estimées)

---

## 🎯 Métriques de Succès

**Avant refactorisation:**
- Total lignes code pages: ~5000 lignes
- Composants réutilisables: 0
- Hooks personnalisés: 0

**Après refactorisation (cible):**
- Total lignes code pages: ~3000 lignes (-40%)
- Composants réutilisables: 6-8
- Hooks personnalisés: 3-4
- Maintenabilité: +60%
- Cohérence design: +80%

---

## 🚀 Bénéfices Attendus

1. **Maintenabilité:** Modification d'un composant = mise à jour globale
2. **Cohérence:** Design uniforme sur toutes les pages
3. **Productivité:** Nouvelles pages créées 3x plus rapidement
4. **Performance:** Moins de code = bundle size réduit
5. **Tests:** Composants isolés = tests unitaires simplifiés
