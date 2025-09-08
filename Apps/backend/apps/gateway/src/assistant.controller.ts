import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Inject,
  HttpException,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { AuthenticatedRequest } from './middleware/auth.middleware';

@Controller('assistants')
export class AssistantController {
  constructor(
    @Inject('DOCTOR_SERVICE_CLIENT')
    private readonly doctorServiceClient: ClientProxy,
  ) {}

  private async handleRequest(pattern: any, body: any, fallbackMsg: string) {
    try {
      const result = await lastValueFrom(
        this.doctorServiceClient.send(pattern, body),
      );
      return {
        success: true,
        data: result,
        message: 'Operation successful',
      };
    } catch (err) {
      console.error('Assistant Microservice Error:', err);

      let status = err?.status || HttpStatus.BAD_REQUEST;
      if (typeof status !== 'number' || isNaN(status)) {
        status = HttpStatus.BAD_REQUEST;
      }
      const message = err?.response?.message || err?.message || fallbackMsg;
      throw new HttpException(
        {
          success: false,
          status,
          message,
          error: this.getErrorName(status),
        },
        status,
      );
    }
  }

  private getErrorName(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'Bad Request';
      case HttpStatus.UNAUTHORIZED:
        return 'Unauthorized';
      case HttpStatus.FORBIDDEN:
        return 'Forbidden';
      case HttpStatus.NOT_FOUND:
        return 'Not Found';
      case HttpStatus.CONFLICT:
        return 'Conflict';
      default:
        return 'Internal Server Error';
    }
  }

  // ==================== ASSISTANT ROUTES ====================

  @Post('respond-invite')
  async respondToInvite(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      inviteId: string;
      response: 'accept' | 'reject';
    },
  ) {
    if (req.user.role !== 'assistant') {
      throw new HttpException(
        {
          success: false,
          status: 403,
          message: 'Assistant access required',
          error: 'Forbidden',
        },
        403,
      );
    }

    return this.handleRequest(
      { cmd: 'respond_to_invite' },
      { token: req.token, assistantUserId: req.user.id, ...body },
      'Failed to respond to invite',
    );
  }

  @Get('my-invites')
  async getMyInvites(@Req() req: AuthenticatedRequest) {
    if (req.user.role !== 'assistant') {
      throw new HttpException(
        {
          success: false,
          status: 403,
          message: 'Assistant access required',
          error: 'Forbidden',
        },
        403,
      );
    }

    return this.handleRequest(
      { cmd: 'get_my_invites' },
      { token: req.token, assistantUserId: req.user.id },
      'Failed to get invites',
    );
  }

  // ==================== DOCTOR ROUTES (for managing assistants) ====================

  @Get('doctor/my-assistants')
  async getMyAssistants(@Req() req: AuthenticatedRequest) {
    if (req.user.role !== 'doctor') {
      throw new HttpException(
        {
          success: false,
          status: 403,
          message: 'Doctor access required',
          error: 'Forbidden',
        },
        403,
      );
    }

    return this.handleRequest(
      { cmd: 'get_my_assistants' },
      { token: req.token, doctorUserId: req.user.id },
      'Failed to get assistants',
    );
  }

  @Post('doctor/invite')
  async inviteAssistant(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      assistantEmail: string;
      workplaceId: string;
      message?: string;
    },
  ) {
    if (req.user.role !== 'doctor') {
      throw new HttpException(
        {
          success: false,
          status: 403,
          message: 'Doctor access required',
          error: 'Forbidden',
        },
        403,
      );
    }

    return this.handleRequest(
      { cmd: 'invite_assistant' },
      { token: req.token, doctorUserId: req.user.id, ...body },
      'Failed to invite assistant',
    );
  }

  @Delete('doctor/remove-assistant')
  async removeAssistant(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      assistantId: string;
      workplaceId: string;
      reason?: string;
    },
  ) {
    if (req.user.role !== 'doctor') {
      throw new HttpException(
        {
          success: false,
          status: 403,
          message: 'Doctor access required',
          error: 'Forbidden',
        },
        403,
      );
    }

    return this.handleRequest(
      { cmd: 'remove_assistant' },
      { token: req.token, doctorUserId: req.user.id, ...body },
      'Failed to remove assistant',
    );
  }

  @Delete('doctor/cancel-invite/:inviteId')
  async cancelInvite(
    @Req() req: AuthenticatedRequest,
    @Param('inviteId') inviteId: string,
  ) {
    if (req.user.role !== 'doctor') {
      throw new HttpException(
        {
          success: false,
          status: 403,
          message: 'Doctor access required',
          error: 'Forbidden',
        },
        403,
      );
    }

    return this.handleRequest(
      { cmd: 'cancel_invite' },
      { token: req.token, doctorUserId: req.user.id, inviteId },
      'Failed to cancel invite',
    );
  }
}
