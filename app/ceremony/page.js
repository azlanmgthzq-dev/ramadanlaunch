'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

export default function CeremonyPage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [loading, setLoading] = useState(true)
  const [quranData, setQuranData] = useState({ arabic: [], english: [] })
  const [audioContextStarted, setAudioContextStarted] = useState(false)
  
  const audioRef = useRef(null)
  const canvasRef = useRef(null)
  const analyserRef = useRef(null)
  const audioContextRef = useRef(null)
  const animationRef = useRef(null)
  const sourceRef = useRef(null)

  // Fetch Quran data
  useEffect(() => {
    const fetchQuranData = async () => {
      try {
        const response = await fetch('https://api.alquran.cloud/v1/surah/1/editions/quran-unicode,en.sahih')
        const data = await response.json()
        
        if (data.code === 200 && data.data) {
          const arabicData = data.data[0]?.ayahs || []
          const englishData = data.data[1]?.ayahs || []
          
          setQuranData({
            arabic: arabicData,
            english: englishData
          })
        }
      } catch (error) {
        console.error('Error fetching Quran data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchQuranData()
  }, [])

  // Initialize audio context and visualizer
  const initAudioContext = useCallback(() => {
    if (audioContextRef.current || !audioRef.current) return
    
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      audioContextRef.current = audioContext
      
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 128
      analyserRef.current = analyser
      
      const source = audioContext.createMediaElementSource(audioRef.current)
      sourceRef.current = source
      source.connect(analyser)
      analyser.connect(audioContext.destination)
      
      setAudioContextStarted(true)
    } catch (error) {
      console.error('Error initializing audio context:', error)
    }
  }, [])

  // Draw visualizer
  const draw = useCallback(() => {
    if (!canvasRef.current || !analyserRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const analyser = analyserRef.current
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    
    const render = () => {
      animationRef.current = requestAnimationFrame(render)
      analyser.getByteFrequencyData(dataArray)
      
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const barWidth = canvas.width / bufferLength
      let x = 0
      
      dataArray.forEach((value) => {
        const height = (value / 255) * canvas.height * 0.9
        
        // Create gradient for bars
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - height)
        gradient.addColorStop(0, 'rgba(212, 175, 55, 0.3)')
        gradient.addColorStop(1, 'rgba(212, 175, 55, 0.9)')
        
        ctx.fillStyle = gradient
        ctx.fillRect(x, canvas.height - height, barWidth - 1, height)
        x += barWidth
      })
    }
    
    render()
  }, [])

  // Auto-play if user interacted on previous screen
  useEffect(() => {
    const hasInteracted = typeof window !== 'undefined' && sessionStorage.getItem('userInteracted') === 'true'
    
    if (hasInteracted && audioRef.current && !loading) {
      const tryAutoPlay = async () => {
        try {
          initAudioContext()
          await audioRef.current.play()
          setIsPlaying(true)
          draw()
        } catch (error) {
          console.log('Auto-play prevented, user interaction required:', error)
        }
      }
      
      // Small delay to ensure everything is loaded
      const timer = setTimeout(tryAutoPlay, 500)
      return () => clearTimeout(timer)
    }
  }, [loading, initAudioContext, draw])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  // Toggle playback
  const togglePlayback = async () => {
    if (!audioRef.current) return
    
    if (!audioContextStarted) {
      initAudioContext()
    }
    
    if (audioRef.current.paused) {
      try {
        // Resume audio context if suspended
        if (audioContextRef.current?.state === 'suspended') {
          await audioContextRef.current.resume()
        }
        await audioRef.current.play()
        setIsPlaying(true)
        draw()
      } catch (error) {
        console.error('Error playing audio:', error)
      }
    } else {
      audioRef.current.pause()
      setIsPlaying(false)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }

  // Handle audio end
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    
    const handleEnded = () => {
      setIsPlaying(false)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
    
    audio.addEventListener('ended', handleEnded)
    return () => audio.removeEventListener('ended', handleEnded)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050a25]">
        <p className="text-[#d4af37] text-lg tracking-wide font-playfair">Loading Al-Fatihah…</p>
      </div>
    )
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
      
      {/* Dark Overlay - cleaner for reading */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#050a25]/70 via-[#050a25]/50 to-[#050a25]/80" />

      {/* Hidden Audio Element */}
      <audio ref={audioRef} src="/audio/al-fatihah.mp3" preload="auto" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center py-8 px-4 md:px-8">
        {/* Header */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-playfair uppercase text-[#d4af37] text-sm tracking-[0.25em] mb-6"
        >
          Ramadan Kareem
        </motion.h1>

        {/* Play/Pause Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          onClick={togglePlayback}
          className={`mb-8 px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
            isPlaying 
              ? 'bg-[#d4af37] text-[#050a25]' 
              : 'border border-[#d4af37]/50 text-[#d4af37] hover:bg-[#d4af37]/10'
          }`}
        >
          {isPlaying ? 'Pause Recitation' : 'Play Recitation'}
        </motion.button>

        {/* Quran Display Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="w-full max-w-6xl rounded-3xl border border-[#d4af37]/40 bg-[#050a25]/70 backdrop-blur-md overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Translation Column */}
            <div className="p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-[#d4af37]/25">
              <h2 className="font-playfair text-[#d4af37] text-xl md:text-2xl text-center mb-6">
                Translation
              </h2>
              <div className="space-y-4">
                {quranData.english.map((ayah, index) => (
                  <p key={ayah.number} className="text-gray-100 text-sm md:text-base leading-relaxed">
                    <span className="text-[#d4af37] font-bold mr-1">{ayah.numberInSurah}.</span>
                    {ayah.text}
                  </p>
                ))}
              </div>
            </div>

            {/* Arabic Column */}
            <div className="p-6 md:p-8" dir="rtl">
              <h2 className="font-amiri text-[#d4af37] text-xl md:text-2xl text-center mb-6">
                سورة الفاتحة
              </h2>
              <div className="space-y-6">
                {quranData.arabic.map((ayah, index) => (
                  <p key={ayah.number} className="font-amiri text-gray-100 text-2xl md:text-3xl leading-loose text-right">
                    {ayah.text}
                    <span className="text-[#d4af37] text-sm mr-2">({ayah.numberInSurah})</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Audio Visualizer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="w-full max-w-3xl mt-8"
        >
          <div className="rounded-xl border border-[#d4af37]/30 bg-[#050a25]/60 overflow-hidden">
            <canvas
              ref={canvasRef}
              width={800}
              height={80}
              className="w-full h-24"
            />
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-8 text-sm text-gray-300 italic"
        >
          Officiated by <span className="text-[#d4af37]">Dato&apos; Nonee Ashirin</span>
        </motion.p>
      </div>
    </motion.main>
  )
}