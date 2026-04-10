'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context/app-context';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Button } from '@/components/ui/button';
import { Send, AlertCircle, Info, Bell, Settings, Megaphone } from 'lucide-react';
import { Notification } from '@/lib/types';
import { GarageFolioLogo } from '@/components/shared/garagefolio-logo';
import Link from 'next/link';

export default function NotificationsPage() {
  const router = useRouter();
  const { currentUser, store } = useApp();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    const sorted = [...store.notifications].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setNotifications(sorted);
  }, [currentUser, store, router]);

  if (!currentUser) {
    return null;
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'new_damage_recorded':
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      case 'registration_incomplete':
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'registration_expiring_30d':
      case 'insurance_expiring_30d':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getIconBg = (type: Notification['type']) => {
    switch (type) {
      case 'new_damage_recorded': return 'bg-destructive/10';
      case 'registration_incomplete': return 'bg-amber-500/10';
      case 'registration_expiring_30d':
      case 'insurance_expiring_30d': return 'bg-blue-500/10';
      default: return 'bg-muted';
    }
  };

  const getStatusBadge = (status: Notification['status']) => {
    switch (status) {
      case 'sent':
        return <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-success/10 text-success border border-success/20">Sent</span>;
      case 'scheduled':
        return <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">Scheduled</span>;
      case 'draft':
        return <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-muted text-muted-foreground border border-border/40">Draft</span>;
    }
  };

  return (
    <div className="min-h-screen pb-safe bg-background">
      {/* Header */}
      <div className="header-gradient border-b border-border/60 sticky top-0 z-30">
        <div className="px-4 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Notifications</h1>
            <Link href="/notifications/settings">
              <Button size="sm" variant="ghost" className="rounded-xl">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          
          <Button className="w-full btn-gold rounded-xl h-12 text-sm font-semibold" onClick={() => router.push('/notifications/broadcast')}>
            <Send className="w-4 h-4 mr-2" />
            Send Broadcast Message
          </Button>
        </div>
      </div>

      {/* Notification List */}
      <div className="p-4 space-y-3 max-w-2xl mx-auto">
        {notifications.length === 0 ? (
          <div className="card-premium relative overflow-hidden p-12 text-center animate-fade-in">
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
              <GarageFolioLogo variant="gold" size="xl" showText={false} className="w-72 h-72" />
            </div>
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-full bg-muted/80 backdrop-blur-sm mx-auto mb-4 flex items-center justify-center border border-border/50 shadow-inner">
                <Megaphone className="w-8 h-8 text-muted-foreground/40" />
              </div>
              <p className="text-foreground/90 font-medium text-lg">No notifications yet</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Notifications will appear here as they are created</p>
            </div>
          </div>
        ) : (
          notifications.map((notification, idx) => {
            const client = notification.clientId 
              ? store.clients.find(c => c.id === notification.clientId)
              : null;

            return (
              <div
                key={notification.id}
                className="card-premium p-4 animate-fade-in-up"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full ${getIconBg(notification.type)} flex items-center justify-center`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-sm">{notification.title}</h3>
                      {getStatusBadge(notification.status)}
                    </div>

                    <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                      {notification.message}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground/70 pt-2 border-t border-border/40">
                      <span>
                        {notification.audience === 'individual' && client 
                          ? `To: ${client.firstName} ${client.lastName}`
                          : 'To: All clients'}
                      </span>
                      <span>{new Date(notification.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <BottomNav />
    </div>
  );
}
