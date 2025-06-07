import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotificationTemplate,
  NotificationType,
} from '../entities/notification-template.entity';

@Injectable()
export class TemplateService {
  constructor(
    @InjectRepository(NotificationTemplate)
    private readonly templateRepo: Repository<NotificationTemplate>,
  ) {}

  async getTemplate(
    name: string,
    type: NotificationType,
  ): Promise<NotificationTemplate | null> {
    return this.templateRepo.findOne({
      where: { name, type, isActive: true },
    });
  }

  async renderTemplate(
    template: NotificationTemplate,
    data: any,
  ): Promise<{ subject: string; content: string }> {
    let subject = template.subject;
    let content = template.content;

    // Replace placeholders like {{name}}, {{otp}}, etc.
    const mergedData = { ...template.defaultData, ...data };

    for (const [key, value] of Object.entries(mergedData)) {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(placeholder, String(value));
      content = content.replace(placeholder, String(value));
    }

    return { subject, content };
  }

  async createTemplate(
    templateData: Partial<NotificationTemplate>,
  ): Promise<NotificationTemplate> {
    const template = this.templateRepo.create(templateData);
    return this.templateRepo.save(template);
  }

  async getAllTemplates(): Promise<NotificationTemplate[]> {
    return this.templateRepo.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async updateTemplate(
    id: string,
    updates: Partial<NotificationTemplate>,
  ): Promise<NotificationTemplate> {
    await this.templateRepo.update(id, updates);
    return this.templateRepo.findOne({ where: { id } });
  }
}
