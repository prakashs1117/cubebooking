import * as Dialog from '@radix-ui/react-dialog'
import { ShieldCheck, X } from 'lucide-react'
import { useIntl } from 'react-intl'

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

export function PrivacyPolicyDialog({ trigger }: { trigger: React.ReactNode }) {
  const intl = useIntl()
  const isDE = intl.locale === 'de'

  return (
    <Dialog.Root>
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
                  <ShieldCheck className="w-5 h-5" style={{ color: 'var(--brand-purple)' }} />
                </span>
                <Dialog.Title className="text-base font-bold" style={{ color: 'var(--foreground)' }}>
                  {intl.formatMessage({ id: 'privacy.title' })}
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

            <Dialog.Description asChild>
              <div className="px-6 pb-6 flex flex-col gap-5">
                {/* Last updated + GDPR badge */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    {intl.formatMessage({ id: 'privacy.lastUpdated' })}
                  </span>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'var(--accent)', color: 'var(--brand-green)' }}
                  >
                    GDPR / DSGVO
                  </span>
                </div>

                {isDE ? (
                  <>
                    <Section title="1. Verantwortliche Stelle">
                      Merck KGaA, Frankfurter Straße 250, 64293 Darmstadt, Deutschland ist für die Verarbeitung Ihrer personenbezogenen Daten gemäß Art. 4 Nr. 7 DSGVO verantwortlich. Bei datenschutzrechtlichen Anfragen wenden Sie sich bitte an: <strong>datenschutz@merck.de</strong>
                    </Section>

                    <Section title="2. Welche Daten wir erheben">
                      <ul className="list-disc list-inside space-y-1 mt-1">
                        <li>Name der Lehrkraft und dienstliche E-Mail-Adresse</li>
                        <li>Schulname und Schulstandort</li>
                        <li>Buchungsdaten: Datum, Uhrzeit, Klasse, Schüleranzahl</li>
                        <li>Optionale Angaben zu Barrierefreiheitsbedürfnissen der Klasse</li>
                        <li>Bevorzugte Sprache und App-Einstellungen</li>
                      </ul>
                      <p className="mt-2">Es werden keine personenbezogenen Daten von Schülerinnen und Schülern erhoben oder gespeichert.</p>
                    </Section>

                    <Section title="3. Zweck der Datenverarbeitung">
                      Ihre Daten werden ausschließlich für folgende Zwecke verarbeitet: Verwaltung von Buchungen für MINT-Erlebnisse (Curiosity Cube, Lab und TOAD-Truck), Kommunikation im Zusammenhang mit Ihrer Buchung sowie technische Verbesserung der Plattform.
                    </Section>

                    <Section title="4. Rechtsgrundlage">
                      Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) für buchungsbezogene Daten sowie Art. 6 Abs. 1 lit. f DSGVO (berechtigte Interessen) für die Verbesserung der Plattform.
                    </Section>

                    <Section title="5. Datenspeicherung & EU-Hosting">
                      Alle Daten werden ausschließlich auf Servern innerhalb der Europäischen Union (Google Cloud, Region europe-west3 / Frankfurt) gespeichert. Daten werden für 36 Monate nach Ihrer letzten Nutzung oder bis zur Kontolöschung aufbewahrt.
                    </Section>

                    <Section title="6. Ihre Rechte">
                      Gemäß DSGVO haben Sie das Recht auf: Auskunft (Art. 15), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) sowie Widerspruch (Art. 21). Sie können Ihre Daten jederzeit in den Profileinstellungen exportieren oder die Kontolöschung beantragen. Sie haben außerdem das Recht, Beschwerde bei der zuständigen Aufsichtsbehörde einzulegen (HBDI – Hessischer Beauftragter für Datenschutz und Informationsfreiheit).
                    </Section>

                    <Section title="7. Cookies & Tracking">
                      Diese App verwendet keine Drittanbieter-Cookies zu Werbezwecken. Firebase Analytics erfasst anonymisierte Nutzungsdaten zur Verbesserung der App (keine personenbezogenen Daten, keine IP-Adressen).
                    </Section>
                  </>
                ) : (
                  <>
                    <Section title="1. Data Controller">
                      Merck KGaA, Frankfurter Straße 250, 64293 Darmstadt, Germany is the data controller for your personal data under Art. 4(7) GDPR. For data protection enquiries, contact: <strong>datenschutz@merck.de</strong>
                    </Section>

                    <Section title="2. What Data We Collect">
                      <ul className="list-disc list-inside space-y-1 mt-1">
                        <li>Teacher name and professional email address</li>
                        <li>School name and location</li>
                        <li>Booking data: date, time, class grade, student count</li>
                        <li>Optional accessibility needs for the class visit</li>
                        <li>Language preference and app settings</li>
                      </ul>
                      <p className="mt-2">No personal data about individual students is collected or stored.</p>
                    </Section>

                    <Section title="3. Purpose of Processing">
                      Your data is used solely to: manage bookings for STEM experiences (Curiosity Cube, Lab, and TOAD Truck), communicate with you about your bookings, and improve the platform technically.
                    </Section>

                    <Section title="4. Legal Basis">
                      Processing is based on Art. 6(1)(b) GDPR (contract performance) for booking data, and Art. 6(1)(f) GDPR (legitimate interests) for platform improvement.
                    </Section>

                    <Section title="5. Data Storage & EU Hosting">
                      All data is stored exclusively on servers within the European Union (Google Cloud, region europe-west3 / Frankfurt). Data is retained for 36 months after your last activity or until account deletion.
                    </Section>

                    <Section title="6. Your Rights">
                      Under GDPR you have the right to: access (Art. 15), rectification (Art. 16), erasure (Art. 17), restriction of processing (Art. 18), data portability (Art. 20), and objection (Art. 21). You can export your data or request account deletion at any time in Profile settings. You also have the right to lodge a complaint with the relevant supervisory authority (HBDI – Hessischer Beauftragter für Datenschutz).
                    </Section>

                    <Section title="7. Cookies & Analytics">
                      This app does not use third-party advertising cookies. Firebase Analytics collects anonymised usage data to improve the app (no personal data, no IP addresses stored).
                    </Section>
                  </>
                )}
              </div>
            </Dialog.Description>
          </div>

          {/* Footer */}
          <div className="border-t px-6 py-4 flex justify-end" style={{ borderColor: 'var(--border)' }}>
            <Dialog.Close asChild>
              <button
                type="button"
                className="tap h-10 px-5 rounded-xl text-sm font-semibold"
                style={{ background: 'var(--primary)', color: '#fff' }}
              >
                {intl.formatMessage({ id: 'dialog.close' })}
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
