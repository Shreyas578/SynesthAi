import Image from "next/image"

export function Header() {
  return (
    <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center">
          <Image src="/synesthai-logo.png" alt="SynesthAI" width={200} height={80} className="h-16 w-auto" />
        </div>
      </div>
    </header>
  )
}
