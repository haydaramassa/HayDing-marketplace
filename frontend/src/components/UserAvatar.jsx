import "../App.css";

function UserAvatar({ user, name, email, size = "medium", className = "" }) {
  const displayName = name || user?.fullName || user?.email || email || "H";
  const imageUrl = user?.profileImageUrl || user?.avatarUrl || "";

  function getInitials(value) {
    return (
      value
        .trim()
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("") || "H"
    );
  }

  return (
    <div className={`user-avatar user-avatar-${size} ${className}`}>
      {imageUrl ? (
        <img src={imageUrl} alt={displayName} />
      ) : (
        <span>{getInitials(displayName)}</span>
      )}
    </div>
  );
}

export default UserAvatar;