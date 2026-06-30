import { AdminRole } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { requireAdminSession, canAccess } from "../../lib/auth";
import {
  createAdminUser,
  changeAdminRole,
  deactivateAdminUser,
  reactivateAdminUser,
  resetAdminPassword,
} from "../../lib/admin-actions";
// ✅ Added: FlashMessage import
import { FlashMessage } from "../../components/FlashMessage";

const prisma = new PrismaClient();
const roles: AdminRole[] = [
  "SUPER_ADMIN",
  "CONTENT_ADMIN",
  "MODERATOR",
  "VIEWER",
];

// ✅ Updated: Added searchParams prop
export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { success?: string; error?: string };
}) {
  const session = requireAdminSession();

  if (!canAccess(session.role, "ADMIN")) {
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
      createdAt: "desc",
    },
  });

  return (
    <>
      <section className="header">
        <h1>Admin Users</h1>
        <p>
          Create admins, change roles, deactivate users, and reset passwords.
        </p>
        {/* ✅ Added: Link to admin audit logs */}
        <p>
          <a href="/admin-audit-logs">View admin audit logs</a>
        </p>
      </section>

      {/* ✅ Added: FlashMessage for success/error feedback */}
      <FlashMessage success={searchParams.success} error={searchParams.error} />

      <section className="card">
        <h3>Create Admin User</h3>
        <form action={createAdminUser} className="grid">
          <input name="name" placeholder="Full name" required />
          <input name="email" type="email" placeholder="Email" required />
          <input
            name="password"
            type="password"
            placeholder="Temporary password"
            required
          />
          <select name="role" defaultValue="VIEWER">
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <button type="submit">Create Admin</button>
        </form>
      </section>

      <section className="card" style={{ marginTop: 20 }}>
        <h3>Existing Admins</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Current Role</th>
              <th>Change Role</th>
              <th>Active</th>
              <th>Reset Password</th>
              <th>Access</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <form action={changeAdminRole} className="actions">
                    <input type="hidden" name="id" value={user.id} />
                    <select name="role" defaultValue={user.role}>
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                    <button type="submit">Save</button>
                  </form>
                </td>
                <td>{user.isActive ? "Yes" : "No"}</td>
                <td>
                  <form action={resetAdminPassword} className="actions">
                    <input type="hidden" name="id" value={user.id} />
                    <input
                      name="password"
                      type="password"
                      placeholder="New password"
                      required
                    />
                    <button type="submit">Reset</button>
                  </form>
                </td>
                <td>
                  {user.isActive ? (
                    <form action={deactivateAdminUser}>
                      <input type="hidden" name="id" value={user.id} />
                      <button type="submit" className="secondary">
                        Deactivate
                      </button>
                    </form>
                  ) : (
                    <form action={reactivateAdminUser}>
                      <input type="hidden" name="id" value={user.id} />
                      <button type="submit">Reactivate</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
