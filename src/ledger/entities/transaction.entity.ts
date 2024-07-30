export class Transaction {
  id: string;
  userId: string;
  createdAt: Date;
  type: 'earned' | 'spent' | 'payout';
  amount: number;
}
