// God Tier Demo Page - Pages Router wrapper
// This wraps the App Router component for compatibility

import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with WebGL
const GodTierDemo = dynamic(() => import('@/app/demo/god-tier/page'), { ssr: false });

export default function GodTierPage() {
  return <GodTierDemo />;
}
