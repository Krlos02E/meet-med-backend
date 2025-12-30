import {
  Controller,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  ForbiddenException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCookieAuth, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { UserRole } from './entities/user.entity';
import { plainToInstance } from 'class-transformer';

@ApiTags('users')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Put(':id')
  @ApiOperation({ summary: 'Update user information' })
  @ApiResponse({ status: HttpStatus.OK, type: UserResponseDto })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() currentUser: any,
  ) {
    if (currentUser.role !== UserRole.ADMIN && currentUser.userId !== id) {
      throw new ForbiddenException('You can only update your own profile');
    }
    const user = await this.usersService.update(id, updateUserDto);
    return plainToInstance(UserResponseDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Logical delete of a user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User deleted logically' })
  async remove(@Param('id') id: string, @GetUser() currentUser: any) {
    if (currentUser.role !== UserRole.ADMIN && currentUser.userId !== id) {
      throw new ForbiddenException('You can only delete your own profile');
    }
    await this.usersService.remove(id);
    return { message: 'User deleted successfully' };
  }
}
