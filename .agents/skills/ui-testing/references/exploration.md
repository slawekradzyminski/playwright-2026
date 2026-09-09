## Viewports

These viewport checks apply to exploration only. Automated functional UI tests run once on the configured desktop viewport. Do not multiply functional scenarios across mobile/tablet/desktop sizes or override individual functional tests to mobile sizes.

Use these defaults for each distinct page/layout in scope. Dimensions are browser viewport width × height in CSS pixels, not physical screen resolutions.

| View | Viewport | Purpose |
| --- | --- | --- |
| Mobile width | 360 × 800 | Narrow layout, wrapping and navigation |
| Tablet width | 768 × 1024 | Intermediate layout and column transitions |
| Desktop | 1440 × 900 | Wide layout and content alignment |

These are practical sampling choices, not a market-share ranking or a device support guarantee. Current [web.dev guidance](https://web.dev/articles/responsive-web-design-basics) recommends choosing breakpoints from content. Check immediately below and above relevant layout transitions observed in the UI or frontend CSS. Add widths such as 320px, landscape orientation or another browser when the feature, a finding or known audience needs them; record additions and coverage gaps.

Resizing checks responsive layout. For touch, mobile viewport metadata or mobile-specific behavior, also use an appropriate device/mobile context and record its actual settings. [Playwright emulation](https://playwright.dev/docs/emulation) distinguishes viewport, user agent, device scale factor, mobile mode and touch settings. A resized desktop browser does not establish real-device or Safari coverage.
## Explore, capture and inspect

1. Establish the feature's expected behavior from available requirements and application context. Note assumptions. Prepare disposable data through the existing API clients when needed.
2. Explore the initial view and relevant states: validation and server errors, success feedback, menus/dialogs, loading or empty content, and long content where applicable. Capture meaningful visual changes rather than every click. Check the initial layout and primary interaction at all three default widths; check additional states at widths where wrapping, layout or interaction could change. Record what was actually covered.
3. Before capturing a stable state, wait for the intended UI, fonts and images to render and finite entrance animations to finish. If a capture catches an animation accidentally, retain and label it as transient, then capture the settled state. Capture transient states deliberately while visible. Do not hide or restyle suspicious content to make the screenshot look correct.
4. Capture the viewport first. Scroll through longer pages and capture relevant lower sections; add a full-page image or component crop when useful. Preserve surrounding context for suspected overlaps, clipped dialogs or fixed elements.
5. Open and visually inspect every saved screenshot with the available image-viewing tool. File existence, an accessibility snapshot or a successful click does not count as image review. Inspect full-page images at readable scale or in sections. Record a result for each image; leave images that could not be inspected explicitly pending.
6. Investigate suspected problems in the browser: reproduce them, inspect the DOM/layout, try a nearby width and consult requirements. Distinguish a usability defect from a subjective design preference. Report findings using [evidence and triage](evidence-and-bugs.md), then automate verified behavior. Continue independent work while a visual question remains unresolved.

During image review, check clipped or overlapping text, wrapping, unexpected horizontal overflow, alignment and spacing consistency, missing images/icons, readable feedback, dialogs and overlays, navigation and visible focus states where exercised. Support precise geometry or contrast claims with DOM measurements or an appropriate tool. A screenshot alone cannot establish keyboard behavior, exact contrast compliance or complete accessibility.
