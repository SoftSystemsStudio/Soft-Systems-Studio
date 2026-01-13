// System V1 Demo Page - Pages Router wrapper
// This wraps the App Router component for compatibility

import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with WebGL
const SystemV1Demo = dynamic(() => import('@/app/demo/god-tier/page'), { ssr: false });

export default function SystemV1Page() {
  return <SystemV1Demo />;
}
