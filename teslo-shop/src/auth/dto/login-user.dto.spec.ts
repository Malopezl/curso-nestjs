import { validate } from 'class-validator';
import { LoginUserDto } from './login-user.dto';
import { plainToClass } from 'class-transformer';

describe('LoginUserDto', () => {
  it('should have the correct properties', async () => {
    // const dto = new LoginUserDto();
    // dto.email = 'prueba@correo.com';
    // dto.password = 'Holamundo1';
    const dto = plainToClass(LoginUserDto, {
      email: 'prueba@correo.com',
      password: 'Holamundo1',
    });

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should throw errors if password is not valid', async () => {
    const dto = new LoginUserDto();
    dto.email = 'prueba@correo.com';
    dto.password = 'password';

    const errors = await validate(dto);

    const passwordError = errors.find((error) => error.property === 'password');

    expect(passwordError).toBeDefined();
    expect(passwordError?.constraints).toBeDefined();
    expect(passwordError!.constraints!.matches).toBe(
      'The password must have a Uppercase, lowercase letter and a number',
    );
  });
});
