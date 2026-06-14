# AI Usage Log

## AI Tools Used
- **Antigravity SDK** (Google DeepMind agentic coding assistant) acting as the primary development collaborator.

## Key Prompts Used
1. *"I need you to build a full-stack React and Node.js shared expenses app based on the requirements in this PDF."*
2. *"Aisha wants a simplified view of who owes whom. Implement a greedy algorithm to reduce the number of transactions."*
3. *"The CSV import needs to handle edge cases like USD currency, missing names, and 'Rohan paid Aisha back' as a settlement rather than an expense."*
4. *"Restyle the frontend using Vanilla CSS to match this modern lime-green glassmorphism mockup."*

## 3 Concrete Cases Where AI Produced Something Wrong

### Case 1: Architectural Violation (Single Ledger vs. Groups)
- **What happened:** The AI initially architected a "Single-Ledger MVP" where importing a CSV wiped the entire global database, assuming there was only one friend group.
- **How I caught it:** I realized this completely violated the "Create and manage groups" requirement in the prompt. I pointed out that the app needed to handle multiple, independent friend groups.
- **What changed:** I instructed the AI to refactor the entire database schema to include `Group` and `GroupMember` tables. We completely rewrote the backend logic so CSVs are imported into isolated group contexts rather than globally.

### Case 2: Dummy UI Elements
- **What happened:** While styling the dashboard based on a design mockup, the AI included non-functional placeholder buttons like "Settle Up" and dummy top-navigation links ("Pricing", "About").
- **How I caught it:** I tested the UI and noticed the buttons didn't do anything and cluttered the interface.
- **What changed:** I directed the AI to strip out all non-functional dummy elements and focus strictly on actionable buttons tied to the real, imported CSV data.

### Case 3: Invisible Features due to Hidden State
- **What happened:** The AI implemented Meera's "Duplicate Review Queue", but I couldn't see it on the screen. The AI had built the queue but restricted its visibility purely based on the logged-in user name without adding a way to easily switch users.
- **How I caught it:** I asked the AI why I couldn't see the feature it claimed to have built.
- **What changed:** I realized I needed a clear way to verify the feature, so the AI added clear labels and ensured the login flow allowed me to explicitly log in as Meera to test the review queue.
