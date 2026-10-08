import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRef } from 'react';
import { enableWebPush, rememberShownNotification, showDeviceNotification, syncPushSubscription } from '../lib/push';
import { useLiveData } from '../context/LiveDataContext';

export const PushSync: React.FC = () => {
  const { isLoggedIn, user } = useAuth();
  const { collections } = useLiveData();
  const primed = useRef(false);

  useEffect(() => {
    if (!isLoggedIn || user?.isGuest) return;
    void syncPushSubscription();
  }, [isLoggedIn, user?.id]);

  useEffect(() => {
    if (!isLoggedIn || user?.isGuest) return;
    const notes = (collections.notifications || []).filter((note: any) => note.userId === user?.id && !note.read);
    if (!primed.current) {
      notes.forEach((note: any) => rememberShownNotification(note.id));
      primed.current = true;
      return;
    }
    notes.forEach((note: any) => {
      void showDeviceNotification(note);
    });
  }, [collections.notifications, isLoggedIn, user?.id]);

  useEffect(() => {
    if (!isLoggedIn || user?.isGuest) return;
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'default') {
      void enableWebPush();
    }
  }, [isLoggedIn, user?.id]);

  return null;
};
