import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[--bg-surface] flex items-center justify-center">
          <span className="text-4xl">🔍</span>
        </div>
        <h1 className="text-4xl font-bold font-[family-name:var(--font-syne)] text-[--text-primary] mb-2">
          404
        </h1>
        <h2 className="text-xl font-semibold text-[--text-primary] mb-4">
          Page Not Found
        </h2>
        <p className="text-[--text-secondary] mb-8 max-w-md">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-[--brand] text-black font-semibold rounded-[--radius-pill] hover:bg-[--brand-dim] transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/browse"
            className="px-6 py-3 bg-[--bg-surface] border border-[--border] text-[--text-primary] font-semibold rounded-[--radius-pill] hover:bg-[--bg-elevated] transition-colors"
          >
            Browse Items
          </Link>
        </div>
      </div>
    </div>
  )
}
