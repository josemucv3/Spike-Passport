import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { BrebService, UsersBreb } from './breb.service';

@Controller('breb')
export class BrebController {
  constructor(private readonly brebService: BrebService) {}

  @Get()
  getBreb(): string {
    return this.brebService.getBreb();
  }
  @Get(':id')
  getUserBreb(@Param('id') id: string): UsersBreb {
    return this.brebService.getUserBreb(id);
  }
  @Post()
  createUserBreb(@Body() body: UsersBreb): UsersBreb[] {
    return this.brebService.createUserBreb(body);
  }
  @Get()
  getAllUsersBreb(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return [...Array(limit)].map((_, index) => index + page * limit);
  }
}
