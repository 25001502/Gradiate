import React from "react";
import { FaSearch } from "react-icons/fa";

export default function DashboardSection({
  title,
  subtitle,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  shortcuts = [],
  stats,
  tabs,
  activeTab,
  onTabChange,
}) {
  return (
    <>
      <header className="dashboard-welcome">
        <h1 className="dashboard-welcome__greeting">{title}</h1>
        <p className="dashboard-welcome__sub">{subtitle}</p>
      </header>

      <div className="dashboard-search">
        <div className="dashboard-search__wrapper">
          <FaSearch className="dashboard-search__icon" />
          <input
            className="dashboard-search__input"
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {shortcuts.length > 0 && (
        <div className="dashboard-shortcuts">
          {shortcuts.map((item) => (
            <button
              key={item.label}
              className="dashboard-shortcut"
              onClick={item.onClick}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>
      )}

      <div className="dashboard-stats">
        {stats.map((stat) => (
          <div className="dashboard-stat" key={stat.label}>
            <p className={`dashboard-stat__value ${stat.valueClass}`}>
              {stat.value}
            </p>
            <p className="dashboard-stat__label">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="dashboard-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`dashboard-tab ${activeTab === tab.key ? "dashboard-tab--active" : ""}`}
            onClick={() => onTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </>
  );
}
