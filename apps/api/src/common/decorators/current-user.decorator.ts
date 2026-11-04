import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserSessionPayload } from '@silex/shared';

export const CurrentUser = createParamDecorator(
  (data: keyof UserSessionPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as UserSessionPayload;
    return data ? user?.[data] : user;
  },
);
