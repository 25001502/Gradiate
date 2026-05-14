import { FaShieldAlt } from 'react-icons/fa';

/**
 * Blue admin badge displayed wherever the app admin's name appears.
 * Uses the .community-status-badge--admin CSS class for consistent styling.
 */
export default function AdminBadge({ className = '' }) {
  return (
    <span
      className={`community-status-badge community-status-badge--admin ${className}`.trim()}
      title="Gradiate Admin"
    >
      <FaShieldAlt style={{ fontSize: '0.7em' }} />
      &nbsp;Admin
    </span>
  );
}
