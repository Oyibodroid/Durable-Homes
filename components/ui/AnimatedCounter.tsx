'use client'

import { useEffect, useState } from 'react'

interface AnimatedCounterProps {
  target: number
  label: string
}

export function AnimatedCounter({ target, label }: AnimatedCounterProps) {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    const duration = 2000 // 2 seconds
    const steps = 60
    const increment = target / steps
    let current = 0
    let step = 0
    
    const timer = setInterval(() => {
      step++
      current += increment
      if (step >= steps) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)
    
    return () => clearInterval(timer)
  }, [target])
  
  return (
    <div className="group">
      <p className="text-2xl font-bold text-white group-hover:scale-110 transition-transform duration-300">
        {count}+
      </p>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  )
}

// Also export as default for flexibility
export default AnimatedCounter