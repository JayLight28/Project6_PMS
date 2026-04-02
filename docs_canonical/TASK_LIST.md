# Maritime System Development Checklist

## Phase 1: Foundation & Specs
- [x] Create Detailed System Specification (English)
- [x] Create Detailed Implementation Plan (English)
- [x] Initialize Monorepo (Mother, Child, Shared)
- [/] Refine Database Schema (Integrated SMS + PMS)

## Phase 2: Core Shared Logic
- [ ] Implement Sync Engine (ZIP Delta Export/Import, max 3.5MB limits)
- [ ] Implement Sync Payload Checksums (SHA-256 validation) & ACK Receipt Loop
- [ ] Implement Image Auto-Compression (Client-side)
- [ ] Implement Document Template Engine (Field mapping, filling & Versioning)
- [ ] Implement Digital Signature Overlay Utility

## Phase 3: Mother Program (HQ)
- [ ] HQ Dashboard: Fleet Status, ACK Monitor & Sync Tracker
- [ ] Vessel Registry: Onboarding new ships
- [ ] Global PMS Manager: 100+ standard item definitions
- [ ] Template Center: Form management & PMS-SMS mapping
- [ ] Core Settings: HQ Configures Vessel "Photo Retention Period" (Archive rules)

## Phase 4: Child Program (Vessel)
- [ ] Login: Role-based access (Master/Crew)
- [ ] PMS Scheduler: Dashboard with colored status alerts
- [ ] Linkage Logic: Mandatory SMS fulfillment check
- [ ] Cert Generator: Dual-signature certificate issuance
- [ ] Audit Log: author-only lock & Master 6-digit PIN override prompt
- [ ] Storage Archiver: Weekly worker cleaning up old photos based on HQ rules

## Phase 5: Distribution & Packaging
- [ ] Create Portable Launchers (.bat)
- [ ] Implement File-based Offline Updater (Updater.bat handling email ZIP)
- [ ] Create Final Installer script
