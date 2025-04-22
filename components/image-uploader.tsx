"use client"

import { useEffect, useState } from "react"
import { FileUploaderRegular } from "@uploadcare/react-uploader"
import "@uploadcare/react-uploader/core.css"
import { ImageIcon, Loader2, X } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface ImageUploaderProps {
  value: string
  onChange: (value: string) => void
}

export function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const [imageUrl, setImageUrl] = useState(value || "")
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    setImageUrl(value || "")
  }, [value])

  const handleUploadComplete = (fileInfo: any) => {
    setIsUploading(false)
    const url = fileInfo.cdnUrl
    setImageUrl(url)
    onChange(url)
  }

  const handleClearImage = () => {
    setImageUrl("")
    onChange("")
  }

  return (
    <div className="space-y-2">
      {imageUrl ? (
        <div className="relative w-full h-48 rounded-md overflow-hidden border">
          <Image
            src={imageUrl}
            alt="Uploaded image"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full"
            onClick={handleClearImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border rounded-md p-4 bg-muted/30 flex items-center justify-center h-48">
          {isUploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-2 text-sm text-muted-foreground">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
              <FileUploaderRegular
                pubkey="d8d785e3fe6bd846b390"
                onChange={handleUploadComplete}
                sourceList="local, camera, facebook, gdrive"
                cameraModes="photo"
                classNameUploader="uc-light"
                onPreUpload={() => setIsUploading(true)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
