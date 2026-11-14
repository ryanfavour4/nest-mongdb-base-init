import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'API root health check' })
  @ApiResponse({ status: 200, description: 'Service health status' })
  getRoot() {
    return this.appService.getHealth();
  }

  @Get('health')
  @ApiOperation({ summary: 'Dedicated health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service health status' })
  getHealth() {
    return this.appService.getHealth();
  }
}
