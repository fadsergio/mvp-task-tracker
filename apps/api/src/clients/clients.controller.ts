import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
    constructor(private readonly clientsService: ClientsService) { }

    @Post()
    create(@Body() createClientDto: any, @Req() req: any) {
        return this.clientsService.create(createClientDto, req.user.tenantId);
    }

    @Get()
    findAll(@Req() req: any) {
        return this.clientsService.findAll(req.user.tenantId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.clientsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateClientDto: any, @Req() req: any) {
        return this.clientsService.update(id, updateClientDto, req.user.tenantId);
    }
}
