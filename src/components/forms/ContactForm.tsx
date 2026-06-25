'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { contactPageSchema, type ContactPageFormData } from '@/lib/schemas'

const TYPE_OPTIONS = [
  { value: 'general',     label: 'General Enquiry' },
  { value: 'quote',       label: 'Request a Quote' },
  { value: 'partnership', label: 'Partnership / B2B' },
  { value: 'ekohaul',    label: 'BGTS EV Fleet' },
  { value: 'complaint',   label: 'Feedback / Complaint' },
]

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactPageFormData>({
    resolver: zodResolver(contactPageSchema),
    defaultValues: { type: 'general' },
  })

  const onSubmit = async (_data: ContactPageFormData) => {
    // TODO: wire to API route / email service
    await new Promise((r) => setTimeout(r, 800))
    // Fire Google Ads conversion
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      ;(window as any).gtag('event', 'conversion', {
        send_to:  'AW-18267437854/96quCNSL0cQcEJ72y4ZE',
        value:    1.0,
        currency: 'INR',
      })
    }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center text-center py-10">
        <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mb-4">
          <CheckCircle size={28} className="text-success" />
        </div>
        <h3 className="font-display font-bold text-xl text-ink-strong mb-2">
          Message received
        </h3>
        <p className="text-ink-muted text-sm max-w-xs">
          Our team will respond within 4 business hours. For urgent freight
          queries, call <a href="tel:+916357225722" className="text-brand hover:underline">+91 63 5722 5722</a>.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Select
        label="Enquiry Type"
        options={TYPE_OPTIONS}
        error={errors.type?.message}
        {...register('type')}
      />
      <div className="grid sm:grid-cols-2 gap-4">
        <Input
          label="Your Name"
          required
          placeholder="Full name"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label="Email Address"
          required
          type="email"
          placeholder="you@company.com"
          error={errors.email?.message}
          {...register('email')}
        />
      </div>
      <Input
        label="Mobile Number"
        type="tel"
        placeholder="10-digit mobile (optional)"
        error={errors.phone?.message}
        {...register('phone')}
      />
      <Input
        label="Subject"
        required
        placeholder="Brief subject line"
        error={errors.subject?.message}
        {...register('subject')}
      />
      <Textarea
        label="Message"
        required
        placeholder="Tell us more about your requirement..."
        error={errors.message?.message}
        {...register('message')}
      />

      <Button type="submit" variant="primary" size="lg" className="w-full" loading={isSubmitting}>
        Send Message
      </Button>
    </form>
  )
}
