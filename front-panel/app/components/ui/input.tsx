import { type ComponentProps } from "react";
import { cn } from "@workspace/shared/utils/ui";

function Input({ className, type, ...props }: ComponentProps<"input">) {
	return (
		<input
			type={type}
			data-slot="input"
			spellCheck="false"
			data-gramm="false"
			className={cn(
				"file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex h-12 w-full min-w-0 rounded-lg border bg-background px-4 py-3 shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-8 file:border-0 file:bg-transparent file:text-base file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 text-base font-medium",
				"focus-visible:border-primary focus-visible:ring-primary/20 focus-visible:ring-[4px]",
				"aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
				className,
			)}
			{...props}
		/>
	);
}

export { Input };
