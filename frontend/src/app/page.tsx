"use client";
import { useActionState } from "react";
import { handleEmail } from "@/src/actions/handleEmail";
export default function Home() {
  const [state, action, pending] = useActionState(handleEmail, {
    errorMassege: "",
    success: false,
  });

  return (
    <div className="border-2 h-screen  flex flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <form action={action} className="flex flex-col items-center gap-4">
        <input
          type="email"
          placeholder="Enter your email"
          name="email"
          className="border border-gray-300 rounded-md p-2"
        />
        <button
          type="submit"
          disabled={pending}
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          {pending ? "Checking..." : "Check your email"}
        </button>
        {state.errorMassege && (
          <p className="text-red-500">{state.errorMassege}</p>
        )}
        {state.success && (
          <p className="text-green-500">Email sent successfully</p>
        )}
      </form>
    </div>
  );
}
