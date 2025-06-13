# YiZ Planner - Complete AI-Powered Design Guide
**Production-Quality Mobile App Design Using AI Tools**

*Version 2.0 | Updated June 13, 2025 | For Design & Frontend Teams*

---

## 🎯 Executive Summary

This guide provides a complete AI-assisted workflow to create production-quality mobile app designs that rival top-tier applications like Duolingo, Notion, and Apple Fitness. We'll leverage cutting-edge AI tools to move from concept to high-fidelity prototype in days, not weeks.

**Target Aesthetic:** Sleek, calming, production-ready with smooth microinteractions  
**Timeline:** 5-7 days from concept to interactive prototype  
**Output:** Complete design system + interactive Figma prototype ready for development

---

## 🏗️ Design Philosophy: The Four Pillars

### 1. **Calm Intelligence**
- Soft, muted color palettes that reduce cognitive load
- Generous white space and breathing room
- Smooth, purposeful animations that feel natural

### 2. **Intuitive Clarity** 
- Clear visual hierarchy with consistent spacing (8px grid system)
- Skills vs Habits distinction through color coding and iconography
- Progressive disclosure - show what's needed, when it's needed

### 3. **Joyful Celebration**
- Duolingo-inspired streak celebrations
- Apple Fitness-style progress rings
- Satisfying microinteractions for task completion

### 4. **Production Polish**
- Pixel-perfect alignment and consistency
- Accessibility-first approach (WCAG 2.1 AA compliance)
- Native iOS/Android design language adherence

---

## 🛠️ AI Tool Arsenal - Complete Breakdown

### **Tier 1: Primary Design Generation**

| Tool | Best For | Pricing | Strengths | Limitations |
|------|---------|---------|-----------|-------------|
| **Galileo AI** | High-fidelity UI screens | $19/mo | • Production-quality outputs<br>• Figma integration<br>• Component-aware generation | • Limited style customization<br>• Requires specific prompting |
| **Uizard** | Wireframe to hi-fi conversion | $12/mo | • Hand-sketch recognition<br>• Real-time collaboration<br>• Template library | • Less refined outputs<br>• Limited animation support |
| **Relume** | AI sitemap + wireframes | $38/mo | • Content-aware layouts<br>• Component libraries<br>• Webflow integration | • Web-focused<br>• Mobile adaptation needed |

### **Tier 2: Visual Assets & Inspiration**

| Tool | Purpose | Best Prompting Strategy |
|------|---------|------------------------|
| **Midjourney v6** | Mood boards, color exploration | Use `--style raw --ar 16:9` for UI inspiration |
| **DALL-E 3** | Custom icons, illustrations | Specify `flat design icon, minimal, single color` |
| **Figma AI** | Component generation within Figma | Natural language: "Create a card component with..." |

### **Tier 3: Specialized Tools**

| Tool | Specific Use Case | Integration |
|------|------------------|-------------|
| **Framer AI** | Interactive prototypes with code | Direct export to React components |
| **Khroma** | AI color palette generation | Export directly to Figma/CSS |
| **Fontjoy** | AI font pairing | Web font integration |

---

## 📋 Complete Design Process: 7-Phase Workflow

### **Phase 1: Foundation & Research (Day 1)**

#### **Step 1.1: Competitive Analysis with AI**
Use ChatGPT/Claude to analyze top apps:

```
Analyze the UI/UX design patterns of Duolingo, Apple Fitness, and Notion. 
Focus on:
1. Color psychology and accessibility
2. Information architecture
3. Microinteraction patterns
4. Onboarding flows
5. Progress visualization methods

Provide specific design recommendations for a habit/skill tracking app.
```

#### **Step 1.2: AI-Generated Mood Board**
**Midjourney Prompt Collection:**

