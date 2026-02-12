import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] text-white px-4">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-xl text-gray-400 mb-8">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-lime-400 text-black font-semibold rounded-lg hover:bg-lime-300 transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
}
