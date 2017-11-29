import { Injectable } from '@angular/core';
import { UserService } from './user.service';

@Injectable()
export class AuthorizationManager {

  constructor(private userService: UserService) {
  }

  get user() {
    return this.userService.user;
  }

  canEdit(/* TODO: organization as parameter */): boolean {
    // TODO replace dummy implementation
    return !this.user.anonymous;
  }
}
