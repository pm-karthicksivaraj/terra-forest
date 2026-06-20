'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Map, SatelliteDish, Flame, AlertTriangle,
  Leaf, CloudCog, Footprints, QrCode, FileText,
  ChevronLeft, ChevronRight, TreePine, Radio, Globe2,
  Database, TrendingDown, Award, ShieldCheck, Users, Key,
  UsersRound, Smartphone, ListTodo, Camera, Upload, Settings, Scale,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { NAV_SECTIONS } from '@/lib/constants';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard, Map, SatelliteDish, Flame, AlertTriangle,
  Leaf, CloudCog, Footprints, QrCode, FileText,
  Radio, Globe2, TreePine, Scale, Database, TrendingDown,
  Award, ShieldCheck, Users, Key, UsersRound, Smartphone,
  ListTodo, Camera, Upload, Settings,
};

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { lang, t } = useI18n();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const getLabel = (section: typeof NAV_SECTIONS[number], item: typeof NAV_SECTIONS[number]['items'][number]) => {
    if (lang === 'vi') {
      return item.labelVi;
    }
    return item.label;
  };

  const getSectionLabel = (section: typeof NAV_SECTIONS[number]) => {
    if (lang === 'vi') {
      return section.labelVi;
    }
    return section.label;
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'h-screen bg-forest-900 text-forest-200 flex flex-col transition-all duration-300 border-r border-forest-700/50 relative',
          collapsed ? 'w-16' : 'w-56'
        )}
      >
        {/* Logo */}
        <div className="h-14 flex items-center gap-2 px-3 border-b border-forest-700/50">
          <div className="w-9 h-9 rounded-lg bg-forest-500 flex items-center justify-center flex-shrink-0">
            <TreePine className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-sm font-bold text-white leading-tight">{t.appName}</h1>
              <p className="text-[10px] text-forest-300 leading-tight">{t.appTagline.split('—')[0].trim()}</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-2 px-2 space-y-3 overflow-y-auto scrollbar-thin">
          {NAV_SECTIONS.map((section, si) => (
            <div key={si}>
              {!collapsed && (
                <p className="text-[9px] uppercase tracking-wider text-forest-500 font-semibold px-2.5 mb-1">
                  {getSectionLabel(section)}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = iconMap[item.icon] || LayoutDashboard;
                  const active = isActive(item.href);

                  const linkContent = (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-2.5 py-1.5 rounded-lg text-sm transition-all duration-200 group',
                        active
                          ? 'bg-forest-700 text-white shadow-sm'
                          : 'text-forest-300 hover:bg-forest-800 hover:text-forest-100'
                      )}
                    >
                      <Icon className={cn('w-4 h-4 flex-shrink-0', active && 'text-forest-300')} />
                      {!collapsed && <span className="truncate text-xs">{getLabel(section, item)}</span>}
                      {active && !collapsed && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-forest-300" />
                      )}
                    </Link>
                  );

                  if (collapsed) {
                    return (
                      <Tooltip key={item.href}>
                        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                        <TooltipContent side="right" className="bg-forest-800 text-forest-100 border-forest-700 text-xs">
                          {getSectionLabel(section)}: {getLabel(section, item)}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return <React.Fragment key={item.href}>{linkContent}</React.Fragment>;
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Collapse toggle */}
        <div className="p-2 border-t border-forest-700/50">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-forest-400 hover:bg-forest-800 hover:text-forest-200 transition-colors text-xs"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {!collapsed && <span>{t.common.collapse}</span>}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
