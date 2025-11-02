import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export interface RequestUser {
  userId: string;
  orgId: string;
  role: string;
  email?: string;
}

/**
 * Extract authenticated user from request
 * 
 * Usage: @Get() findAll(@User() user: RequestUser) { ... }
 */
export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): RequestUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }
);

