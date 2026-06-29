import { PrismaClient } from '@prisma/client';
import { requireAdminSession, canAccess } from '../../lib/auth';
const prisma = new PrismaClient();
export default async function AdminUsersPage() {
 const session = requireAdminSession();
 if (!canAccess(session.role, 'ADMIN')) {
 return (
 <>
 <section className="header">
 <h1>Access Denied</h1>
 <p>Only super admins can manage admin users.</p>
 </section>
 </>
 );
 }
 const users = await prisma.adminUser.findMany({
 orderBy: {
 createdAt: 'desc'
 }
 });
 return (
 <>
 <section className="header">
 <h1>Admin Users</h1>
 <p>Super-admin-only admin user management.</p>
 </section>
 <section className="card">
 <table className="table">
 <thead>
 <tr>
 <th>Name</th>
 <th>Email</th>
 <th>Role</th>
 <th>Active</th>
 <th>Created</th>
 </tr>
 </thead>
 <tbody>
 {users.map((user) => (
 <tr key={user.id}>
 <td>{user.name}</td>
 <td>{user.email}</td>
 <td>{user.role}</td>
 <td>{user.isActive ? 'Yes' : 'No'}</td>
 <td>{new Date(user.createdAt).toLocaleString()}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </section>
 </>
 );
}