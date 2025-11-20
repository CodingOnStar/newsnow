import { AnimatePresence, motion } from "framer-motion"
import { useRef, useState } from "react"
import { useClickAway } from "react-use"
import { myFetch } from "~/utils"

export interface SummaryProps {
  url: string
}

export function AISummary({ url }: SummaryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [summary, setSummary] = useState<{
    tldr: string
    points: string[]
  } | null>(null)

  const ref = useRef<HTMLSpanElement>(null)
  useClickAway(ref, () => {
    if (isOpen) setIsOpen(false)
  })

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isOpen) {
      setIsOpen(false)
      return
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

  return (
    <span
      ref={ref}
      className="inline-flex items-center ml-2 align-middle relative cursor-pointer"
    >
      <button
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

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="absolute left-0 top-6 z-10 w-64 md:w-80"
            onClick={e => e.preventDefault()} // Prevent link click when clicking inside card
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
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  )
}
