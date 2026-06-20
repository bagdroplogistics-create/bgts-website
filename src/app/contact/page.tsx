import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ContactForm } from '@/components/forms/ContactForm'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Reach BGTS for freight enquiries, partnership proposals, or branch-specific queries. Response within 4 business hours.',
}

const contactDetails = [
  {
    icon: Phone,
    label: 'Phone',
    value: '+91 63 5722 5722',
    href: 'tel:+916357225722',
    note: 'Mon–Sat, 8am–8pm',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'info@bgts.in',
    href: 'mailto:info@bgts.in',
    note: 'Response within 4 hours',
  },
  {
    icon: MapPin,
    label: 'Head Office',
    value: 'Old Padra Road, Vadodara — 390015',
    href: 'https://maps.google.com',
    note: 'Gujarat, India',
  },
  {
    icon: Clock,
    label: 'Office Hours',
    value: 'Mon–Sat: 8:00 AM – 8:00 PM',
    href: undefined,
    note: 'Operations 24×7',
  },
]

export default function ContactPage() {
  return (
    <>
      <Navbar />

      <main className="pt-header min-h-screen bg-surface-page">
        {/* Header */}
        <div className="bg-white border-b border-ink-ghost/10">
          <div className="container-xl py-10 md:py-14">
            <p className="eyebrow mb-2">Contact Us</p>
            <h1 className="font-display font-black text-4xl md:text-5xl text-ink-strong tracking-tight mb-3">
              Let's talk freight
            </h1>
            <p className="text-ink-muted text-lg max-w-xl">
              Quote enquiry, partnership proposal, or a branch-specific question —
              our team responds within 4 business hours.
            </p>
          </div>
        </div>

        <div className="container-xl py-10 md:py-16">
          <div className="grid lg:grid-cols-3 gap-10 items-start">
            {/* Form */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-ink-ghost/10 shadow-card p-6 md:p-8">
              <h2 className="font-display font-bold text-lg text-ink-strong mb-6">
                Send us a message
              </h2>
              <ContactForm />
            </div>

            {/* Contact details */}
            <aside className="space-y-4">
              {contactDetails.map(({ icon: Icon, label, value, href, note }) => (
                <div key={label} className="bg-white rounded-xl border border-ink-ghost/10 p-5 flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-brand-subtle flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-brand" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs text-ink-muted font-semibold uppercase tracking-wider mb-1">{label}</p>
                    {href ? (
                      <a href={href} className="text-sm font-semibold text-ink-strong hover:text-brand transition-colors">
                        {value}
                      </a>
                    ) : (
                      <p className="text-sm font-semibold text-ink-strong">{value}</p>
                    )}
                    <p className="text-xs text-ink-muted mt-0.5">{note}</p>
                  </div>
                </div>
              ))}

              {/* EkoHaul enquiries */}
              <div className="rounded-xl p-5 border border-eko/20 bg-eko-50">
                <p className="text-xs font-display font-bold uppercase tracking-wider text-eko mb-2">
                  BGTS EV Fleet Enquiries
                </p>
                <a href="mailto:ekohaul@bgts.in" className="text-sm font-semibold text-eko hover:underline block">
                  ekohaul@bgts.in
                </a>
                <p className="text-xs text-ink-muted mt-1">Dedicated EV fleet sales team</p>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
