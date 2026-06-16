import { Search } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/components/ui/input-group";
import { TopbarTitle } from "./TopbarTitle";
import { NotificationDropdown } from "./NotificationDropdown";

export function InstructorTopbar({ userProfileNode }: { userProfileNode: React.ReactNode }) {
  return (
    <header className="z-sticky flex items-center justify-between gap-4 bg-transparent px-8 py-4 transition-all duration-normal ease-standard">
      <TopbarTitle />

      <InputGroup className="w-md max-w-md flex-1 py-5">
        <InputGroupInput placeholder="Search..." />
        <InputGroupAddon>
          <Search className="size-5" />
        </InputGroupAddon>
      </InputGroup>

      <div className="flex items-center gap-6">
        <NotificationDropdown />
        {userProfileNode}
      </div>
    </header>
  );
}
