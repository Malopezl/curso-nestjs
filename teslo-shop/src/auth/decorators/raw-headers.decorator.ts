import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const getRawHeaders = (data: string, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  // const headers = req.rawHeaders;

  // if (!headers)
  //   throw new InternalServerErrorException('User not found (request)');

  return req.rawHeaders; // [Authorization, bearer token, user-agent]
};

export const RawHeaders = createParamDecorator(getRawHeaders);
