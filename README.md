# Dawaya

A multilingual, offline-first medication reminder and adherence tracker built for elderly users, chronically-ill patients, and the family members who help manage their care.

## Why this project exists

Most medication reminder apps are English-only, text-heavy, and assume the person using them is comfortable navigating a modern app UI. That excludes a huge population: elderly people, low-literacy users, and anyone whose daily language is spoken — like Moroccan Darija — rather than a language with strong app-store support.

Dawaya is built around three ideas:

- **Darija, French, and English**, switchable at runtime — not bolted on as an afterthought.
- **Icons, color, and audio before text.** The patient-facing flow is designed so someone can use it without reading fluently in any language.
- **Fully offline, fully local.** No account, no cloud sync, no server dependency for the core reminder loop. Medication data is treated as sensitive by default.

## Who it's for

- **Elderly patients** who may have low digital literacy or limited reading fluency, and for whom Darija is a spoken but not necessarily written language.
- **Chronically-ill patients of any age** managing multiple medications on different schedules.
- **Caregivers and family members** who set up the schedule and want visibility into adherence, especially when not physically present.

## MVP feature set

- [ ] Add a medication — name, dosage, schedule, optional photo for visual identification.
- [ ] Reliable local, offline notifications at scheduled times.
- [ ] One-tap **Taken / Skipped / Snooze** response to a reminder.
- [ ] A visual adherence view (calendar with colored dots — not a data table).
- [ ] Runtime language switcher (Darija / French / English) covering UI and audio prompts.
- [ ] Fully local storage — no account required, nothing synced by default.

## Explicit non-goals for v1

- No drug interaction checking or medical advice of any kind.
- No prescription OCR/scanning.
- No integration with pharmacies, doctors, or health systems.
- No caregiver remote sync or notifications — that's a deliberately separate, opt-in v2 stretch goal. This app should never silently become a surveillance tool for elderly relatives.

## Tech stack

- **React Native + Expo** — TypeScript template.
- **expo-sqlite + Drizzle ORM** for local-first storage.
- **expo-notifications** for scheduled local reminders (dev build required — see notes below).
- **i18next + react-i18next + expo-localization** for runtime language switching.
- **expo-av / expo-audio** for playing pre-recorded reminder prompts and recording caregiver voice notes.

### A note on voice prompts

There's no offline, on-device text-to-speech engine for Darija on iOS or Android. Rather than depend on a cloud TTS API — which would break the offline-first requirement — Dawaya uses **pre-recorded audio clips** for the fixed set of reminder phrases, and lets caregivers **record their own voice** saying the medication name during setup. This keeps everything working with no internet connection, and arguably feels more human anyway.

### A note on Android notification reliability

Starting with Android 12, exact-alarm scheduling requires the `SCHEDULE_EXACT_ALARM` permission, and reminders can silently fail to fire once the device enters Doze mode without it. This project treats reliable delivery as a first-class concern, not an afterthought — see `/docs` (coming soon) for the reliability spike and fallback plan.

## Getting started

```bash
npm install
npx expo start
```

You'll need a physical device or a development build (not just Expo Go) to fully test scheduled notification behavior, especially on Android.

## Project status

🚧 Early development. Not yet ready for real-world use.

## License

MIT — see [LICENSE](./LICENSE).
