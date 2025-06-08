import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Inject,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { AuthenticatedRequest } from './middleware/auth.middleware';

@Controller('api/assistants')
export class AssistantController {
  constructor(
    @Inject('DOCTOR_SERVICE_CLIENT')
    private readonly doctorServiceClient: ClientProxy,

    @Inject('AUTH_SERVICE_CLIENT')
    private readonly authServiceClient: ClientProxy,
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
      console.error('Doctor Microservice Error:', err);

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

  // ==================== ASSISTANT ENDPOINTS ====================

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
      { cmd: 'get_assistant_invites' },
      { token: req.token, assistantId: req.user.id },
      'Failed to get invites',
    );
  }

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
      {
        token: req.token,
        assistantId: req.user.id,
        inviteId: body.inviteId,
        response: body.response,
      },
      'Failed to respond to invite',
    );
  }

  @Get('my-workplaces')
  async getMyWorkplaces(@Req() req: AuthenticatedRequest) {
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
      { cmd: 'get_assistant_workplaces' },
      { token: req.token, assistantId: req.user.id },
      'Failed to get workplaces',
    );
  }

  @Post('leave-workplace')
  async leaveWorkplace(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      workplaceId: string;
      reason?: string;
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
      { cmd: 'leave_workplace' },
      {
        token: req.token,
        assistantId: req.user.id,
        workplaceId: body.workplaceId,
        reason: body.reason,
      },
      'Failed to leave workplace',
    );
  }
}
