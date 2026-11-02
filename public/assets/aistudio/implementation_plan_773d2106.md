# Chat Context Menu & Personalization Redesign

Transform the input attachment menu into a general-purpose chat context popover with modernized labels ("Files", "Images", "Personalize Chat"), interactive help information badges with clear functional descriptions, native file/image upload handlers, and a side drawer for personalization settings.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were confirmed based on your responses:

- **Confirmed Decision 1 (Description Display)**: Each menu option will feature an interactive help info badge (`ℹ` icon) that smoothly expands on click to reveal a clear, concise description of that button's specific function without cluttering the primary menu items.
- **Confirmed Decision 2 (Personalize Chat Action)**: Clicking "Personalize Chat" opens a dedicated right-hand side drawer to configure user profile details, assistant tone, response length, and custom system instructions.
- **Confirmed Decision 3 (Files & Images Action)**: Clicking "Files" triggers a native document file picker (`.pdf`, `.csv`, `.txt`, `.docx`), while "Images" triggers a native photo picker (`.png`, `.jpg`, `.jpeg`, `.webp`), displaying attached chips directly in the chat composer.

---

## 1. Overview & Core Concept

- **What It Does**: Replaces the financial-specific popup context menu with a clean, versatile attachment & customization popover:
  - **Removed**: The uppercase "ADD FINANCIAL CONTEXT" header is completely removed.
  - **Option 1 ("Files")**: Replaces "Upload Bank Statement" with an updated document icon (`FileText`). Triggers file upload for documents/spreadsheets with an info badge explaining its capability (reading documents, financial tables, raw data, or text files).
  - **Option 2 ("Images")**: Replaces "Sync Investment Portfolio" with an image icon (`Image`). Triggers image picker with an info badge explaining its capability (charts, screenshots, receipts, diagrams).
  - **Option 3 ("Personalize Chat")**: Replaces "Add Monthly Salary Baseline" with a customization/sparkle icon (`SlidersHorizontal` / `UserCog`). Opens a slide-over drawer to customize assistant personality, background context, and conversation presets.
- **Target Audience**: Users interacting with an AI chat workspace needing intuitive document attachment, visual grounding, and customized assistant behavior.
- **Key Value**: Streamlines the composer UI, removes restrictive financial framing, and gives users transparent understanding of each tool's utility through inline contextual help.

---

## 2. User Experience & Visual Design

### Popover Menu Visual Spec
- **Theme & Surface**: Dark theme matching the screenshot (`#131722` / `bg-slate-900/95` with subtle border `border-slate-800`, backdrop blur, and soft shadow).
- **Header**: Clean layout starting immediately with the action items (zero uppercase header clutter).
- **Item Rows**:
  1. **Files**:
     - *Icon*: Blue document icon (`text-sky-400 bg-sky-500/10 p-2 rounded-lg`).
     - *Label*: "Files" (medium weight, crisp white text).
     - *Affordance*: Clean help info badge (`ℹ` icon) on the right edge. When clicked, it expands an inline explanation: *"Upload documents, CSVs, reports, and text files for the assistant to analyze and summarize."*
  2. **Images**:
     - *Icon*: Emerald/cyan photo icon (`text-emerald-400 bg-emerald-500/10 p-2 rounded-lg`).
     - *Label*: "Images" (medium weight, crisp white text).
     - *Affordance*: Info badge expands: *"Attach charts, screenshots, receipts, or mockups for visual analysis and OCR extraction."*
  3. **Personalize Chat**:
     - *Icon*: Purple customization icon (`text-purple-400 bg-purple-500/10 p-2 rounded-lg`).
     - *Label*: "Personalize Chat" (medium weight, crisp white text).
     - *Affordance*: Info badge expands: *"Set custom instructions, preferred tone, output formats, and personal profile context."*

