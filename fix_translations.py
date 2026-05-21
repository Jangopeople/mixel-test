#!/usr/bin/env python3
"""Fix EN and IT translations in apps.json and add new Phase 18 test cases."""
import re

def main():
    with open("apps.json", "r", encoding="utf-8") as f:
        content = f.read()

    lines = content.split("\n")

    # Find section boundaries
    sections = {}
    for i, line in enumerate(lines):
        s = line.strip()
        if s == "DE: [":
            sections["DE"] = i
        elif s == "FR: [":
            sections["FR"] = i
        elif s == "EN: [":
            sections["EN"] = i
        elif s == "IT: [":
            sections["IT"] = i

    print(f"Section starts: {sections}")

    # === STEP 1: Fix EN section (translate German -> English) ===
    en_start = sections["EN"]
    en_end = sections["IT"]

    for i in range(en_start, en_end):
        line = lines[i]

        # App metadata
        line = line.replace('"MIXEL Buchhaltung"', '"MIXEL Accounting"')
        line = line.replace(
            "Die Buchhaltung folgt einem vollst\\u00e4ndigen 17-Phasen-UAT-Plan",
            "Accounting follows a complete 17-phase UAT plan"
        )

        # Fix guide text (raw)
        if "Die Buchhaltung folgt" in line and i > en_start:
            line = line.replace(
                '"guide": "Die Buchhaltung folgt einem vollst\u00e4ndigen 17-Phasen-UAT-Plan, der aus dem offiziellen Testdokument importiert wurde. F\u00fchren Sie die Phasen der Reihe nach aus und protokollieren Sie alle Fehler mit genauen Schritt-/Aktionsnachweisen."',
                '"guide": "Accounting follows a complete 17-phase UAT plan imported from the official test document. Execute the phases in order and log all bugs with precise step/action evidence."'
            )

        # Phase names
        line = line.replace("A. Phase 1: Authentifizierung und Anmeldung", "A. Phase 1: Authentication and Login")
        line = line.replace("B. Phase 2: Unternehmen und Ersteinrichtung", "B. Phase 2: Company and Initial Setup")
        line = line.replace("D. Phase 4: Banking-Einrichtung", "D. Phase 4: Banking Setup")
        line = line.replace("E. Phase 5: Kontakt- und CRM-Management", "E. Phase 5: Contact and CRM Management")
        line = line.replace("F. Phase 6: Angebote und Bestellungen", "F. Phase 6: Quotes and Orders")
        line = line.replace("G. Phase 7: Rechnungsstellung und Abrechnung", "G. Phase 7: Invoicing and Billing")
        line = line.replace("H. Phase 8: Wiederkehrende Rechnungen", "H. Phase 8: Recurring Invoices")
        line = line.replace("I. Phase 9: Kostenmanagement", "I. Phase 9: Expense Management")
        line = line.replace("J. Phase 10: Buchhaltung und Journaleintr\u00e4ge", "J. Phase 10: Accounting and Journal Entries")
        line = line.replace("K. Phase 11: Mehrwertsteuerverwaltung", "K. Phase 11: VAT Management")
        line = line.replace("L. Phase 12: Banking und Vers\u00f6hnung", "L. Phase 12: Banking and Reconciliation")
        line = line.replace("M. Phase 13: Berichte und Dashboard", "M. Phase 13: Reports and Dashboard")
        line = line.replace("N. Phase 14: Dokumentenmanagement", "N. Phase 14: Document Management")
        line = line.replace("O. Phase 15: Multi-Company-Management", "O. Phase 15: Multi-Company Management")
        line = line.replace("P. Phase 16: Einstellungen und Konfiguration", "P. Phase 16: Settings and Configuration")
        line = line.replace("Q/F. Phase 17: Aufgaben zum Jahresende", "Q/F. Phase 17: Year-End Tasks")

        # Titles (German -> English)
        title_map = {
            "Registrieren \u2013 Registrierung eines neuen Kontos": "Register \u2013 Create a New Account",
            "Anmelden \u2013 G\u00fcltige Anmeldeinformationen": "Login \u2013 Valid Credentials",
            "Anmelden \u2013 Ung\u00fcltige Anmeldeinformationen": "Login \u2013 Invalid Credentials",
            "Anmelden \u2013 Validierung leerer Felder": "Login \u2013 Empty Field Validation",
            "Ablauf zum Zur\u00fccksetzen des Passworts": "Password Reset Flow",
            "Abmelden": "Sign Out",
            "Erstellen Sie das erste Unternehmen": "Create First Company",
            "Firmenlogo hochladen": "Upload Company Logo",
            "Gesch\u00e4ftsjahr konfigurieren": "Configure Fiscal Year",
            "Konfigurieren Sie die Mehrwertsteuereinstellungen": "Configure VAT Settings",
            "Legen Sie das Rechnungsnummerierungsformat fest": "Set Invoice Numbering Format",
            "Konfigurieren Sie Standardzahlungsbedingungen": "Configure Default Payment Terms",
            "W\u00e4hlen Sie die Sprache der Benutzeroberfl\u00e4che aus": "Select UI Language",
            "Legen Sie die E-Mail-Absenderdetails fest": "Set Email Sender Details",
            "Standardkontenplan anzeigen": "View Default Chart of Accounts",
            "F\u00fcgen Sie ein neues Konto hinzu": "Add a New Account",
            "Bearbeiten Sie ein vorhandenes Konto": "Edit an Existing Account",
            "Konto deaktivieren/archivieren": "Deactivate / Archive Account",
            "Konten suchen/filtern": "Search / Filter Accounts",
            "F\u00fcgen Sie ein Bankkonto hinzu": "Add a Bank Account",
            "Validieren Sie das ung\u00fcltige IBAN-Format": "Validate Invalid IBAN Format",
            "Legen Sie das Standardbankkonto fest": "Set Default Bank Account",
            "Bankauszugsdaten importieren": "Import Bank Statement Data",
            "Erstellen Sie einen neuen Kontakt": "Create a New Contact",
            "Kontaktdetails bearbeiten": "Edit Contact Details",
            "Kontaktliste suchen/filtern": "Search / Filter Contact List",
            "Kontakt als Kunde markieren": "Mark Contact as Customer",
            "Kontakt als Lieferant markieren": "Mark Contact as Supplier",
            "Kontakt l\u00f6schen/archivieren": "Delete / Archive Contact",
            "Kontaktnotizen hinzuf\u00fcgen": "Add Contact Notes",
            "Mehrere Kontakte \u00fcber CSV importieren": "Import Multiple Contacts via CSV",
            "Kundenkontoauszug anzeigen": "View Customer Account Statement",
            "Lieferantenkontoauszug anzeigen": "View Supplier Account Statement",
            "Erstellen Sie ein neues Angebot": "Create a New Quote",
            "Angebotspositionen hinzuf\u00fcgen": "Add Quote Line Items",
            "Angebots-PDF herunterladen": "Download Quote PDF",
            "Angebot per E-Mail versenden": "Send Quote by Email",
            "Angebot in Rechnung umwandeln": "Convert Quote to Invoice",
            "Angebot duplizieren": "Duplicate Quote",
            "Angebot stornieren": "Cancel Quote",
            "Bestellung aus Angebot erstellen": "Create Order from Quote",
            "Bestellstatus verfolgen": "Track Order Status",
            "Bestellung in Rechnung umwandeln": "Convert Order to Invoice",
            "Erstellen Sie eine neue Rechnung": "Create a New Invoice",
            "Rechnungspositionen mit MwSt. hinzuf\u00fcgen": "Add Invoice Line Items with VAT",
            "Rechnungs-PDF erstellen": "Generate Invoice PDF",
            "Rechnung per E-Mail an Kunden senden": "Send Invoice to Customer by Email",
            "Zahlung auf Rechnung verbuchen": "Record Payment on Invoice",
            "Rechnung als bezahlt markieren": "Mark Invoice as Paid",
            "\u00dcberf\u00e4llige Rechnungen identifizieren": "Identify Overdue Invoices",
            "Gutschrift f\u00fcr eine Rechnung ausstellen": "Issue Credit Note for an Invoice",
            "Rechnung stornieren/annullieren": "Cancel / Void Invoice",
            "Rechnung duplizieren": "Duplicate Invoice",
            "Rechnungsrabatte anwenden (Zeilen-/Gesamtrabatt)": "Apply Invoice Discounts (Line / Total)",
            "Swiss QR-Rechnung erstellen und validieren": "Create and Validate Swiss QR Invoice",
            "Wiederkehrende Rechnungsvorlage erstellen": "Create Recurring Invoice Template",
            "Wiederholungsintervall konfigurieren (monatlich/quartalsweise)": "Configure Recurrence Interval (Monthly / Quarterly)",
            "N\u00e4chste Rechnungsvorschau \u00fcberpr\u00fcfen": "Review Next Invoice Preview",
            "Wiederkehrende Rechnung pausieren": "Pause Recurring Invoice",
            "Wiederkehrende Rechnung beenden": "End Recurring Invoice",
            "Neue Ausgabe manuell erfassen": "Record New Expense Manually",
            "Ausgabenbeleg hochladen (Bild/PDF)": "Upload Expense Receipt (Image/PDF)",
            "OCR-Erkennung f\u00fcr Belege testen": "Test OCR Recognition for Receipts",
            "Ausgabe einer Kategorie/Konto zuordnen": "Assign Expense to Category / Account",
            "Ausgabe genehmigen (Workflow)": "Approve Expense (Workflow)",
            "Ausgabe ablehnen mit Begr\u00fcndung": "Reject Expense with Reason",
            "Ausgabe als bezahlt markieren": "Mark Expense as Paid",
            "Lieferantenrechnung aus Ausgabe erstellen": "Create Vendor Invoice from Expense",
            "Ausgabenliste filtern/suchen": "Filter / Search Expense List",
            "Ausgaben-Zusammenfassung f\u00fcr einen Zeitraum anzeigen": "View Expense Summary for a Period",
            "Manuelle Journalbuchung erstellen": "Create Manual Journal Entry",
            "Soll = Haben Validierung pr\u00fcfen": "Verify Debit = Credit Validation",
            "Journalbuchung bearbeiten (vor Buchung)": "Edit Journal Entry (Before Posting)",
            "Journalbuchung stornieren/umkehren": "Reverse / Cancel Journal Entry",
            "Buchungsjournalliste anzeigen und filtern": "View and Filter Journal Entry List",
            "Journalbuchung mit Beleg verkn\u00fcpfen": "Link Journal Entry to Document",
            "Buchungsperiode sperren": "Lock Posting Period",
            "Automatische Journalbuchung aus Rechnung pr\u00fcfen": "Verify Auto Journal Entry from Invoice",
            "Er\u00f6ffnungsbilanz buchen": "Post Opening Balance",
            "Sammeljournal (Batch) buchen": "Post Batch Journal Entry",
            "MwSt.-Bericht f\u00fcr aktuelle Periode erstellen": "Generate VAT Report for Current Period",
            "MwSt.-S\u00e4tze in Rechnungen \u00fcberpr\u00fcfen": "Verify VAT Rates in Invoices",
            "MwSt.-Abrechnung herunterladen": "Download VAT Settlement",
            "Korrektur-MwSt.-Buchung erstellen": "Create VAT Correction Entry",
            "EU-MwSt.-Regeln f\u00fcr Nicht-CH-Unternehmen testen": "Test EU VAT Rules for Non-CH Companies",
            "Banktransaktionen importieren": "Import Bank Transactions",
            "Automatischen Abgleichsvorschlag pr\u00fcfen": "Review Automatic Matching Suggestion",
            "Transaktion manuell einer Rechnung zuordnen": "Manually Match Transaction to Invoice",
            "Nicht zugeordnete Transaktion als Ausgabe buchen": "Post Unmatched Transaction as Expense",
            "Bankabstimmung f\u00fcr Monat abschlie\u00dfen": "Complete Bank Reconciliation for Month",
            "Abstimmungsdifferenz anzeigen": "View Reconciliation Difference",
            "Importierte Transaktion aufteilen": "Split Imported Transaction",
            "Bankfeed-Verbindung einrichten (Nordigen)": "Set Up Bank Feed Connection (Nordigen)",
            "Bankfeed automatisch synchronisieren": "Sync Bank Feed Automatically",
            "Bankkontostand mit Buchhaltung vergleichen": "Compare Bank Balance with Accounting",
            "Dashboard-\u00dcbersicht anzeigen": "View Dashboard Overview",
            "Erfolgsrechnung (P&L) erstellen": "Generate Profit & Loss Statement",
            "Bilanz erstellen": "Generate Balance Sheet",
            "Kontoauszug f\u00fcr einzelnes Konto anzeigen": "View Account Statement for Single Account",
            "Kostenstellen-Bericht erstellen": "Generate Cost Center Report",
            "Cashflow-Bericht anzeigen": "View Cash Flow Report",
            "Offene-Posten-Liste erstellen (Debitoren)": "Generate Open Items List (Accounts Receivable)",
            "Offene-Posten-Liste erstellen (Kreditoren)": "Generate Open Items List (Accounts Payable)",
            "Dashboard-Zeitraum filtern": "Filter Dashboard Period",
            "Bericht als PDF/Excel exportieren": "Export Report as PDF / Excel",
            "Dokument hochladen und kategorisieren": "Upload and Categorize Document",
            "Dokumentensuche testen": "Test Document Search",
            "Dokument mit Transaktion verkn\u00fcpfen": "Link Document to Transaction",
            "Dokumentenvorschau anzeigen": "View Document Preview",
            "Dokument herunterladen": "Download Document",
            "Zweites Unternehmen erstellen": "Create Second Company",
            "Zwischen Unternehmen wechseln": "Switch Between Companies",
            "Unternehmensdaten bearbeiten": "Edit Company Data",
            "Benutzerzugriff pro Unternehmen konfigurieren": "Configure User Access Per Company",
            "Unternehmens\u00fcbergreifenden Bericht erstellen": "Generate Cross-Company Report",
            "Buchen Sie R\u00fcckstellungen und Vorauszahlungen": "Post Accruals and Prepayments",
            "Gesch\u00e4ftsjahr abschlie\u00dfen / Neues Jahr er\u00f6ffnen": "Close Fiscal Year / Open New Year",
            "\u00dcberpr\u00fcfen Sie die Er\u00f6ffnungssalden f\u00fcr das neue Jahr": "Verify Opening Balances for New Year",
            "Exportieren Sie das Ganzjahresjournal f\u00fcr die Pr\u00fcfung": "Export Full-Year Journal for Audit",
            "Jahresenddokumente archivieren": "Archive Year-End Documents",
        }
        for de, en in title_map.items():
            line = line.replace(de, en)

        # Steps: German instruction patterns -> English
        line = line.replace("\u00dcberpr\u00fcfe, dass der Button", "Verify that the button")
        line = line.replace("\u00dcberpr\u00fcfe, dass der Text", "Verify that the text")
        line = line.replace("\u00dcberpr\u00fcfe, dass ein Feld mit dem Platzhalter", "Verify that a field with placeholder")
        line = line.replace("\u00dcberpr\u00fcfe, dass ein Feld mit Platzhalter", "Verify that a field with placeholder")
        line = line.replace("\u00dcberpr\u00fcfe, dass ein Eingabefeld mit Platzhalter", "Verify that an input field with placeholder")
        line = line.replace("\u00dcberpr\u00fcfe, dass das Eingabefeld mit Platzhalter", "Verify that the input field with placeholder")
        line = line.replace("sichtbar ist", "is visible")
        line = line.replace("Klicke auf den Button", "Click the button")
        line = line.replace("Klicken Sie auf", "Click on")
        line = line.replace("Navigieren Sie zu", "Navigate to")

        # Expected results
        line = line.replace("R\u00fcckstellungen und Vorauszahlungen buchbar.", "Accruals and prepayments can be posted.")
        line = line.replace("Gesch\u00e4ftsjahr abschlie\u00dfbar.", "Fiscal year can be closed.")
        line = line.replace("Er\u00f6ffnungssalden f\u00fcr neues Jahr pr\u00fcfbar.", "Opening balances for the new year can be verified.")
        line = line.replace("Jahresjournal exportierbar.", "Full-year journal can be exported.")
        line = line.replace("Jahresenddokumente archivierbar.", "Year-end documents can be archived.")

        # More expected results
        line = line.replace("Die Finance-Sektion zeigt Felder f\u00fcr Fiscal Year Start, Default Currency, Bankname und IBAN.",
                           "The Finance section shows fields for Fiscal Year Start, Default Currency, Bank Name and IBAN.")
        line = line.replace("Company Profile-Settings sind sichtbar mit Feldern f\u00fcr VAT Number und Company Name.",
                           "Company Profile settings are visible with fields for VAT Number and Company Name.")
        line = line.replace("Die Numbering-Sektion zeigt Felder f\u00fcr Rechnung (RE-), Offerte (AN-) und Payment Term.",
                           "The Numbering section shows fields for Invoice (RE-), Quote (AN-) and Payment Term.")
        line = line.replace("Das Feld f\u00fcr Standardzahlungsbedingungen (Payment Term) ist konfigurierbar.",
                           "The default payment terms field (Payment Term) is configurable.")
        line = line.replace("Das Profil-Formular zeigt Eingabefelder f\u00fcr Anzeigename und Preferred Language.",
                           "The profile form shows input fields for Display Name and Preferred Language.")
        line = line.replace("Die E-Mail-Settings zeigen Felder f\u00fcr Absender-E-Mail (accounting@company.com) und Absendername.",
                           "Email settings show fields for sender email (accounting@company.com) and sender name.")
        line = line.replace("Der Chart of Accounts zeigt \u00fcber 1000 vorinstallierte Konten und einen",
                           "The Chart of Accounts shows 1000+ pre-installed accounts and an")
        line = line.replace("Ein Formular zum Erstellen eines neuen Kontos \u00f6ffnet sich mit Feldern f\u00fcr Kontonummer, Name und Typ.",
                           "A form to create a new account opens with fields for account number, name and type.")
        line = line.replace("Die Kontoliste zeigt editierbare Eintr\u00e4ge mit Account No. und Account Name.",
                           "The account list shows editable entries with Account No. and Account Name.")
        line = line.replace("Die Kontoliste ist geladen und zeigt Konten, die deaktiviert oder archiviert werden k\u00f6nnen.",
                           "The account list is loaded and shows accounts that can be deactivated or archived.")
        line = line.replace("Der Chart of Accounts zeigt filterbare/suchbare Konten mit Account No. und Account Name.",
                           "The Chart of Accounts shows filterable/searchable accounts with Account No. and Account Name.")
        line = line.replace("Ein Formular zum Hinzuf\u00fcgen eines neuen Bankkontos erscheint.",
                           "A form to add a new bank account appears.")
        line = line.replace("Das Bankkonto-Formular \u00f6ffnet sich und zeigt ein IBAN-Eingabefeld.",
                           "The bank account form opens showing an IBAN input field.")
        line = line.replace("Unternehmen entsteht. Der Benutzer landet auf dem Unternehmens-Dashboard. Der Company Name erscheint in der oberen Navigation.",
                           "Company is created. User lands on the company dashboard. The company name appears in the top navigation.")
        line = line.replace("Das Logo wird gespeichert und auf der Einstellungsseite angezeigt. Es soll sp\u00e4ter auf Invoices und Quotesn erscheinen.",
                           "The logo is saved and displayed on the settings page. It should later appear on invoices and quotes.")

        # Remaining step text in auth section
        line = line.replace("Melden Sie sich bei der App an", "Sign in to the app")
        line = line.replace("Melden Sie sich mit g\u00fcltigen Zugangsdaten an", "Sign in with valid credentials")
        line = line.replace("Wenn Sie von einem Onboarding-Assistenten dazu aufgefordert werden, klicken Sie auf", "If prompted by an onboarding wizard, click on")
        line = line.replace("Geben Sie den Company Namen ein", "Enter the company name")
        line = line.replace("Geben Sie Firmenadresse, Land und Umsatzsteuer-Identifikationsnummer ein", "Enter company address, country and VAT ID")
        line = line.replace("Navigieren Sie zu den Unternehmenseinstellungen", "Navigate to company settings")
        line = line.replace("Suchen Sie das Logo-Upload-Feld", "Find the logo upload field")
        line = line.replace("Laden Sie ein PNG- oder JPG-Bild hoch (maximal empfohlene Gr\u00f6\u00dfe ~500 KB).", "Upload a PNG or JPG image (max recommended size ~500 KB).")
        line = line.replace("Speichern Sie die Settings", "Save the settings")
        line = line.replace("Geben Sie eine g\u00fcltige E-Mail-Adresse ein und erstellen Sie ein Passwort", "Enter a valid email address and create a password")
        line = line.replace("F\u00fchren Sie alle E-Mail-Best\u00e4tigungsschritte aus", "Complete all email verification steps")
        line = line.replace("Best\u00e4tigen Sie, dass das Konto erstellt wurde", "Confirm the account was created")
        line = line.replace("Geben Sie eine g\u00fcltige E-Mail-Adresse und ein g\u00fcltiges Passwort ein", "Enter a valid email and password")
        line = line.replace("Geben Sie ein falsches Passwort f\u00fcr eine g\u00fcltige E-Mail-Adresse ein", "Enter an incorrect password for a valid email")
        line = line.replace("Lassen Sie die Felder f\u00fcr E-Mail und Passwort leer", "Leave email and password fields empty")
        line = line.replace("Geben Sie eine g\u00fcltige registrierte E-Mail-Adresse ein", "Enter a valid registered email address")
        line = line.replace("\u00d6ffnen Sie die E-Mail zum Zur\u00fccksetzen und klicken Sie auf den Link", "Open the reset email and click the link")
        line = line.replace("Geben Sie ein neues Passwort ein und best\u00e4tigen Sie es", "Enter a new password and confirm it")
        line = line.replace("Navigieren Sie zum Benutzerprofil oder zum Einstellungsmen\u00fc", "Navigate to user profile or settings menu")

        # Expected results for auth
        line = line.replace("Das Konto wurde erfolgreich erstellt. Der Benutzer wird zur App oder zu einem Onboarding-Assistenten weitergeleitet.",
                           "Account created successfully. User is redirected to the app or an onboarding wizard.")
        line = line.replace("Der Benutzer wird authentifiziert und zum Anwendungs-Dashboard weitergeleitet.",
                           "User is authenticated and redirected to the application dashboard.")
        line = line.replace("Die Anmeldung wird abgelehnt. Es wird eine Fehlermeldung angezeigt",
                           "Login is rejected. An error message is displayed")
        line = line.replace("Es wird kein Zugriff gew\u00e4hrt.",
                           "No access is granted.")
        line = line.replace("Formularvalidierung wird ausgel\u00f6st. Fehler in Pflichtfeldern werden angezeigt. Es wird kein Anmeldeversuch unternommen.",
                           "Form validation is triggered. Required field errors are displayed. No login attempt is made.")
        line = line.replace("Das Passwort wurde erfolgreich zur\u00fcckgesetzt. Der Benutzer kann sich mit dem neuen Passwort anmelden.",
                           "Password reset successfully. User can sign in with the new password.")
        line = line.replace("Sitzung wird beendet. Der Benutzer wird zur Anmeldeseite weitergeleitet.",
                           "Session is terminated. User is redirected to the login page.")
        line = line.replace("Durch die Schaltfl\u00e4che \u201eZur\u00fcck\u201c wird die authentifizierte Sitzung nicht wiederhergestellt.",
                           "The back button does not restore the authenticated session.")

        # German quote marks
        line = line.replace("\u201e", '"')  # lower German quote
        line = line.replace("\u201c", '"')  # upper German quote
        line = line.replace("(z. B. ", "(e.g. ")
        line = line.replace("z. B.", "e.g.")

        lines[i] = line

    # === STEP 2: Fix IT section (translate German -> Italian) ===
    it_start = sections["IT"]

    it_title_map = {
        "MIXEL Buchhaltung": "MIXEL Contabilit\u00e0",
        "Registrieren \u2013 Registrierung eines neuen Kontos": "Registrazione \u2013 Creazione di un nuovo account",
        "Anmelden \u2013 G\u00fcltige Anmeldeinformationen": "Accesso \u2013 Credenziali valide",
        "Anmelden \u2013 Ung\u00fcltige Anmeldeinformationen": "Accesso \u2013 Credenziali non valide",
        "Anmelden \u2013 Validierung leerer Felder": "Accesso \u2013 Validazione campi vuoti",
        "Ablauf zum Zur\u00fccksetzen des Passworts": "Procedura di reset password",
        "Abmelden": "Disconnessione",
        "Erstellen Sie das erste Unternehmen": "Creare la prima azienda",
        "Firmenlogo hochladen": "Caricare il logo aziendale",
        "Gesch\u00e4ftsjahr konfigurieren": "Configurare l'esercizio fiscale",
        "Konfigurieren Sie die Mehrwertsteuereinstellungen": "Configurare le impostazioni IVA",
        "Legen Sie das Rechnungsnummerierungsformat fest": "Impostare il formato numerazione fatture",
        "Konfigurieren Sie Standardzahlungsbedingungen": "Configurare i termini di pagamento predefiniti",
        "W\u00e4hlen Sie die Sprache der Benutzeroberfl\u00e4che aus": "Selezionare la lingua dell'interfaccia",
        "Legen Sie die E-Mail-Absenderdetails fest": "Impostare i dettagli del mittente e-mail",
        "Standardkontenplan anzeigen": "Visualizzare il piano dei conti predefinito",
        "F\u00fcgen Sie ein neues Konto hinzu": "Aggiungere un nuovo conto",
        "Bearbeiten Sie ein vorhandenes Konto": "Modificare un conto esistente",
        "Konto deaktivieren/archivieren": "Disattivare / archiviare conto",
        "Konten suchen/filtern": "Cercare / filtrare conti",
        "F\u00fcgen Sie ein Bankkonto hinzu": "Aggiungere un conto bancario",
        "Validieren Sie das ung\u00fcltige IBAN-Format": "Validare il formato IBAN non valido",
        "Legen Sie das Standardbankkonto fest": "Impostare il conto bancario predefinito",
        "Bankauszugsdaten importieren": "Importare dati estratto conto",
        "Erstellen Sie einen neuen Kontakt": "Creare un nuovo contatto",
        "Kontaktdetails bearbeiten": "Modificare i dettagli del contatto",
        "Kontaktliste suchen/filtern": "Cercare / filtrare lista contatti",
        "Kontakt als Kunde markieren": "Contrassegnare contatto come cliente",
        "Kontakt als Lieferant markieren": "Contrassegnare contatto come fornitore",
        "Kontakt l\u00f6schen/archivieren": "Eliminare / archiviare contatto",
        "Kontaktnotizen hinzuf\u00fcgen": "Aggiungere note al contatto",
        "Mehrere Kontakte \u00fcber CSV importieren": "Importare pi\u00f9 contatti tramite CSV",
        "Kundenkontoauszug anzeigen": "Visualizzare estratto conto cliente",
        "Lieferantenkontoauszug anzeigen": "Visualizzare estratto conto fornitore",
        "Erstellen Sie ein neues Angebot": "Creare una nuova offerta",
        "Angebotspositionen hinzuf\u00fcgen": "Aggiungere voci all'offerta",
        "Angebots-PDF herunterladen": "Scaricare PDF dell'offerta",
        "Angebot per E-Mail versenden": "Inviare offerta per e-mail",
        "Angebot in Rechnung umwandeln": "Convertire offerta in fattura",
        "Angebot duplizieren": "Duplicare offerta",
        "Angebot stornieren": "Annullare offerta",
        "Bestellung aus Angebot erstellen": "Creare ordine da offerta",
        "Bestellstatus verfolgen": "Monitorare stato ordine",
        "Bestellung in Rechnung umwandeln": "Convertire ordine in fattura",
        "Erstellen Sie eine neue Rechnung": "Creare una nuova fattura",
        "Rechnungspositionen mit MwSt. hinzuf\u00fcgen": "Aggiungere voci fattura con IVA",
        "Rechnungs-PDF erstellen": "Generare PDF fattura",
        "Rechnung per E-Mail an Kunden senden": "Inviare fattura al cliente per e-mail",
        "Zahlung auf Rechnung verbuchen": "Registrare pagamento su fattura",
        "Rechnung als bezahlt markieren": "Contrassegnare fattura come pagata",
        "\u00dcberf\u00e4llige Rechnungen identifizieren": "Identificare fatture scadute",
        "Gutschrift f\u00fcr eine Rechnung ausstellen": "Emettere nota di credito per fattura",
        "Rechnung stornieren/annullieren": "Annullare fattura",
        "Rechnung duplizieren": "Duplicare fattura",
        "Rechnungsrabatte anwenden (Zeilen-/Gesamtrabatt)": "Applicare sconti fattura (riga / totale)",
        "Swiss QR-Rechnung erstellen und validieren": "Creare e validare fattura QR svizzera",
        "Wiederkehrende Rechnungsvorlage erstellen": "Creare modello fattura ricorrente",
        "Wiederholungsintervall konfigurieren (monatlich/quartalsweise)": "Configurare intervallo ricorrenza (mensile / trimestrale)",
        "N\u00e4chste Rechnungsvorschau \u00fcberpr\u00fcfen": "Verificare anteprima prossima fattura",
        "Wiederkehrende Rechnung pausieren": "Mettere in pausa fattura ricorrente",
        "Wiederkehrende Rechnung beenden": "Terminare fattura ricorrente",
        "Neue Ausgabe manuell erfassen": "Registrare nuova spesa manualmente",
        "Ausgabenbeleg hochladen (Bild/PDF)": "Caricare ricevuta spesa (immagine/PDF)",
        "OCR-Erkennung f\u00fcr Belege testen": "Testare riconoscimento OCR per ricevute",
        "Ausgabe einer Kategorie/Konto zuordnen": "Assegnare spesa a categoria / conto",
        "Ausgabe genehmigen (Workflow)": "Approvare spesa (workflow)",
        "Ausgabe ablehnen mit Begr\u00fcndung": "Rifiutare spesa con motivazione",
        "Ausgabe als bezahlt markieren": "Contrassegnare spesa come pagata",
        "Lieferantenrechnung aus Ausgabe erstellen": "Creare fattura fornitore da spesa",
        "Ausgabenliste filtern/suchen": "Filtrare / cercare lista spese",
        "Ausgaben-Zusammenfassung f\u00fcr einen Zeitraum anzeigen": "Visualizzare riepilogo spese per periodo",
        "Manuelle Journalbuchung erstellen": "Creare registrazione manuale",
        "Soll = Haben Validierung pr\u00fcfen": "Verificare validazione dare = avere",
        "Journalbuchung bearbeiten (vor Buchung)": "Modificare registrazione (prima della contabilizzazione)",
        "Journalbuchung stornieren/umkehren": "Stornare / annullare registrazione",
        "Buchungsjournalliste anzeigen und filtern": "Visualizzare e filtrare lista registrazioni",
        "Journalbuchung mit Beleg verkn\u00fcpfen": "Collegare registrazione a documento",
        "Buchungsperiode sperren": "Bloccare periodo contabile",
        "Automatische Journalbuchung aus Rechnung pr\u00fcfen": "Verificare registrazione automatica da fattura",
        "Er\u00f6ffnungsbilanz buchen": "Registrare bilancio di apertura",
        "Sammeljournal (Batch) buchen": "Registrare giornale batch",
        "MwSt.-Bericht f\u00fcr aktuelle Periode erstellen": "Generare report IVA per periodo corrente",
        "MwSt.-S\u00e4tze in Rechnungen \u00fcberpr\u00fcfen": "Verificare aliquote IVA nelle fatture",
        "MwSt.-Abrechnung herunterladen": "Scaricare dichiarazione IVA",
        "Korrektur-MwSt.-Buchung erstellen": "Creare registrazione correzione IVA",
        "EU-MwSt.-Regeln f\u00fcr Nicht-CH-Unternehmen testen": "Testare regole IVA UE per aziende non-CH",
        "Banktransaktionen importieren": "Importare transazioni bancarie",
        "Automatischen Abgleichsvorschlag pr\u00fcfen": "Verificare suggerimento abbinamento automatico",
        "Transaktion manuell einer Rechnung zuordnen": "Abbinare manualmente transazione a fattura",
        "Nicht zugeordnete Transaktion als Ausgabe buchen": "Registrare transazione non abbinata come spesa",
        "Bankabstimmung f\u00fcr Monat abschlie\u00dfen": "Completare riconciliazione bancaria mensile",
        "Abstimmungsdifferenz anzeigen": "Visualizzare differenza di riconciliazione",
        "Importierte Transaktion aufteilen": "Suddividere transazione importata",
        "Bankfeed-Verbindung einrichten (Nordigen)": "Configurare connessione bank feed (Nordigen)",
        "Bankfeed automatisch synchronisieren": "Sincronizzare automaticamente bank feed",
        "Bankkontostand mit Buchhaltung vergleichen": "Confrontare saldo bancario con contabilit\u00e0",
        "Dashboard-\u00dcbersicht anzeigen": "Visualizzare panoramica dashboard",
        "Erfolgsrechnung (P&L) erstellen": "Generare conto economico (P&L)",
        "Bilanz erstellen": "Generare bilancio",
        "Kontoauszug f\u00fcr einzelnes Konto anzeigen": "Visualizzare estratto conto singolo",
        "Kostenstellen-Bericht erstellen": "Generare report centri di costo",
        "Cashflow-Bericht anzeigen": "Visualizzare report flussi di cassa",
        "Offene-Posten-Liste erstellen (Debitoren)": "Generare lista partite aperte (debitori)",
        "Offene-Posten-Liste erstellen (Kreditoren)": "Generare lista partite aperte (creditori)",
        "Dashboard-Zeitraum filtern": "Filtrare periodo dashboard",
        "Bericht als PDF/Excel exportieren": "Esportare report come PDF / Excel",
        "Dokument hochladen und kategorisieren": "Caricare e categorizzare documento",
        "Dokumentensuche testen": "Testare ricerca documenti",
        "Dokument mit Transaktion verkn\u00fcpfen": "Collegare documento a transazione",
        "Dokumentenvorschau anzeigen": "Visualizzare anteprima documento",
        "Dokument herunterladen": "Scaricare documento",
        "Zweites Unternehmen erstellen": "Creare seconda azienda",
        "Zwischen Unternehmen wechseln": "Passare tra le aziende",
        "Unternehmensdaten bearbeiten": "Modificare dati aziendali",
        "Benutzerzugriff pro Unternehmen konfigurieren": "Configurare accesso utente per azienda",
        "Unternehmens\u00fcbergreifenden Bericht erstellen": "Generare report inter-aziendale",
        "Buchen Sie R\u00fcckstellungen und Vorauszahlungen": "Registrare accantonamenti e ratei",
        "Gesch\u00e4ftsjahr abschlie\u00dfen / Neues Jahr er\u00f6ffnen": "Chiudere esercizio / Aprire nuovo anno",
        "\u00dcberpr\u00fcfen Sie die Er\u00f6ffnungssalden f\u00fcr das neue Jahr": "Verificare saldi di apertura nuovo anno",
        "Exportieren Sie das Ganzjahresjournal f\u00fcr die Pr\u00fcfung": "Esportare giornale annuale per revisione",
        "Jahresenddokumente archivieren": "Archiviare documenti di fine anno",
    }

    for i in range(it_start, len(lines)):
        line = lines[i]

        for de, it in it_title_map.items():
            line = line.replace(de, it)

        # Phase names
        line = line.replace("A. Phase 1: Authentifizierung und Anmeldung", "A. Fase 1: Autenticazione e accesso")
        line = line.replace("B. Phase 2: Unternehmen und Ersteinrichtung", "B. Fase 2: Azienda e configurazione iniziale")
        line = line.replace("D. Phase 4: Banking-Einrichtung", "D. Fase 4: Configurazione bancaria")
        line = line.replace("E. Phase 5: Kontakt- und CRM-Management", "E. Fase 5: Gestione contatti e CRM")
        line = line.replace("F. Phase 6: Angebote und Bestellungen", "F. Fase 6: Offerte e ordini")
        line = line.replace("G. Phase 7: Rechnungsstellung und Abrechnung", "G. Fase 7: Fatturazione")
        line = line.replace("H. Phase 8: Wiederkehrende Rechnungen", "H. Fase 8: Fatture ricorrenti")
        line = line.replace("I. Phase 9: Kostenmanagement", "I. Fase 9: Gestione spese")
        line = line.replace("J. Phase 10: Buchhaltung und Journaleintr\u00e4ge", "J. Fase 10: Contabilit\u00e0 e registrazioni")
        line = line.replace("K. Phase 11: Mehrwertsteuerverwaltung", "K. Fase 11: Gestione IVA")
        line = line.replace("L. Phase 12: Banking und Vers\u00f6hnung", "L. Fase 12: Banking e riconciliazione")
        line = line.replace("M. Phase 13: Berichte und Dashboard", "M. Fase 13: Report e dashboard")
        line = line.replace("N. Phase 14: Dokumentenmanagement", "N. Fase 14: Gestione documenti")
        line = line.replace("O. Phase 15: Multi-Company-Management", "O. Fase 15: Gestione multi-azienda")
        line = line.replace("P. Phase 16: Einstellungen und Konfiguration", "P. Fase 16: Impostazioni e configurazione")
        line = line.replace("Q/F. Phase 17: Aufgaben zum Jahresende", "Q/F. Fase 17: Operazioni di chiusura annuale")

        # Guide text
        if "Die Buchhaltung folgt" in line:
            line = line.replace(
                "Die Buchhaltung folgt einem vollst\u00e4ndigen 17-Phasen-UAT-Plan, der aus dem offiziellen Testdokument importiert wurde. F\u00fchren Sie die Phasen der Reihe nach aus und protokollieren Sie alle Fehler mit genauen Schritt-/Aktionsnachweisen.",
                "La contabilit\u00e0 segue un piano UAT completo di 17 fasi importato dal documento di test ufficiale. Eseguire le fasi in ordine e registrare tutti i bug con evidenze precise di passaggi/azioni."
            )

        # Steps
        line = line.replace("\u00dcberpr\u00fcfe, dass der Button", "Verificare che il pulsante")
        line = line.replace("\u00dcberpr\u00fcfe, dass der Text", "Verificare che il testo")
        line = line.replace("\u00dcberpr\u00fcfe, dass ein Feld mit dem Platzhalter", "Verificare che un campo con segnaposto")
        line = line.replace("\u00dcberpr\u00fcfe, dass ein Feld mit Platzhalter", "Verificare che un campo con segnaposto")
        line = line.replace("\u00dcberpr\u00fcfe, dass ein Eingabefeld mit Platzhalter", "Verificare che un campo di input con segnaposto")
        line = line.replace("\u00dcberpr\u00fcfe, dass das Eingabefeld mit Platzhalter", "Verificare che il campo di input con segnaposto")
        line = line.replace("sichtbar ist", "sia visibile")
        line = line.replace("Klicke auf den Button", "Fare clic sul pulsante")
        line = line.replace("Klicken Sie auf", "Fare clic su")
        line = line.replace("Navigieren Sie zu", "Navigare a")

        # Expected
        line = line.replace("R\u00fcckstellungen und Vorauszahlungen buchbar.", "Accantonamenti e ratei registrabili.")
        line = line.replace("Gesch\u00e4ftsjahr abschlie\u00dfbar.", "Esercizio fiscale chiudibile.")
        line = line.replace("Er\u00f6ffnungssalden f\u00fcr neues Jahr pr\u00fcfbar.", "Saldi di apertura verificabili per il nuovo anno.")
        line = line.replace("Jahresjournal exportierbar.", "Giornale annuale esportabile.")
        line = line.replace("Jahresenddokumente archivierbar.", "Documenti di fine anno archiviabili.")

        # Auth expected
        line = line.replace("Das Konto wurde erfolgreich erstellt. Der Benutzer wird zur App oder zu einem Onboarding-Assistenten weitergeleitet.",
                           "Account creato con successo. L'utente viene reindirizzato all'app o a una procedura guidata di onboarding.")
        line = line.replace("Der Benutzer wird authentifiziert und zum Anwendungs-Dashboard weitergeleitet.",
                           "L'utente viene autenticato e reindirizzato alla dashboard dell'applicazione.")
        line = line.replace("Die Anmeldung wird abgelehnt. Es wird eine Fehlermeldung angezeigt",
                           "L'accesso viene rifiutato. Viene visualizzato un messaggio di errore")
        line = line.replace("Es wird kein Zugriff gew\u00e4hrt.", "Nessun accesso viene concesso.")
        line = line.replace("Formularvalidierung wird ausgel\u00f6st. Fehler in Pflichtfeldern werden angezeigt. Es wird kein Anmeldeversuch unternommen.",
                           "Viene attivata la validazione del modulo. Vengono visualizzati errori nei campi obbligatori. Nessun tentativo di accesso.")
        line = line.replace("Das Passwort wurde erfolgreich zur\u00fcckgesetzt. Der Benutzer kann sich mit dem neuen Passwort anmelden.",
                           "Password reimpostata con successo. L'utente pu\u00f2 accedere con la nuova password.")
        line = line.replace("Sitzung wird beendet. Der Benutzer wird zur Anmeldeseite weitergeleitet.",
                           "La sessione viene terminata. L'utente viene reindirizzato alla pagina di accesso.")

        line = line.replace("\u201e", '"')
        line = line.replace("\u201c", '"')
        line = line.replace("(z. B. ", "(es. ")

        # Step instructions
        line = line.replace("Melden Sie sich bei der App an", "Accedere all'app")
        line = line.replace("Melden Sie sich mit g\u00fcltigen Zugangsdaten an", "Accedere con credenziali valide")
        line = line.replace("Geben Sie eine g\u00fcltige E-Mail-Adresse ein und erstellen Sie ein Passwort", "Inserire un indirizzo e-mail valido e creare una password")
        line = line.replace("F\u00fchren Sie alle E-Mail-Best\u00e4tigungsschritte aus", "Completare tutti i passaggi di verifica e-mail")
        line = line.replace("Best\u00e4tigen Sie, dass das Konto erstellt wurde", "Confermare che l'account \u00e8 stato creato")
        line = line.replace("Geben Sie eine g\u00fcltige E-Mail-Adresse und ein g\u00fcltiges Passwort ein", "Inserire un indirizzo e-mail e una password validi")
        line = line.replace("Geben Sie ein falsches Passwort f\u00fcr eine g\u00fcltige E-Mail-Adresse ein", "Inserire una password errata per un indirizzo e-mail valido")
        line = line.replace("Lassen Sie die Felder f\u00fcr E-Mail und Passwort leer", "Lasciare vuoti i campi e-mail e password")
        line = line.replace("Geben Sie eine g\u00fcltige registrierte E-Mail-Adresse ein", "Inserire un indirizzo e-mail registrato valido")
        line = line.replace("\u00d6ffnen Sie die E-Mail zum Zur\u00fccksetzen und klicken Sie auf den Link", "Aprire l'e-mail di reset e fare clic sul link")
        line = line.replace("Geben Sie ein neues Passwort ein und best\u00e4tigen Sie es", "Inserire una nuova password e confermarla")
        line = line.replace("Navigieren Sie zum Benutzerprofil oder zum Einstellungsmen\u00fc", "Navigare al profilo utente o al menu impostazioni")

        lines[i] = line

    # === STEP 3: Insert Phase 18 into all 4 language sections ===

    new_phases = {
        "DE": '''        {
          "idx": 18,
          "name": "R. Phase 18: Neue Funktionen (2026)",
          "cases": [
            { "id": "ACC-121", "title": "Sicherheits-Dashboard anzeigen", "where": "Admin > Security", "steps": "1. Als Super Admin anmelden\\n2. Navigieren Sie zu Admin\\n3. Klicken Sie auf den Tab \\"Security\\"\\n4. \u00dcberpr\u00fcfen Sie, dass die Sicherheits\u00fcbersicht geladen wird", "expected": "Das Security-Dashboard zeigt Statistikkarten (gescannte Dateien, KI-Modell, Infrastrukturstatus, aktive Warnungen) und den neuesten Sicherheitsbericht.", "prio": "High" },
            { "id": "ACC-122", "title": "Sicherheits-Scan-Verlauf anzeigen", "where": "Admin > Security", "steps": "1. Navigieren Sie zu Admin > Security\\n2. Scrollen Sie zum Bereich \\"Scan History\\"\\n3. \u00dcberpr\u00fcfen Sie, dass vergangene Scans mit Schweregrad-Indikatoren angezeigt werden", "expected": "Der Scan-Verlauf zeigt vergangene Sicherheitsscans mit Zeitstempel, Schweregrad und Zusammenfassung.", "prio": "Medium" },
            { "id": "ACC-123", "title": "Anomalie-Warnungen anzeigen", "where": "Admin > Security", "steps": "1. Navigieren Sie zu Admin > Security\\n2. \u00dcberpr\u00fcfen Sie den Bereich \\"Anomaly Alerts\\"\\n3. Best\u00e4tigen Sie, dass hochpriorit\u00e4re Warnungen angezeigt werden", "expected": "Anomalie-Warnungen werden mit Schweregrad, Beschreibung und Zeitstempel angezeigt.", "prio": "Medium" },
            { "id": "ACC-124", "title": "Mixail-KI-Assistent \u00f6ffnen", "where": "Beliebige App-Seite", "steps": "1. Melden Sie sich an und navigieren Sie zu einer beliebigen Seite\\n2. Klicken Sie auf den Button \\"Mixail fragen\\" (unten rechts)\\n3. \u00dcberpr\u00fcfen Sie, dass das Chat-Fenster erscheint", "expected": "Das Chat-Fenster \u00f6ffnet sich mit dem Titel \\"Mixel Buchhaltung KI\\", einer Willkommensnachricht und Vorschlagsfragen.", "prio": "High" },
            { "id": "ACC-125", "title": "Frage an Mixail stellen", "where": "Mixail-Chat", "steps": "1. \u00d6ffnen Sie den Mixail-Chat\\n2. Geben Sie eine Frage ein (z.B. \\"Wie sende ich eine Rechnung?\\")\\n3. Klicken Sie auf Senden\\n4. Warten Sie auf die Antwort", "expected": "Eine KI-generierte Antwort wird im Chat-Fenster angezeigt. Streaming-Text wird sichtbar.", "prio": "High" },
            { "id": "ACC-126", "title": "Mixail-Vorschlagsfragen verwenden", "where": "Mixail-Chat", "steps": "1. \u00d6ffnen Sie den Mixail-Chat\\n2. Klicken Sie auf eine der vorgeschlagenen Fragen\\n3. \u00dcberpr\u00fcfen Sie, dass die Frage gesendet wird", "expected": "Die vorgeschlagene Frage wird automatisch gesendet und eine Antwort generiert.", "prio": "Medium" },
            { "id": "ACC-127", "title": "Admin-Einladungen-Tab anzeigen", "where": "Admin > Einladungen", "steps": "1. Als Super Admin anmelden\\n2. Navigieren Sie zu Admin\\n3. Klicken Sie auf den Tab \\"Einladungen\\"\\n4. \u00dcberpr\u00fcfen Sie die Einladungsliste", "expected": "Der Einladungen-Tab zeigt ausstehende und versendete Einladungen mit Status.", "prio": "Medium" },
            { "id": "ACC-128", "title": "Admin-Testphasen-Tab anzeigen", "where": "Admin > Testphasen", "steps": "1. Als Super Admin anmelden\\n2. Navigieren Sie zu Admin\\n3. Klicken Sie auf den Tab \\"Testphasen\\"\\n4. \u00dcberpr\u00fcfen Sie die Trial-Liste", "expected": "Der Testphasen-Tab zeigt aktive und abgelaufene Testphasen mit Ablaufdatum.", "prio": "Medium" },
            { "id": "ACC-129", "title": "Jahresabschluss-Assistent \u00f6ffnen", "where": "Buchhaltung > Jahresabschluss", "steps": "1. Navigieren Sie zu Buchhaltung\\n2. Klicken Sie auf \\"Jahresabschluss\\"\\n3. \u00dcberpr\u00fcfen Sie, dass der 8-Schritte-Assistent erscheint", "expected": "Der Jahresabschluss-Assistent \u00f6ffnet sich mit Schritt 1: Gesch\u00e4ftsjahr ausw\u00e4hlen.", "prio": "Critical" },
            { "id": "ACC-130", "title": "Jahresabschluss-Checkliste durchgehen", "where": "Buchhaltung > Jahresabschluss", "steps": "1. W\u00e4hlen Sie ein offenes Gesch\u00e4ftsjahr\\n2. Klicken Sie auf Weiter\\n3. \u00dcberpr\u00fcfen Sie die Checkliste (Schritt 2)\\n4. Best\u00e4tigen Sie, dass alle Pr\u00fcfungen angezeigt werden", "expected": "Die Checkliste zeigt: Keine ungebuchten Journaleintr\u00e4ge, Journaleintr\u00e4ge vorhanden, P&L-Konten mit Salden.", "prio": "Critical" },
            { "id": "ACC-131", "title": "P&L-Konten im Jahresabschluss pr\u00fcfen", "where": "Buchhaltung > Jahresabschluss", "steps": "1. Navigieren Sie zu Schritt 5 des Assistenten\\n2. \u00dcberpr\u00fcfen Sie Gesamtertrag, Gesamtaufwand und Reingewinn\\n3. Pr\u00fcfen Sie die Auflistung der Ertrags- und Aufwandskonten", "expected": "Zusammenfassungskarten zeigen Gesamtertrag, Gesamtaufwand und Reingewinn. Ertrags- und Aufwandskonten sind aufgelistet.", "prio": "Critical" },
            { "id": "ACC-132", "title": "Abschlussbuchungen erstellen und Perioden sperren", "where": "Buchhaltung > Jahresabschluss", "steps": "1. Navigieren Sie zu Schritt 6 des Assistenten\\n2. \u00dcberpr\u00fcfen Sie die Abschlussbuchungsvorschau\\n3. Best\u00e4tigen Sie den Gewinnvortragscode (2970)\\n4. Fahren Sie mit Schritt 7 (Perioden sperren) fort\\n5. Schlie\u00dfen Sie den Assistenten ab", "expected": "Abschlussbuchung wird erstellt. Monate werden gesperrt. Best\u00e4tigungsseite zeigt Buchungsnummer, Journalzeilen und gesperrte Monate.", "prio": "Critical" }
          ]
        }''',
        "FR": '''        {
          "idx": 18,
          "name": "R. Phase 18 : Nouvelles fonctionnalit\u00e9s (2026)",
          "cases": [
            { "id": "ACC-121", "title": "Afficher le tableau de bord de s\u00e9curit\u00e9", "where": "Admin > Security", "steps": "1. Se connecter en tant que Super Admin\\n2. Naviguer vers Admin\\n3. Cliquer sur l'onglet \\"Security\\"\\n4. V\u00e9rifier que l'aper\u00e7u de s\u00e9curit\u00e9 se charge", "expected": "Le tableau de bord Security affiche les cartes statistiques (fichiers analys\u00e9s, mod\u00e8le IA, \u00e9tat de l'infrastructure, alertes actives) et le dernier rapport.", "prio": "High" },
            { "id": "ACC-122", "title": "Afficher l'historique des scans", "where": "Admin > Security", "steps": "1. Naviguer vers Admin > Security\\n2. Faire d\u00e9filer jusqu'\u00e0 \\"Scan History\\"\\n3. V\u00e9rifier que les scans pass\u00e9s sont affich\u00e9s", "expected": "L'historique des scans montre les analyses pass\u00e9es avec horodatage, gravit\u00e9 et r\u00e9sum\u00e9.", "prio": "Medium" },
            { "id": "ACC-123", "title": "Afficher les alertes d'anomalies", "where": "Admin > Security", "steps": "1. Naviguer vers Admin > Security\\n2. V\u00e9rifier la section \\"Anomaly Alerts\\"\\n3. Confirmer que les alertes prioritaires sont affich\u00e9es", "expected": "Les alertes d'anomalies sont affich\u00e9es avec gravit\u00e9, description et horodatage.", "prio": "Medium" },
            { "id": "ACC-124", "title": "Ouvrir l'assistant IA Mixail", "where": "Toute page de l'application", "steps": "1. Se connecter et naviguer vers n'importe quelle page\\n2. Cliquer sur le bouton \\"Demander \u00e0 Mixail\\" (en bas \u00e0 droite)\\n3. V\u00e9rifier que la fen\u00eatre de chat appara\u00eet", "expected": "La fen\u00eatre de chat s'ouvre avec le titre \\"Mixel Comptabilit\u00e9 IA\\", un message de bienvenue et des questions sugg\u00e9r\u00e9es.", "prio": "High" },
            { "id": "ACC-125", "title": "Poser une question \u00e0 Mixail", "where": "Chat Mixail", "steps": "1. Ouvrir le chat Mixail\\n2. Saisir une question (ex. \\"Comment envoyer une facture ?\\")\\n3. Cliquer sur Envoyer\\n4. Attendre la r\u00e9ponse", "expected": "Une r\u00e9ponse g\u00e9n\u00e9r\u00e9e par l'IA s'affiche dans le chat. Le texte en streaming est visible.", "prio": "High" },
            { "id": "ACC-126", "title": "Utiliser les questions sugg\u00e9r\u00e9es", "where": "Chat Mixail", "steps": "1. Ouvrir le chat Mixail\\n2. Cliquer sur une des questions sugg\u00e9r\u00e9es\\n3. V\u00e9rifier que la question est envoy\u00e9e", "expected": "La question sugg\u00e9r\u00e9e est envoy\u00e9e automatiquement et une r\u00e9ponse est g\u00e9n\u00e9r\u00e9e.", "prio": "Medium" },
            { "id": "ACC-127", "title": "Afficher l'onglet Invitations", "where": "Admin > Invitations", "steps": "1. Se connecter en tant que Super Admin\\n2. Naviguer vers Admin\\n3. Cliquer sur l'onglet \\"Invitations\\"\\n4. V\u00e9rifier la liste des invitations", "expected": "L'onglet Invitations affiche les invitations en attente et envoy\u00e9es avec leur statut.", "prio": "Medium" },
            { "id": "ACC-128", "title": "Afficher l'onglet Essais", "where": "Admin > Essais", "steps": "1. Se connecter en tant que Super Admin\\n2. Naviguer vers Admin\\n3. Cliquer sur l'onglet \\"Essais\\"\\n4. V\u00e9rifier la liste des essais", "expected": "L'onglet Essais affiche les p\u00e9riodes d'essai actives et expir\u00e9es avec date d'expiration.", "prio": "Medium" },
            { "id": "ACC-129", "title": "Ouvrir l'assistant de cl\u00f4ture annuelle", "where": "Comptabilit\u00e9 > Cl\u00f4ture annuelle", "steps": "1. Naviguer vers Comptabilit\u00e9\\n2. Cliquer sur \\"Cl\u00f4ture annuelle\\"\\n3. V\u00e9rifier que l'assistant en 8 \u00e9tapes appara\u00eet", "expected": "L'assistant de cl\u00f4ture annuelle s'ouvre \u00e0 l'\u00e9tape 1 : S\u00e9lectionner l'exercice fiscal.", "prio": "Critical" },
            { "id": "ACC-130", "title": "Parcourir la checklist de cl\u00f4ture", "where": "Comptabilit\u00e9 > Cl\u00f4ture annuelle", "steps": "1. S\u00e9lectionner un exercice fiscal ouvert\\n2. Cliquer sur Suivant\\n3. V\u00e9rifier la checklist (\u00e9tape 2)\\n4. Confirmer que toutes les v\u00e9rifications sont affich\u00e9es", "expected": "La checklist affiche : Pas d'\u00e9critures non comptabilis\u00e9es, \u00c9critures existantes, Comptes de r\u00e9sultat avec soldes.", "prio": "Critical" },
            { "id": "ACC-131", "title": "V\u00e9rifier les comptes P&L", "where": "Comptabilit\u00e9 > Cl\u00f4ture annuelle", "steps": "1. Naviguer \u00e0 l'\u00e9tape 5 de l'assistant\\n2. V\u00e9rifier Total des produits, Total des charges et R\u00e9sultat net\\n3. Examiner la liste des comptes", "expected": "Les cartes r\u00e9sum\u00e9 montrent Total des produits, Total des charges et R\u00e9sultat net. Les comptes sont list\u00e9s.", "prio": "Critical" },
            { "id": "ACC-132", "title": "Cr\u00e9er les \u00e9critures de cl\u00f4ture", "where": "Comptabilit\u00e9 > Cl\u00f4ture annuelle", "steps": "1. Naviguer \u00e0 l'\u00e9tape 6\\n2. V\u00e9rifier l'aper\u00e7u de l'\u00e9criture de cl\u00f4ture\\n3. Confirmer le code Report de b\u00e9n\u00e9fice (2970)\\n4. Passer \u00e0 l'\u00e9tape 7\\n5. Terminer l'assistant", "expected": "L'\u00e9criture de cl\u00f4ture est cr\u00e9\u00e9e. Les mois sont verrouill\u00e9s. La page de confirmation affiche le num\u00e9ro, les lignes et les mois verrouill\u00e9s.", "prio": "Critical" }
          ]
        }''',
        "EN": '''        {
          "idx": 18,
          "name": "R. Phase 18: New Features (2026)",
          "cases": [
            { "id": "ACC-121", "title": "View Security Dashboard", "where": "Admin > Security", "steps": "1. Sign in as Super Admin\\n2. Navigate to Admin\\n3. Click the \\"Security\\" tab\\n4. Verify the security overview loads", "expected": "The Security Dashboard displays stat cards (files scanned, AI model, infra health, active alerts) and the latest security report.", "prio": "High" },
            { "id": "ACC-122", "title": "View Security Scan History", "where": "Admin > Security", "steps": "1. Navigate to Admin > Security\\n2. Scroll to the \\"Scan History\\" section\\n3. Verify past scans with severity indicators are displayed", "expected": "Scan history shows past security scans with timestamp, severity (critical/high/medium/low) and summary.", "prio": "Medium" },
            { "id": "ACC-123", "title": "View Anomaly Alerts", "where": "Admin > Security", "steps": "1. Navigate to Admin > Security\\n2. Check the \\"Anomaly Alerts\\" section\\n3. Confirm high-priority alerts are displayed", "expected": "Anomaly alerts are displayed with severity, description and timestamp.", "prio": "Medium" },
            { "id": "ACC-124", "title": "Open Mixail AI Assistant", "where": "Any App Page", "steps": "1. Sign in and navigate to any page\\n2. Click the \\"Ask Mixail\\" button (bottom right)\\n3. Verify the chat window appears", "expected": "The chat window opens with the title \\"Mixel Accounting AI\\", a welcome message and suggested questions.", "prio": "High" },
            { "id": "ACC-125", "title": "Ask Mixail a Question", "where": "Mixail Chat", "steps": "1. Open the Mixail chat\\n2. Type a question (e.g. \\"How do I send an invoice?\\")\\n3. Click Send\\n4. Wait for the response", "expected": "An AI-generated response is displayed in the chat window. Streaming text is visible.", "prio": "High" },
            { "id": "ACC-126", "title": "Use Mixail Suggested Questions", "where": "Mixail Chat", "steps": "1. Open the Mixail chat\\n2. Click one of the suggested questions\\n3. Verify the question is sent", "expected": "The suggested question is automatically sent and a response is generated.", "prio": "Medium" },
            { "id": "ACC-127", "title": "View Admin Invitations Tab", "where": "Admin > Invitations", "steps": "1. Sign in as Super Admin\\n2. Navigate to Admin\\n3. Click the \\"Invitations\\" tab\\n4. Check the invitations list", "expected": "The Invitations tab shows pending and sent invitations with status.", "prio": "Medium" },
            { "id": "ACC-128", "title": "View Admin Trials Tab", "where": "Admin > Trials", "steps": "1. Sign in as Super Admin\\n2. Navigate to Admin\\n3. Click the \\"Trials\\" tab\\n4. Check the trials list", "expected": "The Trials tab shows active and expired trial periods with expiry dates.", "prio": "Medium" },
            { "id": "ACC-129", "title": "Open Year-End Closing Wizard", "where": "Accounting > Year-End Closing", "steps": "1. Navigate to Accounting\\n2. Click \\"Year-End Closing\\"\\n3. Verify the 8-step wizard appears", "expected": "The Year-End Closing wizard opens at Step 1: Select the fiscal year to close.", "prio": "Critical" },
            { "id": "ACC-130", "title": "Year-End Closing Checklist", "where": "Accounting > Year-End Closing", "steps": "1. Select an open fiscal year\\n2. Click Next\\n3. Review the checklist (Step 2)\\n4. Confirm all checks are displayed", "expected": "The checklist shows: No unposted journal entries, Journal entries exist, P&L accounts have balances.", "prio": "Critical" },
            { "id": "ACC-131", "title": "Review P&L Accounts in Year-End Closing", "where": "Accounting > Year-End Closing", "steps": "1. Navigate to Step 5 of the wizard\\n2. Review Total Revenue, Total Expenses and Net Income\\n3. Check the revenue and expense account lists", "expected": "Summary cards show Total Revenue, Total Expenses and Net Income. Revenue and expense accounts are listed.", "prio": "Critical" },
            { "id": "ACC-132", "title": "Generate Closing Entries and Lock Periods", "where": "Accounting > Year-End Closing", "steps": "1. Navigate to Step 6 of the wizard\\n2. Review the closing entry preview\\n3. Confirm retained earnings code (2970)\\n4. Proceed to Step 7 (Lock Periods)\\n5. Complete the wizard", "expected": "Closing entry is created. Months are locked. Confirmation page shows entry number, journal lines and locked months.", "prio": "Critical" }
          ]
        }''',
        "IT": '''        {
          "idx": 18,
          "name": "R. Fase 18: Nuove funzionalit\u00e0 (2026)",
          "cases": [
            { "id": "ACC-121", "title": "Visualizzare dashboard sicurezza", "where": "Admin > Security", "steps": "1. Accedere come Super Admin\\n2. Navigare a Admin\\n3. Fare clic sulla scheda \\"Security\\"\\n4. Verificare che la panoramica sicurezza si carichi", "expected": "La dashboard Security mostra schede statistiche (file analizzati, modello IA, stato infrastruttura, avvisi attivi) e l'ultimo rapporto.", "prio": "High" },
            { "id": "ACC-122", "title": "Visualizzare cronologia scansioni", "where": "Admin > Security", "steps": "1. Navigare a Admin > Security\\n2. Scorrere fino a \\"Scan History\\"\\n3. Verificare che le scansioni passate siano visualizzate", "expected": "La cronologia scansioni mostra le analisi passate con timestamp, gravit\u00e0 e riepilogo.", "prio": "Medium" },
            { "id": "ACC-123", "title": "Visualizzare avvisi anomalie", "where": "Admin > Security", "steps": "1. Navigare a Admin > Security\\n2. Verificare la sezione \\"Anomaly Alerts\\"\\n3. Confermare che gli avvisi ad alta priorit\u00e0 sono visualizzati", "expected": "Gli avvisi anomalie sono visualizzati con gravit\u00e0, descrizione e timestamp.", "prio": "Medium" },
            { "id": "ACC-124", "title": "Aprire assistente IA Mixail", "where": "Qualsiasi pagina dell'app", "steps": "1. Accedere e navigare a qualsiasi pagina\\n2. Fare clic sul pulsante \\"Chiedi a Mixail\\" (in basso a destra)\\n3. Verificare che la finestra chat appaia", "expected": "La finestra chat si apre con il titolo \\"Mixel Contabilit\u00e0 IA\\", un messaggio di benvenuto e domande suggerite.", "prio": "High" },
            { "id": "ACC-125", "title": "Fare una domanda a Mixail", "where": "Chat Mixail", "steps": "1. Aprire la chat Mixail\\n2. Digitare una domanda (es. \\"Come invio una fattura?\\")\\n3. Fare clic su Invia\\n4. Attendere la risposta", "expected": "Una risposta generata dall'IA viene visualizzata nella chat. Il testo in streaming \u00e8 visibile.", "prio": "High" },
            { "id": "ACC-126", "title": "Usare domande suggerite Mixail", "where": "Chat Mixail", "steps": "1. Aprire la chat Mixail\\n2. Fare clic su una delle domande suggerite\\n3. Verificare che la domanda venga inviata", "expected": "La domanda suggerita viene inviata automaticamente e viene generata una risposta.", "prio": "Medium" },
            { "id": "ACC-127", "title": "Visualizzare scheda Inviti admin", "where": "Admin > Inviti", "steps": "1. Accedere come Super Admin\\n2. Navigare a Admin\\n3. Fare clic sulla scheda \\"Inviti\\"\\n4. Controllare la lista inviti", "expected": "La scheda Inviti mostra inviti in sospeso e inviati con stato.", "prio": "Medium" },
            { "id": "ACC-128", "title": "Visualizzare scheda Prove admin", "where": "Admin > Prove", "steps": "1. Accedere come Super Admin\\n2. Navigare a Admin\\n3. Fare clic sulla scheda \\"Prove\\"\\n4. Controllare la lista prove", "expected": "La scheda Prove mostra periodi di prova attivi e scaduti con data di scadenza.", "prio": "Medium" },
            { "id": "ACC-129", "title": "Aprire procedura chiusura annuale", "where": "Contabilit\u00e0 > Chiusura annuale", "steps": "1. Navigare a Contabilit\u00e0\\n2. Fare clic su \\"Chiusura annuale\\"\\n3. Verificare che la procedura guidata a 8 passaggi appaia", "expected": "La procedura di chiusura annuale si apre al Passaggio 1: Selezionare l'esercizio da chiudere.", "prio": "Critical" },
            { "id": "ACC-130", "title": "Checklist chiusura annuale", "where": "Contabilit\u00e0 > Chiusura annuale", "steps": "1. Selezionare un esercizio fiscale aperto\\n2. Fare clic su Avanti\\n3. Verificare la checklist (Passaggio 2)\\n4. Confermare che tutte le verifiche sono visualizzate", "expected": "La checklist mostra: Nessuna registrazione non contabilizzata, Registrazioni esistenti, Conti economici con saldi.", "prio": "Critical" },
            { "id": "ACC-131", "title": "Verificare conti P&L nella chiusura", "where": "Contabilit\u00e0 > Chiusura annuale", "steps": "1. Navigare al Passaggio 5\\n2. Verificare Totale ricavi, Totale costi e Utile netto\\n3. Controllare le liste dei conti", "expected": "Le schede riepilogo mostrano Totale ricavi, Totale costi e Utile netto. I conti sono elencati.", "prio": "Critical" },
            { "id": "ACC-132", "title": "Creare scritture di chiusura e bloccare periodi", "where": "Contabilit\u00e0 > Chiusura annuale", "steps": "1. Navigare al Passaggio 6\\n2. Verificare l'anteprima della scrittura\\n3. Confermare il codice Utili portati a nuovo (2970)\\n4. Procedere al Passaggio 7\\n5. Completare la procedura", "expected": "La scrittura di chiusura viene creata. I mesi vengono bloccati. La pagina di conferma mostra numero, righe e mesi bloccati.", "prio": "Critical" }
          ]
        }'''
    }

    # Find all "idx": 17 locations and insert Phase 18 after them
    content = "\n".join(lines)
    lines = content.split("\n")

    idx17_positions = []
    for i, line in enumerate(lines):
        if '"idx": 17' in line:
            idx17_positions.append(i)

    # For each idx:17, find the closing brace of that phase object
    inserts = []
    for idx17_line in idx17_positions:
        # Find language
        lang = None
        for j in range(idx17_line, -1, -1):
            s = lines[j].strip()
            if s in ("DE: [", "FR: [", "EN: [", "IT: ["):
                lang = s.split(":")[0].strip()
                break
        if not lang:
            continue

        # Find matching close brace for this phase object
        depth = 0
        close_line = None
        for j in range(idx17_line, len(lines)):
            for ch in lines[j]:
                if ch == '{':
                    depth += 1
                elif ch == '}':
                    depth -= 1
                    if depth == 0:
                        close_line = j
                        break
            if close_line is not None:
                break

        if close_line and lang in new_phases:
            inserts.append((close_line, lang))

    # Insert in reverse order
    for close_line, lang in sorted(inserts, reverse=True):
        # Add comma after phase 17 close
        lines[close_line] = lines[close_line].rstrip()
        if not lines[close_line].endswith(","):
            lines[close_line] += ","
        # Insert new phase after
        lines.insert(close_line + 1, new_phases[lang])

    result = "\n".join(lines)

    with open("apps.json", "w", encoding="utf-8") as f:
        f.write(result)

    # Verify
    en_german_check = ["Überprüfe", "Klicke auf den", "Navigieren Sie", "sichtbar ist"]
    result_lines = result.split("\n")
    en_s = None
    it_s = None
    for i, l in enumerate(result_lines):
        if l.strip() == "EN: [":
            en_s = i
        if l.strip() == "IT: [" and en_s:
            it_s = i
            break

    if en_s and it_s:
        en_text = "\n".join(result_lines[en_s:it_s])
        for pattern in en_german_check:
            count = en_text.count(pattern)
            if count > 0:
                print(f"  WARNING: '{pattern}' still appears {count}x in EN section")

    # Count test cases per language
    for lang_name in ["DE", "FR", "EN", "IT"]:
        count = result.count(f'"id": "ACC-')  # rough count

    acc_count = {}
    for lang_name in ["DE", "FR", "EN", "IT"]:
        start = None
        end = None
        for i, l in enumerate(result_lines):
            if l.strip() == f"{lang_name}: [":
                start = i
            elif start and l.strip().startswith(("DE: [", "FR: [", "EN: [", "IT: [", "}")):
                if l.strip() != f"{lang_name}: [":
                    end = i
                    break
        if start:
            section = "\n".join(result_lines[start:(end or len(result_lines))])
            acc_count[lang_name] = section.count('"id": "ACC-')

    print(f"\nTest case counts: {acc_count}")
    print(f"Total lines: {len(result_lines)}")
    print("Done!")


if __name__ == "__main__":
    main()
