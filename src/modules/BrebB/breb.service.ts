import { Injectable } from '@nestjs/common';

export interface UsersBreb {
  id: string;
  name: string;
  email: string;
}
const usersBreb: UsersBreb[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
  },

  {
    id: '2',
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
  },
];
@Injectable()
export class BrebService {
  getBreb(): string {
    return 'Breb';
  }

  getUserBreb(id: string): UsersBreb {
    return usersBreb.find((user) => user.id === id);
  }

  createUserBreb(body: UsersBreb): UsersBreb[] {
    const arrayWithNewUser = [...usersBreb, body];
    return arrayWithNewUser;
  }
}
