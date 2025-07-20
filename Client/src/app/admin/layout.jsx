import PropTypes from 'prop-types';
import AdminPanel from '../../pages/AdminPanel';

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen flex">
      <AdminPanel />
      <div>
        <main>{children}</main>
      </div>
    </div>
  );
}

// Add PropTypes validation
AdminLayout.propTypes = {
  children: PropTypes.node.isRequired,
};