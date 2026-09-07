import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image as ImageIcon, X } from 'lucide-react';
import { getUserImages } from './api';

const MyMedia = ({ user }) => {
  const { t } = useTranslation();
  const [images, setImages] = useState([]);
  const [selected, setSelected] = useState(null);
  const username = user?.username;

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!username) return;
      try {
        const data = await getUserImages(username);
        if (cancelled) return;
        setImages(Array.isArray(data?.images) ? data.images : []);
      } catch (error) {
        console.error('Failed to load user images:', error);
        if (!cancelled) setImages([]);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [username]);

  const title = useMemo(() => t('my_media', { defaultValue: 'My Media' }), [t]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 ring-1 ring-emerald-400/15 flex items-center justify-center">
          <ImageIcon className="h-5 w-5 text-heybuddy-lavender" />
        </div>
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-heybuddy-dark-gray truncate">{title}</h2>
          <p className="text-sm text-heybuddy-medium-gray">
            {t('my_media_subtitle', { defaultValue: 'Images you have sent and received.' })}
          </p>
        </div>
      </div>

      {images.length === 0 ? (
        <div className="rounded-2xl bg-heybuddy-warm-gray/60 border border-emerald-400/15 p-6 text-center">
          <p className="text-sm text-heybuddy-medium-gray">
            {t('no_media_yet', { defaultValue: 'No images yet.' })}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((img) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setSelected(img)}
              className="group relative aspect-square overflow-hidden rounded-2xl bg-heybuddy-warm-gray border border-emerald-400/15 shadow-sm"
              title={t('open_image', { defaultValue: 'Open image' })}
            >
              <img
                src={img.media_url}
                alt={t('image_message_alt', { defaultValue: 'Sent image' })}
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                loading="lazy"
              />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/35 via-transparent to-transparent" />
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 safe-px safe-pb">
          <div className="relative w-full max-w-3xl">
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="absolute -top-12 right-0 inline-flex items-center justify-center h-10 w-10 rounded-xl bg-heybuddy-warm-gray/95 text-heybuddy-dark-gray ring-1 ring-emerald-400/15 shadow-sm"
              aria-label={t('close', { defaultValue: 'Close' })}
            >
              <X className="h-5 w-5" />
            </button>
            <div className="rounded-2xl overflow-hidden bg-heybuddy-warm-gray border border-emerald-400/15 shadow-2xl">
              <img
                src={selected.media_url}
                alt={t('image_message_alt', { defaultValue: 'Sent image' })}
                className="w-full max-h-[78dvh] object-contain bg-black/10"
              />
              <div className="p-3 text-xs text-heybuddy-medium-gray flex items-center justify-between gap-2">
                <span className="truncate">
                  {selected.from_user} → {selected.to_user}
                </span>
                <span className="shrink-0">
                  {selected.timestamp ? new Date(String(selected.timestamp).replace(' ', 'T') + 'Z').toLocaleString() : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyMedia;

