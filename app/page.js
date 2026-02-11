'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useRef, useEffect, useState } from 'react'
import SignaturePad from '@/components/SignaturePad'
import html2canvas from 'html2canvas'

export default function HomePage() {
  const router = useRouter()

  const containerRef = useRef(null)
  const audioRef = useRef(null)
  const signTimeoutRef = useRef(null)

  const [isFinishing, setIsFinishing] = useState(false)
  const [showGlitter, setShowGlitter] = useState(false)
  const [isSigning, setIsSigning] = useState(false)

  // ✨ Trigger effects while signing
  const handleSigningStart = () => {
    setIsSigning(true)
    setShowGlitter(true)

    // 🔊 Play sound when user starts signing
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {})
    }
  }

  const handleSigned = async () => {
    if (signTimeoutRef.current) {
      clearTimeout(signTimeoutRef.current)
    }

    setIsFinishing(true)
    setIsSigning(false)

    // ✨ wait for effect
    await new Promise(resolve => setTimeout(resolve, 800))

    // 📸 Screenshot with background
    if (containerRef.current) {
      const canvas = await html2canvas(containerRef.current, {
        useCORS: true,
        allowTaint: true,
        scale: 2,
        backgroundColor: null, // Keep transparency
        logging: false,
        imageTimeout: 0,
        removeContainer: false,
      })

      const image = canvas.toDataURL('image/png')

      // Save to session
      sessionStorage.setItem('ceremonyScreenshot', image)
      // ✅ Set flag for autoplay on next page
      sessionStorage.setItem('userInteracted', 'true')

      // 📥 Auto download
      const link = document.createElement('a')
      link.href = image
      link.download = 'ramadan-ceremony.png'
      link.click()
    }

    // 🚀 Navigate
    router.push('/ceremony')
  }

  useEffect(() => {
    return () => {
      if (signTimeoutRef.current) {
        clearTimeout(signTimeoutRef.current)
      }
    }
  }, [])

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="relative min-h-screen overflow-hidden"
    >
      {/* Background - moved inside screenshot container */}
      <div
        ref={containerRef}
        className="relative min-h-screen"
      >
        {/* Background layer */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/islamic_bg.png')" }}
        />

        {/* Content wrapper */}
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 md:px-12 py-8 text-center">
          <h1 className="font-playfair text-[#d4af37] text-4xl md:text-6xl leading-tight mb-4">
            Ramadan Reflection Through <br />
            Tadarus Al-Quran
          </h1>

          <p className="font-playfair italic text-[#d4af37]/80 text-xl mb-6">
            "Hearts United by the Al-Quran"
          </p>

          <div className="mb-8">
            <h2 className="font-playfair text-[#d4af37] text-xl md:text-2xl">
              Dato&apos; Nonee Ashirin Binti Dato' Mohd Radzi
            </h2>
            <p className="text-[#d4af37]/80 text-sm mt-2 tracking-wide">
              Chairman of Global Group
            </p>
          </div>

          <p className="uppercase text-[#d4af37] text-xs tracking-[0.3em] mb-4">
            Please sign to officiate the ceremony
          </p>

          <div className="w-full max-w-xl mb-4">
            <SignaturePad 
              onComplete={handleSigned}
              onSigningStart={handleSigningStart}
            />
          </div>

          {isFinishing && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[#d4af37]/80 text-xs mt-2 italic"
            >
              Finalizing ceremony...
            </motion.p>
          )}
        </div>
      </div>

      {/* 🔊 Sound */}
      <audio ref={audioRef} src="/audio/slowchime.mp3" preload="auto" />

      {/* ✨ Glitter Overlay - shows while signing */}
      {showGlitter && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isSigning ? 0.7 : 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 pointer-events-none z-50"
        >
          {/* Glow Flash */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.4),transparent_70%)] animate-pulse" />

          {/* Sparkle Animation */}
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[length:40px_40px] animate-[spin_6s_linear_infinite]" />
        </motion.div>
      )}
    </motion.main>
  )
}