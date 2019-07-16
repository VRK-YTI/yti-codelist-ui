import { UserSimpleType } from '../services/api-schema';

export class UserSimple {

  id: string;
  firstName: string;
  lastName: string;

  constructor(data: UserSimpleType) {
    this.id = data.id;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
  }

  serialize(): UserSimpleType {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
    };
  }

  getDisplayName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  clone(): UserSimple {
    return new UserSimple(this.serialize());
  }
}
