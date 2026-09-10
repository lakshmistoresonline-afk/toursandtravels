# Build Fixes and UI Polish

This plan addresses remaining UI tasks after the initial build fixes, specifically ensuring that new routes are accessible via the navigation components.

## Proposed Changes

### [Component Name] front-panel/app/components

#### [MODIFY] [Header.tsx](file:///E:/Tour/rr-tours-app-main/front-panel/app/components/Header/Header.tsx)
- Add "Contact" link to the navigation menu.

#### [MODIFY] [Footer.tsx](file:///E:/Tour/rr-tours-app-main/front-panel/app/components/Footer/Footer.tsx)
- Add "Terms of Usage" link to the Support section.

---

### [Component Name] front-panel/app/routes/Home

#### [MODIFY] [home.tsx](file:///E:/Tour/rr-tours-app-main/front-panel/app/routes/Home/home.tsx)
- Use `Route.ClientLoaderArgs` for the `clientLoader` to ensure proper typing.

## Verification Plan

### Manual Verification
- Verify that the navigation links appear correctly in the Header and Footer.
- Verify that the `home.tsx` file passes static analysis.
