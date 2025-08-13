## A Fontonic - Firefox Android Edition

A font customization extension optimized for Firefox on Android devices, including eink tablets.

## Features

- **Quick Font Application**: Apply favorite serif (Merriweather 16 400) and sans-serif (Rubik 17 400) fonts with one-click buttons
- **Late Hydration Support**: Robust font application that works on modern SPAs and dynamically loaded content
- **Performance Optimizations**: Automatically detects and optimizes for low-performance devices including eink tablets

## Performance Features

### Late Hydration Handling
The extension now handles websites with late hydration (like modern React/Next.js sites) through:

- **Progressive Delay Application**: Fonts are applied at strategic intervals (0ms, 100ms, 500ms, 1s, 2s, 3s) to catch different hydration phases
- **MutationObserver**: Automatically reapplies fonts when new content is dynamically loaded
- **Multiple DOM Ready Listeners**: Listens to various DOM loading states to ensure fonts apply correctly

### Device-Specific Optimizations
The extension automatically detects device performance and optimizes accordingly:

#### High-Performance Devices
- Full progressive delay sequence (6 applications)
- 200ms mutation debounce delay
- Deep DOM tree monitoring
- Complete event listener suite

#### Low-Performance Devices (eink tablets, etc.)
- Reduced progressive delays (3 applications: 0ms, 1s, 3s)
- 1000ms mutation debounce delay (5x longer)
- Shallow DOM monitoring only
- Simplified event listeners
- Higher content threshold for triggering font reapplication

#### Detection Criteria
Low-performance mode activates when:
- Performance timing test > 20ms (cached for 30 days)

The extension runs a 50-iteration DOM manipulation test to measure device performance. Results are cached for 30 days. Users can reset the test via Settings > "Reset performance test" to force a retest.

This ensures optimal performance on devices like:
- xppen Magic Note Pad
- ONYX BOOX Note Air 3C  
- Other eink tablets and low-end Android devices

## Report or Request

Report unsupported websites here: https://forms.gle/3eqT9NU3mGHNjtyD8

Request fonts by <a href="mailto:amkhrjee@gmail.com">mailing</a> me.

## Resources for development

Firefox for Android Add-on documentaion: https://extensionworkshop.com/documentation/develop/developing-extensions-for-firefox-for-android/

How to SSH into your Android device using Termux: https://joeprevite.com/ssh-termux-from-computer/

