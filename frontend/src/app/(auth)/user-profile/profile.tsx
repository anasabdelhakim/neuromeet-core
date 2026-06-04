import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import AvatarSec from "@/src/features/auth/components/avatar";
const MOCK_USER = {
  profile: {
    full_name: "Anas Abdelhakim",
    email: "anas.abdelhakim@neuromeet.com",
    avatar_url:
      "https://api.dicebear.com/7.x/initials/svg?seed=Anas&backgroundColor=1a768d&fontSize=48",
    is_verified: true,
  },
};

export default function UserProfile() {
  const user = MOCK_USER;

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/sign-in">
          <Button variant="ghost" className="px-6 py-5">
            Sign in
          </Button>
        </Link>
        <Link href="/about">
          <Button className="px-6 py-5">Get Started</Button>
        </Link>
      </div>
    );
  }

  return <AvatarSec profile={user.profile} />;
}
