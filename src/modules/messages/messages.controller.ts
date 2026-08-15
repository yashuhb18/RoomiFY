import { Controller, Get, Post, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';
import { CurrentUser, JwtPayload, Roles } from '../../common/decorators';
import { Role } from '@prisma/client';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('warden-contact')
  async getWardenContact(@CurrentUser() user: JwtPayload) {
    return this.messagesService.getWardenContact(user.hostelId);
  }

  @Post()
  async sendMessage(
    @Body() dto: SendMessageDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.messagesService.sendMessage(user.sub, user.hostelId, dto);
  }

  @Get('conversation/:otherUserId')
  async getConversation(
    @Param('otherUserId') otherUserId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.messagesService.getConversation(user.sub, otherUserId);
  }

  @Get('warden-threads')
  @Roles(Role.WARDEN, Role.SUPER_ADMIN)
  async getWardenThreads(@CurrentUser() user: JwtPayload) {
    return this.messagesService.getWardenConversations(user.sub, user.hostelId);
  }

  @Post('broadcast')
  @Roles(Role.WARDEN, Role.SUPER_ADMIN)
  async sendBroadcast(
    @Body() body: { title: string; content: string },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.messagesService.sendBroadcastAnnouncement(user.sub, user.hostelId, body.title, body.content);
  }

  @Get('notifications')
  async getNotifications(@CurrentUser() user: JwtPayload) {
    return this.messagesService.getNotifications(user.sub);
  }

  @Post('notifications/mark-read')
  async markRead(@CurrentUser() user: JwtPayload) {
    return this.messagesService.markNotificationsAsRead(user.sub);
  }
}
