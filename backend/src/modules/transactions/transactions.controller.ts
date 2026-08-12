import {
  Controller,
  Post,
  Get,
  Req,
  Headers,
  HttpCode,
  HttpStatus,
  RawBodyRequest,
} from '@nestjs/common';
import { Request } from 'express';
import { TransactionsService } from './transactions.service';
import { CurrentUser, JwtPayload, Public } from '../../common/decorators';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const rawBody = req.rawBody;
    if (!rawBody) {
      return { error: 'Missing raw body' };
    }
    return this.transactionsService.handleWebhook(rawBody, signature);
  }

  @Get('my')
  async getMyTransactions(@CurrentUser() user: JwtPayload) {
    return this.transactionsService.getByUser(user.sub);
  }
}
