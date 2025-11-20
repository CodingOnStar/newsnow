import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { myFetch } from "~/utils"

export interface SummaryProps {
  url: string
}

export function AISummary({ url }: SummaryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null)
  const [summary, setSummary] = useState<{
    tldr: string
    points: string[]
  } | null>(null)

  const buttonRef = useRef<HTMLButtonElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node
      if (
        buttonRef.current?.contains(target)
        || contentRef.current?.contains(target)
      ) {
        return
      }
      setIsOpen(false)
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("touchstart", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
    }
  }, [isOpen])

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isOpen) {
      setIsOpen(false)
      return
    }

    if (buttonRef.current) {
      setButtonRect(buttonRef.current.getBoundingClientRect())
    }
    setIsOpen(true)

    if (!summary && !isLoading) {
      setIsLoading(true)
      try {
        const res = await myFetch<{ tldr: string, points: string[] }>(
          "/api/summary",
          {
            method: "POST",
            body: { url },
          },
        )
        setSummary(res)
      } catch (error) {
        console.error("Failed to fetch summary", error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const getPositionStyle = () => {
    if (!buttonRect) return {}

    const isMobile = window.innerWidth < 768
    const width = isMobile ? 256 : 320
    const padding = 16

    let left = buttonRect.left
    if (left + width > window.innerWidth - padding) {
      left = window.innerWidth - width - padding
    }
    if (left < padding) left = padding

    return {
      top: buttonRect.bottom + 8,
      left,
      width,
    }
  }

  return (
    <span className="inline-flex items-center ml-2 align-middle relative cursor-pointer">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className={$(
          "w-5 h-5 rounded-full flex items-center justify-center transition-all cursor-pointer",
          "hover:bg-purple-500/20 text-purple-500/60 hover:text-purple-500",
          isOpen && "bg-purple-500/20 text-purple-500",
        )}
        title="AI 智能摘要"
      >
        <span
          className={$(
            "i-ph:sparkle-fill text-sm cursor-pointer",
            isLoading && "animate-pulse",
          )}
        />
      </button>

      {isOpen && buttonRect && createPortal(
        <div
          ref={contentRef}
          className="fixed z-[9999]"
          style={getPositionStyle()}
          onClick={e => e.preventDefault()} // Prevent link click
        >
          <div className="bg-base/90 backdrop-blur-md border border-purple-500/20 rounded-xl p-3 shadow-lg text-sm">
            {isLoading
              ? (
                  <div className="flex items-center gap-2 text-purple-500/80">
                    <span className="i-ph:spinner animate-spin" />
                    <span>正在生成摘要...</span>
                  </div>
                )
              : summary
                ? (
                    <div className="flex flex-col gap-2">
                      <div className="font-bold text-purple-600 dark:text-purple-400">
                        {summary.tldr}
                      </div>
                      <ul className="list-disc list-outside pl-4 space-y-1 text-xs opacity-80">
                        {summary.points.map(point => (
                          <li key={point}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )
                : (
                    <div className="text-red-500 text-xs">生成失败，请重试</div>
                  )}
          </div>
        </div>,
        document.body,
      )}
    </span>
  )
}
