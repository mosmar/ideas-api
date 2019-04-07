import { AuthGuard } from './../shared/auth.gaurd';
import { ValidationPipe } from './../shared/validation.pipe';
import { UserDTO } from './user.dto';
import { UserService } from './user.service';
import { Controller, Get, Post, Body, UsePipes, UseGuards } from '@nestjs/common';
import { User } from './user.decorator';

@Controller()
export class UserController {

    constructor(private userService: UserService) { }

    @Get('api/users')
    @UseGuards(new AuthGuard())
    showAllUsers(@User() user) {
        return this.userService.showAll();
    }

    @Post('login')
    @UsePipes(new ValidationPipe())
    login(@Body() data: UserDTO) {
        return this.userService.login(data);
    }

    @Post('register')
    @UsePipes(new ValidationPipe())
    register(@Body() data: UserDTO) {
        return this.userService.register(data);
    }
}
