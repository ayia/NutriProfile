# Audit Responsive

Vérifie et corrige les problèmes de responsive design.

## Breakpoints Tailwind

| Préfixe | Min Width | Device |
|---------|-----------|--------|
| (base)  | 0px       | iPhone SE (375px) |
| sm:     | 640px     | Large phones |
| md:     | 768px     | Tablets |
| lg:     | 1024px    | Laptops |
| xl:     | 1280px    | Desktops |

## Checklist par Écran

### Mobile (375px)
- [ ] Pas d'overflow horizontal
- [ ] Texte lisible (min 14px)
- [ ] Touch targets >= 44px
- [ ] Navigation bottom accessible
- [ ] Modals ne dépassent pas

### Tablet (768px)
- [ ] Grilles s'adaptent
- [ ] Sidebar si applicable
- [ ] Images responsives

### Desktop (1024px+)
- [ ] Layout optimisé
- [ ] Hover states
- [ ] Max-width conteneurs

## Patterns à Vérifier

```tsx
// Typography
text-sm sm:text-base md:text-lg

// Spacing
p-2 sm:p-4 md:p-6

// Grids
grid-cols-1 sm:grid-cols-2 lg:grid-cols-3

// Modals
max-w-[calc(100vw-24px)] sm:max-w-md

// Blobs (éviter overflow)
w-[200px] sm:w-[350px] md:w-[500px]
```

## Problèmes Courants

1. **Overflow horizontal**: Éléments décoratifs trop grands
2. **Touch targets trop petits**: Boutons < 44px
3. **Texte illisible**: Font size < 12px sur mobile
4. **Modal qui dépasse**: max-width fixe sans calc

## Composant/Page à Auditer

$ARGUMENTS
