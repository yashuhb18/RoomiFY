import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { TxStatus, ItemStatus } from '@prisma/client';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);
  private readonly stripe: Stripe;
  private readonly webhookSecret: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly configService: ConfigService,
  ) {
    this.stripe = new Stripe(configService.get<string>('stripe.secretKey')!, {
      apiVersion: '2023-10-16',
    });
    this.webhookSecret = configService.get<string>('stripe.webhookSecret')!;
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.webhookSecret,
      );
    } catch (err) {
      this.logger.error(
        `Webhook signature verification failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
      );
      throw new InternalServerErrorException('Webhook signature verification failed.');
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const { itemId, buyerId, transactionId, hostelId } =
        session.metadata || {};

      if (!transactionId || !itemId || !buyerId || !hostelId) {
        this.logger.error('Missing metadata in Stripe webhook event.');
        return { received: true };
      }

      try {
        await this.prisma.$transaction(async (tx) => {
          // Update transaction status to COMPLETED
          await tx.transaction.update({
            where: { id: transactionId },
            data: {
              status: TxStatus.COMPLETED,
              stripePaymentId: session.payment_intent as string,
            },
          });

          // Update marketplace item status to SOLD
          await tx.marketplaceItem.update({
            where: { id: itemId },
            data: { status: ItemStatus.SOLD },
          });
        });

        // Log in audit
        await this.auditService.log({
          action: 'PURCHASE_COMPLETED',
          newValue: {
            transactionId,
            itemId,
            buyerId,
            amount: session.amount_total ? session.amount_total / 100 : 0,
          },
          hostelId,
          userId: buyerId,
        });
      } catch (error) {
        this.logger.error(
          'Error processing checkout completion',
          error instanceof Error ? error.stack : undefined,
        );
      }
    }

    return { received: true };
  }

  async getByUser(userId: string) {
    try {
      return this.prisma.transaction.findMany({
        where: { buyerId: userId },
        include: {
          item: {
            select: { id: true, title: true, price: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.logger.error('Error fetching transactions', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to fetch transactions.');
    }
  }
}
