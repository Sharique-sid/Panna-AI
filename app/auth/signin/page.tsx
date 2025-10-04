import { SignInForm } from "@/components/auth/signin-form"

export default function SignInPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 bg-background">
      <div className="w-full max-w-sm">
        <SignInForm />
      </div>
    </div>
  )
}
