# Admin Components - Modular Design Guide

This directory contains reusable components for building consistent and maintainable admin pages, especially for Phasmo Tourney 5 admin functionality.

## Overview

The admin components follow a modular design pattern that:
- Reduces code duplication across admin pages
- Provides consistent UI/UX across the admin interface
- Simplifies authentication and authorization checks
- Makes admin pages easier to maintain and extend

## Components

### AdminAuthGuard

A wrapper component that handles admin authentication checks.

**Usage:**
```tsx
import { AdminAuthGuard } from "@/components/admin";

export default function MyAdminPage() {
  return (
    <AdminAuthGuard message="Custom access denied message">
      <YourPageContent />
    </AdminAuthGuard>
  );
}
```

**Props:**
- `children: ReactNode` - The content to display if user is admin
- `message?: string` - Custom message to show if not admin (default: "Admin access required.")

---

### AdminPageLayout

Provides a consistent layout structure with title, subtitle, and optional back navigation.

**Usage:**
```tsx
import { AdminAuthGuard, AdminPageLayout } from "@/components/admin";

export default function MyAdminPage() {
  return (
    <AdminAuthGuard>
      <AdminPageLayout
        title="Manage Round 1"
        subtitle="Standard Round - Record runs and assign immunity"
        backLink={{ href: "/admin/phasmoTourney5", label: "Back to Admin Dashboard" }}
      >
        <YourPageContent />
      </AdminPageLayout>
    </AdminAuthGuard>
  );
}
```

**Props:**
- `children: ReactNode` - The page content
- `title: string` - Page title (displayed as h2)
- `subtitle?: string` - Optional subtitle text
- `backLink?: { href: string, label: string }` - Optional back navigation link

---

### PlayerSelector

A consistent dropdown component for selecting players from a list.

**Usage:**
```tsx
import { PlayerSelector, useAdminPlayers } from "@/components/admin";

export default function MyForm() {
  const { players } = useAdminPlayers();
  const [selectedPlayer, setSelectedPlayer] = useState("");

  return (
    <PlayerSelector
      players={players}
      value={selectedPlayer}
      onChange={setSelectedPlayer}
      label="Choose Player"
      placeholder="Select a player..."
      required
      showStatus
    />
  );
}
```

**Props:**
- `players: Player[]` - Array of player objects
- `value: string` - Currently selected player ID
- `onChange: (playerId: string) => void` - Callback when selection changes
- `label?: string` - Label text (default: "Player")
- `placeholder?: string` - Placeholder text (default: "Choose a player...")
- `required?: boolean` - Whether selection is required
- `disabled?: boolean` - Whether selector is disabled
- `showStatus?: boolean` - Whether to show player status in dropdown

---

### FormCard

A styled card wrapper for forms with consistent header, body, and optional submit button.

**Usage:**
```tsx
import { FormCard } from "@/components/admin";

export default function MyForm() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <FormCard
      title="Add New Result"
      subtitle="Enter player performance data"
      onSubmit={handleSubmit}
      submitLabel="Save Result"
      submitDisabled={false}
    >
      <Form.Group className="mb-3">
        <Form.Label>Score</Form.Label>
        <Form.Control type="number" />
      </Form.Group>
      {/* More form fields */}
    </FormCard>
  );
}
```

**Props:**
- `children: ReactNode` - Form fields and content
- `title: string` - Card header title
- `subtitle?: string` - Optional subtitle in header
- `onSubmit?: (e: React.FormEvent) => void` - Form submission handler (if provided, wraps children in `<form>`)
- `submitLabel?: string` - Submit button text (default: "Submit")
- `submitDisabled?: boolean` - Whether submit button is disabled
- `footer?: ReactNode` - Optional card footer content

---

### useAdminPlayers (Hook)

A custom React hook for loading and managing player data with built-in loading and error states.

**Usage:**
```tsx
import { useAdminPlayers, PlayerSelector } from "@/components/admin";
import { Spinner, Alert } from "react-bootstrap";

export default function MyComponent() {
  const { players, loading, error, refetch } = useAdminPlayers(true);

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div>
      <PlayerSelector players={players} ... />
      <Button onClick={refetch}>Refresh Players</Button>
    </div>
  );
}
```

**Parameters:**
- `filterEliminated?: boolean` - Whether to filter out eliminated players (default: `true`)

**Returns:**
- `players: Player[]` - Array of player objects
- `loading: boolean` - Loading state
- `error: string | null` - Error message if fetch failed
- `refetch: () => Promise<void>` - Function to reload player data

---

## Complete Example

See `src/app/admin/phasmoTourney5/managerounds/round2/page.refactored.example.tsx` for a complete example of how these components work together to create a clean, maintainable admin page.

### Before (Original):
```tsx
// 240 lines of code with:
// - Manual auth checks
// - Duplicated layout code
// - Inline player fetching
// - Repeated form patterns
```

### After (Refactored):
```tsx
// ~150 lines of code with:
// - Reusable components
// - Consistent styling
// - Cleaner separation of concerns
// - Easier to maintain and extend
```

## Benefits

1. **Consistency**: All admin pages use the same layout, authentication, and form patterns
2. **Maintainability**: Changes to common patterns only need to be made once
3. **Developer Experience**: New admin pages are faster to build with less boilerplate
4. **Type Safety**: All components are fully typed with TypeScript
5. **Accessibility**: Components follow Bootstrap's accessibility patterns

## Migration Guide

To migrate an existing admin page:

1. Wrap page content with `<AdminAuthGuard>`
2. Replace manual auth checks and Container with `<AdminPageLayout>`
3. Replace player fetching code with `useAdminPlayers()` hook
4. Replace player select dropdowns with `<PlayerSelector>`
5. Wrap forms with `<FormCard>` for consistent styling

See the refactored example file for a complete migration example.
