import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
const Razorpay = require('razorpay');
import { MarketplaceRepository } from './marketplace.repository';
import { CreateListingDto } from './dto/create-listing.dto';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ItemStatus, TxStatus } from '@prisma/client';

@Injectable()
export class MarketplaceService {
  private readonly logger = new Logger(MarketplaceService.name);
  private razorpay: any;
  private readonly frontendUrl: string;

  constructor(
    private readonly marketplaceRepository: MarketplaceRepository,
    private readonly auditService: AuditService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const keyId = this.configService.get<string>('RAZORPAY_KEY_ID') || process.env.RAZORPAY_KEY_ID;
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET') || process.env.RAZORPAY_KEY_SECRET;
    this.razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    this.frontendUrl = configService.get<string>('frontendUrl')!;
  }

  async createListing(
    dto: CreateListingDto,
    sellerId: string,
    hostelId: string,
    imageUrl?: string,
  ) {
    try {
      const item = await this.marketplaceRepository.create({
        title: dto.title,
        description: dto.description,
        price: dto.price,
        imageUrl,
        hostelId,
        sellerId,
      });

      await this.auditService.log({
        action: 'LISTING_CREATED',
        newValue: { title: item.title, price: item.price },
        hostelId,
        userId: sellerId,
      });

      return item;
    } catch (error) {
      this.logger.error('Error creating listing', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to create listing.');
    }
  }

  async findAll(hostelId: string) {
    try {
      return this.marketplaceRepository.findAvailableByHostel(hostelId);
    } catch (error) {
      this.logger.error('Error fetching listings', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to fetch listings.');
    }
  }

  async findById(id: string) {
    try {
      const item = await this.marketplaceRepository.findById(id);
      if (!item) throw new NotFoundException('Item not found.');
      return item;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('Error fetching item', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to fetch item.');
    }
  }

  async buyItem(itemId: string, buyerId: string, hostelId: string) {
    try {
      const item = await this.marketplaceRepository.findById(itemId);

      if (!item) throw new NotFoundException('Item not found.');
      if (item.status !== ItemStatus.AVAILABLE) {
        throw new BadRequestException('This item is no longer available.');
      }
      if (item.sellerId === buyerId) {
        throw new ForbiddenException('You cannot purchase your own item.');
      }

      // Create a pending transaction
      const transaction = await this.prisma.transaction.create({
        data: {
          amount: item.price,
          status: TxStatus.PENDING,
          itemId,
          buyerId,
        },
      });

      // Create Razorpay Order
      const options = {
        amount: Math.round(item.price * 100),
        currency: 'INR',
        receipt: `market_${transaction.id.substring(0, 8)}`,
      };
      
      const order = await this.razorpay.orders.create(options);

      // Store Razorpay order ID in stripePaymentId (reusing the field for gateway ID)
      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: { stripePaymentId: order.id },
      });

      return {
        orderId: order.id,
        amount: options.amount,
        currency: options.currency,
        keyId: this.configService.get<string>('RAZORPAY_KEY_ID') || process.env.RAZORPAY_KEY_ID,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      this.logger.error('Error buying item:', error);
      throw new InternalServerErrorException(error instanceof Error ? error.message : 'Failed to initiate purchase.');
    }
  }

  async verifyPayment(razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string) {
    const secret = this.configService.get<string>('RAZORPAY_KEY_SECRET') || process.env.RAZORPAY_KEY_SECRET;

    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', secret!)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      throw new BadRequestException('Invalid payment signature');
    }

    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findFirst({
        where: { stripePaymentId: razorpayOrderId },
      });

      if (!transaction) {
        throw new NotFoundException('Transaction not found');
      }

      await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          status: TxStatus.COMPLETED,
        },
      });

      await tx.marketplaceItem.update({
        where: { id: transaction.itemId },
        data: { status: ItemStatus.SOLD },
      });

      return { success: true };
    });
  }

  async deleteListing(id: string, userId: string, hostelId: string) {
    try {
      const item = await this.marketplaceRepository.findById(id);
      if (!item) throw new NotFoundException('Item not found.');
      if (item.sellerId !== userId) {
        throw new ForbiddenException('You can only delete your own listings.');
      }

      await this.marketplaceRepository.delete(id);

      await this.auditService.log({
        action: 'LISTING_DELETED',
        oldValue: { title: item.title, price: item.price },
        hostelId,
        userId,
      });

      return { message: 'Listing deleted successfully.' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) throw error;
      this.logger.error('Error deleting listing', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to delete listing.');
    }
  }
}
