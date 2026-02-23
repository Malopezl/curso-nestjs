import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto';
import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const mockUserRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        AuthService,
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('should create a user and return user with token', async () => {
    const dto: CreateUserDto = {
      email: 'prueba@correo.com',
      password: 'Abc123',
      fullName: 'Test user',
    };

    const user = {
      email: dto.email,
      fullName: dto.fullName,
      id: '1',
      isActive: true,
      roles: ['user'],
    } as User;

    jest.spyOn(userRepository, 'create').mockReturnValue(user);

    const result = await authService.create(dto);

    expect(result).toEqual({
      user: {
        email: 'prueba@correo.com',
        fullName: 'Test user',
        id: '1',
        isActive: true,
        roles: ['user'],
      },
      token: 'mock-jwt-token',
    });
  });

  it('should create a user and return user with token', async () => {
    const dto: CreateUserDto = {
      email: 'test@correo.com',
      password: 'Abc123',
      fullName: 'Test user',
    };

    const user = {
      email: dto.email,
      fullName: dto.fullName,
      id: '1',
      isActive: true,
      roles: ['user'],
    } as User;

    jest.spyOn(userRepository, 'create').mockReturnValue(user);
    jest.spyOn(bcrypt, 'hashSync').mockReturnValue('hashed-password');

    const result = await authService.create(dto);

    expect(bcrypt.hashSync).toHaveBeenCalledWith(dto.password, 10);

    expect(result).toEqual({
      user: {
        email: 'test@correo.com',
        fullName: 'Test user',
        id: '1',
        isActive: true,
        roles: ['user'],
      },
      token: 'mock-jwt-token',
    });
  });

  it('should throw an error if email already exists', async () => {
    const dto: CreateUserDto = {
      email: 'test@correo.com',
      password: 'Abc123',
      fullName: 'Test user',
    };

    jest
      .spyOn(userRepository, 'save')
      .mockRejectedValue({ code: '23505', detail: 'Email already exists' });

    await expect(authService.create(dto)).rejects.toThrow(BadRequestException);
    await expect(authService.create(dto)).rejects.toThrow(
      'Email already exists',
    );
  });

  it('should throw an internal server error', async () => {
    const dto = {
      email: 'test@correo.com',
    } as CreateUserDto;

    // Se deja vacio para que ya no imprima el console.log en pantalla
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    jest
      .spyOn(userRepository, 'save')
      .mockRejectedValue({ code: '9999', detail: 'Unhandled error' });

    await expect(authService.create(dto)).rejects.toThrow(
      InternalServerErrorException,
    );
    await expect(authService.create(dto)).rejects.toThrow(
      'Please check server logs',
    );

    expect(console.log).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith({
      code: '9999',
      detail: 'Unhandled error',
    });

    logSpy.mockRestore();
  });

  it('should login a user and return user with token', async () => {
    const loginDto = {
      email: 'test@correo.com',
      password: 'Abc123',
    };

    const user = {
      email: loginDto.email,
      fullName: 'Test user',
      id: '1',
      isActive: true,
      roles: ['user'],
    } as User;

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
    jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);

    const result = await authService.login(loginDto);

    expect(bcrypt.compareSync).toHaveBeenCalledWith(
      loginDto.password,
      user.password,
    );
    expect(result).toEqual({
      user: {
        email: 'test@correo.com',
        fullName: 'Test user',
        id: '1',
        isActive: true,
        roles: ['user'],
      },
      token: 'mock-jwt-token',
    });
    expect(result.user.password).toBeUndefined();
  });

  it('should throw an unauthorized exception if user does not exist', async () => {
    const loginDto = {
      email: 'nonexistent@correo.com',
      password: 'Abc123',
    };

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

    await expect(authService.login(loginDto)).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(authService.login(loginDto)).rejects.toThrow(
      'Credentials are not valid (email)',
    );
  });

  it('should throw an unauthorized exception if password is incorrect', async () => {
    const loginDto = {
      email: 'test@correo.com',
      password: 'WrongPassword',
    };

    const user = {
      email: loginDto.email,
      fullName: 'Test user',
      id: '1',
      isActive: true,
      roles: ['user'],
    } as User;

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
    jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);

    await expect(authService.login(loginDto)).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(authService.login(loginDto)).rejects.toThrow(
      'Credentials are not valid (password)',
    );
  });

  it('should check auth status and return user with token', async () => {
    const user = {
      email: 'test@correo.com',
      fullName: 'Test user',
      id: '1',
      isActive: true,
      roles: ['user'],
    } as User;

    const result = await authService.checkAuthStatus(user);

    expect(result).toEqual({
      user: {
        email: 'test@correo.com',
        fullName: 'Test user',
        id: '1',
        isActive: true,
        roles: ['user'],
      },
      token: 'mock-jwt-token',
    });
  });
});
