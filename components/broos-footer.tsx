"use client"

import Image from "next/image"
import Link from "next/link"

export function BroosFooter() {
  return (
    <footer className="bg-black border-t border-gray-800 py-4 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="https://broosmedia.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Image 
              src="/broos-media-logo.webp" 
              alt="Broos Media Logo" 
              width={40} 
              height={40}
              loading="lazy"
              className="object-contain"
              style={{ width: '40px', height: '40px' }}
            />
          </Link>
          <span className="text-sm text-gray-400 hidden sm:inline">•</span>
          <p className="text-sm text-gray-300 text-center">Bu platform Broos Media tarafından oluşturulmuştur</p>
        </div>
      </div>
    </footer>
  )
}
