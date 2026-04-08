/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Cycle Tracker'

interface CycleEntryLoggedProps {
  cycleStartDate?: string
}

const CycleEntryLoggedEmail = ({ cycleStartDate }: CycleEntryLoggedProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New cycle entry logged in {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>New Cycle Entry Logged</Heading>
        <Text style={text}>
          {cycleStartDate
            ? `A new cycle entry starting ${cycleStartDate} has been recorded in your ${SITE_NAME} account.`
            : `A new cycle entry has been recorded in your ${SITE_NAME} account.`}
        </Text>
        <Text style={text}>
          You can open the app at any time to review your history and predictions.
        </Text>
        <Text style={footer}>
          Best regards,{'\n'}The {SITE_NAME} Team
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: CycleEntryLoggedEmail,
  subject: 'Cycle Tracker: New Cycle Entry Logged',
  displayName: 'Cycle entry logged',
  previewData: { cycleStartDate: '2026-04-01' },
} satisfies TemplateEntry

const main = {
  backgroundColor: '#ffffff',
  fontFamily: "'DM Sans', Arial, sans-serif",
}
const container = { padding: '20px 25px' }
const h1 = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  fontFamily: "'Fraunces', Georgia, serif",
  color: '#302420',
  margin: '0 0 20px',
}
const text = {
  fontSize: '14px',
  color: '#6b6159',
  lineHeight: '1.5',
  margin: '0 0 25px',
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
