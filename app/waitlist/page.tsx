import { Metadata } from 'next'
import WaitlistForm from "@/components/WaitlistForm"

export const metadata: Metadata = {
  title: 'Join the Waitlist - Anilyst',
  description: 'Get early access to Anilyst and receive 20% off at launch. Transform your data analysis with AI-powered insights.',
  openGraph: {
    title: 'Join the Anilyst Waitlist',
    description: 'Get early access and 20% off at launch',
    images: ['/waitlist-og.jpg'],
  }
}

export default function WaitlistPage() {
  return <WaitlistForm />
} 