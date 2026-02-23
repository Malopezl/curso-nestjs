import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { getRawHeaders } from './raw-headers.decorator';

jest.mock('@nestjs/common', () => ({
  //si se quiere hacer la implementacion ficticia de una funcion que venga de algun paquete dentro
  //   createParamDecorator: jest.fn().mockImplementation(() => jest.fn()),
  createParamDecorator: jest.fn(),
}));

describe('RawHeader Decorator', () => {
  const mockExecutionContext = {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({
        rawHeaders: ['Authorization', 'Bearer Token', 'User-Agent', 'NestJS'],
      }),
    }),
  } as unknown as ExecutionContext; //Como no reconoce ExecutionContext se pone primero as unknown

  it('should return the raw headers from the request', () => {
    const result = getRawHeaders('', mockExecutionContext);

    expect(result).toEqual([
      'Authorization',
      'Bearer Token',
      'User-Agent',
      'NestJS',
    ]);
  });

  it('should call createParamDecorator with getRawHeaders', () => {
    expect(createParamDecorator).toHaveBeenCalledWith(getRawHeaders);
  });
});
