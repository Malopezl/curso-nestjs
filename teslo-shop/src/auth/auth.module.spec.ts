import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AppModule } from '../app.module';

describe('AuthModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    let mockUserRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };

    let mockConfigService = {
      get: jest.fn().mockReturnValue('test-secret'),
    };

    module = await Test.createTestingModule({
      controllers: [AuthController],
      imports: [
        ConfigModule.forRoot(),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => {
            return {
              secret: configService.get('JWT_SECRET'),
              signOptions: {
                expiresIn: '2h',
              },
            };
          },
        }),
        AppModule,
      ],
      providers: [
        {
          provide: AuthService,
          useValue: {},
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        JwtStrategy,
      ],
    }).compile();
  });

  beforeEach(() => {
    module.close();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should have AuthService as provider', () => {
    const service = module.get<AuthService>(AuthService);

    expect(service).toBeDefined();
  });

  it('should have AuthController as controller', () => {
    const controller = module.get<AuthController>(AuthController);

    expect(controller).toBeDefined();
  });

  it('should have JwtStrategy as provider', () => {
    const provider = module.get<JwtStrategy>(JwtStrategy);

    expect(provider).toBeDefined();
  });

  it('should have JwtModule as module', () => {
    const jwtModule = module.get<JwtModule>(JwtModule);

    expect(jwtModule).toBeDefined();
  });
});
