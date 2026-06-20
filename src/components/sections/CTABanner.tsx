import Image from 'next/image'
import Link from 'next/link'
import { BookNowButton } from '@/components/ui/BookNowButton'
import { Truck, Phone } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function CTABanner() {
  return (
    <section
      className="relative overflow-hidden py-20"
      aria-labelledby="cta-heading"
    >
      {/* Background photo */}
      <Image
        src="/cta-bg.jpg"
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-center"
        aria-hidden="true"
      />

      {/* Dark overlay */}
      <div
        className="absolute inset-0 bg-black/60"
        aria-hidden="true"
      />

      {/* Arrow pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(0,0,0,0.08) 20px, rgba(0,0,0,0.08) 21px)',
        }}
        aria-hidden="true"
      />

      <div className="container-xl relative z-10 text-center">
        <p className="font-display font-bold text-white/80 text-sm uppercase tracking-widest mb-4">
          Ready to move?
        </p>
        <h2
          id="cta-heading"
          className="font-display font-black text-4xl md:text-5xl text-white leading-tight tracking-tight mb-4"
        >
          Get your freight quote<br className="hidden md:block" /> in under 60 seconds.
        </h2>
        <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
          Tell us your route and cargo — we'll give you an instant estimate
          with transit time, insurance, and GST breakdown included.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="secondary"
            size="xl"
            icon={<Truck size={18} />}
            iconPosition="left"
            className="bg-white text-brand hover:bg-white/90 border-white"
            asChild
          >
            <BookNowButton variant="primary" size="lg" className="bg-white text-brand hover:bg-white/90">Book Now</BookNowButton>
          </Button>
          <Button
            variant="ghost"
            size="xl"
            icon={<Phone size={16} />}
            iconPosition="left"
            className="text-white border border-white/30 hover:bg-white/10"
            asChild
          >
            <a href="tel:+916357225722">Call Us Now</a>
          </Button>
        </div>

        <p className="mt-8 text-white/60 text-sm">
          No registration required · Response within 2 hours · GST invoice guaranteed
        </p>
      </div>
    </section>
  )
}
