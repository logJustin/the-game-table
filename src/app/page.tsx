import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen p-4 md:p-8" style={{ 
      backgroundColor: '#2C1810',
      backgroundImage: `
        linear-gradient(45deg, rgba(74, 52, 41, 0.1) 25%, transparent 25%),
        linear-gradient(-45deg, rgba(74, 52, 41, 0.1) 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, rgba(74, 52, 41, 0.1) 75%),
        linear-gradient(-45deg, transparent 75%, rgba(74, 52, 41, 0.1) 75%)
      `,
      backgroundSize: '60px 60px',
      backgroundPosition: '0 0, 0 30px, 30px -30px, -30px 0px'
    }}>
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-6xl font-bold mb-4" style={{ 
          fontFamily: 'serif',
          color: '#F5F5DC',
          textShadow: '3px 3px 6px rgba(0, 0, 0, 0.5)'
        }}>
          The Game Table
        </h1>
        
        <p className="text-xl mb-8" style={{ color: '#E6DDD4' }}>
          A magical place where friends gather to discover their next gaming adventure
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
          <div className="p-6 rounded-lg" style={{
            backgroundColor: 'rgba(92, 64, 51, 0.3)',
            border: '1px solid #5C4033'
          }}>
            <h3 className="text-xl font-bold mb-2" style={{ color: '#F5F5DC', fontFamily: 'serif' }}>
              🎲 Spin the Wheel
            </h3>
            <p style={{ color: '#E6DDD4' }}>
              Add games to the magical wheel and let fate decide your next adventure
            </p>
          </div>

          <div className="p-6 rounded-lg" style={{
            backgroundColor: 'rgba(92, 64, 51, 0.3)',
            border: '1px solid #5C4033'
          }}>
            <h3 className="text-xl font-bold mb-2" style={{ color: '#F5F5DC', fontFamily: 'serif' }}>
              👥 Friends Welcome
            </h3>
            <p style={{ color: '#E6DDD4' }}>
              Everyone can join the session and add their favorite games to the mix
            </p>
          </div>

          <div className="p-6 rounded-lg" style={{
            backgroundColor: 'rgba(92, 64, 51, 0.3)',
            border: '1px solid #5C4033'
          }}>
            <h3 className="text-xl font-bold mb-2" style={{ color: '#F5F5DC', fontFamily: 'serif' }}>
              📖 Session Logs
            </h3>
            <p style={{ color: '#E6DDD4' }}>
              Track your gaming sessions, winners, and create lasting memories
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Link
            href="/session"
            className="inline-block px-8 py-4 rounded-lg font-bold text-xl transition-all duration-200 transform hover:scale-105"
            style={{
              background: 'linear-gradient(to bottom, #DAA520, #B8860B)',
              color: '#2F1B14',
              boxShadow: '0 6px 12px rgba(184, 134, 11, 0.4)',
              textShadow: '1px 1px 2px rgba(255, 255, 255, 0.3)'
            }}
          >
            🎯 Start Playing
          </Link>
          
          <div className="flex gap-4 justify-center">
            <Link
              href="/spinner-test"
              className="text-sm underline transition-colors duration-200"
              style={{ color: '#B8860B' }}
            >
              🎯 Game Spinner
            </Link>
            <Link
              href="/search-test"
              className="text-sm underline transition-colors duration-200"
              style={{ color: '#B8860B' }}
            >
              🔍 Game Library
            </Link>
          </div>
          
          <p className="text-sm" style={{ color: '#E6DDD4' }}>
            Create multiplayer sessions, spin the wheel, or browse the game library
          </p>
        </div>
      </div>
    </div>
  );
}
