import "../App.css";

function UserAvatar({ user, name, email, size = "medium", className = "" }) {
  const displayName = name || user?.fullName || user?.email || email || "H";
  const rawImageUrl = user?.profileImageUrl || user?.avatarUrl || "";

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

  function buildImageUrl(imageUrl) {
    if (!imageUrl) return "";

    if (
      imageUrl.startsWith("http") ||
      imageUrl.startsWith("blob:") ||
      imageUrl.startsWith("data:")
    ) {
      return imageUrl;
    }

    return `http://localhost:8080${imageUrl}`;
  }

  const imageUrl = buildImageUrl(rawImageUrl);

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