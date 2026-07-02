export const Avatars = [
  {
    initials: "YS",
    color: "bg-brand-cyan",
    alt: "Yousef",
  },
  {
    initials: "MH",
    color: "bg-brand-purple",
    alt: "Mohamed",
  },
  {
    src: "/avatar-man.png",
    alt: "Ahmed",
  },
  {
    initials: "AL",
    color: "bg-action-yellow",
    alt: "Ali",
  },
  {
    initials: "OM",
    color: "bg-status-success",
    alt: "Omar",
  },
  {
    initials: "KS",
    color: "bg-action-join",
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
          className={`relative w-8 h-8 flex items-center justify-center rounded-full border-2 -ml-3 first:ml-0 overflow-hidden shadow-soft ${avatar.color || "bg-muted"}`}
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
          className="relative w-8 h-8 rounded-full border-2 border-background bg-primary-soft-muted flex items-center justify-center text-xs font-bold text-primary-light -ml-3 shadow-soft backdrop-blur-sm"
          style={{ zIndex: 0 }}
        >
          +{avatars.length - max}
        </div>
      )}
    </div>
  );
};
