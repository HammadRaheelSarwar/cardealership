export interface INotification {
  id: string;
  dealership_id: string;
  user_id: string;
  title: string;
  body: string;
  read: boolean;
  link?: string;
  created_at: string;
}
export type Notification = INotification;
