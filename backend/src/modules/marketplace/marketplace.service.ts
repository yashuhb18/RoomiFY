import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { MarketplaceRepository } from './marketplace.repository';
import { CreateListingDto } from './dto/create-listing.dto';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ItemStatus, TxStatus } from '@prisma/client';

@Injectable()
export class MarketplaceService {
  private readonly logger = new Logger(MarketplaceService.name);
  private readonly stripe: Stripe;
  private readonly frontendUrl: string;

  constructor(
    private readonly marketplaceRepository: MarketplaceRepository,
    private readonly auditService: AuditService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.stripe = new Stripe(configService.get<string>('stripe.secretKey')!, {
      apiVersion: '2023-10-16',
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

      // Create Stripe Checkout Session
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'inr',
              product_data: {
                name: item.title,
                description: item.description || undefined,
              },
              unit_amount: Math.round(item.price * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${this.frontendUrl}/student/marketplace?success=true`,
        cancel_url: `${this.frontendUrl}/student/marketplace?canceled=true`,
        metadata: {
          itemId,
          buyerId,
          transactionId: transaction.id,
          hostelId,
        },
      });

      // Store Stripe session ID
      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: { stripePaymentId: session.id },
      });

      return { url: session.url };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      this.logger.error('Error buying item', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to initiate purchase.');
    }
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
