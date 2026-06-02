import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaBookOpen,
  FaGraduationCap,
  FaHome,
  FaUserCircle,
  FaUsers,
} from "react-icons/fa";
import { useAuth } from "../context/useAuth";
import { routes } from "../lib/routes";
import "./BottomNavigation.css";

function isActivePath(pathname, key) {
  if (key === "home") return pathname === routes.application;
  if (key === "practice") return pathname === routes.practice;
  if (key === "bursaries") return pathname === routes.bursaryDashboard;
  if (key === "community") return pathname.startsWith(routes.community);
  if (key === "profile") return pathname === routes.profile;
  return false;
}

export default function BottomNavigation() {
  const { user } = useAuth();
  const { pathname } = useLocation();

  useEffect(() => {
    document.body.classList.add("has-bottom-navigation");

    return () => {
      document.body.classList.remove("has-bottom-navigation");
    };
  }, []);

  const items = [
    { key: "home", label: "Home", to: routes.application, icon: FaHome },
    { key: "practice", label: "Past Papers", to: routes.practice, icon: FaBookOpen },
    { key: "bursaries", label: "Bursaries", to: routes.bursaryDashboard, icon: FaGraduationCap },
    { key: "community", label: "Community", to: routes.community, icon: FaUsers },
    { key: "profile", label: "Profile", to: user?.uid ? routes.profile : routes.auth, icon: FaUserCircle },
  ];

  return (
    <nav className="bottom-navigation" aria-label="Dashboard navigation">
      <ul className="bottom-navigation__list">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = isActivePath(pathname, item.key);

          return (
            <li className="bottom-navigation__item" key={item.key}>
              <Link
                className={`bottom-navigation__link ${isActive ? "bottom-navigation__link--active" : ""}`}
                to={item.to}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="bottom-navigation__icon" aria-hidden="true" />
                <span className="bottom-navigation__label">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
