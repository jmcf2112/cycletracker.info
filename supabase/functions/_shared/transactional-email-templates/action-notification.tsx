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

interface ActionNotificationProps {
  action?: string
}

const ActionNotificationEmail = ({ action }: ActionNotificationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{action ? `You used ${action}` : 'Activity notification'} — {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Activity Notification</Heading>
        <Text style={text}>
          {action
            ? `You used the "${action}" feature in ${SITE_NAME}.`
            : `An action was performed in ${SITE_NAME}.`}
        </Text>
        <Text style={footer}>
          Best regards,{'\n'}The {SITE_NAME} Team
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ActionNotificationEmail,
  subject: (data: Record<string, any>) =>
    `Cycle Tracker: ${data.action || 'Activity Notification'}`,
  displayName: 'Action notification',
  previewData: { action: 'Log Cycle' },
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
