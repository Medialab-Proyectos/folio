'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context/app-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Send } from 'lucide-react';

export default function BroadcastPage() {
  const router = useRouter();
  const { store, setNotifications, showToast } = useApp();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const notification = {
      id: `notif-${Date.now()}`,
      type: 'mass_communication' as const,
      audience: 'all_clients' as const,
      title,
      message,
      status: 'sent' as const,
      createdAt: new Date().toISOString(),
    };

    setNotifications([...store.notifications, notification]);
    showToast('Broadcast sent successfully', 'success');

    router.push('/notifications');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-[hsl(var(--surface-dark))] text-white p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-semibold">Broadcast Message</h1>
            <p className="text-sm text-white/70">Send to all clients</p>
          </div>
        </div>
      </header>

      <form onSubmit={handleSend} className="p-4 space-y-6">
        <div className="card-premium p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Holiday Hours Update"
              required
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message..."
              rows={6}
              required
            />
            <p className="text-xs text-muted-foreground">
              This message will be sent to all active clients
            </p>
          </div>
        </div>

        <div className="card-premium p-4 bg-muted/50">
          <h3 className="text-sm font-medium mb-2">Preview</h3>
          <div className="bg-card p-4 rounded-lg space-y-2">
            <p className="font-semibold">{title || 'Title will appear here'}</p>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {message || 'Message content will appear here'}
            </p>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading || !title || !message}
          className="w-full btn-dark h-12"
        >
          <Send className="w-4 h-4 mr-2" />
          {loading ? 'Sending...' : 'Send Broadcast'}
        </Button>
      </form>
    </div>
  );
}
