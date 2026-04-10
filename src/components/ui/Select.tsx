import { SelectHTMLAttributes, forwardRef } from "react"

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", label, error, options, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[--text-secondary] mb-2">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`
            w-full bg-[--bg-elevated] border rounded-[--radius-sm] px-4 py-3
            text-[--text-primary] appearance-none cursor-pointer
            focus:outline-none focus:border-[--brand] focus:ring-1 focus:ring-[--brand]
            transition-colors
            ${error ? "border-[--accent-red]" : "border-[--border]"}
            ${className}
          `}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1.5 text-sm text-[--accent-red]">{error}</p>
        )}
      </div>
    )
  }
)

Select.displayName = "Select"
