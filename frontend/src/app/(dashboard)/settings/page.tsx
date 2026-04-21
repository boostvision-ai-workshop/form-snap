'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Monitor, Sun, Moon } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';

export const dynamic = 'force-dynamic';

interface UserInfo {
  uid: string;
  email: string;
  email_verified: boolean;
  id?: string;
  display_name?: string | null;
  avatar_url?: string | null;
  created_at?: string;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserInfo() {
      try {
        setLoading(true);
        const response = await api.get('/api/v1/users/me');
        const data = await response.json();
        setUserInfo(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load user info');
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchUserInfo();
    }
  }, [user]);

  const getInitials = (name?: string | null, email?: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  const themeOptions = [
    {
      value: 'system',
      label: 'System',
      description: 'Follow system preference',
      icon: Monitor,
    },
    {
      value: 'light',
      label: 'Light',
      description: 'Light theme',
      icon: Sun,
    },
    {
      value: 'dark',
      label: 'Dark',
      description: 'Dark theme',
      icon: Moon,
    },
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="w-full max-w-md">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Your account details and information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading ? (
                <div className="space-y-4">
                  <div className="h-16 w-16 rounded-full bg-muted animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={userInfo?.avatar_url || undefined} />
                      <AvatarFallback>
                        {getInitials(userInfo?.display_name, userInfo?.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Avatar
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Your profile picture
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Email
                      </p>
                      <p className="text-sm">{userInfo?.email}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Display Name
                      </p>
                      <p className="text-sm">
                        {userInfo?.display_name || (
                          <span className="text-muted-foreground">Not set</span>
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Member Since
                      </p>
                      <p className="text-sm">{formatDate(userInfo?.created_at)}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        User ID
                      </p>
                      <p className="text-sm font-mono">{userInfo?.uid}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Email Verified
                      </p>
                      {userInfo?.email_verified ? (
                        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600">
                          Unverified
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button disabled title="Coming soon">
                      Edit Profile
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the appearance of the application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <p className="text-sm font-medium mb-4">Theme</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {themeOptions.map((option) => {
                    const Icon = option.icon;
                    const isActive = theme === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setTheme(option.value)}
                        className={`flex flex-col items-start gap-2 p-4 rounded-lg border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                          isActive
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <Icon className={`h-6 w-6 ${isActive ? 'text-primary' : ''}`} />
                        <div className="text-left">
                          <p className={`font-medium ${isActive ? 'text-primary' : ''}`}>
                            {option.label}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {option.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
