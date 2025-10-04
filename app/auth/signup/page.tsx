import { SignUpForm } from "@/components/auth/signup-form"

export default function SignUpPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 bg-background">
      <div className="w-full max-w-sm">
        <SignUpForm />
      </div>
    </div>
  )
}
