"use client";
import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const { login, signup } = useAuth();
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [signupForm, setSignupForm] = useState(false);
  const router = useRouter();

  function changeForm(e: React.MouseEvent) {
    e.preventDefault();
    setSignupForm((f) => !f);
  }

  async function handleForm(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const email = emailRef.current!.value;
      const pass = passwordRef.current!.value;
      if (signupForm) await signup(email, pass);
      else await login(email, pass);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Auth failed");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-4">
      <div className="rounded-lg border border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-4 py-3 text-center mb-4">
        {signupForm
          ? "Create an account with us"
          : "Enter your details to login to the website"}
      </div>

      <form onSubmit={handleForm}>
        <div className="mb-3">
          <div className="flex items-center gap-4">
            <label className="w-20 text-sm font-medium text-foreground shrink-0">
              Email:
            </label>
            <input
              type="email"
              required
              placeholder="A valid email address"
              ref={emailRef}
              className="flex-1 rounded-lg border border-border dark:border-border-dark bg-background dark:bg-background-dark text-foreground px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div className="mb-3">
          <div className="flex items-center gap-4">
            <label className="w-20 text-sm font-medium text-foreground shrink-0">
              Password:
            </label>
            <input
              type="password"
              required
              placeholder="Minimum 8 length"
              minLength={8}
              ref={passwordRef}
              className="flex-1 rounded-lg border border-border dark:border-border-dark bg-background dark:bg-background-dark text-foreground px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div className="flex mb-3 gap-2">
          <button
            disabled={loading}
            type="submit"
            className="flex-1 rounded-lg bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {signupForm ? "Create account" : "Login"}
          </button>
          <button
            disabled={loading}
            type="reset"
            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-foreground px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      </form>

      <div className="rounded-lg border border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-4 py-3 mb-4">
        {signupForm ? (
          <span>
            Already have an account with us?{" "}
            <a
              href="#"
              onClick={changeForm}
              className="underline font-medium hover:text-blue-600"
            >
              Click here
            </a>
          </span>
        ) : (
          <span>
            Don&apos;t have an account yet?{" "}
            <a
              href="#"
              onClick={changeForm}
              className="underline font-medium hover:text-blue-600"
            >
              Click here
            </a>
          </span>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300 px-4 py-3">
          {error}
        </div>
      )}
    </div>
  );
}
