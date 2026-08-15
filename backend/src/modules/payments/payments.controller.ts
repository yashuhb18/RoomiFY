import { Controller, Post, Body } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CurrentUser, JwtPayload } from '../../common/decorators';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-order')
  async createOrder(@Body() dto: CreateOrderDto, @CurrentUser() user: JwtPayload) {
    return this.paymentsService.createOrder(dto.invoiceId, user.sub);
  }

  @Post('verify')
  async verifyPayment(
    @Body('razorpay_order_id') orderId: string,
    @Body('razorpay_payment_id') paymentId: string,
    @Body('razorpay_signature') signature: string,
  ) {
    return this.paymentsService.verifyPayment(orderId, paymentId, signature);
  }
}
