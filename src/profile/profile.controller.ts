import { User } from '@app/user/decorators/user.decorator';
import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ProfileResponseInterface } from '@app/profile/types/profileResponse.interface';
import { ProfileService } from '@app/profile/profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':username')
  async getProfile(
    @User('id') userId: number,
    @Param('username') username: string,
  ): Promise<ProfileResponseInterface> {
    const profile = await this.profileService.getProfile(userId, username);
    return this.profileService.buildProfileResponse(profile);
  }

  @Post(':username/follow')
  async followProfile(
    @User('id') userId: number,
    @Param('username') username: string,
  ): Promise<ProfileResponseInterface> {
    const profile = await this.profileService.followProfile(userId, username);
    return this.profileService.buildProfileResponse(profile);
  }

  @Delete(':username/follow')
  async unFollowProfile(
    @User('id') userId: number,
    @Param('username') username: string,
  ): Promise<ProfileResponseInterface> {
    const profile = await this.profileService.unFollowProfile(userId, username);
    return this.profileService.buildProfileResponse(profile);
  }
}
