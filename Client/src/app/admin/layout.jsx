// components/AdminLayout.js
import PropTypes from 'prop-types';
import AdminPanel from '../../pages/AdminPanel';

export default function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      <AdminPanel />
      <div className="admin-layout-content">
        <main className="admin-main-content">{children}</main>
      </div>
    </div>
  );
}

// Add PropTypes validation
AdminLayout.propTypes = {
  children: PropTypes.node.isRequired,
};