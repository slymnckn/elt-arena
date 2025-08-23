"use client"

import { useState } from "react"
import { UniversalFilePreview } from "./universal-file-preview"
import type { Resource } from "@/lib/data"

interface ResourceViewerProps {
  resource: Resource
  onClose: () => void
}

export function ResourceViewer({ resource, onClose }: ResourceViewerProps) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50">
      <div className="w-full h-full bg-white overflow-hidden">
        <UniversalFilePreview resource={resource} onClose={onClose} />
      </div>
    </div>
  )
}
