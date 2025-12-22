# Règles Frontend React

## Stack
- React 18
- TypeScript (strict mode)
- Vite
- Tailwind CSS
- shadcn/ui
- React Query (TanStack Query)
- React Router v6

## Conventions de Code

### TypeScript Strict
```typescript
// ✅ Correct - Types explicites
interface User {
  id: number;
  email: string;
  name: string;
}

const UserCard: React.FC<{ user: User }> = ({ user }) => {
  return <div>{user.name}</div>;
};

// ❌ Incorrect - any ou types implicites
const UserCard = ({ user }: any) => { ... }
```

### Composants Fonctionnels
```typescript
// Toujours utiliser des composants fonctionnels
import { useState, useEffect } from 'react';

interface Props {
  userId: number;
}

export function UserProfile({ userId }: Props) {
  const [user, setUser] = useState<User | null>(null);

  // ...

  return (
    <div className="p-4">
      {user && <h1>{user.name}</h1>}
    </div>
  );
}
```

### React Query pour les Données
```typescript
import { useQuery, useMutation } from '@tanstack/react-query';

// Fetch
const { data: user, isLoading, error } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
});

// Mutation
const createUser = useMutation({
  mutationFn: (newUser: UserCreate) => api.post('/users', newUser),
  onSuccess: () => queryClient.invalidateQueries(['users']),
});
```

### Tailwind CSS
```typescript
// Utiliser les classes Tailwind directement
<button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Submit
</button>

// Pour les styles conditionnels, utiliser clsx ou cn
import { cn } from '@/lib/utils';

<div className={cn(
  "p-4 rounded",
  isActive && "bg-blue-100",
  isError && "bg-red-100"
)}>
```

### shadcn/ui Components
```typescript
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

// Utiliser les composants shadcn
<Card>
  <CardHeader>Titre</CardHeader>
  <CardContent>
    <Input placeholder="Email" />
    <Button variant="default">Submit</Button>
  </CardContent>
</Card>
```

## Structure des Dossiers

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── layout/          # Header, Footer, etc.
│   │   └── features/        # Composants par feature
│   ├── pages/               # Pages/Routes
│   ├── hooks/               # Custom hooks
│   ├── services/            # API calls
│   ├── lib/                 # Utilitaires
│   ├── types/               # Types TypeScript
│   └── App.tsx
├── public/
└── package.json
```

## Gestion des Erreurs

```typescript
// Error Boundary
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="p-4 bg-red-100 text-red-700 rounded">
      <h2>Une erreur est survenue</h2>
      <pre>{error.message}</pre>
    </div>
  );
}

<ErrorBoundary FallbackComponent={ErrorFallback}>
  <App />
</ErrorBoundary>
```

## Tests (Vitest)

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { UserCard } from './UserCard';

describe('UserCard', () => {
  it('affiche le nom utilisateur', () => {
    render(<UserCard user={{ id: 1, name: 'John', email: 'john@test.com' }} />);
    expect(screen.getByText('John')).toBeInTheDocument();
  });
});
```
