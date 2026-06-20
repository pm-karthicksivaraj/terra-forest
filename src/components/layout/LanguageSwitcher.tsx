'use client';
import { useI18n } from '@/lib/i18n/context';
import { Button } from '@/components/ui/button';
import { Globe2 } from 'lucide-react';

export default function LanguageSwitcher() {
  const { lang, setLang } = useI18n();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 gap-1.5 text-xs"
      onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
    >
      <Globe2 className="w-3.5 h-3.5" />
      {lang === 'vi' ? 'EN' : 'VI'}
    </Button>
  );
}
