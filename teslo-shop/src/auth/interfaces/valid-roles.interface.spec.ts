import { validRoles } from './valid-roles.interface';

describe('Valid roles Enum', () => {
  it('should have correct values', () => {
    expect(validRoles.admin).toBe('admin');
    expect(validRoles.superUser).toBe('super-user');
    expect(validRoles.user).toBe('user');
  });

  it('should contain all expected keys', () => {
    const keysToHave = ['admin', 'super-user', 'user'];

    expect(Object.values(validRoles)).toEqual(
      expect.arrayContaining(keysToHave),
    );
  });
});