### Side Drawer ("Personalize Chat")
- **Layout**: Right slide-over panel with smooth transition backdrop.
- **Sections**:
  - *Tone & Style Selector*: Concise, balanced, in-depth, or analytical.
  - *User Persona & Background*: Short bio, domain/industry, and role.
  - *Custom Directives*: Persistent textarea for guidelines (e.g. "Always use bullet points", "Explain financial metrics simply").
  - *Active Context Status*: Toggle to enable/disable personalization per conversation.

---

## 3. Key Product Decisions & Trade-Offs

| Decision | Chosen Approach | Rationale |
| :--- | :--- | :--- |
| **Header Removal** | Direct list without "ADD FINANCIAL CONTEXT" header | Minimizes vertical footprint and removes rigid financial domain lock-in. |
| **Description Placement** | Expandable `ℹ` info badge on each row | Keeps the menu compact and scannable for repeat users while offering complete descriptions on demand. |
| **File Picker Invocation** | Hidden `<input type="file">` elements | Standard zero-friction native OS browser file dialogs with filtered MIME types. |
| **Personalization State** | Local state + localStorage sync | Retains user preferences across browser sessions without requiring backend authentication. |

---

## 4. Technical Architecture & Component Structure

```
┌─────────────────────────────────────────────────────────────┐
│                       ChatComposer                          │
│                                                             │
│   ┌──────────┐  [ Message input box... ]      [ Send ➔ ]    │
│   │  (+)     │                                              │
│   └────┬─────┘                                              │
└────────┼────────────────────────────────────────────────────┘
         │ (Toggles popover)
         ▼
┌─────────────────────────────────────────────────────────────┐
│                 AttachmentContextPopover                    │
│                                                             │
│  [📄 Files] ────────────────────────── [ ℹ ] (Expands desc) │
│     └─► Triggers <input accept=".pdf,.csv,.txt,...">        │
│                                                             │
│  [🖼️ Images] ───────────────────────── [ ℹ ] (Expands desc) │
│     └─► Triggers <input accept="image/*">                   │
│                                                             │
│  [⚙️ Personalize Chat] ──────────────── [ ℹ ] (Expands desc) │
│     └─► Opens PersonalizeDrawer                             │
└────────────────────────────────────────┬────────────────────┘
                                         │
                                         ▼
                 ┌────────────────────────────────┐
                 │       PersonalizeDrawer        │
                 │  - Persona & Tone Settings     │
                 │  - Custom Instructions Textarea│
                 │  - Save / Reset Actions        │
                 └────────────────────────────────┘
```

---

## 5. Direct Copy-able Prompt

Below is the ready-to-use prompt for making these modifications:

```markdown
Please update the chat context menu popover with the following changes:

1. Remove the "ADD FINANCIAL CONTEXT" header text from the top of the popover menu so the items start directly at the top.
2. Rename the menu items and update their icons:
   - Change "Upload Bank Statement" to "Files" (using a document/file icon).
   - Change "Sync Investment Portfolio" to "Images" (using a photo/image icon).
   - Change "Add Monthly Salary Baseline" to "Personalize Chat" (using a slider/customization icon).
3. Add a clear description of each button's specific function:
   - Next to each item label, provide an expandable help info badge (an "ℹ" icon button) that reveals a clear description when clicked:
     - Files: "Upload documents, CSVs, reports, and text files for the assistant to analyze and summarize."
     - Images: "Attach charts, screenshots, receipts, or mockups for visual analysis and OCR extraction."
     - Personalize Chat: "Set custom instructions, preferred tone, output formats, and personal profile context."
4. Implement the interactive functions:
   - Clicking "Files" opens a native document file picker accepting PDF, CSV, TXT, and DOCX files, displaying attached files as removable chips.
   - Clicking "Images" opens a native photo picker accepting PNG, JPG, and WebP images with a thumbnail preview.
   - Clicking "Personalize Chat" opens a right-side drawer allowing the user to configure custom AI instructions, response tone (e.g. Concise, Balanced, Detailed), and profile background context.
5. Style the popover with a sleek dark slate background, crisp typography, clean hairline borders, and smooth transitions.
```
