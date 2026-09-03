import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <SignIn
        appearance={{
          variables: {
            colorPrimary: "#6C47FF",
          },
        }}
      />
    </div>
  );
}