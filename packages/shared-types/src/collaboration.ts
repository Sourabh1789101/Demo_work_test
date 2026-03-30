export type PresenceEvent = {
  userId: string;
  formId: string;
  status: 'online' | 'offline';
};
