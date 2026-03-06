# Phase 2 Onboarding Flow Implementation

## Summary
Created a new 3-screen onboarding flow that replaces the previous 6-screen multi-step onboarding with a streamlined, conversion-focused experience.

## Files Created & Modified

### Created
- `lib/features/onboarding/onboarding_flow.dart` - Complete 3-screen onboarding flow implementation

### Modified
- `lib/features/onboarding/onboarding_page.dart` - Simplified to wrap `OnboardingFlow`

## Architecture

### Main Flow Component
- **OnboardingFlow** (ConsumerStatefulWidget)
  - Manages 3-screen PageView navigation
  - Handles state for manual mode vs Google connection
  - Manages user input for booking value, slot duration, working days, and hours
  - Calculates estimated monthly leakage
  - Saves settings and marks onboarding complete

### Screen 1: Hook
- **Headline**: "See what your calendar is hiding"
- **Subtext**: "Socelle analyzes your schedule to find unrealized revenue from open gaps."
- **Primary CTA**: "Connect Google Calendar" (triggers googleConnectionProvider.connect())
- **Secondary CTA**: "I'll estimate manually" (enters manual mode)

### Screen 2: Input
**Two paths:**

1. **Google Connected Path**: 
   - Shows success state with checkmark icon
   - "Google Calendar connected!" message
   - Continue button to Screen 3

2. **Manual Mode Path**:
   - Average booking value input field (dollar format, default $85)
   - Appointment duration picker (30/45/60/90/120 min, default 60)
   - Working days toggles (Mon-Sun, defaults Mon-Fri)
   - Working hours time pickers (default 9 AM - 5 PM)
   - Continue button saves settings → Screen 3

### Screen 3: Revenue Reveal
- Animated counter (TweenAnimationBuilder-like, 1.2s duration, easeOutCubic curve)
- Counter animates from $0 to calculated estimated monthly leakage
- Text: "in unrealized revenue hiding in your calendar"
- Primary CTA: "Start recovering" (completes onboarding, navigates to AppShell)

## Revenue Calculation Formula
```
estimatedMonthly = avgBookingValue * 
                   (totalWorkingHoursPerWeek / slotDurationMinutes) * 
                   0.15 * 
                   4.3
```
- 15% gap rate assumption
- 4.3 weeks per month
- Automatically adjusts based on enabled working days and hours

## State Management
- Uses Riverpod ConsumerStatefulWidget
- Watches `googleConnectionProvider` for connection status
- Reads `settingsStorageProvider` for persistence
- Invalidates `userSettingsProvider` and `onboardingCompleteProvider` after completion

## Design Compliance
- **Background**: SocelleColors.background (#F5F3F0)
- **Text**: SocelleColors.ink (#1A1714) for primary
- **Accent**: SocelleColors.accent (deep green) for highlights
- **Leakage Color**: SocelleColors.leakage (terracotta) for revenue numbers
- **Font**: Inter (via theme)
- **Tone**: Calm, editorial, financial
- **No gradients** (except removed from old code)
- **No bright blues or neon**
- **No bounce/confetti animations**
- **Properly formatted headers** (not all caps)

## Component Breakdown

### Input Components
1. **_DollarInput** - TextInput for average booking value with $ prefix
2. **_DurationPicker** - FilterChip selector for appointment lengths
3. **_WorkingDayToggles** - Day toggles (Mon-Sun) for working days
4. **_WorkingHoursSelector** - Time pickers for start/end times

### Screen Components
1. **_Screen1Hook** - Initial hook screen
2. **_Screen2Input** - Input form or Google success state
3. **_GoogleSuccessState** - Success state for Google connection
4. **_Screen3RevenueReveal** - Animated revenue reveal with CTA

## Navigation Flow
```
Screen 1 (Hook)
  ├── "Connect Google" → [Processing] → Google OAuth → Screen 2 (Success) → Screen 3
  └── "Manual Mode" → Screen 2 (Form) → [Fill Form] → Screen 3

Screen 3 (Revenue Reveal)
  └── "Start Recovering" → [Saving Settings] → AppShell
```

## Settings Persistence
- All data is saved to storage via `settingsStorageProvider`
- `setOnboardingComplete()` is called before navigation
- Providers are invalidated to refresh app state
- NavigationProvider updates to reflect completion

## Key Features
✓ Responsive design with proper spacing
✓ Loading states for async operations
✓ Error handling with snackbars
✓ Proper back navigation with disable during processing
✓ Working hours calculation via WorkingDay.totalMinutes
✓ Automatic time formatting to HH:MM
✓ Animated counter with proper formatting
✓ Google OAuth integration
✓ Settings validation and serialization
