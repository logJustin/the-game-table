'use client'

import Link from 'next/link'

export default function UITest() {
  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
          UI Layout Test
        </h1>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 text-gray-700">Flex Test</h2>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded">
              <span className="text-blue-800">Left Item</span>
              <span className="text-blue-800">Right Item</span>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 text-gray-700">Grid Test</h2>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-green-100 p-3 rounded text-center text-green-800">1</div>
              <div className="bg-green-100 p-3 rounded text-center text-green-800">2</div>
              <div className="bg-green-100 p-3 rounded text-center text-green-800">3</div>
              <div className="bg-green-100 p-3 rounded text-center text-green-800">4</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-gray-700">Responsive Test</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 bg-purple-100 p-4 rounded text-purple-800">
              Column 1 - Should stack on mobile, side-by-side on desktop
            </div>
            <div className="flex-1 bg-purple-100 p-4 rounded text-purple-800">
              Column 2 - Should stack on mobile, side-by-side on desktop
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <div className="inline-flex gap-4">
            <Link
              href="/"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              ← Home
            </Link>
            <Link
              href="/logs"
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Game Logs →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}