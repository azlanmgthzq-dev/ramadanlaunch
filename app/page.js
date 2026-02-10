'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import SignaturePad from '@/components/SignaturePad'

// Islamic Calligraphy Icon SVG
const IslamicIcon = () => (
  <svg 
    width="70" 
    height="70" 
    viewBox="0 0 70 70" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className="text-[#d4af37]"
  >
    {/* Mosque dome outline */}
    <path 
      d="M35 5C35 5 15 25 15 40C15 48 22 55 35 55C48 55 55 48 55 40C55 25 35 5 35 5Z" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round"
      fill="none"
    />
    {/* Crescent moon */}
    <path 
      d="M35 12C32 15 30 20 30 25C30 32 34 38 35 38C36 38 40 32 40 25C40 20 38 15 35 12Z" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round"
      fill="none"
    />
    {/* Base decorative lines */}
    <path 
      d="M20 55L20 62M35 55L35 65M50 55L50 62" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round"
    />
    {/* Star decorations */}
    <circle cx="25" cy="35" r="1.5" fill="currentColor" />
    <circle cx="35" cy="30" r="2" fill="currentColor" />
    <circle cx="45" cy="35" r="1.5" fill="currentColor" />
  </svg>
)

export default function HomePage() {
  const router = useRouter()

  const handleSigned = () => {
    sessionStorage.setItem('userInteracted', 'true')
    router.push('/ceremony')
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="relative min-h-screen overflow-hidden"
    >
      {/* Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/islamic_bg.png')" }}
      />
      
      {/* Dark Overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#0a0e27]/60 via-[#0a0e27]/40 to-[#1a1f3a]/60" />
      
      {/* Particle Animation Layer */}
      <div className="fixed inset-0 particles opacity-30" />
      
      {/* Radial Glow Effect */}
      <div className="fixed inset-0 glow-effect" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 md:px-12 py-8">
        {/* Top Label */}
        <motion.p 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-playfair uppercase text-[#d4af37] text-sm tracking-[0.3em] mb-4"
        >
          Global Turbine Asia Presents
        </motion.p>

        {/* Islamic Calligraphy Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-6"
        >
          <IslamicIcon />
        </motion.div>

        {/* Main Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mb-4"
        >
          <h1 className="font-playfair text-[#d4af37] text-4xl md:text-6xl leading-tight">
            Tadarus Al-Quran
          </h1>
          <h1 className="font-playfair text-[#d4af37] text-4xl md:text-6xl leading-tight">
            Ceremony
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="font-playfair italic text-[#d4af37]/80 text-base mb-6"
        >
          Wishing you a blessed and reflective Ramadan
        </motion.p>

        {/* Honoree Name */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="font-playfair text-[#d4af37] text-xl md:text-2xl mb-8"
        >
          Dato&apos; Nonee Ashirin
        </motion.h2>

        {/* Instruction Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="uppercase text-[#d4af37] text-xs tracking-[0.3em] mb-4 select-none"
        >
          Please sign to officiate the ceremony
        </motion.p>

        {/* Signature Pad */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="w-full max-w-xl mb-4"
        >
          <SignaturePad onComplete={handleSigned} />
        </motion.div>

        {/* Helper Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.6 }}
          className="text-[#d4af37]/70 text-xs mt-4"
        >
          Sign above using your finger or mouse
        </motion.p>
      </div>
    </motion.main>
  )
}