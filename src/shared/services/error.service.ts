import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ErrorMessage } from '@app/shared/types/error.interface';

@Injectable()
export class ErrorService {
  errorResponse(
    errorMessages: ErrorMessage[] | string,
    httpStatus: HttpStatus,
  ) {
    let errors: any = {};
    if (Array.isArray(errorMessages)) {
      errors = errorMessages.reduce((acc, error) => {
        acc[error.property] = error.messages;
        return acc;
      }, {});
    } else {
      errors.message = errorMessages;
    }

    throw new HttpException({ errors }, httpStatus);
  }
}
