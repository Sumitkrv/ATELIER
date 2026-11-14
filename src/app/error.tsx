"use client";
export default function PublicError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="mx-auto min-h-[60vh] max-w-xl px-5 py-24 text-center"><h1 className="font-serif text-3xl">We’ll be back shortly</h1><p className="mt-4">Website content is temporarily unavailable. Please try again in a moment.</p><button className="mt-6 rounded-lg bg-[#681A27] px-6 py-3 text-white" onClick={reset}>Try again</button></main>;
}
