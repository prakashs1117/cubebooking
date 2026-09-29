import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { FileText, X, CheckCircle2, Loader2 } from 'lucide-react'
import { useIntl } from 'react-intl'
import { useAuthContext } from '../../context/AuthContext'
import { format } from 'date-fns'
import { de, enUS } from 'date-fns/locale'
import type { Timestamp } from 'firebase/firestore'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{title}</h3>
      <div className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
        {children}
      </div>
    </div>
  )
}

export function UserAgreementDialog({ trigger }: { trigger: React.ReactNode }) {
  const intl = useIntl()
  const { profile, acceptAgreement } = useAuthContext()
  const isDE = intl.locale === 'de'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const agreedAt = profile?.agreedAt as Timestamp | undefined
  const agreedDate = agreedAt?.toDate ? agreedAt.toDate() : null

  const handleAccept = async () => {
    setLoading(true)
    setError(null)
    try {
      await acceptAgreement()
    } catch {
      setError(intl.formatMessage({ id: 'agreement.error' }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)', animation: 'fadeIn 0.2s ease-out' }}
        />
        <Dialog.Content
          className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-3xl sm:inset-auto sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:rounded-3xl sm:w-full sm:max-w-lg"
          style={{
            background: 'var(--background)',
            border: '1px solid var(--border)',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
            maxHeight: '90vh',
            animation: 'slideUp 0.3s cubic-bezier(0.2,0.8,0.2,1)',
          }}
        >
          <style>{`
            @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
            @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
          `}</style>

          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-10 h-1 rounded-full" style={{ background: 'var(--border)' }} />
          </div>

          <div className="overflow-y-auto flex-1 min-h-0">
            <div className="flex items-start justify-between px-6 pt-5 pb-3">
              <div className="flex items-center gap-2.5">
                <span
                  className="flex-none grid place-items-center w-9 h-9 rounded-xl"
                  style={{ background: 'var(--tint-purple)' }}
                >
                  <FileText className="w-5 h-5" style={{ color: 'var(--brand-purple)' }} />
                </span>
                <Dialog.Title className="text-base font-bold" style={{ color: 'var(--foreground)' }}>
                  {intl.formatMessage({ id: 'agreement.title' })}
                </Dialog.Title>
              </div>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="tap iconbtn flex-none"
                  aria-label="Close"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>

            {/* Already accepted banner */}
            {agreedDate && (
              <div
                className="mx-6 mb-3 flex items-center gap-2.5 px-4 py-3 rounded-xl"
                style={{ background: 'var(--accent)' }}
              >
                <CheckCircle2 className="w-4 h-4 flex-none" style={{ color: 'var(--brand-green)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--brand-green)' }}>
                  {intl.formatMessage({ id: 'agreement.accepted' })}{' '}
                  {format(agreedDate, 'd MMMM yyyy', { locale: isDE ? de : enUS })}
                </span>
              </div>
            )}

            <Dialog.Description asChild>
              <div className="px-6 pb-6 flex flex-col gap-5">
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  {intl.formatMessage({ id: 'agreement.intro' })}
                </p>

                {isDE ? (
                  <>
                    <Section title="1. Geltungsbereich">
                      Diese Nutzungsbedingungen gelten für alle registrierten Lehrkräfte und Schulkoordinatoren, die das Curiosity Booking-System der Merck KGaA (im Folgenden „Merck") nutzen, um MINT-Erlebnisse im Rahmen des Programms Curiosity Cube, Curiosity Lab oder TOAD-Truck zu buchen.
                    </Section>

                    <Section title="2. Nutzungsberechtigung">
                      Das System darf ausschließlich von Lehrkräften und autorisierten Schulvertretern aus dem Raum Darmstadt (Hessen, Deutschland) für schulische Buchungen genutzt werden. Jede andere Nutzung ist untersagt.
                    </Section>

                    <Section title="3. Buchungs- und Stornierungsbedingungen">
                      <ul className="list-disc list-inside space-y-1 mt-1">
                        <li>Buchungen für den Curiosity Cube und das Lab werden sofort bestätigt.</li>
                        <li>TOAD-Truck-Anfragen unterliegen der Genehmigung durch Merck.</li>
                        <li>Stornierungen müssen mindestens 5 Werktage vor dem Besuchstermin vorgenommen werden.</li>
                        <li>Wiederholte Nichterscheinen oder kurzfristige Stornierungen können zum Ausschluss vom System führen.</li>
                      </ul>
                    </Section>

                    <Section title="4. Verantwortlichkeiten der Schule">
                      Die Lehrkraft ist verantwortlich für die korrekte Angabe der Teilnehmerzahl und Klassenstufe sowie für die Einholung der erforderlichen Einverständniserklärungen der Eltern/Erziehungsberechtigten. Sie trägt die Aufsichtspflicht über die Schülerinnen und Schüler während des gesamten Besuchs.
                    </Section>

                    <Section title="5. Datenschutz">
                      Mit der Nutzung der Plattform erklären Sie sich mit unserer Datenschutzerklärung einverstanden. Es werden keine personenbezogenen Daten von Schülerinnen und Schülern gespeichert. Alle Daten werden in der EU (Frankfurt) gemäß DSGVO verarbeitet.
                    </Section>

                    <Section title="6. Haftungsausschluss">
                      Merck KGaA behält sich das Recht vor, Termine bei außergewöhnlichen Umständen (höhere Gewalt, Betriebsunterbrechungen) zu verschieben oder abzusagen. In solchen Fällen wird die Schule so früh wie möglich informiert und ein Ersatztermin angeboten.
                    </Section>

                    <Section title="7. Änderungen der Bedingungen">
                      Merck behält sich vor, diese Bedingungen mit angemessener Frist zu ändern. Registrierte Nutzer werden per App-Benachrichtigung informiert.
                    </Section>
                  </>
                ) : (
                  <>
                    <Section title="1. Scope">
                      These Terms of Use apply to all registered teachers and school coordinators who use the Curiosity Booking system of Merck KGaA ("Merck") to book STEM experiences under the Curiosity Cube, Curiosity Lab, or TOAD Truck programmes.
                    </Section>

                    <Section title="2. Eligibility">
                      The system may only be used by teachers and authorised school representatives from the Darmstadt area (Hesse, Germany) for school visit bookings. Any other use is prohibited.
                    </Section>

                    <Section title="3. Booking & Cancellation Terms">
                      <ul className="list-disc list-inside space-y-1 mt-1">
                        <li>Curiosity Cube and Lab bookings are confirmed instantly.</li>
                        <li>TOAD Truck requests are subject to Merck approval.</li>
                        <li>Cancellations must be made at least 5 working days before the visit date.</li>
                        <li>Repeated no-shows or late cancellations may result in account suspension.</li>
                      </ul>
                    </Section>

                    <Section title="4. School Responsibilities">
                      The teacher is responsible for providing accurate participant numbers and class grade, obtaining required parental/guardian consent forms, and maintaining adequate supervision of students throughout the entire visit.
                    </Section>

                    <Section title="5. Data Protection">
                      By using the platform you agree to our Privacy Policy. No personal data about individual students is stored. All data is processed in the EU (Frankfurt) in accordance with GDPR.
                    </Section>

                    <Section title="6. Liability Disclaimer">
                      Merck KGaA reserves the right to reschedule or cancel appointments under exceptional circumstances (force majeure, operational disruptions). Schools will be notified as early as possible and offered an alternative date.
                    </Section>

                    <Section title="7. Changes to Terms">
                      Merck reserves the right to amend these terms with reasonable notice. Registered users will be notified via in-app notification.
                    </Section>
                  </>
                )}

                {error && (
                  <div
                    className="px-4 py-3 rounded-xl text-sm font-medium"
                    style={{ background: 'var(--tint-red)', color: 'var(--destructive)' }}
                  >
                    {error}
                  </div>
                )}
              </div>
            </Dialog.Description>
          </div>

          {/* Footer */}
          <div className="border-t px-6 py-4 flex gap-3 justify-end" style={{ borderColor: 'var(--border)' }}>
            <Dialog.Close asChild>
              <button
                type="button"
                className="tap h-10 px-4 rounded-xl text-sm font-semibold"
                style={{ background: 'var(--muted)', color: 'var(--foreground)' }}
              >
                {intl.formatMessage({ id: 'dialog.cancel' })}
              </button>
            </Dialog.Close>
            {!agreedDate ? (
              <button
                type="button"
                onClick={handleAccept}
                disabled={loading}
                className="tap h-10 px-5 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'var(--primary)', color: '#fff' }}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {intl.formatMessage({ id: 'agreement.accept' })}
              </button>
            ) : (
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="tap h-10 px-5 rounded-xl text-sm font-semibold"
                  style={{ background: 'var(--primary)', color: '#fff' }}
                >
                  {intl.formatMessage({ id: 'dialog.close' })}
                </button>
              </Dialog.Close>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
