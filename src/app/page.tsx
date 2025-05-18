import dynamic from 'next/dynamic';

// Use dynamic import with no SSR to avoid hydration issues with the panels
const AppWithNoSSR = dynamic(() => import('./app'), {
  ssr: false,
});

export default function Home() {
  return <AppWithNoSSR />;
}
