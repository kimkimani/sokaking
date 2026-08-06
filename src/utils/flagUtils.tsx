import React, { useState } from 'react';

export function getCountryFlagUrl(countryName?: string, flag?: string): string | null {
  const targetFlag = flag?.trim();
  if (targetFlag && (
    targetFlag.startsWith('http://') || 
    targetFlag.startsWith('https://') || 
    targetFlag.startsWith('//') || 
    targetFlag.startsWith('/') || 
    targetFlag.startsWith('data:')
  )) {
    return targetFlag;
  }
  
  const key = (countryName || targetFlag || '').trim().toLowerCase();
  if (!key) return null;

  const flagMap: Record<string, string> = {
    'england': 'https://flagcdn.com/w40/gb-eng.png',
    'scotland': 'https://flagcdn.com/w40/gb-sct.png',
    'wales': 'https://flagcdn.com/w40/gb-wls.png',
    'spain': 'https://flagcdn.com/w40/es.png',
    'italy': 'https://flagcdn.com/w40/it.png',
    'france': 'https://flagcdn.com/w40/fr.png',
    'germany': 'https://flagcdn.com/w40/de.png',
    'netherlands': 'https://flagcdn.com/w40/nl.png',
    'portugal': 'https://flagcdn.com/w40/pt.png',
    'brazil': 'https://flagcdn.com/w40/br.png',
    'argentina': 'https://flagcdn.com/w40/ar.png',
    'kenya': 'https://flagcdn.com/w40/ke.png',
    'turkey': 'https://flagcdn.com/w40/tr.png',
    'usa': 'https://flagcdn.com/w40/us.png',
    'united states': 'https://flagcdn.com/w40/us.png',
    'sweden': 'https://flagcdn.com/w40/se.png',
    'denmark': 'https://flagcdn.com/w40/dk.png',
    'romania': 'https://flagcdn.com/w40/ro.png',
    'bulgaria': 'https://flagcdn.com/w40/bg.png',
    'cyprus': 'https://flagcdn.com/w40/cy.png',
    'ireland': 'https://flagcdn.com/w40/ie.png',
    'iceland': 'https://flagcdn.com/w40/is.png',
    'poland': 'https://flagcdn.com/w40/pl.png',
    'belgium': 'https://flagcdn.com/w40/be.png',
    'norway': 'https://flagcdn.com/w40/no.png',
    'austria': 'https://flagcdn.com/w40/at.png',
    'switzerland': 'https://flagcdn.com/w40/ch.png',
    'greece': 'https://flagcdn.com/w40/gr.png',
    'croatia': 'https://flagcdn.com/w40/hr.png',
    'czech republic': 'https://flagcdn.com/w40/cz.png',
    'finland': 'https://flagcdn.com/w40/fi.png',
    'south africa': 'https://flagcdn.com/w40/za.png',
    'nigeria': 'https://flagcdn.com/w40/ng.png',
    'egypt': 'https://flagcdn.com/w40/eg.png',
    'morocco': 'https://flagcdn.com/w40/ma.png',
    'saudi arabia': 'https://flagcdn.com/w40/sa.png',
    'japan': 'https://flagcdn.com/w40/jp.png',
    'south korea': 'https://flagcdn.com/w40/kr.png',
    'colombia': 'https://flagcdn.com/w40/co.png',
    'mexico': 'https://flagcdn.com/w40/mx.png',
    'chile': 'https://flagcdn.com/w40/cl.png',
    'peru': 'https://flagcdn.com/w40/pe.png',
    'uruguay': 'https://flagcdn.com/w40/uy.png',
    'ecuador': 'https://flagcdn.com/w40/ec.png',
    'ghana': 'https://flagcdn.com/w40/gh.png',
    'ivory coast': 'https://flagcdn.com/w40/ci.png',
    'senegal': 'https://flagcdn.com/w40/sn.png',
    'cameroon': 'https://flagcdn.com/w40/cm.png',
    'tanzania': 'https://flagcdn.com/w40/tz.png',
    'uganda': 'https://flagcdn.com/w40/ug.png',
    'zambia': 'https://flagcdn.com/w40/zm.png',
    'algeria': 'https://flagcdn.com/w40/dz.png',
    'tunisia': 'https://flagcdn.com/w40/tn.png',
    'australia': 'https://flagcdn.com/w40/au.png',
    'europe': 'https://flagcdn.com/w40/eu.png',
    'world': 'https://flagcdn.com/w40/un.png',
  };

  return flagMap[key] || null;
}

export function getCountryEmoji(countryName?: string, flag?: string): string {
  if (flag && !flag.startsWith('http') && !flag.startsWith('/') && !flag.startsWith('//')) {
    if (flag.length <= 4 && !/^[a-zA-Z0-9_-]+$/.test(flag)) {
      return flag;
    }
  }
  const name = (countryName || flag || '').trim().toLowerCase();

  const emojiMap: Record<string, string> = {
    'england': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    'wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
    'spain': '🇪🇸',
    'italy': '🇮🇹',
    'france': '🇫🇷',
    'germany': '🇩🇪',
    'netherlands': '🇳🇱',
    'portugal': '🇵🇹',
    'brazil': '🇧🇷',
    'argentina': '🇦🇷',
    'kenya': '🇰🇪',
    'turkey': '🇹🇷',
    'usa': '🇺🇸',
    'sweden': '🇸🇪',
    'denmark': '🇩🇰',
    'romania': '🇷🇴',
    'bulgaria': '🇧🇬',
    'cyprus': '🇨🇾',
    'ireland': '🇮🇪',
    'iceland': '🇮🇸',
    'poland': '🇵🇱',
    'belgium': '🇧🇪',
    'norway': '🇳🇴',
    'europe': '🇪🇺',
    'world': '🌐',
  };

  return emojiMap[name] || (flag && flag.length <= 4 && !/^[a-zA-Z0-9_-]+$/.test(flag) ? flag : '⚽');
}

export function FlagImage({ flag, countryName, countryFlag }: { flag?: string; countryName?: string; countryFlag?: string }) {
  const [hasError, setHasError] = useState(false);
  const effectiveFlag = countryFlag || flag;
  const flagUrl = getCountryFlagUrl(countryName, effectiveFlag);
  const emoji = getCountryEmoji(countryName, effectiveFlag);

  if (flagUrl && !hasError) {
    return (
      <img
        src={flagUrl}
        alt={countryName || 'Country flag'}
        className="w-4 h-3 object-cover rounded-2xs inline-block shrink-0 shadow-2xs border border-slate-200/60 dark:border-slate-700/60"
        onError={() => setHasError(true)}
      />
    );
  }

  return <span className="shrink-0 leading-none text-xs">{emoji}</span>;
}
