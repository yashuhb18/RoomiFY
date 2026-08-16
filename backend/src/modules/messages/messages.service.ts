import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { SendMessageDto } from './dto/send-message.dto';
import { Role } from '@prisma/client';

import { MailService } from '../mail/mail.service';

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly mailService: MailService,
  ) {}

  // Get assigned Warden contact details for Student Help Centre
  async getWardenContact(hostelId: string) {
    let warden = await this.prisma.user.findFirst({
      where: {
        hostelId,
        role: { in: [Role.WARDEN, Role.SUPER_ADMIN] },
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        role: true,
        profile: true,
      },
    });

    if (!warden) {
      // Fallback to any active Warden or Super Admin across platform
      warden = await this.prisma.user.findFirst({
        where: {
          role: { in: [Role.WARDEN, Role.SUPER_ADMIN] },
          isActive: true,
        },
        select: {
          id: true,
          email: true,
          role: true,
          profile: true,
        },
      });
    }

    if (!warden) {
      throw new NotFoundException('No active Warden or Hostel Administrator found.');
    }

    const profile = (warden.profile as any) || {};

    return {
      id: warden.id,
      fullName: profile.fullName || 'Hostel Chief Warden',
      email: warden.email,
      phone: profile.phone || profile.phoneNumber || '+91 98765 43210',
      officeHours: 'Mon - Sat: 9:00 AM - 7:00 PM',
      role: warden.role,
    };
  }

  // Send a direct message
  async sendMessage(senderId: string, hostelId: string, dto: SendMessageDto) {
    let targetReceiverId = dto.receiverId;

    // Verify receiver exists
    const receiverExists = await this.prisma.user.findUnique({
      where: { id: targetReceiverId },
    });

    if (!receiverExists) {
      // Fallback to any active Warden/Admin if receiverId was stale
      const wardenUser = await this.prisma.user.findFirst({
        where: {
          role: { in: [Role.WARDEN, Role.SUPER_ADMIN] },
          isActive: true,
        },
      });

      if (wardenUser) {
        targetReceiverId = wardenUser.id;
      } else {
        throw new NotFoundException('Recipient user account not found.');
      }
    }

    const message = await this.prisma.directMessage.create({
      data: {
        content: dto.content,
        senderId,
        receiverId: targetReceiverId,
        hostelId,
      },
      include: {
        sender: {
          select: { id: true, email: true, role: true, profile: true },
        },
        receiver: {
          select: { id: true, email: true, role: true, profile: true },
        },
      },
    });

    await this.auditService.log({
      action: 'DIRECT_MESSAGE_SENT',
      newValue: { messageId: message.id, receiverId: targetReceiverId },
      hostelId,
      userId: senderId,
    });

    // Send email alert asynchronously in background without blocking API response
    if (message.receiver.role === Role.SUPER_ADMIN || message.receiver.role === Role.WARDEN) {
      const senderProfile = (message.sender.profile as any) || {};
      const senderName = senderProfile.fullName || message.sender.email.split('@')[0];
      setImmediate(() => {
        this.mailService.sendWardenConcernAlert(
          message.receiver.email,
          senderName,
          message.sender.email,
          message.sender.role,
          dto.content,
        ).catch(() => {});
      });
    }

    return message;
  }

  // Get conversation thread between two users
  async getConversation(user1Id: string, user2Id: string) {
    const messages = await this.prisma.directMessage.findMany({
      where: {
        OR: [
          { senderId: user1Id, receiverId: user2Id },
          { senderId: user2Id, receiverId: user1Id },
        ],
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: { id: true, email: true, role: true, profile: true },
        },
        receiver: {
          select: { id: true, email: true, role: true, profile: true },
        },
      },
    });

    // Mark unread messages received by user1 as read
    await this.prisma.directMessage.updateMany({
      where: {
        senderId: user2Id,
        receiverId: user1Id,
        isRead: false,
      },
      data: { isRead: true },
    });

    return messages;
  }

  // Get active student conversation threads for Warden Message Desk
  async getWardenConversations(wardenId: string, hostelId: string) {
    // Fetch all messages in the hostel where warden is sender or receiver
    const messages = await this.prisma.directMessage.findMany({
      where: {
        OR: [
          { receiverId: wardenId },
          { senderId: wardenId },
          { hostelId },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, email: true, role: true, profile: true } },
        receiver: { select: { id: true, email: true, role: true, profile: true } },
      },
    });

    // Group messages by student ID
    const conversationMap = new Map<string, { student: any; latestMessage: any; unreadCount: number }>();

    for (const msg of messages) {
      const student = msg.senderId === wardenId ? msg.receiver : msg.sender;
      if (!student || student.id === wardenId) continue;

      if (!conversationMap.has(student.id)) {
        const unread = msg.receiverId === wardenId && !msg.isRead ? 1 : 0;
        conversationMap.set(student.id, {
          student,
          latestMessage: msg,
          unreadCount: unread,
        });
      } else {
        if (msg.receiverId === wardenId && !msg.isRead) {
          const thread = conversationMap.get(student.id)!;
          thread.unreadCount += 1;
        }
      }
    }

    return Array.from(conversationMap.values());
  }

  // Broadcast announcement to all active students in hostel
  async sendBroadcastAnnouncement(senderId: string, hostelId: string, title: string, content: string) {
    const students = await this.prisma.user.findMany({
      where: {
        hostelId,
        role: Role.STUDENT,
        isActive: true,
      },
      select: { id: true, email: true },
    });

    if (students.length === 0) {
      return { count: 0, message: 'No active resident students found in hostel.' };
    }

    const broadcastText = `📢 [ANNOUNCEMENT] ${title}\n\n${content}`;

    await this.prisma.directMessage.createMany({
      data: students.map((s) => ({
        content: broadcastText,
        senderId,
        receiverId: s.id,
        hostelId,
        isRead: false,
      })),
    });

    await this.auditService.log({
      action: 'BROADCAST_ANNOUNCEMENT_SENT',
      newValue: { title, recipientCount: students.length },
      hostelId,
      userId: senderId,
    });

    return { count: students.length, message: `Broadcast announcement sent to ${students.length} resident students.` };
  }

  // Get notifications (unread messages & announcements) for logged-in user
  async getNotifications(userId: string) {
    const unreadCount = await this.prisma.directMessage.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });

    const recentMessages = await this.prisma.directMessage.findMany({
      where: { receiverId: userId },
      orderBy: { createdAt: 'desc' },
      take: 15,
      include: {
        sender: {
          select: { id: true, email: true, role: true, profile: true },
        },
      },
    });

    return {
      unreadCount,
      notifications: recentMessages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        isRead: msg.isRead,
        senderName: (msg.sender.profile as any)?.fullName || msg.sender.email.split('@')[0],
        senderRole: msg.sender.role,
        createdAt: msg.createdAt,
        isAnnouncement: msg.content.includes('[ANNOUNCEMENT]'),
      })),
    };
  }

  // Mark all unread notifications as read for user
  async markNotificationsAsRead(userId: string) {
    await this.prisma.directMessage.updateMany({
      where: {
        receiverId: userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    return { message: 'All notifications marked as read.' };
  }
}
