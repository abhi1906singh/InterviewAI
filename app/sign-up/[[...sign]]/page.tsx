import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <SignUp
        appearance={{
          elements: {
            card: "shadow-xl rounded-2xl",
            headerTitle: "text-2xl font-bold",
            headerSubtitle: "text-gray-500",
            formButtonPrimary:
              "bg-indigo-600 hover:bg-indigo-700 text-white",
            footerActionLink:
              "text-indigo-600 hover:text-indigo-700",
          },
        }}
      />
    </div>
  );
}