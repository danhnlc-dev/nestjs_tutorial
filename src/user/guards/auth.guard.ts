import { ErrorService } from '@app/shared/services/error.service';
import { ExpressRequest } from '@app/types/expressRequest.interface';
import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private errorService: ErrorService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<ExpressRequest>();
    if (request.user) {
      return true;
    }

    this.errorService.errorResponse('Not authorized', HttpStatus.UNAUTHORIZED);
  }
}
