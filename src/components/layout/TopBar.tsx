'use client';

import React, { useState } from 'react';
import { Search, Bell, LogOut, User as UserIcon, ChevronDown } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useI18n } from '@/lib/i18n/context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ROLES } from '@/lib/constants';
import LanguageSwitcher from './LanguageSwitcher';

export default function TopBar() {
  const { user, logout } = useAuth();
  const { lang, t } = useI18n();

  const alerts = [
    { id: 1, message: lang === 'vi' ? 'Cảnh báo nguy cơ cháy tại ô DN_BGM_003 — FWI vượt ngưỡng 40' : 'Fire risk alert at plot DN_BGM_003 — FWI exceeded threshold 40', severity: 'high', time: lang === 'vi' ? '5 phút trước' : '5 min ago' },
    { id: 2, message: lang === 'vi' ? 'Phát hiện phá rừng tại Đắk Lắk qua phân tích thay đổi Sentinel-2' : 'Deforestation detected in Dak Lak via Sentinel-2 change analysis', severity: 'critical', time: lang === 'vi' ? '12 phút trước' : '12 min ago' },
    { id: 3, message: lang === 'vi' ? 'Phát hiện thay đổi lớp phủ rừng tại Bình Phước — NDVI delta -0.04' : 'Forest cover change detected at Binh Phuoc — NDVI delta -0.04', severity: 'medium', time: lang === 'vi' ? '1 giờ trước' : '1 hour ago' },
    { id: 4, message: lang === 'vi' ? 'Đội Alpha hoàn thành tuần tra — 5 quan sát đã tải lên' : 'Ranger Team Alpha completed patrol — 5 observations uploaded', severity: 'low', time: lang === 'vi' ? '2 giờ trước' : '2 hours ago' },
  ];

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(-2).join('')
    : 'TF';

  const roleLabel = ROLES.find(r => r.value === user?.role)?.[lang === 'vi' ? 'labelVi' : 'label'] || user?.role || 'User';

  return (
    <header className="h-14 bg-white border-b border-forest-200 flex items-center justify-between px-4 gap-4">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={t.common.searchPlotsAlerts}
          className="pl-9 h-9 bg-forest-100/50 border-forest-200 focus:border-forest-500"
        />
      </div>

      <div className="flex items-center gap-2">
        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 relative">
              <Bell className="w-4 h-4" />
              <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-fire-700 text-white">
                {alerts.length}
              </Badge>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-3 border-b">
              <h4 className="text-sm font-semibold">{t.common.notifications}</h4>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {alerts.map((alert) => (
                <div key={alert.id} className="p-3 border-b last:border-0 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      alert.severity === 'critical' ? 'bg-red-600' : alert.severity === 'high' ? 'bg-fire-700' : 'bg-yellow-500'
                    }`} />
                    <div>
                      <p className="text-xs">{alert.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{alert.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 px-2 gap-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-forest-600 text-white text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-xs font-medium leading-tight">{user?.name}</span>
                <span className="text-[10px] text-muted-foreground leading-tight">{roleLabel}</span>
              </div>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="gap-2">
              <UserIcon className="w-4 h-4" />
              {t.common.profile}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 text-red-600" onClick={logout}>
              <LogOut className="w-4 h-4" />
              {t.common.signOut}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
