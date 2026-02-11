'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

export default function CeremonyPage() {
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [visibleVerseIndex, setVisibleVerseIndex] = useState(-1)
  const [quranData, setQuranData] = useState({ arabic: [], english: [] })

  const audioRef = useRef(null)
  const canvasRef = useRef(null)
  const analyserRef = useRef(null)
  const audioContextRef = useRef(null)
  const animationRef = useRef(null)

  /* ---------------------------------------------------
     Fetch Quran Data
  --------------------------------------------------- */
  useEffect(() => {
    const fetchQuran = async () => {
      try {
        const res = await fetch(
          'https://api.alquran.cloud/v1/surah/1/editions/quran-unicode,en.sahih'
        )
        const json = await res.json()

        setQuranData({
          arabic: json.data[0].ayahs,
          english: json.data[1].ayahs
        })
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }

    fetchQuran()
  }, [])

  /* ---------------------------------------------------
     Progressive Verse Reveal
     - First verse appears after 9 seconds
     - Each subsequent verse appears every 5 seconds
  --------------------------------------------------- */
  useEffect(() => {
    if (quranData.arabic.length === 0) return

    let intervalId

    // Show first verse after 9 seconds
    const timeoutId = setTimeout(() => {
      setVisibleVerseIndex(0)

      // Show next verses every 5 seconds
      intervalId = setInterval(() => {
        setVisibleVerseIndex((prev) => {
          if (prev + 1 >= quranData.arabic.length) {
            clearInterval(intervalId)
            return prev
          }
          return prev + 1
        })
      }, 5000)
    }, 6500)

    return () => {
      clearTimeout(timeoutId)
      if (intervalId) clearInterval(intervalId)
    }
  }, [quranData.arabic.length])

  /* ---------------------------------------------------
     Audio Context + Visualizer
  --------------------------------------------------- */
  const initAudioContext = useCallback(() => {
    if (audioContextRef.current || !audioRef.current) return

    const AudioCtx = window.AudioContext || window.webkitAudioContext
    const ctx = new AudioCtx()
    audioContextRef.current = ctx

    const analyser = ctx.createAnalyser()
    analyser.fftSize = 128
    analyserRef.current = analyser

    const source = ctx.createMediaElementSource(audioRef.current)
    source.connect(analyser)
    analyser.connect(ctx.destination)
  }, [])

  const drawVisualizer = useCallback(() => {
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

      dataArray.forEach((v) => {
        const h = (v / 255) * canvas.height * 0.9
        const g = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - h)
        g.addColorStop(0, 'rgba(212,175,55,0.3)')
        g.addColorStop(1, 'rgba(212,175,55,0.9)')
        ctx.fillStyle = g
        ctx.fillRect(x, canvas.height - h, barWidth - 1, h)
        x += barWidth
      })
    }

    render()
  }, [])

  /* ---------------------------------------------------
     Auto play if signed on previous page
  --------------------------------------------------- */
  useEffect(() => {
    const signed = sessionStorage.getItem('userInteracted') === 'true'
    if (!signed || !audioRef.current || loading) return

    const timer = setTimeout(async () => {
      try {
        initAudioContext()
        await audioRef.current.play()
        setIsPlaying(true)
        drawVisualizer()
      } catch {}
    }, 500)

    return () => clearTimeout(timer)
  }, [loading, initAudioContext, drawVisualizer])

  /* ---------------------------------------------------
     Toggle Play / Pause
  --------------------------------------------------- */
  const togglePlayback = async () => {
    const audio = audioRef.current
    if (!audio) return

    if (audio.paused) {
      initAudioContext()
      if (audioContextRef.current?.state === 'suspended') {
        await audioContextRef.current.resume()
      }
      await audio.play()
      setIsPlaying(true)
      drawVisualizer()
    } else {
      audio.pause()
      setIsPlaying(false)
      cancelAnimationFrame(animationRef.current)
    }
  }

  /* ---------------------------------------------------
     Handle audio end
  --------------------------------------------------- */
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

  /* ---------------------------------------------------
     Cleanup
  --------------------------------------------------- */
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animationRef.current)
      audioContextRef.current?.close()
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050a25]">
        <p className="text-[#d4af37] font-playfair text-lg tracking-wide">Loading Al-Fatihah…</p>
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

      {/* Dark Overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#050a25]/15 via-[#050a25]/50 to-[#050a25]/15" />

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
         
        "Hearts United by the  Al-Quran”
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
                  index <= visibleVerseIndex && (
                    <motion.p
                      key={ayah.number}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8 }}
                      className="text-gray-100 text-sm md:text-base leading-relaxed"
                    >
                      <span className="text-[#d4af37] font-bold mr-1">
                        {ayah.numberInSurah}.
                      </span>
                      {ayah.text}
                    </motion.p>
                  )
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
                  index <= visibleVerseIndex && (
                    <motion.p
                      key={ayah.number}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8 }}
                      className="font-amiri text-gray-100 text-2xl md:text-3xl leading-loose text-right"
                    >
                      {ayah.text}
                      <span className="text-[#d4af37] text-sm mr-2">({ayah.numberInSurah})</span>
                    </motion.p>
                  )
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
