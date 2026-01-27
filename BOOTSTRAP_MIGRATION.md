# Bootstrap to MUI Migration Guide

## Overview
This guide documents the ongoing migration from React-Bootstrap to MUI (Material-UI) as part of Phase 6/6 of the design system overhaul.

## Migration Status

### ✅ Completed (15/15 core components)

#### UI Components (11)
- Card → MUI Card with variants (elevated, outlined, glass)
- EmptyState → MUI Card + motion
- ErrorBoundary → MUI Alert + Card
- SkeletonCard, SkeletonList, SkeletonTable → MUI + react-loading-skeleton
- AnimatedButton, AnimatedCard → MUI + Framer Motion  
- IconButton → MUI IconButton
- ToastProvider → MUI Snackbar + Alert
- KeyboardShortcutsModal → MUI Dialog

#### Admin Components (4)
- AdminPageLayout → MUI Container + Typography
- AdminAuthGuard → MUI Alert + Container
- FormCard → MUI Card + CardHeader/Content/Actions
- PlayerSelector → MUI Select + FormControl

#### Layout & Errors
- Footer → MUI Grid + Box + Stack
- DynamicBreadcrumb → MUI Breadcrumbs
- not-found.tsx → MUI Container + Typography
- error.tsx → MUI (new file)

### 🔄 Remaining (38 items)

#### Pages (9)
- account/page.tsx
- login/page.tsx
- phasmotourney-series/page.tsx
- phasmotourney2records/page.tsx
- phasmotourneyData/page.tsx
- posts/page.tsx
- profile/page.tsx
- style-check/page.tsx
- suggestions/page.tsx

#### Components (29)
See main PR description for full list.

## Migration Patterns

### Container → Container
```tsx
// Before (Bootstrap)
import { Container } from "react-bootstrap";
<Container className="py-4">...</Container>

// After (MUI)
import { Container } from "@mui/material";
<Container maxWidth="xl" sx={{ py: 4 }}>...</Container>
```

### Card → Card
```tsx
// Before
import { Card } from "react-bootstrap";
<Card className="shadow-sm">
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
</Card>

// After
import { Card, CardHeader, CardContent } from "@mui/material";
<Card elevation={2}>
  <CardHeader title="Title" />
  <CardContent>Content</CardContent>
</Card>
```

### Button → Button
```tsx
// Before
import { Button } from "react-bootstrap";
<Button variant="primary" size="lg">Click</Button>

// After
import { Button } from "@mui/material";
<Button variant="contained" color="primary" size="large">Click</Button>
```

### Alert → Alert
```tsx
// Before
import { Alert } from "react-bootstrap";
<Alert variant="warning">Message</Alert>

// After
import { Alert } from "@mui/material";
<Alert severity="warning">Message</Alert>
```

### Form → TextField / FormControl
```tsx
// Before
import { Form } from "react-bootstrap";
<Form.Group>
  <Form.Label>Name</Form.Label>
  <Form.Control type="text" />
</Form.Group>

// After
import { TextField } from "@mui/material";
<TextField
  label="Name"
  fullWidth
  margin="normal"
/>
```

### Grid (Row/Col) → Grid
```tsx
// Before
import { Row, Col } from "react-bootstrap";
<Row>
  <Col md={6}>Left</Col>
  <Col md={6}>Right</Col>
</Row>

// After
import { Grid } from "@mui/material";
<Grid container spacing={3}>
  <Grid item xs={12} md={6}>Left</Grid>
  <Grid item xs={12} md={6}>Right</Grid>
</Grid>
```

### Badge → Chip
```tsx
// Before
import { Badge } from "react-bootstrap";
<Badge bg="primary">Label</Badge>

// After
import { Chip } from "@mui/material";
<Chip label="Label" color="primary" />
```

### Table → Table
```tsx
// Before
import { Table } from "react-bootstrap";
<Table responsive striped hover>
  <thead>...</thead>
  <tbody>...</tbody>
</Table>

// After
import { Table, TableHead, TableBody, TableRow, TableCell, Paper } from "@mui/material";
<Paper sx={{ width: '100%', overflow: 'auto' }}>
  <Table>
    <TableHead>...</TableHead>
    <TableBody>...</TableBody>
  </Table>
</Paper>
```

### Modal → Dialog
```tsx
// Before
import { Modal } from "react-bootstrap";
<Modal show={open} onHide={onClose}>
  <Modal.Header closeButton>
    <Modal.Title>Title</Modal.Title>
  </Modal.Header>
  <Modal.Body>Content</Modal.Body>
</Modal>

// After
import { Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
<Dialog open={open} onClose={onClose}>
  <DialogTitle>
    Title
    <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
      <CloseIcon />
    </IconButton>
  </DialogTitle>
  <DialogContent>Content</DialogContent>
</Dialog>
```

### Spinner → CircularProgress
```tsx
// Before
import { Spinner } from "react-bootstrap";
<Spinner animation="border" />

// After
import { CircularProgress } from "@mui/material";
<CircularProgress />
```

### ListGroup → List
```tsx
// Before
import { ListGroup } from "react-bootstrap";
<ListGroup>
  <ListGroup.Item>Item</ListGroup.Item>
</ListGroup>

// After
import { List, ListItem, ListItemText } from "@mui/material";
<List>
  <ListItem>
    <ListItemText primary="Item" />
  </ListItem>
</List>
```

## Styling Migration

### className → sx prop
```tsx
// Before
<div className="mt-3 mb-4 text-center">

// After
<Box sx={{ mt: 3, mb: 4, textAlign: 'center' }}>
```

### Spacing
- Bootstrap: `mt-3`, `mb-4`, `py-2`, `px-3`
- MUI: `mt: 3`, `mb: 4`, `py: 2`, `px: 3`
- Note: MUI uses 8px base unit

### Colors
- Bootstrap: `text-primary`, `bg-secondary`, `text-muted`
- MUI: `color="primary"`, `bgcolor="secondary.main"`, `color="text.secondary"`

### Display/Flex
- Bootstrap: `d-flex`, `justify-content-center`, `align-items-center`
- MUI: `display="flex"`, `justifyContent="center"`, `alignItems="center"`

## Next Steps

1. Migrate remaining 9 pages
2. Migrate navigation components
3. Migrate domain-specific components (tourney, home, profile, etc.)
4. Remove Bootstrap from:
   - package.json dependencies
   - global.scss import
   - Anywhere still using react-bootstrap
5. Update copilot instructions
6. Run full accessibility audit
7. Test in light/dark modes
8. Create before/after screenshots

## Tips

- Use MUI's theme system for consistent colors: `theme.palette.primary.main`
- Leverage the `sx` prop for one-off styling
- Use `styled()` for reusable component variants
- Test responsive breakpoints: `{ xs: 12, md: 6 }`
- Ensure dark mode compatibility with `theme.palette.mode`
- Add transitions for interactive elements: `transition: 'all 0.2s'`
