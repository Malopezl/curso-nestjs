import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { Product } from 'src/products/entities';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const mockAuthService = {
      create: jest.fn(),
      login: jest.fn(),
      checkAuthStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
      controllers: [AuthController],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  it('should create user with the proper DTO', async () => {
    const dto: CreateUserDto = {
      email: 'prueba@correo.com',
      password: 'Abc123',
      fullName: 'Test user',
    };

    await authController.createUser(dto);

    expect(authService.create).toHaveBeenCalled();
    expect(authService.create).toHaveBeenCalledWith(dto);
  });

  it('should login user with the proper DTO', async () => {
    const dto: LoginUserDto = {
      email: 'prueba@correo.com',
      password: 'Abc123',
    };

    await authController.loginUser(dto);

    expect(authService.login).toHaveBeenCalled();
    expect(authService.login).toHaveBeenCalledWith(dto);
  });

  it('should check-user status with the proper DTO', async () => {
    const dto: User = {
      email: 'prueba@correo.com',
      password: 'Abc123',
      fullName: 'Test user',
    } as User;

    await authController.checkAuthStatus(dto);

    expect(authService.checkAuthStatus).toHaveBeenCalled();
    expect(authService.checkAuthStatus).toHaveBeenCalledWith(dto);
  });

  it('should return private route data', () => {
    const user: User = {
      id: '1',
      email: 'prueba@correo.com',
      fullName: 'Test user',
    } as User;

    const request = {} as Express.Request;
    const rawHeaders = ['header1: value1', 'headers2: value2'];
    const headers = { header1: 'value1', header2: 'value20' };

    const result = authController.testingPrivateRoute(
      request,
      user,
      user.email,
      rawHeaders,
      headers,
    );

    expect(result).toEqual({
      ok: true,
      message: 'Hola mundo private',
      user: { id: '1', email: 'prueba@correo.com', fullName: 'Test user' },
      userEmail: 'prueba@correo.com',
      rawHeaders: ['header1: value1', 'headers2: value2'],
      headers: { header1: 'value1', header2: 'value20' },
    });
  });
});
