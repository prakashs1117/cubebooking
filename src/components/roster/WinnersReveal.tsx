import { motion } from 'framer-motion'
import { AWARD_CATEGORIES } from '../../lib/awardCategories'
import type { AttendanceDoc } from '../../types'

interface WinnersRevealProps {
  winners: Record<string, string>
  profileByName: Map<string, AttendanceDoc>
  isMobile?: boolean
}

export function WinnersReveal({
  winners,
  profileByName,
  isMobile = false,
}: WinnersRevealProps) {
  const declared = AWARD_CATEGORIES.filter(cat => winners[cat.id])

  if (declared.length === 0) return null

  return (
    <div style={{
      marginTop: 20,
      marginBottom: 20,
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
        gap: 16,
        padding: '0 12px',
      }}>
        {declared.map((cat, idx) => {
          const winnerName = winners[cat.id]
          const profile = profileByName.get(winnerName)
          const photoURL = profile?.photoURL
          const initials = winnerName
            .split(/[\s@._-]+/)
            .filter(Boolean)
            .slice(0, 2)
            .map(p => p[0]?.toUpperCase() ?? '')
            .join('')
          const hue = winnerName.charCodeAt(0) * 47 % 360

          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.4 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 10,
                textAlign: 'center',
              }}
            >
              {/* Photo/initials circle */}
              <div style={{
                position: 'relative',
                width: 80,
                height: 80,
                borderRadius: '50%',
                flexShrink: 0,
                border: '4px solid #F59E0B',
                background: photoURL ? `url(${photoURL})` : `hsl(${hue}, 65%, 52%)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(119,36,50,0.3)',
                overflow: 'hidden',
              }}>
                {!photoURL && (
                  <span style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: '#fff',
                  }}>
                    {initials}
                  </span>
                )}
                <div style={{
                  position: 'absolute',
                  bottom: -4,
                  right: -4,
                  fontSize: 32,
                }}>
                  🏆
                </div>
              </div>

              {/* Award emoji */}
              <div style={{ fontSize: 24 }}>
                {cat.emoji}
              </div>

              {/* Winner name and category */}
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: '#111827',
                  wordBreak: 'break-word',
                  lineHeight: 1.2,
                  marginBottom: 2,
                }}>
                  {winnerName}
                </div>
                <div style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: 0.3,
                }}>
                  {cat.label}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
