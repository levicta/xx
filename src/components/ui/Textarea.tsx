import { TextareaHTMLAttributes, forwardRef } from "react"

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[--text-secondary] mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`
            w-full bg-[--bg-elevated] border rounded-[--radius-sm] px-4 py-3
            text-[--text-primary] placeholder:text-[--text-muted] resize-none
            focus:outline-none focus:border-[--brand] focus:ring-1 focus:ring-[--brand]
            transition-colors
            ${error ? "border-[--accent-red]" : "border-[--border]"}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-[--accent-red]">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-[--text-muted]">{helperText}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = "Textarea"
