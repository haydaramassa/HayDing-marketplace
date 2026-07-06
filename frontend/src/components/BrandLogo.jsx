import { Link } from "react-router-dom";
import logoMain from "../assets/branding/logo-main.png";

function BrandLogo({ to = "/", className = "" }) {
  return (
    <Link className={`logo brand-logo ${className}`} to={to}>
      <span className="logo-mark logo-image-mark">
        <img src="/icon/hayding-mark.png" alt="" aria-hidden="true" />
      </span>

      <img className="brand-logo-wordmark" src={logoMain} alt="HayDing" />
    </Link>
  );
}

export default BrandLogo;