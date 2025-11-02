import { Injectable, UnauthorizedException, Inject } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import type { PrismaClient } from "@prisma/client";
import { RequestUser } from "../decorators/user.decorator";

export interface JwtPayload {
  sub: string; // user ID
  email?: string;
  orgId?: string;
  role?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject("PrismaClient") private readonly prisma: PrismaClient) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || "change-me-in-production-use-strong-random-secret",
    });
  }

  async validate(payload: JwtPayload): Promise<RequestUser> {
    // 驗證使用者存在並取得組織上下文
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          org: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException("User not found");
      }

      return {
        userId: user.id,
        orgId: user.orgId,
        role: user.role,
        email: user.email,
      };
    } catch (error) {
      throw new UnauthorizedException("Invalid token or user not found");
    }
  }
}
