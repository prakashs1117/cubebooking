import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { db } from '../firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Target,
  TrendingUp,
  Calendar,
  MessageSquare,
  Linkedin,
  AlertCircle,
  Check,
} from 'lucide-react'

type FormData = {
  name: string
  email: string
  phone: string
  city: string
  goal: string
  level: string
  attendance: string
  formats: string[]
  source: string
  notes: string
  linkedin?: string
  acceptTerms: boolean
}

type FormErrors = Partial<Record<keyof FormData, string>>

const INITIAL_FORM_DATA: FormData = {
  name: '',
  email: '',
  phone: '',
  city: '',
  goal: '',
  level: '',
  attendance: '',
  formats: [],
  source: '',
  notes: '',
  linkedin: '',
  acceptTerms: false,
}

export default function EnhancedOnboarding() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA)
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('onboarding_draft')
    if (saved) {
      setFormData(JSON.parse(saved))
    }
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('onboarding_draft', JSON.stringify(formData))
  }, [formData])

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }


  const validateStep = (stepNum: number): boolean => {
    const newErrors: FormErrors = {}

    if (stepNum === 1) {
      if (!formData.name?.trim()) newErrors.name = 'Name is required'
      if (!formData.email?.trim()) newErrors.email = 'Email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Valid email required'
      }
      if (!formData.phone?.trim()) newErrors.phone = 'Phone is required'
      if (!formData.city?.trim()) newErrors.city = 'City is required'
      if (!formData.goal) newErrors.goal = 'Please select a goal'
    }

    if (stepNum === 2) {
      if (!formData.level) newErrors.level = 'Please select experience level'
      if (!formData.attendance) newErrors.attendance = 'Please select attendance preference'
      if (formData.formats.length === 0) newErrors.formats = 'Select at least one format'
      if (!formData.source) newErrors.source = 'Please select how you found us'
    }

    if (stepNum === 3) {
      if (!formData.acceptTerms) newErrors.acceptTerms = 'Please accept the terms'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      if (step < 4) {
        setStep(step + 1)
      }
    }
  }

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) return

    setLoading(true)
    try {
      await addDoc(collection(db, 'toastmaster-onboarding'), {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        note: formData.notes,
        answers: {
          goal: formData.goal,
          level: formData.level,
          when: formData.attendance,
          mode: formData.formats,
          source: formData.source,
          linkedin: formData.linkedin || 'Not provided',
        },
        submittedAt: serverTimestamp(),
      })
      setSubmitted(true)
      localStorage.removeItem('onboarding_draft')
    } catch (error) {
      console.error('Submission error:', error)
      setErrors({ name: 'Failed to submit. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Check className="w-8 h-8 text-green-600" strokeWidth={3} />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
            <p className="text-gray-600 mb-6">
              We've received your interest. Our team will reach out soon to welcome you to the Toastmasters community.
            </p>
            <button
              onClick={() => {
                setFormData(INITIAL_FORM_DATA)
                setStep(1)
                setSubmitted(false)
              }}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Fill Another Form
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 md:px-8 py-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl md:text-3xl font-bold text-white">Join Us</h1>
              <div className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium">
                Step {step} of 4
              </div>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
              <motion.div
                initial={false}
                animate={{ width: `${(step / 4) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="h-full bg-white rounded-full"
              />
            </div>
          </div>

          {/* Content */}
          <div className="px-6 md:px-8 py-8">
            <AnimatePresence mode="wait">
              {/* Step 1: Personal Info */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2">Let's start with the basics</h2>
                      <p className="text-gray-600">Tell us a bit about yourself</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField
                        icon={User}
                        label="Full Name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={val => updateField('name', val)}
                        error={errors.name}
                      />
                      <InputField
                        icon={Mail}
                        label="Email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={val => updateField('email', val)}
                        error={errors.email}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField
                        icon={Phone}
                        label="Phone Number"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={val => updateField('phone', val)}
                        error={errors.phone}
                      />
                      <InputField
                        icon={MapPin}
                        label="City"
                        placeholder="Bengaluru"
                        value={formData.city}
                        onChange={val => updateField('city', val)}
                        error={errors.city}
                      />
                    </div>

                    <SelectField
                      icon={Target}
                      label="What are you hoping to get better at?"
                      value={formData.goal}
                      onChange={val => updateField('goal', val)}
                      options={[
                        { value: '', label: 'Select a goal' },
                        { value: 'Public speaking', label: 'Public speaking' },
                        { value: 'Confidence', label: 'Confidence' },
                        { value: 'Leadership', label: 'Leadership' },
                        { value: 'Interviews', label: 'Interviews' },
                        { value: 'Networking', label: 'Networking' },
                        { value: 'Just curious', label: 'Just curious' },
                      ]}
                      error={errors.goal}
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 2: Experience & Preferences */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2">Your experience & preferences</h2>
                      <p className="text-gray-600">Help us customize your journey</p>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-5 h-5 text-indigo-600" />
                        <span className="font-medium text-gray-900">Experience Level</span>
                      </label>
                      <div className="space-y-2">
                        {[
                          { value: 'beginner', label: 'Complete beginner' },
                          { value: 'few', label: 'Spoken a few times' },
                          { value: 'comfortable', label: 'Comfortable already' },
                          { value: 'experienced', label: 'Experienced speaker' },
                        ].map(option => (
                          <RadioButton
                            key={option.value}
                            name="level"
                            value={option.value}
                            label={option.label}
                            checked={formData.level === option.value}
                            onChange={() => updateField('level', option.value)}
                          />
                        ))}
                      </div>
                      {errors.level && <ErrorMessage msg={errors.level} />}
                    </div>

                    <div>
                      <label className="flex items-center gap-2 mb-3">
                        <Calendar className="w-5 h-5 text-indigo-600" />
                        <span className="font-medium text-gray-900">When could you attend?</span>
                      </label>
                      <div className="space-y-2">
                        {[
                          { value: 'saturday', label: 'Saturday evenings' },
                          { value: 'sunday', label: 'Sunday mornings' },
                          { value: 'weekday', label: 'Weekday evenings' },
                          { value: 'flexible', label: 'Flexible' },
                        ].map(option => (
                          <RadioButton
                            key={option.value}
                            name="attendance"
                            value={option.value}
                            label={option.label}
                            checked={formData.attendance === option.value}
                            onChange={() => updateField('attendance', option.value)}
                          />
                        ))}
                      </div>
                      {errors.attendance && <ErrorMessage msg={errors.attendance} />}
                    </div>

                    <SelectField
                      icon={MessageSquare}
                      label="How did you find us?"
                      value={formData.source}
                      onChange={val => updateField('source', val)}
                      options={[
                        { value: '', label: 'Select an option' },
                        { value: 'instagram', label: 'Instagram' },
                        { value: 'friend', label: 'A friend or colleague' },
                        { value: 'google', label: 'Google search' },
                        { value: 'linkedin', label: 'LinkedIn' },
                        { value: 'other', label: 'Somewhere else' },
                      ]}
                      error={errors.source}
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 3: Details & Terms */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2">Additional details</h2>
                      <p className="text-gray-600">Optional but helpful</p>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-5 h-5 text-indigo-600" />
                        <span className="font-medium text-gray-900">Notes (optional)</span>
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={e => updateField('notes', e.target.value)}
                        placeholder="Anything else you'd like us to know?"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        rows={4}
                      />
                    </div>

                    <InputField
                      icon={Linkedin}
                      label="LinkedIn Profile (optional)"
                      placeholder="linkedin.com/in/yourprofile"
                      value={formData.linkedin}
                      onChange={val => updateField('linkedin', val)}
                    />

                    <label className="flex items-start gap-3 p-4 bg-indigo-50 rounded-lg border border-indigo-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.acceptTerms}
                        onChange={e => updateField('acceptTerms', e.target.checked)}
                        className="w-5 h-5 mt-1 accent-indigo-600"
                      />
                      <span className="text-sm text-gray-700">
                        I agree to receive updates from Toastmasters and have read the privacy policy.
                      </span>
                    </label>
                    {errors.acceptTerms && <ErrorMessage msg={errors.acceptTerms} />}
                  </div>
                </motion.div>
              )}

              {/* Step 4: Review */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2">Review your information</h2>
                      <p className="text-gray-600">Please verify everything is correct</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                      <ReviewItem label="Name" value={formData.name} />
                      <ReviewItem label="Email" value={formData.email} />
                      <ReviewItem label="Phone" value={formData.phone} />
                      <ReviewItem label="City" value={formData.city} />
                      <ReviewItem label="Goal" value={formData.goal} />
                      <ReviewItem label="Experience" value={formData.level} />
                      <ReviewItem label="Availability" value={formData.attendance} />
                      <ReviewItem label="Found Us" value={formData.source} />
                    </div>

                    {formData.notes && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-900 mb-1">Notes:</p>
                        <p className="text-sm text-gray-700">{formData.notes}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 md:px-8 py-6 border-t border-gray-200 flex items-center justify-between gap-4">
            <button
              onClick={handlePrevious}
              disabled={step === 1}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Previous
            </button>

            {step < 4 ? (
              <button
                onClick={handleNext}
                className="px-8 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// Helper Components

function InputField({
  icon: Icon,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
}: {
  icon: any
  label: string
  type?: string
  placeholder: string
  value: string | undefined
  onChange: (val: string) => void
  error?: string
}) {
  return (
    <div>
      <label className="flex items-center gap-2 mb-2">
        <Icon className="w-5 h-5 text-indigo-600" />
        <span className="font-medium text-gray-900">{label}</span>
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all ${
          error ? 'border-red-500 bg-red-50' : 'border-gray-200'
        }`}
      />
      {error && <ErrorMessage msg={error} />}
    </div>
  )
}

function SelectField({
  icon: Icon,
  label,
  value,
  onChange,
  options,
  error,
}: {
  icon: any
  label: string
  value: string
  onChange: (val: string) => void
  options: { value: string; label: string }[]
  error?: string
}) {
  return (
    <div>
      <label className="flex items-center gap-2 mb-2">
        <Icon className="w-5 h-5 text-indigo-600" />
        <span className="font-medium text-gray-900">{label}</span>
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all ${
          error ? 'border-red-500 bg-red-50' : 'border-gray-200'
        }`}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <ErrorMessage msg={error} />}
    </div>
  )
}

function RadioButton({
  name,
  value,
  label,
  checked,
  onChange,
}: {
  name: string
  value: string
  label: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="w-5 h-5 accent-indigo-600"
      />
      <span className="font-medium text-gray-900">{label}</span>
    </label>
  )
}

function ErrorMessage({ msg }: { msg: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 mt-2 text-red-600 text-sm"
    >
      <AlertCircle className="w-4 h-4" />
      <span>{msg}</span>
    </motion.div>
  )
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value || '—'}</p>
    </div>
  )
}
