import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@workspace/shared/utils/ui";

const badgeVariants = cva(
	"select-none inline-flex items-center justify-center rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest w-fit whitespace-nowrap shrink-0 [&>svg]:size-3.5 gap-1.5 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[4px] aria-invalid:ring-destructive/20 transition-all overflow-hidden shadow-sm",
	{
		variants: {
			variant: {
				default: "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90 shadow-md",
				secondary:
					"border-transparent bg-primary/10 text-primary [a&]:hover:bg-primary/20",
				destructive:
					"border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 shadow-md",
				success: "border-transparent bg-emerald-600 text-white shadow-md",
				outline: "text-foreground border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

function Badge({
	className,
	variant,
	asChild = false,
	...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
	const Comp = asChild ? Slot : "span";

	return <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
