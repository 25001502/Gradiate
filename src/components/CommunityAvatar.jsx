import { DEFAULT_AVATAR_STYLE, getAvatarUrl } from "../utils/avatarUtils";

function getInitials(name = "GS") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "GS";
}

export default function CommunityAvatar({
  name,
  photoURL,
  avatarSeed,
  avatarStyle = DEFAULT_AVATAR_STYLE,
  size = "md",
}) {
  const generatedAvatar = avatarSeed ? getAvatarUrl(avatarSeed, avatarStyle || DEFAULT_AVATAR_STYLE) : "";
  const avatarSrc = generatedAvatar || photoURL || "";

  return (
    <div className={`community-avatar community-avatar--${size}`}>
      {avatarSrc ? (
        <img src={avatarSrc} alt="" referrerPolicy="no-referrer" />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}
