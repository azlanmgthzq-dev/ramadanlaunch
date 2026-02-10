'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

/**
 * Delay-based verse timing (seconds after audio starts)
 * Adjust these values if audio changes
 */
const verseTimings = [
  { index: 0, start: 5 },   // Bismillah
  { index: 1, start: 11 },
  { index: 2, start: 18 },
  { index: 3, start: 26 },
  { index: 4, start: 33 },
  { index: 5, start: 40 },
  { index: 6, start: 47 }
]

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
     Verse Sync (Option A)
  --------------------------------------------------- */
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTimeUpdate = () => {
      const t = audio.currentTime
      for (let i = verseTimings.length - 1; i >= 0; i--) {
        if (t >= verseTimings[i].start) {
          setVisibleVerseIndex(verseTimings[i].index)
          break
        }
      }
    }

    audio.addEventListener('timeupdate', onTimeUpdate)
    return () => audio.removeEventListener('timeupdate', onTimeUpdate)
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
      if (audio.currentTime === 0) setVisibleVerseIndex(-1)
      initAudioContext()
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
        <p className="text-[#d4af37] font-playfair">Loading Al-Fatihah…</p>
      </div>
    )
  }

  return (
    <motion.main className="relative min-h-screen overflow-hidden">
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/islamic_bg.png')" }}
      />
      <div className="fixed inset-0 bg-[#050a25]/75" />

      <audio ref={audioRef} src="/audio/al-fatihah.mp3" preload="auto" />

      <div className="relative z-10 flex flex-col items-center px-4 py-8">
        <button
          onClick={togglePlayback}
          className="mb-8 px-6 py-2 rounded-full border border-[#d4af37] text-[#d4af37]"
        >
          {isPlaying ? 'Pause Recitation' : 'Play Recitation'}
        </button>

        {/* Quran Card */}
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 bg-[#050a25]/70 border border-[#d4af37]/30 rounded-3xl overflow-hidden">
          {/* English */}
          <div className="p-6 border-b lg:border-b-0 lg:border-r border-[#d4af37]/25">
            {quranData.english.map((a) => (
              <p key={a.number} className="text-gray-100 text-sm mb-3">
                <span className="text-[#d4af37] mr-1">{a.numberInSurah}.</span>
                {a.text}
              </p>
            ))}
          </div>

          {/* Arabic */}
          <div className="p-6 space-y-6" dir="rtl">
            {quranData.arabic.map(
              (a, i) =>
                i <= visibleVerseIndex && (
                  <motion.p
                    key={a.number}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-amiri text-2xl md:text-3xl text-gray-100"
                  >
                    {a.text}
                    <span className="text-[#d4af37] text-sm mr-2">
                      ({a.numberInSurah})
                    </span>
                  </motion.p>
                )
            )}
          </div>
        </div>

        {/* Visualizer */}
        <canvas
          ref={canvasRef}
          width={800}
          height={80}
          className="mt-8 w-full max-w-3xl h-24 border border-[#d4af37]/30 bg-[#050a25]/60 rounded-xl"
        />
      </div>
    </motion.main>
  )
}
