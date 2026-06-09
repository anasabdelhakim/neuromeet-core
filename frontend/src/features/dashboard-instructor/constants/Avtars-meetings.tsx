export const Avatars = [
  {
    initials: "YS",
    color: "bg-cyan-600",
    alt: "Yousef",
  },
  {
    initials: "MH",
    color: "bg-purple-600",
    alt: "Mohamed",
  },
  {
    src: "/avatar-man.png",
    alt: "Ahmed",
  },
  {
    initials: "AL",
    color: "bg-orange-500",
    alt: "Ali",
  },
  {
    initials: "OM",
    color: "bg-emerald-600",
    alt: "Omar",
  },
  {
    initials: "KS",
    color: "bg-blue-600",
    alt: "Kareem",
  },
];

import Image from "next/image";

export const AvatarChain = ({ avatars = Avatars, max = 4 }) => {
  return (
    <div className="flex">
      {avatars.slice(0, max).map((avatar, i) => (
        <div
          key={i}
          className={`relative w-8 h-8 flex items-center justify-center rounded-full border-2 -ml-3 first:ml-0 overflow-hidden shadow-sm ${avatar.color || "bg-muted"}`}
          style={{ zIndex: max - i }}
          title={avatar.alt}
        >
          {avatar.src ? (
            <Image
              src={avatar.src}
              alt={avatar.alt}
              fill
              sizes="32px"
              className="object-cover"
            />
          ) : (
            <span className="text-xs font-bold text-white uppercase">
              {avatar.initials}
            </span>
          )}
        </div>
      ))}
      {avatars.length > max && (
        <div
          className="relative w-8 h-8 rounded-full border-2 border-background bg-primary-soft-muted flex items-center justify-center text-[11px] font-bold text-primary-light -ml-3 shadow-sm backdrop-blur-sm"
          style={{ zIndex: 0 }}
        >
          +{avatars.length - max}
        </div>
      )}
    </div>
  );
};
