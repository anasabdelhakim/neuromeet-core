import { EmailForm } from "@/src/components/features/EmailForm";
import Image from "next/image";

export default function Home() {
  return (
    <div className="border-2 h-screen flex flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <EmailForm />
      {/* <Image width={150} height={150} src="/logo.webp" alt="chat" /> */}
    </div>
  );
}
