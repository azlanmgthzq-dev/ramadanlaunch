'use client'

import { useRef, useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

// Dynamic import to avoid SSR issues with canvas
const SignatureCanvas = dynamic(
  () => import('react-signature-canvas'),
  { ssr: false }
)

export default function SignaturePad({ onComplete }) {
  const sigRef = useRef(null)
  const [isEmpty, setIsEmpty] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const containerRef = useRef(null)

  const handleEnd = () => {
    if (sigRef.current && !sigRef.current.isEmpty()) {
      setIsEmpty(false)
      setIsTransitioning(true)
      
      // Auto-navigate after brief delay
      setTimeout(() => {
        const dataURL = sigRef.current?.toDataURL()
        if (dataURL) {
          sessionStorage.setItem('signature', dataURL)
        }
        onComplete()
      }, 400)
    }
  }

  const handleClear = () => {
    sigRef.current?.clear()
    setIsEmpty(true)
    setIsTransitioning(false)
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <div 
        ref={containerRef}
        className={`relative rounded-2xl border-2 border-[#d4af37]/40 bg-white/5 backdrop-blur-sm overflow-hidden transition-all duration-300 ${isTransitioning ? 'scale-105 border-[#d4af37]/80 shadow-lg shadow-[#d4af37]/20' : ''}`}
      >
        <SignatureCanvas
          ref={sigRef}
          onEnd={handleEnd}
          canvasProps={{
            className: 'w-full h-48 cursor-crosshair',
            style: { touchAction: 'none' }
          }}
          penColor="#d4af37"
          backgroundColor="transparent"
          minWidth={0.5}
          maxWidth={2.5}
        />
        
        {/* Subtle corner decorations */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#d4af37]/30 rounded-tl" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#d4af37]/30 rounded-tr" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#d4af37]/30 rounded-bl" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#d4af37]/30 rounded-br" />
      </div>

      {!isEmpty && !isTransitioning && (
        <div className="flex justify-center">
          <button
            onClick={handleClear}
            className="px-5 py-1.5 rounded-full border border-[#d4af37]/50 text-[#d4af37] text-sm hover:bg-[#d4af37]/10 transition-all"
          >
            Clear
          </button>
        </div>
      )}
      
      {isTransitioning && (
        <div className="flex justify-center">
          <span className="text-[#d4af37]/80 text-sm animate-pulse">
            Proceeding to ceremony...
          </span>
        </div>
      )}
    </div>
  )
}