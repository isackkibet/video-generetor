describe('Admin RBAC rules', () => {
  const permissions: Record<string, string[]> = {
    SUPER_ADMIN: ['VIEW', 'GENERATE', 'MODERATE', 'PUBLISH', 'ADMIN'],
    CONTENT_ADMIN: ['VIEW', 'GENERATE'],
    MODERATOR: ['VIEW', 'MODERATE', 'PUBLISH'],
    VIEWER: ['VIEW']
  };
  function can(role: string, permission: string) {
    return permissions[role]?.includes(permission) || false;
  }
  it('allows super admin to run all actions', () => {
    expect(can('SUPER_ADMIN', 'ADMIN')).toBe(true);
    expect(can('SUPER_ADMIN', 'PUBLISH')).toBe(true);
  });
  it('blocks viewer from mutations', () => {
    expect(can('VIEWER', 'GENERATE')).toBe(false);
    expect(can('VIEWER', 'PUBLISH')).toBe(false);
  });
  it('allows moderator to moderate and publish only', () => {
    expect(can('MODERATOR', 'MODERATE')).toBe(true);
    expect(can('MODERATOR', 'PUBLISH')).toBe(true);
    expect(can('MODERATOR', 'GENERATE')).toBe(false);
  });
});
