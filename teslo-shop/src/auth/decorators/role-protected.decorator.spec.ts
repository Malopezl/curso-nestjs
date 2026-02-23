import { SetMetadata } from '@nestjs/common';
import { validRoles } from '../interfaces';
import { META_ROLES, RoleProtected } from './role-protected.decorator';

/* Si se utiliza mockImplementation, va a retornar lo que pongamos y no la implementacion real */
jest.mock('@nestjs/common', () => ({
  //   SetMetadata: jest.fn().mockImplementation((key, value) => ({
  //     key,
  //     value,
  //   })),
  SetMetadata: jest.fn(),
}));

describe('RoleProtected Decorator', () => {
  it('should set metadata with the correct roles', () => {
    const roles = [validRoles.admin, validRoles.user];

    const result = RoleProtected(...roles);

    // expect(result).toEqual({ key: META_ROLES, value: roles });
    expect(SetMetadata).toHaveBeenCalled();
    expect(SetMetadata).toHaveBeenCalledWith(META_ROLES, roles);
  });
});
