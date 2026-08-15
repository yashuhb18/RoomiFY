import { Injectable, Logger, InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';
const Razorpay = require('razorpay');
import { InvoiceStatus, TxStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private razorpay: any;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.razorpay = new Razorpay({
      key_id: this.configService.get<string>('RAZORPAY_KEY_ID'),
      key_secret: this.configService.get<string>('RAZORPAY_KEY_SECRET'),
    });
  }

  async createOrder(invoiceId: string, studentId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    if (invoice.studentId !== studentId) {
      throw new BadRequestException('Not authorized to pay this invoice');
    }
    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Invoice is already paid');
    }

    try {
      // Create Razorpay Order
      const options = {
        amount: Math.round(invoice.amount * 100), // amount in smallest currency unit (paise)
        currency: 'INR',
        receipt: `receipt_${invoiceId}`,
      };

      const order = await this.razorpay.orders.create(options);

      // Create a pending PaymentRecord in our DB
      const paymentRecord = await this.prisma.paymentRecord.create({
        data: {
          invoiceId: invoice.id,
          amountPaid: invoice.amount,
          gatewayId: order.id,
          status: TxStatus.PENDING,
        },
      });

      return {
        orderId: order.id,
        amount: options.amount,
        currency: options.currency,
        keyId: this.configService.get<string>('RAZORPAY_KEY_ID'),
        paymentRecordId: paymentRecord.id,
      };
    } catch (error) {
      this.logger.error('Failed to create Razorpay order', error);
      throw new InternalServerErrorException('Payment gateway error');
    }
  }

  async verifyPayment(razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string) {
    const secret = this.configService.get<string>('RAZORPAY_KEY_SECRET');

    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', secret!)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      throw new BadRequestException('Invalid payment signature');
    }

    // Payment is valid! Update the records.
    return this.prisma.$transaction(async (tx) => {
      const paymentRecord = await tx.paymentRecord.findFirst({
        where: { gatewayId: razorpayOrderId },
      });

      if (!paymentRecord) {
        throw new NotFoundException('Payment record not found');
      }

      await tx.paymentRecord.update({
        where: { id: paymentRecord.id },
        data: {
          status: TxStatus.COMPLETED,
          paymentId: razorpayPaymentId,
        },
      });

      const invoice = await tx.invoice.update({
        where: { id: paymentRecord.invoiceId },
        data: {
          status: InvoiceStatus.PAID,
        },
      });

      return { success: true, invoiceId: invoice.id };
    });
  }
}
