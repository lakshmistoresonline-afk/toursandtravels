import { useNavigate } from "react-router";
import { Button } from "./button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@workspace/shared/utils/ui";

interface BackButtonProps {
	className?: string;
	fallbackUrl?: string;
	label?: string;
}

export function BackButton({ className, fallbackUrl, label = "Back" }: BackButtonProps) {
	const navigate = useNavigate();

	const handleBack = () => {
		if (window.history.length > 1) {
			navigate(-1);
		} else if (fallbackUrl) {
			navigate(fallbackUrl);
		} else {
			navigate("/");
		}
	};

	return (
		<Button
			variant="ghost"
			size="sm"
			onClick={handleBack}
			className={cn(
				"flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-foreground/40 hover:text-primary hover:bg-primary/5 transition-all rounded-full px-4 h-10",
				className,
			)}
		>
			<ArrowLeft className="h-4 w-4" />
			<span>{label}</span>
		</Button>
	);
}
