---
name: frontend-component
description: Use when creating or modifying Next.js frontend components. Ensures consistent patterns for React components, styling, motion, and the project's design system.
---

# Frontend Component Skill

## Component Location

- Components: `/packages/frontend/src/components/`
- Pages: `/packages/frontend/src/pages/`
- API routes: `/packages/frontend/src/pages/api/`

## File Naming

| Type             | Convention           | Example           |
| ---------------- | -------------------- | ----------------- |
| React components | PascalCase           | `HeroSection.tsx` |
| Utilities        | kebab-case           | `format-date.ts`  |
| Hooks            | camelCase with `use` | `useAnalytics.ts` |

## TypeScript Requirements

- Use strict types (no `any`)
- Define prop interfaces explicitly
- Export types when reusable

```typescript
interface HeroSectionProps {
  title: string;
  subtitle?: string;
  ctaText: string;
  onCtaClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  ctaText,
  onCtaClick,
}) => {
  // ...
};
```

## Design System Components

Use existing UI components from `/components/ui/`:

```typescript
import { Button } from '@/components/ui/Button';
import { HoloCard } from '@/components/ui/HoloCard';
import { Modal } from '@/components/ui/Modal';
import { GlowText } from '@/components/ui/GlowText';
import { ScanLine } from '@/components/ui/ScanLine';
```

## Motion/Animation

Use Framer Motion components from `/components/motion/`:

```typescript
import { FadeIn } from '@/components/motion/FadeIn';
import { StaggerContainer } from '@/components/motion/StaggerContainer';

export const MyComponent = () => (
  <StaggerContainer>
    <FadeIn>
      <h1>Hello</h1>
    </FadeIn>
    <FadeIn delay={0.2}>
      <p>World</p>
    </FadeIn>
  </StaggerContainer>
);
```

## Three.js Components

3D components are in `/components/three/`. Always use dynamic imports:

```typescript
import dynamic from 'next/dynamic';

const Scene3D = dynamic(() => import('@/components/three/Scene3D'), { ssr: false });
```

## Environment Variables

**Never access `process.env` directly** (ESLint rule enforced).

Use the typed env module:

```typescript
import { env } from '@/lib/env';

// Good
const apiUrl = env.NEXT_PUBLIC_API_URL;

// Bad - will fail lint
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

## Styling

Use Tailwind CSS with the brutalist theme:

```typescript
// Theme colors from tailwind.config.cjs
<div className="bg-background text-foreground">
  <h1 className="text-primary font-mono">Title</h1>
  <p className="text-muted-foreground">Description</p>
</div>
```

### Glass Effect Pattern

```typescript
<div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl">
  {/* Content */}
</div>
```

## Client-Only Components

For components using browser APIs:

```typescript
import dynamic from 'next/dynamic';

const ClientOnlyComponent = dynamic(() => import('./ClientOnlyComponent'), { ssr: false });
```

## Page Pattern

```typescript
// pages/my-page.tsx
import type { NextPage } from 'next';
import Head from 'next/head';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const MyPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>My Page | Soft Systems</title>
        <meta name="description" content="Page description" />
      </Head>

      <Navbar />

      <main className="min-h-screen">
        {/* Page content */}
      </main>

      <Footer />
    </>
  );
};

export default MyPage;
```

## API Route Pattern

```typescript
// pages/api/my-endpoint.ts
import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  success: boolean;
  data?: unknown;
  error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Handle request
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
```

## Related Files

- Components: `/packages/frontend/src/components/`
- UI Kit: `/packages/frontend/src/components/ui/`
- Motion: `/packages/frontend/src/components/motion/`
- Environment: `/packages/frontend/src/lib/env.ts`
- Tailwind config: `/packages/frontend/tailwind.config.cjs`
