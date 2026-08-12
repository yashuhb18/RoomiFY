import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from '@prisma/client';
import { MarketplaceService } from './marketplace.service';
import { CreateListingDto, BuyItemDto } from './dto/create-listing.dto';
import { CurrentUser, JwtPayload, Roles } from '../../common/decorators';
import { SupabaseService } from '../supabase/supabase.service';

@Controller('marketplace')
export class MarketplaceController {
  constructor(
    private readonly marketplaceService: MarketplaceService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Post('listings')
  @Roles(Role.STUDENT)
  @UseInterceptors(FileInterceptor('image', {
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (!file.mimetype.match(/^image\/(jpeg|png|webp|gif)$/)) {
        return cb(new Error('Only image files are allowed.'), false);
      }
      cb(null, true);
    },
  }))
  async createListing(
    @Body() dto: CreateListingDto,
    @UploadedFile() image: Express.Multer.File | undefined,
    @CurrentUser() user: JwtPayload,
  ) {
    let imageUrl: string | undefined;
    if (image) {
      imageUrl = await this.supabaseService.uploadFile(image, 'marketplace');
    }

    return this.marketplaceService.createListing(
      dto,
      user.sub,
      user.hostelId,
      imageUrl,
    );
  }

  @Get('listings')
  async findAll(@CurrentUser() user: JwtPayload) {
    return this.marketplaceService.findAll(user.hostelId);
  }

  @Get('listings/:id')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.marketplaceService.findById(id);
  }

  @Post('buy')
  @Roles(Role.STUDENT)
  async buyItem(
    @Body() dto: BuyItemDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.marketplaceService.buyItem(
      dto.itemId,
      user.sub,
      user.hostelId,
    );
  }

  @Delete('listings/:id')
  @Roles(Role.STUDENT)
  async deleteListing(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.marketplaceService.deleteListing(id, user.sub, user.hostelId);
  }
}
