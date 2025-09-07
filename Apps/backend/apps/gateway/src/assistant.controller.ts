import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Req,
  Param,
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
  ) {}

  private async handleRequest(pattern: any, body: any, fallbackMsg: string) {
    try {
      const result = await lastValueFrom(
        this.doctorServiceClient.send(pattern, body),
      );
      return { success: true, data: result, message: 'Operation successful' };
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

  // ==================== DOCTOR → ASSISTANT MANAGEMENT ====================

  @Post('invite')
  async inviteAssistant(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: { assistantEmail: string; workplaceId: string; message?: string },
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
      {
        token: req.token,
        doctorUserId: req.user.id,
        assistantEmail: body.assistantEmail,
        workplaceId: body.workplaceId,
        message: body.message,
      },
      'Failed to invite assistant',
    );
  }

  @Get('my-assistants')
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

  @Get('pending-invites')
  async getPendingInvites(@Req() req: AuthenticatedRequest) {
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
      { cmd: 'get_doctor_pending_invites' },
      { token: req.token, doctorUserId: req.user.id },
      'Failed to get pending invites',
    );
  }

  @Delete('remove')
  async removeAssistant(
    @Req() req: AuthenticatedRequest,
    @Body() body: { assistantId: string; workplaceId: string; reason?: string },
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

  @Delete('cancel-invite/:inviteId')
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

  // ==================== ASSISTANT SELF ENDPOINTS ====================

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
    @Body() body: { inviteId: string; response: 'accept' | 'reject' },
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
      { token: req.token, assistantId: req.user.id, ...body },
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
    @Body() body: { workplaceId: string; reason?: string },
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
      { token: req.token, assistantId: req.user.id, ...body },
      'Failed to leave workplace',
    );
  }

  // ==================== WORKPLACE MANAGEMENT ====================
  @MessagePattern({ cmd: 'update_workplace' })
  async updateWorkplace(
    @Payload() data: { workplaceId: string; updates: any },
    @CurrentUser() user: any,
  ) {
    return this.doctorService.updateWorkplace(
      user.id,
      data.workplaceId,
      data.updates,
    );
  }

  @UseGuards(MicroserviceAuthGuard, RoleGuard)
  @DoctorOnly()
  @MessagePattern({ cmd: 'delete_workplace' })
  async deleteWorkplace(
    @Payload() data: { workplaceId: string },
    @CurrentUser() user: any,
  ) {
    return this.doctorService.deleteWorkplace(user.id, data.workplaceId);
  }

  // ==================== APPOINTMENT SLOTS ====================

  @UseGuards(MicroserviceAuthGuard, RoleGuard)
  @DoctorOnly()
  @MessagePattern({ cmd: 'create_appointment_slots' })
  async createAppointmentSlots(
    @Payload()
    data: {
      workplaceId: string;
      date: string;
      start_time: string;
      end_time: string;
      slot_duration: number;
    },
    @CurrentUser() user: any,
  ) {
    return this.doctorService.createAppointmentSlots(
      user.id,
      data.workplaceId,
      data,
    );
  }

  @UseGuards(MicroserviceAuthGuard, RoleGuard)
  @DoctorOnly()
  @MessagePattern({ cmd: 'get_workplace_appointment_slots' })
  async getWorkplaceAppointmentSlots(
    @Payload() data: { workplaceId: string; date: string },
  ) {
    return this.doctorService.getWorkplaceAppointmentSlots(
      data.workplaceId,
      data.date,
    );
  }

  // ==================== ASSISTANT EXTRA ====================

  @UseGuards(MicroserviceAuthGuard, RoleGuard)
  @RequireRoles(UserRole.DOCTOR)
  @MessagePattern({ cmd: 'get_doctor_pending_invites' })
  async getDoctorPendingInvites(@Payload() data: { doctorUserId: string }) {
    return this.doctorService.getDoctorPendingInvites(data.doctorUserId);
  }

  @UseGuards(MicroserviceAuthGuard, RoleGuard)
  @RequireRoles(UserRole.ASSISTANT)
  @MessagePattern({ cmd: 'get_assistant_workplaces' })
  async getAssistantWorkplaces(@Payload() data: { assistantId: string }) {
    return this.doctorService.getAssistantWorkplaces(data.assistantId);
  }

  @UseGuards(MicroserviceAuthGuard, RoleGuard)
  @RequireRoles(UserRole.ASSISTANT)
  @MessagePattern({ cmd: 'leave_workplace' })
  async leaveWorkplace(
    @Payload()
    data: {
      assistantId: string;
      workplaceId: string;
      reason?: string;
    },
  ) {
    return this.doctorService.leaveWorkplace(
      data.assistantId,
      data.workplaceId,
      data.reason,
    );
  }
}
