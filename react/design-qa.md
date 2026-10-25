# Business tab navigation QA

Reference: the first screenshot supplied on 2026-10-23, showing the staff tabs with a light shared background and white active tab.

Final result: passed.

- Staff and clients were visually compared at desktop width. The selected tab is white with a subtle shadow; other tabs share one light background.
- Business tab bars in staff, clients, products, loyalty, marketing, finance, integrations and profile use the same component and styling. Related tabs inside dialogs, the calendar and POS use the same styling.
- At 320, 375 and 390 px, checked business tab bars stay inside their own horizontal rail without page-wide horizontal overflow. Client tab switching works at mobile width.
- `npm run build` and `npm run lint` pass.
