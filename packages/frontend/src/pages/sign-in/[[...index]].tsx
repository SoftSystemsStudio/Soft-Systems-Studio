import Head from 'next/head';
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <>
      <Head>
        <title>Sign In - Soft Systems Studio</title>
        <link rel="canonical" href="https://softsystemsstudiollc.com/sign-in" />
      </Head>
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <SignIn
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'shadow-xl',
            },
          }}
        />
      </div>
    </>
  );
}
