'use client'

import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function SignaturePad({ onComplete, onSigningStart }) {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [isEmpty, setIsEmpty] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * 2
    canvas.height = rect.height * 2
    ctx.scale(2, 2)

    // Style
    ctx.strokeStyle = '#d4af37'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [])

  const startDrawing = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return

    // 🎯 Trigger effects on first stroke
    if (!hasStarted && onSigningStart) {
      onSigningStart()
      setHasStarted(true)
    }

    setIsDrawing(true)
    setIsEmpty(false)

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.touches ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = e.touches ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.touches ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = e.touches ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setIsEmpty(true)
    setHasStarted(false)
  }

  const handleConfirm = () => {
    if (!isEmpty) {
      onComplete()
    }
  }

  return (
    <div className="w-full">
      <div className="relative border-2 border-[#d4af37]/30 rounded-lg bg-white/5 backdrop-blur-sm">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-40 md:h-48 cursor-crosshair touch-none"
        />
      </div>

      <div className="flex gap-4 justify-center mt-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={clearSignature}
          className="px-6 py-2 text-sm text-[#d4af37] border border-[#d4af37]/50 rounded-md hover:bg-[#d4af37]/10 transition-colors"
        >
          Clear
        </motion.button>

        <motion.button
          whileHover={{ scale: isEmpty ? 1 : 1.05 }}
          whileTap={{ scale: isEmpty ? 1 : 0.95 }}
          onClick={handleConfirm}
          disabled={isEmpty}
          className={`px-6 py-2 text-sm rounded-md transition-colors ${
            isEmpty
              ? 'bg-[#d4af37]/20 text-[#d4af37]/40 cursor-not-allowed'
              : 'bg-[#d4af37] text-[#1a1a1a] hover:bg-[#d4af37]/90'
          }`}
        >
          Confirm Signature
        </motion.button>
      </div>
    </div>
  )
}