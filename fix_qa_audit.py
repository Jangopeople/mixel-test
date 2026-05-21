#!/usr/bin/env python3
"""
QA Test Case Audit & Fix Script for MIXEL Accounting (mixel-acc)
================================================================
Audits all 132 EN test cases (ACC-001 through ACC-132) in apps.json and fixes:

1. Toast/ephemeral message references - replaced with persistent UI state checks
2. Wrong locale URLs (/de/ in EN section)
3. German text left untranslated in EN section
4. Button/link name mismatches with actual i18n keys
5. Incorrect "where" labels still in German
6. Expected results referencing toast messages

Also applies corresponding fixes to DE section where the same toast issues exist.
"""

import json
import copy
import sys
from pathlib import Path

APPS_JSON = Path(__file__).parent / "apps.json"

# ─── Fix registry ──────────────────────────────────────────────────────────
# Each fix: (test_id, field, description_of_fix)
fixes_applied = []

def log_fix(test_id, field, desc):
    fixes_applied.append((test_id, field, desc))


def fix_en_cases(cases):
    """Apply all fixes to EN test cases. Returns modified list."""
    case_map = {}
    for cat in cases:
        for c in cat.get("cases", []):
            case_map[c["id"]] = c

    # ── ACC-001: button name "Kostenlos testen" is German in EN section
    if "ACC-001" in case_map:
        c = case_map["ACC-001"]
        old = c["steps"]
        c["steps"] = (
            '1. Navigate to https://acc.mixel.ch\n'
            '2. Click on "Start Free" or "Try for Free"\n'
            '3. Enter a valid email address and create a password\n'
            '4. Complete all email verification steps\n'
            '5. Verify you are redirected to the app or an onboarding wizard'
        )
        c["expected"] = "Account created successfully. User is redirected to the app or an onboarding wizard."
        if old != c["steps"]:
            log_fix("ACC-001", "steps", 'Replaced German "Kostenlos testen" with English "Start Free"; removed ephemeral confirmation step')

    # ── ACC-002: button "Anmelden" is German
    if "ACC-002" in case_map:
        c = case_map["ACC-002"]
        old = c["steps"]
        c["steps"] = (
            '1. Navigate to https://acc.mixel.ch\n'
            '2. Click on "Sign In"\n'
            '3. Enter a valid email and password\n'
            '4. Click Sign In / Submit\n'
            '5. Verify the dashboard page loads'
        )
        if old != c["steps"]:
            log_fix("ACC-002", "steps", 'Replaced German "Anmelden" with English "Sign In"')

    # ── ACC-003: German "tor Anmeldeseite", "Anmelden"
    if "ACC-003" in case_map:
        c = case_map["ACC-003"]
        c["steps"] = (
            '1. Navigate to the sign-in page\n'
            '2. Enter an incorrect password for a valid email\n'
            '3. Click Sign In\n'
            '4. Verify an error message is displayed on the page'
        )
        log_fix("ACC-003", "steps", 'Replaced German "tor Anmeldeseite" / "Anmelden" with English equivalents')

    # ── ACC-004: German "tor Anmeldeseite", "Anmelden"
    if "ACC-004" in case_map:
        c = case_map["ACC-004"]
        c["steps"] = (
            '1. Navigate to the sign-in page\n'
            '2. Leave email and password fields empty\n'
            '3. Click Sign In\n'
            '4. Verify required field validation errors are shown on the form'
        )
        log_fix("ACC-004", "steps", 'Replaced German "tor Anmeldeseite" / "Anmelden" with English')

    # ── ACC-005: German text throughout
    if "ACC-005" in case_map:
        c = case_map["ACC-005"]
        c["steps"] = (
            '1. Click "Forgot Password" on the sign-in page\n'
            '2. Enter a valid registered email address\n'
            '3. Click "Send Reset Link"\n'
            '4. Open the reset email and click the link\n'
            '5. Enter a new password and confirm it\n'
            '6. Verify you can sign in with the new password'
        )
        log_fix("ACC-005", "steps", 'Replaced German text with English equivalents')

    # ── ACC-006: Entirely German steps and URL uses /de/
    if "ACC-006" in case_map:
        c = case_map["ACC-006"]
        c["steps"] = (
            '1. Navigate to https://acc.mixel.ch/en/app\n'
            '2. Click the user profile icon in the sidebar\n'
            '3. Click "Sign Out"\n'
            '4. Verify the URL contains "/auth/signin"'
        )
        c["expected"] = "User is signed out and redirected to the sign-in page."
        log_fix("ACC-006", "steps+expected", 'Translated from German to English; changed /de/ to /en/')

    # ── ACC-007: German button names
    if "ACC-007" in case_map:
        c = case_map["ACC-007"]
        c["steps"] = (
            '1. Sign in to the app\n'
            '2. If prompted by an onboarding wizard, click "Create Company"\n'
            '3. Enter the company name (e.g. "Acme Test GmbH")\n'
            '4. Enter company address, country and VAT ID\n'
            '5. Click Save / Next\n'
            '6. Verify the company name appears in the top navigation'
        )
        c["where"] = "Settings > Company Setup"
        log_fix("ACC-007", "steps+where", 'Replaced German "Unternehmen erstellen" / "Speichern/Weiter" with English')

    # ── ACC-008: German "den Unternehmenseinstellungen"
    if "ACC-008" in case_map:
        c = case_map["ACC-008"]
        c["steps"] = (
            '1. Navigate to the company settings page\n'
            '2. Find the logo upload field\n'
            '3. Upload a PNG or JPG image (max recommended size ~500 KB)\n'
            '4. Save the settings\n'
            '5. Verify the logo is displayed on the settings page'
        )
        c["where"] = "Settings > Company Setup"
        log_fix("ACC-008", "steps+where", 'Replaced German "den Unternehmenseinstellungen" with English')

    # ── ACC-009: URL uses /de/, toast message reference "Financial settings saved"
    if "ACC-009" in case_map:
        c = case_map["ACC-009"]
        c["steps"] = (
            '1. Navigate to https://acc.mixel.ch/en/app/settings\n'
            '2. Click the "Financial" tab\n'
            '3. Select "Fiscal Year Start" (e.g. January)\n'
            '4. Select the "Default Currency" (e.g. CHF)\n'
            '5. Click "Save Financial Settings"\n'
            '6. Verify the saved values persist after refreshing the page'
        )
        log_fix("ACC-009", "steps", 'Changed /de/ to /en/; replaced toast verification with persistent state check')

    # ── ACC-010: Entirely German steps, URL /de/, toast reference
    if "ACC-010" in case_map:
        c = case_map["ACC-010"]
        c["steps"] = (
            '1. Navigate to https://acc.mixel.ch/en/app/settings?tab=company\n'
            '2. Enter "Example Ltd" in the "Company Name" field\n'
            '3. Click the "Save Company Profile" button\n'
            '4. Verify the company name is displayed in the settings after save'
        )
        c["expected"] = "Company profile is saved. The company name appears on invoices."
        c["title"] = "Update Company Profile"
        log_fix("ACC-010", "steps+expected+title", 'Translated from German; changed /de/ to /en/; replaced toast with persistent check')

    # ── ACC-011: Entirely German steps, URL /de/, toast reference
    if "ACC-011" in case_map:
        c = case_map["ACC-011"]
        c["steps"] = (
            '1. Navigate to https://acc.mixel.ch/en/app/settings?tab=numbering\n'
            '2. Enter e.g. "INV-" in the Invoice prefix field\n'
            '3. Click "Save Numbering"\n'
            '4. Verify the prefix value persists after saving'
        )
        c["expected"] = "Numbering settings are saved."
        log_fix("ACC-011", "steps+expected", 'Translated from German; changed /de/ to /en/; replaced toast with persistent check')

    # ── ACC-012: Entirely German steps, URL /de/, toast reference
    if "ACC-012" in case_map:
        c = case_map["ACC-012"]
        c["steps"] = (
            '1. Navigate to https://acc.mixel.ch/en/app/settings?tab=numbering\n'
            '2. Scroll to the "Payment Terms" section\n'
            '3. Change the payment term days\n'
            '4. Click "Save Numbering"\n'
            '5. Verify the updated payment term value persists after saving'
        )
        c["expected"] = "Payment terms are saved."
        log_fix("ACC-012", "steps+expected", 'Translated from German; changed /de/ to /en/; replaced toast with persistent check')

    # ── ACC-013: Entirely German steps, URL /de/
    if "ACC-013" in case_map:
        c = case_map["ACC-013"]
        c["steps"] = (
            '1. Navigate to https://acc.mixel.ch/en/app/settings?tab=appearance\n'
            '2. Select a different language from the dropdown\n'
            '3. Click "Save"\n'
            '4. Verify the UI language has changed'
        )
        c["expected"] = "The UI language switches to the selected language."
        log_fix("ACC-013", "steps+expected", 'Translated from German; changed /de/ to /en/')

    # ── ACC-014: Entirely German steps, URL /de/, toast reference
    if "ACC-014" in case_map:
        c = case_map["ACC-014"]
        c["steps"] = (
            '1. Navigate to https://acc.mixel.ch/en/app/settings?tab=email\n'
            '2. Enter a test email address in the sender email field\n'
            '3. Click "Save Settings"\n'
            '4. Verify the email address persists after saving'
        )
        c["expected"] = "Email settings are saved."
        log_fix("ACC-014", "steps+expected", 'Translated from German; changed /de/ to /en/; replaced toast with persistent check')

    # ── ACC-015: Entirely German steps, URL /de/
    if "ACC-015" in case_map:
        c = case_map["ACC-015"]
        c["steps"] = (
            '1. Navigate to https://acc.mixel.ch/en/app/accounting\n'
            '2. Click the "Chart of Accounts" tab\n'
            '3. Verify accounts are displayed in the table\n'
            '4. Verify accounts in the range 1000-9999 are present'
        )
        c["expected"] = "The chart of accounts is displayed with standard accounts."
        log_fix("ACC-015", "steps+expected", 'Translated from German; changed /de/ to /en/')

    # ── ACC-016: URL /de/
    if "ACC-016" in case_map:
        c = case_map["ACC-016"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/accounting", "https://acc.mixel.ch/en/app/accounting")
        log_fix("ACC-016", "steps", 'Changed /de/ to /en/')

    # ── ACC-017: URL /de/
    if "ACC-017" in case_map:
        c = case_map["ACC-017"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/accounting", "https://acc.mixel.ch/en/app/accounting")
        log_fix("ACC-017", "steps", 'Changed /de/ to /en/')

    # ── ACC-018: Wrong steps! Steps describe language switching instead of account deactivation, URL /de/
    if "ACC-018" in case_map:
        c = case_map["ACC-018"]
        c["steps"] = (
            '1. Navigate to https://acc.mixel.ch/en/app/accounting\n'
            '2. Click the "Chart of Accounts" tab\n'
            '3. Find an existing account in the list\n'
            '4. Click the edit icon for the account\n'
            '5. Look for a "Deactivate" or "Archive" option\n'
            '6. Confirm the action\n'
            '7. Verify the account is marked as deactivated/archived'
        )
        c["expected"] = "The account is deactivated and no longer selectable for new entries. It remains visible in historical entries."
        log_fix("ACC-018", "steps+expected", 'CRITICAL: Steps were completely wrong (language switching instead of account deactivation). Rewritten. Changed /de/ to /en/')

    # ── ACC-019: URL /de/
    if "ACC-019" in case_map:
        c = case_map["ACC-019"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/accounting", "https://acc.mixel.ch/en/app/accounting")
        log_fix("ACC-019", "steps", 'Changed /de/ to /en/')

    # ── ACC-020: URL /de/
    if "ACC-020" in case_map:
        c = case_map["ACC-020"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/banking", "https://acc.mixel.ch/en/app/banking")
        log_fix("ACC-020", "steps", 'Changed /de/ to /en/')

    # ── ACC-021: URL /de/
    if "ACC-021" in case_map:
        c = case_map["ACC-021"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/banking", "https://acc.mixel.ch/en/app/banking")
        log_fix("ACC-021", "steps", 'Changed /de/ to /en/')

    # ── ACC-022: URL /de/
    if "ACC-022" in case_map:
        c = case_map["ACC-022"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/banking", "https://acc.mixel.ch/en/app/banking")
        log_fix("ACC-022", "steps", 'Changed /de/ to /en/')

    # ── ACC-023: URL /de/, toast "Account updated"
    if "ACC-023" in case_map:
        c = case_map["ACC-023"]
        c["steps"] = (
            '1. Navigate to https://acc.mixel.ch/en/app/banking\n'
            '2. Click on the bank account to edit\n'
            '3. Click "Edit Account"\n'
            '4. Change the account name or bank name\n'
            '5. Click "Save"\n'
            '6. Verify the updated name appears in the account list'
        )
        c["title"] = "Edit Bank Account Details"
        log_fix("ACC-023", "steps+title", 'Changed /de/ to /en/; replaced toast with persistent check; translated title')

    # ── ACC-024: URL /de/, German title
    if "ACC-024" in case_map:
        c = case_map["ACC-024"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/banking", "https://acc.mixel.ch/en/app/banking")
        c["title"] = "Delete a Bank Account"
        log_fix("ACC-024", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-025: URL /de/, toast "Contact created"
    if "ACC-025" in case_map:
        c = case_map["ACC-025"]
        c["steps"] = (
            '1. Navigate to https://acc.mixel.ch/en/app/contacts\n'
            '2. Click the "New Contact" button\n'
            '3. Select type "Company"\n'
            '4. Enter "Company Name" (e.g. "Example Ltd")\n'
            '5. Enter email and phone\n'
            '6. Enter address (street, zip, city)\n'
            '7. Click "Create"\n'
            '8. Verify the new contact appears in the contact list'
        )
        c["title"] = "Create a New Customer Contact"
        log_fix("ACC-025", "steps+title", 'Changed /de/ to /en/; replaced toast with list verification; translated title')

    # ── ACC-026: URL /de/, toast "Contact created"
    if "ACC-026" in case_map:
        c = case_map["ACC-026"]
        c["steps"] = (
            '1. Navigate to https://acc.mixel.ch/en/app/contacts\n'
            '2. Click the "New Contact" button\n'
            '3. Select type "Company"\n'
            '4. Enter the supplier company name (e.g. "Supplier Ltd")\n'
            '5. Enter email, phone and address\n'
            '6. Click "Create"\n'
            '7. Verify the new supplier contact appears in the contact list'
        )
        c["title"] = "Create a New Supplier Contact"
        log_fix("ACC-026", "steps+title", 'Changed /de/ to /en/; replaced toast with list verification; translated title')

    # ── ACC-027: URL /de/, toast "Contact updated"
    if "ACC-027" in case_map:
        c = case_map["ACC-027"]
        c["steps"] = (
            '1. Navigate to https://acc.mixel.ch/en/app/contacts\n'
            '2. Click on an existing contact in the list\n'
            '3. Click "Edit"\n'
            '4. Update phone number or address\n'
            '5. Click "Save"\n'
            '6. Verify the updated details are visible in the contact list'
        )
        c["title"] = "Edit Contact Details"
        log_fix("ACC-027", "steps+title", 'Changed /de/ to /en/; replaced toast with persistent check; translated title')

    # ── ACC-028: URL /de/, German title
    if "ACC-028" in case_map:
        c = case_map["ACC-028"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/contacts", "https://acc.mixel.ch/en/app/contacts")
        c["title"] = "Add Tags/Categories to Contact"
        log_fix("ACC-028", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-029: URL /de/, German title
    if "ACC-029" in case_map:
        c = case_map["ACC-029"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/contacts", "https://acc.mixel.ch/en/app/contacts")
        c["title"] = "View Revenue per Contact"
        log_fix("ACC-029", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-030: URL /de/, German title
    if "ACC-030" in case_map:
        c = case_map["ACC-030"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/contacts", "https://acc.mixel.ch/en/app/contacts")
        c["title"] = "Import Contacts from CSV"
        log_fix("ACC-030", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-031: URL /de/, German title
    if "ACC-031" in case_map:
        c = case_map["ACC-031"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/settings", "https://acc.mixel.ch/en/app/settings")
        c["title"] = "Export Contacts to Excel"
        log_fix("ACC-031", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-032: URL /de/, German title
    if "ACC-032" in case_map:
        c = case_map["ACC-032"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/contacts", "https://acc.mixel.ch/en/app/contacts")
        c["title"] = "Search and Filter Contacts"
        log_fix("ACC-032", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-033: Good (already uses /en/ URL)
    # No fix needed

    # ── ACC-034: URL /de/, German title
    if "ACC-034" in case_map:
        c = case_map["ACC-034"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/quotes", "https://acc.mixel.ch/en/app/quotes")
        c["title"] = "Apply Discount to a Quote"
        log_fix("ACC-034", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-035: Entirely German steps and expected
    if "ACC-035" in case_map:
        c = case_map["ACC-035"]
        c["steps"] = (
            '1. Open a saved quote\n'
            '2. Click "Download PDF" or "Preview"'
        )
        c["expected"] = "A PDF is generated with company logo, contact details, line items, VAT breakdown and total. The format is clean and professional."
        c["title"] = "Preview Quote as PDF"
        log_fix("ACC-035", "steps+expected+title", 'Translated from German to English')

    # ── ACC-036: URL /de/, German title
    if "ACC-036" in case_map:
        c = case_map["ACC-036"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/quotes", "https://acc.mixel.ch/en/app/quotes")
        c["title"] = "Send Quote by Email"
        log_fix("ACC-036", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-037-039: Good (already uses /en/ URL)
    # No fix needed

    # ── ACC-040: URL /de/, toast "Invoice created"
    if "ACC-040" in case_map:
        c = case_map["ACC-040"]
        c["steps"] = (
            '1. Navigate to https://acc.mixel.ch/en/app/invoices\n'
            '2. Click the "New Invoice" button\n'
            '3. Select a contact from the dropdown\n'
            '4. Verify invoice number and date are set automatically\n'
            '5. Click "Add Item" and enter description, quantity and price\n'
            '6. Select VAT rate (e.g. 8.1%)\n'
            '7. Click "Create Invoice"\n'
            '8. Verify the new invoice appears in the invoice list with status "Draft"'
        )
        c["title"] = "Create a Manual Invoice"
        log_fix("ACC-040", "steps+title", 'Changed /de/ to /en/; replaced toast with list verification; translated title')

    # ── ACC-041: URL /de/, German title
    if "ACC-041" in case_map:
        c = case_map["ACC-041"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/invoices", "https://acc.mixel.ch/en/app/invoices")
        c["title"] = "Apply Multiple VAT Rates to Invoice"
        log_fix("ACC-041", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-042: URL /de/, German title
    if "ACC-042" in case_map:
        c = case_map["ACC-042"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/invoices", "https://acc.mixel.ch/en/app/invoices")
        c["title"] = "Multi-Currency Invoice (EUR)"
        log_fix("ACC-042", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-043: URL /de/, German title
    if "ACC-043" in case_map:
        c = case_map["ACC-043"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/invoices", "https://acc.mixel.ch/en/app/invoices")
        c["title"] = "Generate QR Invoice / Payment Reference"
        log_fix("ACC-043", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-044: URL /de/, German title
    if "ACC-044" in case_map:
        c = case_map["ACC-044"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/invoices", "https://acc.mixel.ch/en/app/invoices")
        c["title"] = "Send Invoice by Email"
        log_fix("ACC-044", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-045: URL /de/, German title "Mark Invoice as Paid (vollständige Zahlung)"
    if "ACC-045" in case_map:
        c = case_map["ACC-045"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/invoices", "https://acc.mixel.ch/en/app/invoices")
        c["title"] = "Mark Invoice as Paid (Full Payment)"
        log_fix("ACC-045", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-046: URL /de/, German title
    if "ACC-046" in case_map:
        c = case_map["ACC-046"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/invoices", "https://acc.mixel.ch/en/app/invoices")
        c["title"] = "Record Partial Payment on Invoice"
        log_fix("ACC-046", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-047: URL /de/, ephemeral confirmation reference, German title
    if "ACC-047" in case_map:
        c = case_map["ACC-047"]
        c["steps"] = (
            '1. Navigate to https://acc.mixel.ch/en/app/invoices\n'
            '2. Filter by "Overdue" status\n'
            '3. Open an overdue invoice\n'
            '4. Look in the action menu for "Send Reminder" or "Payment Reminder"\n'
            '5. Click it and confirm\n'
            '6. Verify the reminder history is updated in the invoice details'
        )
        c["title"] = "Send Automatic Payment Reminder"
        log_fix("ACC-047", "steps+title", 'Changed /de/ to /en/; replaced ephemeral confirmation with persistent check; translated title')

    # ── ACC-048: URL /de/, toast "Credit note created", German title
    if "ACC-048" in case_map:
        c = case_map["ACC-048"]
        c["steps"] = (
            '1. Navigate to https://acc.mixel.ch/en/app/credit-notes\n'
            '2. Click the "New Credit Note" button\n'
            '3. Select a contact\n'
            '4. Optionally select a linked invoice\n'
            '5. Add a line item with description and amount\n'
            '6. Select VAT rate\n'
            '7. Click "Create"\n'
            '8. Verify the new credit note appears in the credit notes list'
        )
        c["title"] = "Create Credit Note (Reversal)"
        log_fix("ACC-048", "steps+title", 'Changed /de/ to /en/; replaced toast with list verification; translated title')

    # ── ACC-049: URL /de/, German title
    if "ACC-049" in case_map:
        c = case_map["ACC-049"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/invoices", "https://acc.mixel.ch/en/app/invoices")
        c["title"] = "Clone / Duplicate an Invoice"
        log_fix("ACC-049", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-050: URL /de/, German title
    if "ACC-050" in case_map:
        c = case_map["ACC-050"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/invoices", "https://acc.mixel.ch/en/app/invoices")
        c["title"] = "Invoice with Late Payment Fee"
        log_fix("ACC-050", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-051: URL /de/
    if "ACC-051" in case_map:
        c = case_map["ACC-051"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/accounting", "https://acc.mixel.ch/en/app/accounting")
        log_fix("ACC-051", "steps", 'Changed /de/ to /en/')

    # ── ACC-052: URL /de/, German title
    if "ACC-052" in case_map:
        c = case_map["ACC-052"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/settings", "https://acc.mixel.ch/en/app/settings")
        c["title"] = "Invoice PDF with Custom Template"
        log_fix("ACC-052", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-053: URL /de/, toast "Template created", German title
    if "ACC-053" in case_map:
        c = case_map["ACC-053"]
        c["steps"] = (
            '1. Navigate to https://acc.mixel.ch/en/app/recurring-invoices\n'
            '2. Click the "New Template" button\n'
            '3. Select a contact\n'
            '4. Set the interval (e.g. "Monthly")\n'
            '5. Enter start date and optionally end date\n'
            '6. Add line items with description, quantity and price\n'
            '7. Click "Create Template"\n'
            '8. Verify the new template appears in the recurring invoices list'
        )
        c["title"] = "Create a Recurring Invoice"
        log_fix("ACC-053", "steps+title", 'Changed /de/ to /en/; replaced toast with list verification; translated title')

    # ── ACC-054: URL /de/
    if "ACC-054" in case_map:
        c = case_map["ACC-054"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/recurring-invoices", "https://acc.mixel.ch/en/app/recurring-invoices")
        log_fix("ACC-054", "steps", 'Changed /de/ to /en/')

    # ── ACC-055: URL /de/, German title
    if "ACC-055" in case_map:
        c = case_map["ACC-055"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/recurring-invoices", "https://acc.mixel.ch/en/app/recurring-invoices")
        c["title"] = "Edit a Recurring Invoice"
        log_fix("ACC-055", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-056: URL /de/, German title
    if "ACC-056" in case_map:
        c = case_map["ACC-056"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/recurring-invoices", "https://acc.mixel.ch/en/app/recurring-invoices")
        c["title"] = "Pause a Recurring Invoice"
        log_fix("ACC-056", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-057: URL /de/, German title
    if "ACC-057" in case_map:
        c = case_map["ACC-057"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/recurring-invoices", "https://acc.mixel.ch/en/app/recurring-invoices")
        c["title"] = "Delete a Recurring Invoice"
        log_fix("ACC-057", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-058: URL /de/, toast "Expense created", German title
    if "ACC-058" in case_map:
        c = case_map["ACC-058"]
        c["steps"] = (
            '1. Navigate to https://acc.mixel.ch/en/app/expenses\n'
            '2. Click the "New Expense" button\n'
            '3. Enter a description (e.g. "Office supplies March")\n'
            '4. Enter the amount (e.g. 120.50)\n'
            '5. Select a date\n'
            '6. Select a category (e.g. "Office Supplies")\n'
            '7. Click "Save"\n'
            '8. Verify the new expense appears in the expense list'
        )
        c["title"] = "Create a Manual Expense Entry"
        log_fix("ACC-058", "steps+title", 'Changed /de/ to /en/; replaced toast with list verification; translated title')

    # ── ACC-059: URL /de/, German title
    if "ACC-059" in case_map:
        c = case_map["ACC-059"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/expenses", "https://acc.mixel.ch/en/app/expenses")
        c["title"] = "Upload Receipt Photo"
        log_fix("ACC-059", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-060: URL /de/, German title
    if "ACC-060" in case_map:
        c = case_map["ACC-060"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/expenses", "https://acc.mixel.ch/en/app/expenses")
        c["title"] = "Categorize an Expense"
        log_fix("ACC-060", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-061: URL /de/, German title
    if "ACC-061" in case_map:
        c = case_map["ACC-061"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/expenses", "https://acc.mixel.ch/en/app/expenses")
        c["title"] = "Apply VAT to an Expense"
        log_fix("ACC-061", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-062: URL /de/, German title
    if "ACC-062" in case_map:
        c = case_map["ACC-062"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/expenses", "https://acc.mixel.ch/en/app/expenses")
        c["title"] = "Submit Expense for Approval"
        log_fix("ACC-062", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-063: URL /de/, German title
    if "ACC-063" in case_map:
        c = case_map["ACC-063"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/expenses", "https://acc.mixel.ch/en/app/expenses")
        c["title"] = "Approve an Expense"
        log_fix("ACC-063", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-064: URL /de/, German title
    if "ACC-064" in case_map:
        c = case_map["ACC-064"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/expenses", "https://acc.mixel.ch/en/app/expenses")
        c["title"] = "Reject an Expense"
        log_fix("ACC-064", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-065: URL /de/, German title
    if "ACC-065" in case_map:
        c = case_map["ACC-065"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/settings", "https://acc.mixel.ch/en/app/settings")
        c["title"] = "Export Expenses for Tax Declaration"
        log_fix("ACC-065", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-066: URL /de/, German title
    if "ACC-066" in case_map:
        c = case_map["ACC-066"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/accounting", "https://acc.mixel.ch/en/app/accounting")
        c["title"] = "View Journal Entries"
        log_fix("ACC-066", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-067: URL /de/, toast "Entry created", German title
    if "ACC-067" in case_map:
        c = case_map["ACC-067"]
        c["steps"] = (
            '1. Navigate to https://acc.mixel.ch/en/app/accounting\n'
            '2. Click the "Journal" tab\n'
            '3. Click the "New Entry" button\n'
            '4. Enter date and description (e.g. "Rent January 2026")\n'
            '5. Add a line: select debit account (e.g. 5000) and enter amount\n'
            '6. Add a line: select credit account (e.g. 1000) with the same amount\n'
            '7. Verify debit = credit\n'
            '8. Click "Create Entry"\n'
            '9. Verify the new entry appears in the journal list'
        )
        c["title"] = "Create a Manual Journal Entry"
        log_fix("ACC-067", "steps+title", 'Changed /de/ to /en/; replaced toast with list verification; translated title')

    # ── ACC-068: German title
    if "ACC-068" in case_map:
        c = case_map["ACC-068"]
        c["title"] = "Verify Debit = Credit Balance"
        log_fix("ACC-068", "title", 'Translated title from German')

    # ── ACC-069: German title, Italian text in expected
    if "ACC-069" in case_map:
        c = case_map["ACC-069"]
        c["title"] = "Cancel a Journal Entry"
        c["expected"] = 'Entry is cancelled. Status changes to "Cancelled". Reversal entry is visible in the journal.'
        log_fix("ACC-069", "title+expected", 'Translated title; removed Italian text fragment from expected')

    # ── ACC-070: German title
    if "ACC-070" in case_map:
        c = case_map["ACC-070"]
        c["title"] = "Search Journal Entries by Account"
        log_fix("ACC-070", "title", 'Translated title from German')

    # ── ACC-071: German title
    if "ACC-071" in case_map:
        c = case_map["ACC-071"]
        c["title"] = "View Account Ledger (Account Statement)"
        log_fix("ACC-071", "title", 'Translated title from German')

    # ── ACC-072: German title
    if "ACC-072" in case_map:
        c = case_map["ACC-072"]
        c["title"] = "Verify Trial Balance"
        log_fix("ACC-072", "title", 'Translated title from German')

    # ── ACC-073: URL /de/, German title
    if "ACC-073" in case_map:
        c = case_map["ACC-073"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/accounting", "https://acc.mixel.ch/en/app/accounting")
        c["title"] = "View VAT Overview"
        log_fix("ACC-073", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-074-076: Titles OK, no URL issues
    # No fix needed

    # ── ACC-077: URL /de/, German title
    if "ACC-077" in case_map:
        c = case_map["ACC-077"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/accounting", "https://acc.mixel.ch/en/app/accounting")
        c["title"] = "Generate VAT Return Report"
        log_fix("ACC-077", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-079: URL /de/, German title
    if "ACC-079" in case_map:
        c = case_map["ACC-079"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/banking", "https://acc.mixel.ch/en/app/banking")
        c["title"] = "View Bank Transactions"
        log_fix("ACC-079", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-080: URL /de/, German title
    if "ACC-080" in case_map:
        c = case_map["ACC-080"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/banking", "https://acc.mixel.ch/en/app/banking")
        c["title"] = "Match Bank Transaction to Invoice Payment"
        log_fix("ACC-080", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-081: URL /de/, German title
    if "ACC-081" in case_map:
        c = case_map["ACC-081"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/banking", "https://acc.mixel.ch/en/app/banking")
        c["title"] = "Match Bank Transaction to Expense"
        log_fix("ACC-081", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-082: URL /de/, toast "Transaction created", German title
    if "ACC-082" in case_map:
        c = case_map["ACC-082"]
        c["steps"] = (
            '1. Navigate to https://acc.mixel.ch/en/app/banking\n'
            '2. Open a bank account\n'
            '3. Click the "New Transaction" button\n'
            '4. Enter date, description and amount\n'
            '5. Select type (Income / Expense / Transfer)\n'
            '6. Select a category\n'
            '7. Click "Save"\n'
            '8. Verify the new transaction appears in the transaction list'
        )
        c["title"] = "Create a Manual Bank Transaction"
        log_fix("ACC-082", "steps+title", 'Changed /de/ to /en/; replaced toast with list verification; translated title')

    # ── ACC-083: URL /de/, German title
    if "ACC-083" in case_map:
        c = case_map["ACC-083"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/banking", "https://acc.mixel.ch/en/app/banking")
        c["title"] = "Reconcile Bank Account"
        log_fix("ACC-083", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-084: URL /de/, German title
    if "ACC-084" in case_map:
        c = case_map["ACC-084"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/banking", "https://acc.mixel.ch/en/app/banking")
        c["title"] = "Review Reconciliation Discrepancy"
        log_fix("ACC-084", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-085: URL /de/, German title
    if "ACC-085" in case_map:
        c = case_map["ACC-085"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/banking", "https://acc.mixel.ch/en/app/banking")
        c["title"] = "View Reconciliation History"
        log_fix("ACC-085", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-086: URL /de/, German title
    if "ACC-086" in case_map:
        c = case_map["ACC-086"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app", "https://acc.mixel.ch/en/app")
        c["title"] = "View Main Dashboard"
        log_fix("ACC-086", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-087: URL /de/, German title
    if "ACC-087" in case_map:
        c = case_map["ACC-087"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/reports", "https://acc.mixel.ch/en/app/reports")
        c["title"] = "View Balance Sheet"
        log_fix("ACC-087", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-088: URL /de/, German title
    if "ACC-088" in case_map:
        c = case_map["ACC-088"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/reports", "https://acc.mixel.ch/en/app/reports")
        c["title"] = "View Profit & Loss Statement (P&L)"
        log_fix("ACC-088", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-089: URL /de/, German title
    if "ACC-089" in case_map:
        c = case_map["ACC-089"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/invoices", "https://acc.mixel.ch/en/app/invoices")
        c["title"] = "View Accounts Receivable Aging Report"
        log_fix("ACC-089", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-090: URL /de/, German title
    if "ACC-090" in case_map:
        c = case_map["ACC-090"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/expenses", "https://acc.mixel.ch/en/app/expenses")
        c["title"] = "View Accounts Payable Aging Report"
        log_fix("ACC-090", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-091: URL /de/, German title
    if "ACC-091" in case_map:
        c = case_map["ACC-091"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/reports", "https://acc.mixel.ch/en/app/reports")
        c["title"] = "Filter Reports by Custom Date Range"
        log_fix("ACC-091", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-092: URL /de/, German title
    if "ACC-092" in case_map:
        c = case_map["ACC-092"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/reports", "https://acc.mixel.ch/en/app/reports")
        c["title"] = "Export Report as PDF"
        log_fix("ACC-092", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-093: URL /de/, German title
    if "ACC-093" in case_map:
        c = case_map["ACC-093"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/settings", "https://acc.mixel.ch/en/app/settings")
        c["title"] = "Export Report to Excel"
        log_fix("ACC-093", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-094: URL /de/, German title
    if "ACC-094" in case_map:
        c = case_map["ACC-094"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/contacts", "https://acc.mixel.ch/en/app/contacts")
        c["title"] = "View Revenue per Contact Report"
        log_fix("ACC-094", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-095: URL /de/, toast "Document uploaded successfully", German title
    if "ACC-095" in case_map:
        c = case_map["ACC-095"]
        c["steps"] = (
            '1. Navigate to https://acc.mixel.ch/en/app/documents\n'
            '2. Click the "Upload" button\n'
            '3. Select a file (PDF, PNG or JPG)\n'
            '4. Optionally enter a name for the document\n'
            '5. Click "Upload" or confirm the upload\n'
            '6. Verify the document appears in the document list'
        )
        c["title"] = "Upload a Business Document"
        log_fix("ACC-095", "steps+title", 'Changed /de/ to /en/; replaced toast with list verification; translated title')

    # ── ACC-096: URL /de/, German title
    if "ACC-096" in case_map:
        c = case_map["ACC-096"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/documents", "https://acc.mixel.ch/en/app/documents")
        c["title"] = "Retrieve and Download a Document"
        log_fix("ACC-096", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-097: Entirely German steps and expected, German title
    if "ACC-097" in case_map:
        c = case_map["ACC-097"]
        c["steps"] = (
            '1. Ensure company logo and details are set in Settings\n'
            '2. Create and finalize an invoice\n'
            '3. Click "Download PDF"\n'
            '4. Verify the PDF contains company logo, address and payment details'
        )
        c["expected"] = "PDF is generated from the configured template. Company logo, address and payment details are correctly placed."
        c["title"] = "Generate Invoice PDF with Custom Template"
        c["where"] = "Documents > Document Management"
        log_fix("ACC-097", "steps+expected+title+where", 'Translated from German; removed German "where" label')

    # ── ACC-098: URL /de/, German title, German "where"
    if "ACC-098" in case_map:
        c = case_map["ACC-098"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/documents", "https://acc.mixel.ch/en/app/documents")
        c["title"] = "Search for a Document"
        c["where"] = "Documents > Document Management"
        log_fix("ACC-098", "steps+title+where", 'Changed /de/ to /en/; translated title and where')

    # ── ACC-099: URL /de/, German title
    if "ACC-099" in case_map:
        c = case_map["ACC-099"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/documents", "https://acc.mixel.ch/en/app/documents")
        c["title"] = "Archive a Document"
        log_fix("ACC-099", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-100: URL /de/, German title
    if "ACC-100" in case_map:
        c = case_map["ACC-100"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/settings", "https://acc.mixel.ch/en/app/settings")
        c["title"] = "Create a Second Company"
        log_fix("ACC-100", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-101: German title
    if "ACC-101" in case_map:
        c = case_map["ACC-101"]
        c["title"] = "Switch Between Companies"
        log_fix("ACC-101", "title", 'Translated title from German')

    # ── ACC-103: URL /de/, German title
    if "ACC-103" in case_map:
        c = case_map["ACC-103"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/settings", "https://acc.mixel.ch/en/app/settings")
        c["title"] = "Delete / Archive a Company"
        log_fix("ACC-103", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-104: URL /de/, toast "Profile saved", German title
    if "ACC-104" in case_map:
        c = case_map["ACC-104"]
        c["steps"] = (
            '1. Navigate to https://acc.mixel.ch/en/app/settings\n'
            '2. Click the "My Profile" tab\n'
            '3. Change the "Display Name"\n'
            '4. Click "Save Profile"\n'
            '5. Verify the new name is displayed in the sidebar or profile section'
        )
        c["title"] = "Update User Profile"
        log_fix("ACC-104", "steps+title", 'Changed /de/ to /en/; replaced toast with persistent check; translated title')

    # ── ACC-105: German title
    if "ACC-105" in case_map:
        c = case_map["ACC-105"]
        c["title"] = "Configure Invoice PDF Template with Logo"
        log_fix("ACC-105", "title", 'Translated title from German')

    # ── ACC-106: URL /de/, German title
    if "ACC-106" in case_map:
        c = case_map["ACC-106"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/settings", "https://acc.mixel.ch/en/app/settings")
        c["title"] = "Configure Automatic Payment Reminders"
        log_fix("ACC-106", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-107: URL /de/, German title
    if "ACC-107" in case_map:
        c = case_map["ACC-107"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/settings", "https://acc.mixel.ch/en/app/settings")
        c["title"] = "Configure Email Sending Domain"
        log_fix("ACC-107", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-108: URL /de/, German title
    if "ACC-108" in case_map:
        c = case_map["ACC-108"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/settings", "https://acc.mixel.ch/en/app/settings")
        c["title"] = "Change Date and Number Format"
        log_fix("ACC-108", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-109: URL /de/, German title
    if "ACC-109" in case_map:
        c = case_map["ACC-109"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/audit-trail", "https://acc.mixel.ch/en/app/audit-trail")
        c["title"] = "Access Audit Log / Activity History"
        log_fix("ACC-109", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-110: German title
    if "ACC-110" in case_map:
        c = case_map["ACC-110"]
        c["title"] = "Run Year-End Trial Balance"
        log_fix("ACC-110", "title", 'Translated title from German')

    # ── ACC-111: URL /de/
    if "ACC-111" in case_map:
        c = case_map["ACC-111"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/invoices", "https://acc.mixel.ch/en/app/invoices")
        log_fix("ACC-111", "steps", 'Changed /de/ to /en/')

    # ── ACC-112: URL /de/, German title
    if "ACC-112" in case_map:
        c = case_map["ACC-112"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/reports", "https://acc.mixel.ch/en/app/reports")
        c["title"] = "Create Annual Balance Sheet"
        log_fix("ACC-112", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-113: URL /de/, German title
    if "ACC-113" in case_map:
        c = case_map["ACC-113"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/reports", "https://acc.mixel.ch/en/app/reports")
        c["title"] = "Create Annual Profit & Loss Statement"
        log_fix("ACC-113", "steps+title", 'Changed /de/ to /en/; translated title')

    # ── ACC-114: German title
    if "ACC-114" in case_map:
        c = case_map["ACC-114"]
        c["title"] = "Create Annual VAT Report"
        log_fix("ACC-114", "title", 'Translated title from German')

    # ── ACC-115: German title
    if "ACC-115" in case_map:
        c = case_map["ACC-115"]
        c["title"] = "Post Depreciation Journal Entry"
        log_fix("ACC-115", "title", 'Translated title from German')

    # ── ACC-117: URL /de/
    if "ACC-117" in case_map:
        c = case_map["ACC-117"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/accounting", "https://acc.mixel.ch/en/app/accounting")
        log_fix("ACC-117", "steps", 'Changed /de/ to /en/')

    # ── ACC-120: URL /de/
    if "ACC-120" in case_map:
        c = case_map["ACC-120"]
        c["steps"] = c["steps"].replace("https://acc.mixel.ch/de/app/documents", "https://acc.mixel.ch/en/app/documents")
        log_fix("ACC-120", "steps", 'Changed /de/ to /en/')

    # ── Fix category names that are still German
    for cat in cases:
        old_name = cat.get("name", "")
        if "Quotes und Bestellungen" in old_name:
            cat["name"] = "F. Phase 6: Quotes and Orders"
            log_fix("Category", "name", f'Translated "{old_name}" to "F. Phase 6: Quotes and Orders"')
        elif "Recurringe Invoices" in old_name:
            cat["name"] = "H. Phase 8: Recurring Invoices"
            log_fix("Category", "name", f'Fixed typo "Recurringe" to "Recurring" in "{old_name}"')
        elif "Reports und Dashboard" in old_name:
            cat["name"] = "M. Phase 13: Reports and Dashboard"
            log_fix("Category", "name", f'Translated "{old_name}" to "M. Phase 13: Reports and Dashboard"')
        elif "Documentsnmanagement" in old_name:
            cat["name"] = "N. Phase 14: Document Management"
            log_fix("Category", "name", f'Fixed typo "Documentsnmanagement" to "Document Management" in "{old_name}"')
        elif "Settings und Konfiguration" in old_name:
            cat["name"] = "P. Phase 16: Settings and Configuration"
            log_fix("Category", "name", f'Translated "{old_name}" to "P. Phase 16: Settings and Configuration"')
        elif "Aufgaben zum Jahresende" in old_name:
            cat["name"] = "F. Phase 17: Year-End Tasks"
            log_fix("Category", "name", f'Translated "{old_name}" to "F. Phase 17: Year-End Tasks"')

    # ── Fix "where" labels still in German
    where_fixes = {
        "Settings > Firmen-Setup": "Settings > Company Setup",
        "Dokumente > Dokumentenverwaltung": "Documents > Document Management",
        "Documents > Documentsnverwaltung": "Documents > Document Management",
        "Einstellungen > Firmenprofil": "Settings > Company Profile",
        "Einstellungen > Nummerierung": "Settings > Numbering",
        "Einstellungen > Mein Profil": "Settings > My Profile",
        "Einstellungen > Finanzen": "Settings > Finance",
        "Einstellungen > E-Mail Einstellungen": "Settings > Email Settings",
        "Einstellungen > Darstellung": "Settings > Appearance",
        "Credit Notes > Gutschriften": "Credit Notes > Credit Notes",
        "Beliebige App-Seite": "Any App Page",
        "Buchhaltung > Geschäftsjahre": "Accounting > Fiscal Years",
        "Admin > Einladungen": "Admin > Invitations",
        "Admin > Testphasen": "Admin > Trials",
        "Mixail-Chat": "Mixail Chat",
    }
    for cat in cases:
        for c in cat.get("cases", []):
            for old_where, new_where in where_fixes.items():
                if c.get("where") == old_where:
                    c["where"] = new_where
                    log_fix(c["id"], "where", f'Translated "{old_where}" to "{new_where}"')

    return cases


def fix_de_toast_references(cases):
    """Fix DE section toast references - replace with persistent UI state checks."""
    case_map = {}
    for cat in cases:
        for c in cat.get("cases", []):
            case_map[c["id"]] = c

    # DE section toast fixes - map of test ID to the toast step pattern and replacement
    de_toast_fixes = {
        "ACC-009": {
            "old_pattern": "Prüfen Sie, dass die Meldung \"Finanzeinstellungen gespeichert\" erscheint",
            "new_pattern": "Prüfen Sie, dass die gespeicherten Werte nach dem Neuladen der Seite bestehen bleiben"
        },
        "ACC-010": {
            "old_pattern": "Prüfen Sie dass eine Erfolgsmeldung erscheint",
            "new_pattern": "Prüfen Sie, dass der Firmenname in den Einstellungen angezeigt wird"
        },
        "ACC-011": {
            "old_pattern": "Prüfen Sie dass eine Erfolgsmeldung erscheint",
            "new_pattern": "Prüfen Sie, dass der Präfix-Wert nach dem Speichern bestehen bleibt"
        },
        "ACC-012": {
            "old_pattern": "Prüfen Sie dass eine Erfolgsmeldung erscheint",
            "new_pattern": "Prüfen Sie, dass die aktualisierte Zahlungsfrist nach dem Speichern bestehen bleibt"
        },
        "ACC-014": {
            "old_pattern": "Prüfen Sie dass eine Erfolgsmeldung erscheint",
            "new_pattern": "Prüfen Sie, dass die E-Mail-Adresse nach dem Speichern bestehen bleibt"
        },
        "ACC-023": {
            "old_pattern": "Prüfen Sie, dass die Meldung \"Konto aktualisiert\" erscheint",
            "new_pattern": "Prüfen Sie, dass der aktualisierte Name in der Kontoliste erscheint"
        },
        "ACC-025": {
            "old_pattern": "Prüfen Sie, dass die Meldung \"Kontakt erstellt\" erscheint",
            "new_pattern": "Prüfen Sie, dass der neue Kontakt in der Kontaktliste erscheint"
        },
        "ACC-026": {
            "old_pattern": "Prüfen Sie, dass die Meldung \"Kontakt erstellt\" erscheint",
            "new_pattern": "Prüfen Sie, dass der neue Lieferantenkontakt in der Kontaktliste erscheint"
        },
        "ACC-027": {
            "old_pattern": "Prüfen Sie, dass die Meldung \"Kontakt aktualisiert\" erscheint",
            "new_pattern": "Prüfen Sie, dass die aktualisierten Details in der Kontaktliste sichtbar sind"
        },
        "ACC-040": {
            "old_pattern": "Prüfen Sie, dass die Meldung \"Rechnung erstellt\" erscheint",
            "new_pattern": "Prüfen Sie, dass die neue Rechnung in der Rechnungsliste mit Status \"Entwurf\" erscheint"
        },
        "ACC-048": {
            "old_pattern": "Prüfen Sie, dass die Meldung \"Gutschrift erstellt\" erscheint",
            "new_pattern": "Prüfen Sie, dass die neue Gutschrift in der Gutschriftenliste erscheint"
        },
        "ACC-053": {
            "old_pattern": "Prüfen Sie, dass die Meldung \"Vorlage erstellt\" erscheint",
            "new_pattern": "Prüfen Sie, dass die neue Vorlage in der Liste der wiederkehrenden Rechnungen erscheint"
        },
        "ACC-058": {
            "old_pattern": "Prüfen Sie, dass die Meldung \"Ausgabe erstellt\" erscheint",
            "new_pattern": "Prüfen Sie, dass die neue Ausgabe in der Ausgabenliste erscheint"
        },
        "ACC-067": {
            "old_pattern": "Prüfen Sie, dass die Meldung \"Buchung erstellt\" erscheint",
            "new_pattern": "Prüfen Sie, dass die neue Buchung in der Journalliste erscheint"
        },
        "ACC-082": {
            "old_pattern": "Prüfen Sie, dass die Meldung \"Transaktion erstellt\" erscheint",
            "new_pattern": "Prüfen Sie, dass die neue Transaktion in der Transaktionsliste erscheint"
        },
        "ACC-095": {
            "old_pattern": "Prüfen Sie, dass die Meldung \"Dokument erfolgreich hochgeladen\" erscheint\n7. Prüfen Sie, dass das Dokument in der Liste erscheint",
            "new_pattern": "Prüfen Sie, dass das Dokument in der Dokumentenliste erscheint"
        },
        "ACC-104": {
            "old_pattern": "Prüfen Sie, dass die Meldung \"Profil gespeichert\" erscheint\n6. Prüfen Sie, dass der neue Name in der App angezeigt wird",
            "new_pattern": "Prüfen Sie, dass der neue Name in der Sidebar oder im Profilbereich angezeigt wird"
        },
    }

    for test_id, fix in de_toast_fixes.items():
        if test_id in case_map:
            c = case_map[test_id]
            if fix["old_pattern"] in c.get("steps", ""):
                c["steps"] = c["steps"].replace(fix["old_pattern"], fix["new_pattern"])
                log_fix(f"{test_id} (DE)", "steps", f'Replaced toast verification with persistent UI state check')

    return cases


def main():
    print("=" * 70)
    print("MIXEL Accounting QA Test Case Audit & Fix")
    print("=" * 70)

    # Load
    with open(APPS_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Find EN accounting section
    en_section = data.get("EN", [])
    en_accounting = None
    for app in en_section:
        if app.get("id") == "accounting":
            en_accounting = app
            break

    if not en_accounting:
        print("ERROR: Could not find EN accounting section!")
        sys.exit(1)

    # Find DE accounting section
    de_section = data.get("DE", [])
    de_accounting = None
    for app in de_section:
        if app.get("id") == "accounting":
            de_accounting = app
            break

    # Count EN cases
    en_case_count = sum(
        len(cat.get("cases", []))
        for cat in en_accounting.get("categories", [])
    )
    print(f"\nEN section: {en_case_count} test cases found")

    if de_accounting:
        de_case_count = sum(
            len(cat.get("cases", []))
            for cat in de_accounting.get("categories", [])
        )
        print(f"DE section: {de_case_count} test cases found")

    # Apply EN fixes
    print("\n--- Applying EN fixes ---")
    en_accounting["categories"] = fix_en_cases(en_accounting["categories"])

    en_fix_count = len(fixes_applied)
    print(f"EN fixes applied: {en_fix_count}")

    # Apply DE fixes (toast references)
    if de_accounting:
        print("\n--- Applying DE fixes ---")
        de_accounting["categories"] = fix_de_toast_references(de_accounting["categories"])
        de_fix_count = len(fixes_applied) - en_fix_count
        print(f"DE fixes applied: {de_fix_count}")

    # Also fix IT and FR sections if they exist and have the same issues
    # (The IT and FR sections also have /de/ URLs and toast references,
    #  but the user asked specifically about EN and DE)

    # Save
    with open(APPS_JSON, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")

    print(f"\nSaved to: {APPS_JSON}")

    # Print summary
    print("\n" + "=" * 70)
    print("FIX SUMMARY")
    print("=" * 70)

    # Group by fix type
    toast_fixes = [f for f in fixes_applied if "toast" in f[2].lower() or "ephemeral" in f[2].lower()]
    url_fixes = [f for f in fixes_applied if "/de/ to /en/" in f[2]]
    translation_fixes = [f for f in fixes_applied if "translat" in f[2].lower() or "German" in f[2]]
    critical_fixes = [f for f in fixes_applied if "CRITICAL" in f[2]]
    category_fixes = [f for f in fixes_applied if f[0] == "Category"]
    where_fixes = [f for f in fixes_applied if "where" in f[1]]

    print(f"\n1. TOAST/EPHEMERAL MESSAGE FIXES: {len(toast_fixes)}")
    for test_id, field, desc in toast_fixes:
        print(f"   {test_id}: {desc}")

    print(f"\n2. URL LOCALE FIXES (/de/ -> /en/): {len(url_fixes)}")
    for test_id, field, desc in url_fixes:
        print(f"   {test_id}")

    print(f"\n3. UNTRANSLATED TITLE/TEXT FIXES: {len(translation_fixes)}")
    for test_id, field, desc in translation_fixes:
        print(f"   {test_id} [{field}]: {desc}")

    print(f"\n4. CRITICAL BUGS: {len(critical_fixes)}")
    for test_id, field, desc in critical_fixes:
        print(f"   {test_id}: {desc}")

    print(f"\n5. CATEGORY NAME FIXES: {len(category_fixes)}")
    for test_id, field, desc in category_fixes:
        print(f"   {desc}")

    print(f"\n6. WHERE LABEL FIXES: {len(where_fixes)}")
    for test_id, field, desc in where_fixes:
        print(f"   {test_id}: {desc}")

    print(f"\n{'=' * 70}")
    print(f"TOTAL FIXES APPLIED: {len(fixes_applied)}")
    print(f"{'=' * 70}")


if __name__ == "__main__":
    main()
