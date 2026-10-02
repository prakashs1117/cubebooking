import { useEffect, useState, useDebugValue } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../shared/firebase'

export interface MaintenanceConfig {
  enabled: boolean
  bannerOnly: boolean
  message: string
}

const DEFAULT: MaintenanceConfig = { enabled: false, bannerOnly: false, message: '' }

export function useMaintenanceMode() {
  const [config, setConfig] = useState<MaintenanceConfig>(DEFAULT)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'config', 'maintenance'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data()
          setConfig({
            enabled: Boolean(data.enabled),
            bannerOnly: Boolean(data.bannerOnly),
            message: typeof data.message === 'string' ? data.message : '',
          })
        } else {
          setConfig(DEFAULT)
        }
        setLoading(false)
      },
      () => {
        setConfig(DEFAULT)
        setLoading(false)
      },
    )
    return unsub
  }, [])

  useDebugValue(config, (c) => `useMaintenanceMode: ${c.enabled ? (c.bannerOnly ? 'banner' : 'full') : 'off'}`)
  return { ...config, loading }
}
