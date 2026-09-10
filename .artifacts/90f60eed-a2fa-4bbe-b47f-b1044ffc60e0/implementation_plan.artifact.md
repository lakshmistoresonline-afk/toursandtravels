# Build Fixes and Code Quality Improvements

This plan addresses several issues identified in the React Router v7 application, including missing imports, incorrect import paths, and inconsistent loader references.

## User Review Required

> [!IMPORTANT]
> The missing routes for Contact, Privacy Policy, and Terms of Usage will be added to `routes.ts`. Please verify if these should be under a specific layout.

## Proposed Changes

### [Component Name] front-panel/app/routes

#### [MODIFY] [home.tsx](file:///E:/Tour/rr-tours-app-main/front-panel/app/routes/Home/home.tsx)
- Fix incorrect `Route` type import path.

#### [MODIFY] [signup.tsx](file:///E:/Tour/rr-tours-app-main/front-panel/app/routes/Auth/signup.tsx)
- Add missing `Card` component imports from `~/components/ui/card`.

#### [MODIFY] [account-details.tsx](file:///E:/Tour/rr-tours-app-main/front-panel/app/routes/Account/account-details.tsx)
- Change `loader` to `clientLoader` in import from `~/root`.

#### [MODIFY] [routes.ts](file:///E:/Tour/rr-tours-app-main/front-panel/app/routes.ts)
- Add missing routes for `Contact Us`, `Privacy Policy`, and `Terms of Usage`.

---

### [Component Name] front-panel/app/components

#### [MODIFY] [Header.tsx](file:///E:/Tour/rr-tours-app-main/front-panel/app/components/Header/Header.tsx)
- Change `loader` to `clientLoader` in import from `~/root`.

## Verification Plan

### Manual Verification
- Since the build tool (`npm`) is not available in the current environment, I will use `analyze_file` to verify that there are no remaining static analysis errors in the modified files.
- The user can verify by running `npm run build` in their local environment.
