/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  Globe, 
  MapPin, 
  Phone,
  Download, 
  QrCode, 
  Linkedin, 
  Github, 
  X,
  Copy,
  Check,
  Loader2
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { CardConfig } from './types';
import { DEFAULT_CONFIG } from './defaultConfig';
import { loadConfig } from './utils/configLoader';
import { ACCENT_MAP } from './utils/styleMap';

export default function App() {
  const [config, setConfig] = useState<CardConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    loadConfig().then((cfg) => {
      setConfig(cfg);
      setIsLoading(false);
    }).catch(() => {
      setConfig(DEFAULT_CONFIG);
      setIsError(true);
      setIsLoading(false);
    });
  }, []);

  const CARD_CONFIG = config || DEFAULT_CONFIG;

  // Resolve "profile image" and "logo" from either:
  // - an external override URL (imagePublicUrl/logoPublicUrl), or
  // - a local asset under `public/assets/` (by filename/path), or
  // - a legacy value that may already be a full URL.
  const resolveAssetSrc = (value: string, publicUrl?: string): string => {
    if (publicUrl) return publicUrl;

    const v = value.trim();
    const isExternal =
      /^https?:\/\//i.test(v) || v.startsWith('data:');
    if (isExternal) return v;

    const baseUrl = import.meta.env.BASE_URL as string;

    // If the config provides an absolute path like `/assets/foo.png`,
    // keep it but prefix with BASE_URL for subpath deployments.
    if (v.startsWith('/')) {
      return `${baseUrl}${v.replace(/^\/+/, '')}`;
    }

    // Otherwise treat it as a filename or relative path inside `public/assets/`.
    // Examples: `profile.jpg`, `logos/company.png`
    return `${baseUrl}assets/${v}`;
  };

  const profileImageSrc = resolveAssetSrc(
    CARD_CONFIG.profile.image,
    CARD_CONFIG.profile.imagePublicUrl
  );
  const profileLogoSrc = resolveAssetSrc(
    CARD_CONFIG.profile.logo,
    CARD_CONFIG.profile.logoPublicUrl
  );

  const imageObjectPosition = CARD_CONFIG.profile.imageObjectPosition ?? '50% 50%';
  const imageZoom = CARD_CONFIG.profile.imageZoom ?? 1;
  const imageOffsetX = CARD_CONFIG.profile.imageOffsetX ?? 0;
  const imageOffsetY = CARD_CONFIG.profile.imageOffsetY ?? 0;
  const logoSizePx = CARD_CONFIG.profile.logoSizePx ?? 24;

  // Motion values for rotation
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for rotation
  const rotateX = useSpring(useTransform(y, [-100, 100], [15, -15]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-15, 15]), { stiffness: 150, damping: 20 });

  // Holographic shimmer position
  const shimmerX = useTransform(x, [-100, 100], [100, 0]);
  const shimmerY = useTransform(y, [-100, 100], [100, 0]);
  const glareX = useTransform(x, [-100, 100], [0, 100]);
  const glareY = useTransform(y, [-100, 100], [0, 100]);

  // IMPORTANT: motion hooks like `useTransform` must be called unconditionally.
  // Rendering can be conditional, but hook calls cannot depend on config/features.
  const backgroundPosition = useTransform(
    [shimmerX, shimmerY],
    ([sx, sy]) => `${sx}% ${sy}%`
  );
  const glareXPercent = useTransform(glareX, [0, 100], ['0%', '100%']);
  const glareYPercent = useTransform(glareY, [0, 100], ['0%', '100%']);

  // Handle Gyroscope (Mobile)
  useEffect(() => {
    const currentConfig = config || DEFAULT_CONFIG;
    if (!currentConfig.features.enableGyroscope) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.beta !== null && event.gamma !== null) {
        const beta = Math.max(-30, Math.min(30, event.beta - 45));
        const gamma = Math.max(-30, Math.min(30, event.gamma));
        
        x.set((gamma / 30) * 100);
        y.set((beta / 30) * 100);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [x, y, config]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#050505] text-zinc-500"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  // Handle Mouse Movement (Desktop)
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // Normalize to -100 to 100
    const xPct = ((mouseX / width) - 0.5) * 200;
    const yPct = ((mouseY / height) - 0.5) * 200;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Canonical page URL for QR/copy (origin + pathname avoids including query strings).
  // This ensures GitHub Pages repo paths resolve correctly.
  const pageUrl = `${window.location.origin}${window.location.pathname}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(pageUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const style = ACCENT_MAP[CARD_CONFIG.theme.accentColor] || ACCENT_MAP.indigo;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#050505] selection:bg-indigo-500/30 overflow-x-hidden">
      {isError && (
        <div className="fixed top-4 bg-red-500/10 text-red-500 px-4 py-2 rounded-full text-xs font-bold border border-red-500/20 z-50">
          Using default configuration
        </div>
      )}
      {/* Optional Page Background */}
      {CARD_CONFIG.theme.pageBackground.enabled && (
        <div 
          className={`fixed inset-0 pointer-events-none z-0 ${
            CARD_CONFIG.theme.pageBackground.type === 'mesh' ? 'bg-mesh' : 'bg-dots'
          }`}
          style={{ opacity: CARD_CONFIG.theme.pageBackground.opacity }}
        />
      )}

      {/* Main Content */}
      <main className="relative z-10 w-full max-w-md flex flex-col items-center gap-8 mt-16">
        {/* The Card */}
        <div className="card-container w-full aspect-[2/3] max-w-[360px]">
          <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative w-full h-full bg-[#121212] border border-white/10 shadow-2xl overflow-hidden group cursor-pointer isolate"
            style={{
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
              WebkitMaskImage: "-webkit-radial-gradient(white, black)",
              backfaceVisibility: "hidden",
              borderRadius: CARD_CONFIG.theme.cardRounding,
            }}
          >
            {/* Holographic Overlay */}
            {CARD_CONFIG.features.enableHolographicEffect && (
              <>
                {/* Prismatic Shimmer */}
                <motion.div 
                  style={{
                    backgroundPosition
                  }}
                  className="absolute inset-0 z-20 pointer-events-none holographic-shimmer transition-opacity duration-500"
                  initial={{ opacity: CARD_CONFIG.theme.shimmerOpacity }}
                  whileHover={{ opacity: CARD_CONFIG.theme.shimmerHoverOpacity }}
                />
                
                {/* Dynamic Glare */}
                <motion.div 
                  style={{
                    '--x': glareXPercent,
                    '--y': glareYPercent,
                  } as any}
                  className="absolute inset-0 z-20 pointer-events-none card-glare opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />
              </>
            )}

            {/* Card Content */}
            <div className="absolute inset-0 z-10 flex flex-col">
              {/* Top Section: Image */}
              <div className="relative h-[55%] overflow-hidden">
                <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                  <img
                    src={profileImageSrc}
                    alt={CARD_CONFIG.profile.name}
                    className="w-full h-full object-cover grayscale-[0.2] transition-transform duration-700"
                    style={{
                      objectPosition: imageObjectPosition,
                      transform: `scale(${imageZoom}) translate(${imageOffsetX}%, ${imageOffsetY}%)`,
                      transformOrigin: 'center center',
                    }}
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-black/20" />
              </div>

              {/* Bottom Section: Info */}
              <div className="flex-1 px-8 pb-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-3xl font-bold tracking-tight">{CARD_CONFIG.profile.name}</h1>
                    {CARD_CONFIG.features.showCompanyLogo &&
                      (CARD_CONFIG.profile.logo || CARD_CONFIG.profile.logoPublicUrl) && (
                      <img 
                        src={profileLogoSrc}
                        alt="Company Logo" 
                        className="object-contain rounded-sm"
                        style={{ width: `${logoSizePx}px`, height: `${logoSizePx}px` }}
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </div>
                  <p className={`${style.text} text-xs font-bold uppercase tracking-[0.2em] mb-4`}>
                    {CARD_CONFIG.profile.role}
                  </p>
                  <p className="text-zinc-500 text-sm leading-relaxed italic line-clamp-2">
                    "{CARD_CONFIG.profile.bio}"
                  </p>
                </div>

                {/* Contact Details */}
                <div className="space-y-3 mt-6">
                  <a 
                    href={`mailto:${CARD_CONFIG.profile.email}`}
                    className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors group/link"
                  >
                    <Mail className="w-4 h-4 group-hover/link:scale-110 transition-transform" />
                    <span className="text-sm font-medium">{CARD_CONFIG.profile.email}</span>
                  </a>
                  <a 
                    href={CARD_CONFIG.profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors group/link"
                  >
                    <Globe className="w-4 h-4 group-hover/link:scale-110 transition-transform" />
                    <span className="text-sm font-medium">{CARD_CONFIG.profile.website.replace(/^https?:\/\//, '')}</span>
                  </a>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CARD_CONFIG.profile.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors group/link"
                  >
                    <MapPin className="w-4 h-4 group-hover/link:scale-110 transition-transform" />
                    <span className="text-sm font-medium">{CARD_CONFIG.profile.location}</span>
                  </a>
                  {CARD_CONFIG.profile.phone && (
                    <a 
                      href={`https://wa.me/${CARD_CONFIG.profile.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors group/link"
                    >
                      <Phone className="w-4 h-4 group-hover/link:scale-110 transition-transform" />
                      <span className="text-sm font-medium">WhatsApp</span>
                    </a>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-8">
                  {CARD_CONFIG.features.showDownloadButton && (
                    <a 
                      href={`${import.meta.env.BASE_URL}assets/contact.vcf`}
                      download
                      className="flex-1 h-12 bg-white text-black rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors active:scale-95"
                    >
                      <Download className="w-4 h-4" />
                      Save Contact
                    </a>
                  )}
                  {CARD_CONFIG.features.showQrCode && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsShareModalOpen(true);
                      }}
                      className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center hover:bg-zinc-700 transition-colors active:scale-95"
                    >
                      <QrCode className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Subtle Inner Border */}
            <div 
              className="absolute inset-4 border border-white/5 pointer-events-none z-30" 
              style={{ borderRadius: `calc(${CARD_CONFIG.theme.cardRounding} - 0.75rem)` }}
            />
          </motion.div>
        </div>

        {/* Social Links */}
        {CARD_CONFIG.features.showSocialLinks && (
          <div className="flex flex-col items-center gap-6 w-full">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600">You can find me</p>
            <div className="flex justify-center gap-8">
              {CARD_CONFIG.socials.linkedin && (
                <a href={CARD_CONFIG.socials.linkedin} target="_blank" rel="noopener noreferrer" className="p-3 bg-zinc-900 rounded-2xl text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800 transition-all">
                  <Linkedin className="w-6 h-6" />
                </a>
              )}
              {CARD_CONFIG.socials.github && (
                <a href={CARD_CONFIG.socials.github} target="_blank" rel="noopener noreferrer" className="p-3 bg-zinc-900 rounded-2xl text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800 transition-all">
                  <Github className="w-6 h-6" />
                </a>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Share Modal */}
      <AnimatePresence>
        {isShareModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsShareModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl"
            >
              <button 
                onClick={() => setIsShareModalOpen(false)}
                className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex flex-col items-center gap-8">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight">Share Card</h2>
                  <p className="text-zinc-500 text-sm">Scan the QR code or copy the link to share your professional profile.</p>
                </div>

                {/* QR Code */}
                <div className="p-6 bg-white rounded-[2rem] shadow-xl">
                  <QRCodeCanvas 
                    value={pageUrl} 
                    size={200}
                    level="H"
                    includeMargin={false}
                    imageSettings={{
                      src: profileImageSrc,
                      x: undefined,
                      y: undefined,
                      height: 40,
                      width: 40,
                      excavate: true,
                    }}
                  />
                </div>

                {/* Copy Link */}
                <div className="w-full space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 text-center">Profile Link</p>
                  <div className="flex items-center gap-2 p-2 bg-black/40 rounded-2xl border border-white/5">
                    <div className="flex-1 px-3 py-2 text-sm text-zinc-400 truncate font-mono">
                      {pageUrl}
                    </div>
                    <button 
                      onClick={handleCopyLink}
                      className={`p-3 rounded-xl transition-all flex items-center justify-center ${isCopied ? 'bg-emerald-500 text-white' : 'bg-white text-black hover:bg-zinc-200'}`}
                    >
                      {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="relative z-10 mt-20 pb-12 text-center">
        <p className="text-zinc-700 text-[10px] font-medium uppercase tracking-widest">
          {CARD_CONFIG.metadata.cardType}
        </p>
      </footer>
    </div>
  );
}
