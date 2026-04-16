export type Notification = {
  notification_id: string;
  type: string;
  title: string;
  content: string;
  metadata: any;
  is_global: boolean;
  created_at: string;
  read: boolean;
  deleted: boolean;
  read_at: string | null;
  deleted_at: string | null;
};
