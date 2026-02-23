import { User } from './user.entity';

describe('UserEntity', () => {
  it('should create a User Instance', () => {
    const user = new User();

    expect(user).toBeInstanceOf(User);
  });

  it('should clear email before save', () => {
    const user = new User();
    user.email = 'PruebaCorreo@correo.com   ';
    user.checkFieldsBeforeInsert();

    expect(user.email).toBe('pruebacorreo@correo.com');
  });

  it('should clear email before update', () => {
    const user = new User();
    user.email = 'prUebaCorreo@correo.com   ';
    user.checkFieldsBeforeUpdate();

    expect(user.email).toBe('pruebacorreo@correo.com');
  });
});
