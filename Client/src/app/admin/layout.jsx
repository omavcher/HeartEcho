import PropTypes from 'prop-types';
import AdminPanel from '../../pages/AdminPanel';

export default function AdminLayout({ children }) {
  return (
    <div className="admin-layout-wrapper-x30sn">
      <AdminPanel />
      <div className="admin-layout-body-x30sn">
        <main className="admin-layout-main-x30sn">{children}</main>
      </div>
    </div>
  );
}

AdminLayout.propTypes = {
  children: PropTypes.node.isRequired,
};