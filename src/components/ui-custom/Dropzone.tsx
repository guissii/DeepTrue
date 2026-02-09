import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  label?: string;
  sublabel?: string;
  className?: string;
}

export function Dropzone({
  onFileSelect,
  accept = {
    "image/*": [".jpg", ".jpeg", ".png"],
    "video/*": [".mp4", ".mov", ".avi"],
    "audio/*": [".mp3", ".wav", ".m4a"],
  },
  maxSize = 100 * 1024 * 1024, // 100MB
  label = "Glissez-déposez votre fichier ici",
  sublabel = "ou cliquez pour parcourir",
  className,
}: DropzoneProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null);

      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors[0].code === "file-too-large") {
          setError("Fichier trop volumineux (max 100MB)");
        } else {
          setError("Format de fichier non supporté");
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setSelectedFile(file);
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
  });

  const clearFile = () => {
    setSelectedFile(null);
    setError(null);
  };

  if (selectedFile) {
    return (
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center bg-muted/50",
          className
        )}
      >
        <div className="flex items-center justify-center gap-4">
          <File className="h-8 w-8 text-primary" />
          <div className="text-left">
            <p className="font-medium">{selectedFile.name}</p>
            <p className="text-sm text-muted-foreground">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={clearFile}
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
        isDragActive
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-muted-foreground/50",
        className
      )}
    >
      <input {...getInputProps()} />
      <Upload
        className={cn(
          "mx-auto h-12 w-12 mb-4",
          isDragActive ? "text-primary" : "text-muted-foreground"
        )}
      />
      <p className="text-lg font-medium">{label}</p>
      <p className="text-sm text-muted-foreground mt-1">{sublabel}</p>
      {error && <p className="text-sm text-destructive mt-2">{error}</p>}
    </div>
  );
}
