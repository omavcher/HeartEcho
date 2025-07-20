// app/admin/layout.js
import AdminPanel from '../../pages/AdminPanel';

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen flex">
      <AdminPanel />
      <div >
        <main >{children}</main>
      </div>
    </div>
  );
}
