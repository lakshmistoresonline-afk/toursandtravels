import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "~/components/ui/button";
import { Upload, X } from "lucide-react";

/**
 * Image Input Component
 * REFACTORED: Simplified for Firebase Storage.
 */
export default function ImageInput({
	value,
	onChange
}: {
	value?: any;
	onChange: (file: File | null) => void
}) {
	const [preview, setPreview] = useState<string | null>(null);

	useEffect(() => {
		if (typeof value === "string") {
			setPreview(value);
		} else if (value instanceof File) {
			setPreview(URL.createObjectURL(value));
		} else {
			setPreview(null);
		}
	}, [value]);

	const onDrop = (acceptedFiles: File[]) => {
		if (acceptedFiles.length > 0) {
			onChange(acceptedFiles[0]);
		}
	};

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: { "image/*": [] },
		maxFiles: 1
	});

	return (
		<div className="space-y-4">
			{preview ? (
				<div className="relative w-full aspect-video rounded-lg overflow-hidden border">
					<img src={preview} className="w-full h-full object-cover" alt="Preview" />
					<Button
						type="button"
						variant="destructive"
						size="icon"
						className="absolute top-2 right-2 rounded-full"
						onClick={() => onChange(null)}
					>
						<X className="h-4 w-4" />
					</Button>
				</div>
			) : (
				<div
					{...getRootProps()}
					className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary"}`}
				>
					<input {...getInputProps()} />
					<Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
					<p className="text-sm text-muted-foreground">
						Drag & drop or click to upload tour cover image
					</p>
				</div>
			)}
		</div>
	);
}
