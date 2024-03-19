import { HttpStatus, Injectable } from '@nestjs/common';
import { ProfileType } from '@app/profile/types/profile.type';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@app/user/user.entity';
import { Repository } from 'typeorm';
import { ProfileResponseInterface } from '@app/profile/types/profileResponse.interface';
import { FollowEntity } from './follow.entity';
import { ErrorService } from '@app/shared/services/error.service';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>,
    private readonly errorService: ErrorService,
  ) {}

  async getProfile(userId: number, username: string): Promise<ProfileType> {
    const user = await this.userRepository.findOne({
      where: { username },
    });

    if (!user) {
      this.errorService.errorResponse(
        'Profile does not exist',
        HttpStatus.NOT_FOUND,
      );
    }

    const follow = await this.followRepository.findOne({
      where: { followerId: userId, followingId: user.id },
    });

    return { ...user, following: Boolean(follow) };
  }

  async followProfile(userId: number, username: string): Promise<ProfileType> {
    const user = await this.userRepository.findOne({
      where: { username },
    });

    if (!user) {
      this.errorService.errorResponse(
        'Profile does not exist',
        HttpStatus.NOT_FOUND,
      );
    }

    if (user.id === userId) {
      this.errorService.errorResponse(
        'follower and following cannot be equal',
        HttpStatus.BAD_REQUEST,
      );
    }

    const follow = await this.followRepository.findOne({
      where: {
        followerId: userId,
        followingId: user.id,
      },
    });

    if (!follow) {
      const followToCreate = new FollowEntity();
      followToCreate.followerId = userId;
      followToCreate.followingId = user.id;
      await this.followRepository.save(followToCreate);
    }

    return { ...user, following: true };
  }

  async unFollowProfile(
    userId: number,
    username: string,
  ): Promise<ProfileType> {
    const user = await this.userRepository.findOne({
      where: { username },
    });

    if (!user) {
      this.errorService.errorResponse(
        'Profile does not exist',
        HttpStatus.NOT_FOUND,
      );
    }

    if (user.id === userId) {
      this.errorService.errorResponse(
        'follower and following cannot be equal',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.followRepository.delete({
      followerId: userId,
      followingId: user.id,
    });

    return { ...user, following: false };
  }

  buildProfileResponse(profile: ProfileType): ProfileResponseInterface {
    return {
      profile,
    };
  }
}
