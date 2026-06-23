export default function Avatar({ user, size = "md", className = "" }) {
  const name = user?.name || "User";
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  if (user?.profileImage) {
    return <img className={`avatar avatar-${size} ${className}`} src={user.profileImage} alt={name} />;
  }

  return (
    <span className={`avatar avatar-${size} avatar-fallback ${className}`} aria-label={name}>
      {initials || "U"}
    </span>
  );
}