```
// Prompt 1: Overall Aesthetic
calm productivity app interface, digital zen garden aesthetic, 
learning and growth theme, muted teal and soft lavender palette, 
minimalist design, organic shapes, --ar 16:9 --style raw --v 6

// Prompt 2: Color Exploration  
mobile app color palette, productivity and wellness theme, 
soft teal primary, lavender secondary, warm sand accent, 
high contrast for accessibility, modern gradient examples --ar 3:2

// Prompt 3: Icon Style Direction
minimalist app icons, learning and habit themes, 
thin line style, consistent stroke weight, 
brain, calendar, progress, achievement icons --ar 1:1 --style raw
```

#### **Step 1.3: Design System Foundation**
Extract and document:
- **Primary Colors:** Muted Teal (#4A9B8E), Soft Lavender (#B8A9D9), Warm Sand (#F5E6D3)
- **Typography:** Inter or SF Pro (iOS) / Roboto (Android)
- **Spacing System:** 8px base grid (8, 16, 24, 32, 40px)
- **Border Radius:** 12px (cards), 8px (buttons), 20px (pills)

---

### **Phase 2: Information Architecture (Day 1-2)**

#### **Step 2.1: AI-Assisted User Flow Mapping**
**ChatGPT/Claude Prompt:**

```
Create a detailed user flow map for YiZ Planner app with these key features:
1. Onboarding (goal setting, preferences)
2. Dashboard (unified view of skills & habits)
3. Skill creation & management (30-day programs)
4. Habit tracking & streaks
5. Progress analytics
6. Settings & profile

For each flow, specify:
- Entry points
- Decision points
- Success/error states
- Navigation patterns

Format as a hierarchical outline with screen names and transitions.
```

#### **Step 2.2: Content Strategy**
Define microcopy, button labels, and error messages with AI assistance.

---

### **Phase 3: Core Screen Generation (Day 2-3)**

#### **Step 3.1: Dashboard - The Heart of the App**

**Galileo AI Master Prompt:**

```
Design an iOS mobile app dashboard screen for "YiZ Planner" - a learning and habit tracking app.

AESTHETIC REQUIREMENTS:
- Style: Sleek, calming, production-quality (Duolingo + Apple Fitness inspiration)
- Colors: Muted teal (#4A9B8E), soft lavender (#B8A9D9), warm sand (#F5E6D3)
- Typography: SF Pro Display/Text, clean hierarchy
- Layout: iOS-native, safe area aware, 375x812px (iPhone 13 mini)

LAYOUT STRUCTURE:
Header Section:
- Dynamic greeting "Good morning, Sarah" (left-aligned)
- Streak counter "🔥 12 days" (top-right)
- Profile avatar (circular, 32px, top-right corner)

Today's Focus Card (Primary):
- Large card with subtle shadow and rounded corners (16px)
- Combined progress ring (similar to Apple Fitness rings)
- Inner text: "4/6 Today's Goals" with completion percentage
- Subtle gradient background (teal to lavender)

Active Skills Section:
- Horizontal scrolling carousel
- Each skill card shows: title, progress bar, "Day X/30" indicator
- Cards have distinct visual treatment (slightly elevated)
- "View All" button at the end

Today's Habits Section:
- Vertical list, max 4 visible items
- Each habit row: icon + name + large check circle (tap target)
- Completed habits show green checkmark with subtle animation state
- "See All Habits" link at bottom

Floating Action Button:
- Teal gradient, 56px diameter
- Plus icon, subtle shadow
- Bottom-right positioning with proper margin

INTERACTION STATES:
- Show hover/pressed states for all interactive elements
- Indicate disabled states where applicable
- Include loading state for progress elements

OUTPUT FORMAT: High-fidelity mockup suitable for developer handoff
```

#### **Step 3.2: Skill Detail Screen**

**Galileo AI Prompt:**

```
Design an iOS skill detail screen for YiZ Planner app.

CONTEXT: User has tapped on "Master Python" skill from dashboard.

SCREEN STRUCTURE:
Navigation Bar:
- Back arrow (left)
- "Master Python" title (center)
- More options menu (right, optional)

Progress Hero Section:
- Large progress visualization (circular or linear)
- "Day 12 of 30" prominently displayed
- Completion percentage (40%)
- "Next milestone in 3 days" subtitle

Daily Curriculum:
- Scrollable timeline/list view
- Each day is a card with different states:
  * Completed days: Checkmark, muted colors, collapsed
  * Current day: Highlighted border, expanded showing today's tasks
  * Future days: Locked icon, greyed out
- Today's tasks shown as interactive checklist

Action Buttons:
- Primary: "Continue Today's Lesson" (full-width, teal)
- Secondary: "Mark Day Complete" (outline style)

VISUAL HIERARCHY:
- Clear distinction between completed, current, and future content
- Use color, iconography, and typography to guide attention
- Maintain consistency with dashboard design language

Include proper iOS navigation patterns and safe area handling.
```

#### **Step 3.3: Habit Tracking Screen**

**Galileo AI Prompt:**

```
Design an iOS habit detail screen for YiZ Planner app.

CONTEXT: Habit "Daily Meditation" - user wants to see progress and mark today complete.

LAYOUT DESIGN:
Header:
- Back navigation + "Daily Meditation" title
- Category icon (meditation/wellness themed)

Streak Visualization:
- Large flame icon with current streak number "🔥 42"
- "Longest streak: 68 days" as secondary info
- Achievement badges for milestones (7, 30, 100 days)

Calendar Heat Map:
- Monthly grid view (current month)
- Completed days: Solid teal circles
- Missed days: Empty circles
- Today: Outlined circle (pending)
- Previous/next month navigation

Quick Stats Cards:
- Success rate this month: "92%"
- Total completions: "127 days"
- Average weekly streak: "6.2 days"

Primary Action:
- Large "Mark Complete for Today" button
- Success state: "Great job! Day 43 🎉"
- Include confetti animation mockup

Monthly Navigation:
- Swipeable month selector
- Year overview option

MICROINTERACTIONS TO SHOW:
- Button press states
- Success celebration moment
- Streak counter animation
- Calendar day selection feedback

Ensure accessibility with proper contrast and touch targets (44px minimum).
```

---

### **Phase 4: User Flow Screens (Day 3-4)**

#### **Step 4.1: Onboarding Flow**

**Galileo AI Sequence Prompts:**

```
// Screen 1: Welcome
Create an iOS onboarding welcome screen for YiZ Planner.
- Hero illustration (AI-generated or placeholder)
- "Welcome to YiZ Planner" headline
- "Your AI-powered learning companion" subtitle  
- "Get Started" primary button
- "I already have an account" text link
- Follow iOS onboarding best practices

// Screen 2: Goal Setting
Create goal selection screen for YiZ Planner onboarding.
- "What would you like to focus on?" headline
- Grid of selectable categories (6-8 options):
  * Technology & Programming
  * Languages & Communication  
  * Health & Fitness
  * Creative Arts
  * Business & Finance
  * Personal Development
- Multi-select with visual feedback
- Progress indicator (2/4)
- Continue button (enabled when ≥1 selected)

// Screen 3: Learning Style
Create learning preference screen.
- "How do you prefer to learn?" title
- Three large option cards:
  * "Structured Programs" (30-day skill paths)
  * "Flexible Habits" (daily consistency building)
  * "Mixed Approach" (both skills and habits)
- Single selection required
- Each card shows brief description and icon
- Progress indicator (3/4)

// Screen 4: Permissions
Create permissions request screen.
- Friendly explanation of what's needed
- Notification permission (with preview)
- Optional: Calendar integration
- "Enable Notifications" primary button
- "Maybe Later" secondary option
- Progress indicator (4/4)
```

#### **Step 4.2: Content Creation Flows**

**Skill Creation Wizard:**
```
Design a multi-step skill creation flow for YiZ Planner:

Step 1 - Skill Input:
- "What skill would you like to master?" text input
- AI suggestion chips below input field
- "Generate 30-Day Plan" primary button
- Examples: "Learn Python", "Master Photography", "Spanish Fluency"

Step 2 - AI Plan Preview:
- "Your personalized 30-day plan" title
- Scrollable curriculum preview (Week 1, 2, 3, 4 breakdown)
- Difficulty level indicator
- Time commitment estimate
- "Customize Plan" and "Start Learning" options

Step 3 - Customization:
- Difficulty adjustment slider
- Daily time commitment (15min, 30min, 1hr, 2hr)
- Learning schedule (weekdays only, daily, custom)
- "Create My Plan" confirmation button

Use native iOS patterns with clear progress indication.
```

---

### **Phase 5: Figma Integration & Polish (Day 4-5)**

#### **Step 5.1: Import and Organize**
1. Create Figma project structure:
   ```
   📁 YiZ Planner Design System
   ├── 🎨 Style Guide (colors, typography, spacing)
   ├── 🧩 Components (buttons, cards, inputs)
   ├── 📱 Screens (all generated screens)
   ├── 🔄 User Flows (connected prototypes)
   └── 📋 Documentation (handoff specs)
   ```

#### **Step 5.2: Component System Creation**
**Use Figma AI to generate components:**

```
// Button Component
Create a button component system with these variants:
- Size: Small (32px), Medium (44px), Large (56px)
- Type: Primary (teal gradient), Secondary (outline), Tertiary (text only)
- State: Default, Hover, Pressed, Disabled
- Include proper touch targets and accessibility labels
```

#### **Step 5.3: Design System Documentation**
Create comprehensive style guide including:
- Color system with accessibility ratios
- Typography scale with line heights
- Icon library with consistent stroke weights
- Spacing and layout grid system
- Animation and interaction guidelines

---

### **Phase 6: Microinteraction Design (Day 5-6)**

#### **Step 6.1: Define Core Interactions**

**Interaction 1: Task Completion Animation**
```
Figma Smart Animate Sequence:
Frame 1: Empty circle (stroke only)
Frame 2: Circle shrinks 90% scale, 100ms
Frame 3: Circle expands 110% scale, fills with teal, 200ms
Frame 4: Checkmark draws in, returns to 100% scale, 150ms
Frame 5: Subtle particle burst effect, 300ms fade

Total duration: ~650ms
Easing: Ease-out for natural feel
```

**Interaction 2: Progress Ring Animation**
```
Animated Progress Ring:
- SVG-based circular progress
- Animates from current % to new %
- Duration: 800ms ease-out
- Color transition: Grey → Teal gradient
- Include percentage counter animation
```

**Interaction 3: Streak Celebration**
```
Streak Update Animation:
1. Flame icon pulses (scale 1.0 → 1.3 → 1.0)
2. Number rolls up like slot machine
3. Particle effects burst from flame
4. Success haptic feedback (to document for dev)
5. Optional: Screen edge glow effect

Inspiration: Duolingo streak celebrations
```

#### **Step 6.2: Loading and Feedback States**
Design comprehensive state system:
- Loading skeletons for content areas
- Empty states with helpful illustrations
- Error states with clear recovery actions
- Success confirmations with visual feedback

---

### **Phase 7: Prototyping & Documentation (Day 6-7)**

#### **Step 7.1: Interactive Prototype Creation**
Build in Figma with:
- Complete user flows (onboarding → dashboard → detail screens)
- Realistic transitions using Smart Animate
- Gesture-based interactions (swipes, long presses)
- Multiple device size support (iPhone 13 mini, Pro, Pro Max)

#### **Step 7.2: Developer Handoff Package**
Create comprehensive handoff documentation:

```markdown
## YiZ Planner - Developer Handoff Specification

### Design Tokens
- Export all colors as HEX/RGB/HSL values
- Typography scale with exact font weights and sizes
- Spacing values as rem/px conversions
- Animation timing functions and durations

### Component Specifications  
- Complete prop definitions for each component
- All interaction states documented
- Responsive behavior guidelines
- Accessibility requirements (ARIA labels, focus management)

### Animation Guidelines
- Specific easing curves (cubic-bezier values)
- Duration recommendations for different interaction types
- Performance considerations (60fps targets)
- Reduced motion alternatives

### Platform-Specific Notes
- iOS: Native navigation patterns, SF Symbols usage
- Android: Material Design 3 adaptations
- Accessibility: Screen reader compatibility, color contrast ratios
```

---

## 🎛️ Advanced AI Prompting Techniques

### **The Perfect Galileo AI Prompt Structure**
```
[CONTEXT] + [AESTHETIC REQUIREMENTS] + [LAYOUT STRUCTURE] + [INTERACTION STATES] + [OUTPUT FORMAT]

Example Context: "Design an iOS settings screen for YiZ Planner app"
Aesthetic: "Production-quality, calm aesthetic, muted teal theme"
Layout: "Header + grouped settings list + logout button"
States: "Show toggle states, navigation arrows, destructive actions"
Output: "High-fidelity mockup ready for development handoff"
```

### **Effective Follow-up Prompting**
```
// Refinement prompts
"Make the text hierarchy more prominent using SF Pro font weights"
"Increase the contrast ratio for accessibility compliance"
"Add more breathing room between sections using 24px spacing"
"Show the pressed state for the primary button"
```

---

## 🚀 Pro Tips for Production Quality

### **1. Consistency Checklist**
- [ ] All spacing follows 8px grid system
- [ ] Color usage is consistent across screens
- [ ] Typography hierarchy is clear and scalable
- [ ] Touch targets meet 44px minimum requirement
- [ ] Loading states are designed for all dynamic content

### **2. Accessibility Integration**
- [ ] Color contrast ratios meet WCAG 2.1 AA standards
- [ ] All interactive elements have proper focus states
- [ ] Text scales appropriately for dynamic type
- [ ] Alternative text provided for all images/icons
- [ ] Reduced motion alternatives considered

### **3. Platform Optimization**
**iOS Specific:**
- Use SF Symbols for system icons
- Follow iOS navigation patterns
- Implement proper safe area handling
- Consider Dark Mode variants

**Android Specific:**
- Material Design 3 color system
- Adaptive icons for app launcher
- Navigation drawer vs tab bar decisions
- Handle different screen densities

---

## 📊 Success Metrics & Validation

### **Design Quality Benchmarks**
- **Visual Polish:** Compare against Duolingo/Apple Fitness screenshots
- **Usability:** 5-second tests for key task completion
- **Accessibility:** Automated accessibility audits (axe-core)
- **Performance:** Interaction response times under 100ms

### **AI Tool ROI Tracking**
- Time saved vs traditional design methods
- Iteration speed improvements
- Design consistency scores
- Developer handoff efficiency

---

## 🔧 Troubleshooting Common AI Design Issues

### **Problem: Generated UI looks generic**
**Solution:** Add specific brand personality descriptors
```
Instead of: "modern app design"
Use: "calm, zen-garden inspired interface with organic curves and breathing room"
```

### **Problem: Inconsistent spacing/sizing**  
**Solution:** Always specify exact measurements
```
"Use 16px padding, 8px border radius, 44px touch targets"
```

### **Problem: Poor accessibility**
**Solution:** Include accessibility requirements in every prompt
```
"Ensure WCAG 2.1 AA compliance with 4.5:1 contrast ratios"
```

---

## 📚 Additional Resources

### **Recommended Reading**
- Apple Human Interface Guidelines
- Material Design 3 Specification  
- Inclusive Design Principles
- Animation principles for mobile interfaces

### **Design Inspiration Sources**
- Mobbin (mobile design patterns)
- Page Flows (user flow examples)  
- UI Movement (microinteraction inspiration)
- Apple Design Awards winners

### **AI Prompting Communities**
- r/PromptEngineering
- AI Design Tools Discord servers
- Figma AI Beta user groups

---

*This guide is designed to be a living document. Update it as new AI tools emerge and design patterns evolve. The goal is always production-quality results that users love and developers can efficiently implement.*