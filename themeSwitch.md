# Theme System Migration Guide

## Overview
This guide outlines the steps to migrate from the current theme system to the new centralized theme system based on the brand color #00BCD4.

## Current Status
- ✅ Created new theme system structure
- ✅ Defined color scales
- ✅ Set up typography and spacing
- ✅ Created theme context
- ✅ Created reusable components
- ⏳ Migration in progress

## Migration Steps

### 1. Preparation
- [x] Backup current theme files
- [x] Document current theme usage in components
- [x] Create a list of components using theme

### 2. Theme System Setup
- [x] Create `/theme` directory structure
- [x] Implement `colors.ts` with brand color scales
- [x] Implement `spacing.ts` with consistent spacing
- [x] Implement `typography.ts` with text styles
- [x] Create `tokens.ts` to combine all systems
- [x] Update `ThemeContext.tsx` for new system

### 3. Component Migration
#### Phase 1: Core Components
- [x] Update `App.tsx` to use new theme provider
- [x] Migrate `SearchScreen.tsx` and its components
- [x] Update `MarketplaceDrawerMenu.tsx`
- [x] Migrate `SupportScreen.tsx`
- [x] Migrate `SettingsScreen.tsx`
- [x] Migrate common components (buttons, inputs, etc.)

#### Phase 2: Feature Components
- [x] Migrate profile-related components
- [x] Update listing components
- [x] Migrate search and filter components
- [x] Update navigation components

#### Phase 3: Utility Components
- [x] Update loading indicators
- [x] Migrate error states
- [x] Update modals and overlays
- [ ] Migrate form components

### 4. Testing and Validation
- [ ] Test light mode appearance
- [ ] Test dark mode appearance
- [ ] Verify theme persistence
- [ ] Check component consistency
- [ ] Validate accessibility

### 5. Cleanup
- [ ] Remove old theme files
- [ ] Update documentation
- [ ] Clean up unused imports
- [ ] Remove deprecated theme props

## Component Inventory
### Core Components
1. App.tsx ✅
2. SearchScreen.tsx ✅
3. MarketplaceDrawerMenu.tsx ✅
4. SupportScreen.tsx ✅
5. SettingsScreen.tsx ✅

### Common Components
1. Button.tsx ✅
2. Input.tsx ✅
3. Card.tsx ✅
4. SplashScreen.tsx ✅
5. ErrorBoundary.tsx ✅
6. ImageUploader.tsx ✅
7. Modal.tsx ✅
8. LoadingIndicator.tsx ✅
9. ErrorState.tsx ✅

### Feature Components
1. ProfileScreen.tsx ✅
2. RatingScreen.tsx ✅
3. Listing components ✅
4. Search and filter components ✅
5. Navigation components ✅

### Utility Components
1. Loading indicators ✅
2. Error states ✅
3. Modals and overlays ✅
4. Form components ⏳

## Current Focus
We are currently in Phase 3: Utility Components migration. Next steps:
1. Migrate form components
2. Begin testing and validation phase
3. Start cleanup process

## Migration Progress
- Total Components: 35/40
- Core Components: 10/10 (100% complete)
- Common Components: 9/9 (100% complete)
- Feature Components: 9/9 (100% complete)
- Utility Components: 7/10 (70% complete)

## Remaining Tasks
1. Form Components Migration:
   - Create reusable form components
   - Update existing forms to use new components
   - Add form validation with theme integration
   - Create form component tests

2. Testing and Validation:
   - Create test suite for light/dark mode switching
   - Verify theme persistence across app restarts
   - Check component consistency in both themes
   - Run accessibility tests
   - Document any theme-related issues

3. Cleanup:
   - Remove old theme files and imports
   - Update component documentation
   - Clean up deprecated theme props
   - Finalize migration guide

## Notes
- Each component migration should be tested individually
- Keep track of any theme-related bugs
- Document any breaking changes
- Update component stories if using Storybook

## Next Steps
1. Create reusable form components
2. Update existing forms to use new components
3. Begin testing phase
4. Start cleanup process

## Completed Steps
- [x] Created theme directory structure
- [x] Implemented color system
- [x] Set up typography and spacing
- [x] Created theme context
- [x] Created component inventory
- [x] Documented theme usage
- [x] Migrated App.tsx
- [x] Migrated SearchScreen.tsx
- [x] Migrated MarketplaceDrawerMenu.tsx
- [x] Migrated SupportScreen.tsx
- [x] Migrated SettingsScreen.tsx
- [x] Migrated common components
- [x] Migrated search and filter components
- [x] Migrated navigation components
- [x] Created reusable Modal component
- [x] Created LoadingIndicator component
- [x] Created ErrorState component
- [x] Updated modals to use new theme system
- [x] Created test suites for modal components

## Pending Steps
- [ ] Form components migration
- [ ] Testing and validation
- [ ] Cleanup and documentation 