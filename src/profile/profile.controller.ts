import { Body, Controller, Post } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto';

@Controller('profile')
export class ProfileController {
    constructor(private profileService: ProfileService) {}
    @Post('')
    update(@Body() dto: UpdateProfileDto) {
        return this.profileService.update(dto)
    }
}
