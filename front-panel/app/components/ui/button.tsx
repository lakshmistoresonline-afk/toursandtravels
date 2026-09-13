import { type ButtonHTMLAttributes, type ComponentProps } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "motion/react";
import { cn } from "@workspace/shared/utils/ui";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-3 rounded-lg text-base font-bold uppercase tracking-wider transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[4px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer text-center leading-tight",
	{
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground shadow-lg hover:bg-primary/90",
				destructive:
					"bg-destructive text-white shadow-lg hover:bg-destructive/90 focus-visible:ring-destructive/20",
				outline:
					"border-2 border-primary/20 bg-background shadow-sm hover:bg-primary/5 hover:border-primary/40",
				secondary: "bg-primary/10 text-primary shadow-sm hover:bg-primary/20",
				ghost: "hover:bg-primary/5 hover:text-primary",
				link: "text-primary underline-offset-8 hover:underline",
			},
			size: {
				default: "h-12 px-6 py-3",
				sm: "h-10 rounded-lg gap-2 px-4 text-xs",
				lg: "h-16 rounded-xl px-10 text-lg has-[>svg]:px-8",
				icon: "size-12",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

const MotionSlot = motion.create(Slot);

function Button({
	className,
	variant = "default",
	size = "default",
	asChild = false,
	noEffect = false,
	...props
}: ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
		noEffect?: boolean;
	}) {
	const Comp = asChild ? MotionSlot : (motion.button as any);

	return (
		<Comp
			data-slot="button"
			data-size={size}
			data-variant={variant}
			className={cn(buttonVariants({ variant, size, className }))}
			whileTap={!noEffect ? { scale: 0.95 } : undefined}
			transition={{ duration: 0.1, ease: "easeInOut" }}
			{...props}
		/>
	);
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

export { Button, buttonVariants, type ButtonProps };
