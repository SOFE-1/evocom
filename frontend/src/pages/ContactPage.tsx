import { ContactAside } from './AboutPage'
import { QuoteForm } from '../components/QuoteForm'

export function ContactPage() {
  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-5 py-14 lg:grid-cols-[0.85fr_1.15fr]">
      <ContactAside />
      <QuoteForm />
    </section>
  )
}
