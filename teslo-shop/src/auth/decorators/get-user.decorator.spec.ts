import { ExecutionContext, InternalServerErrorException } from '@nestjs/common';
import { getUser } from './get-user.decorator';

jest.mock('@nestjs/common', () => ({
  createParamDecorator: jest.fn(),
  InternalServerErrorException:
    jest.requireActual('@nestjs/common').InternalServerErrorException,
}));

describe('GetUser Decorator', () => {
  // Esta adentro del describe porque eso nos permite resetear los datos de ser necesario
  const mockExecutionContext = {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({
        user: {
          id: '1',
          name: 'John Doe',
        },
      }),
    }),
  } as unknown as ExecutionContext;

  it('should return the user from the request', async () => {
    const result = getUser('', mockExecutionContext);

    expect(result).toEqual({
      id: '1',
      name: 'John Doe',
    });
  });

  it('should return the user name from the request', async () => {
    const result = getUser('name', mockExecutionContext);

    expect(result).toEqual('John Doe');
  });

  it('should throw an internal server error if user not found', async () => {
    const mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: null,
        }),
      }),
    } as unknown as ExecutionContext;

    try {
      getUser('', mockExecutionContext);
      expect(true).toBeFalsy();
    } catch (error) {
      expect(error).toBeInstanceOf(InternalServerErrorException);
      expect(error.message).toBe('User not found (request)');
    }
  });
});
