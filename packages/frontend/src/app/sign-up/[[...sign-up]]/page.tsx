import type { Metadata } from 'next';
import { SignUp } from '@clerk/nextjs';

export const metadata: Metadata = {
  title: 'Sign Up',
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505]">
      <SignUp
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'shadow-xl',
          },
        }}
      />
    </div>
  );
}
