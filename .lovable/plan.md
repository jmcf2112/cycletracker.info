

# Fix "Bloom" References to "Cycle Tracker"

## Problem
Two files contain the name "Bloom" instead of "Cycle Tracker":

1. **`src/components/onboarding/WelcomeStep.tsx`** line 15: `"Welcome to Bloom"` → `"Welcome to Cycle Tracker"`
2. **`src/components/settings/SettingsView.tsx`** line 91: `"Bloom v2.0 • Made with care"` → `"Cycle Tracker v2.0 • Made with care"`

## Changes
- Replace both occurrences of "Bloom" with "Cycle Tracker"
- No other files or logic affected

