import Head from 'next/head';
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <>
      <Head>
        <title>Sign Up - Soft Systems Studio</title>
        <link rel="canonical" href="https://softsystemsstudiollc.com/sign-up" />
      </Head>
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <SignUp
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
