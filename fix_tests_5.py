"""Fix test steps to match actual UI elements in acc.mixel.ch.
Run with: python3 fix_tests_5.py
"""
import json

BASE = "https://acc.mixel.ch/en/app"

# ── Per-test step overrides keyed by case ID ──────────────────────────────
# Each value maps lang → new steps string (and optionally 'expected' and 'where')
# Use only ONE canonical language dict, then fan it out where different.
#
# Rules derived from actual component code:
#  - Settings tabs: runner navigates via ?tab= param using 'where' field already
#  - CompanyProfile: input placeholder is dynamic (CHE-xxx from countryConfig), use "Company Name" field
#  - Numbering: prefix inputs use placeholder like "RE-", next-number uses placeholder "1"
#  - Payment terms name placeholder from i18n key (unknown value) — use "Name" or visible text
#  - FinancialSettings: bank name placeholder is "bank name", IBAN uses "CH44 3199..."

OVERRIDES = {

    # ── Auth / Sign-out ──────────────────────────────────────────────────
    "ACC-006": {
        "EN": {
            "steps": (
                f"1. Navigate to {BASE}\n"
                "2. Click the user profile icon at the bottom-left of the sidebar\n"
                "3. Click the 'Sign out' button\n"
                "4. Verify the URL contains '/auth/signin'"
            ),
            "expected": (
                "The user is signed out. The browser navigates to /auth/signin "
                "(which may show an email entry or OTP step). "
                "Presence of the sign-in page confirms successful sign-out."
            ),
        },
        "DE": {
            "steps": (
                f"1. Navigieren Sie zu {BASE}\n"
                "2. Klicken Sie auf das Benutzerprofil-Icon unten links in der Sidebar\n"
                "3. Klicken Sie auf 'Abmelden'\n"
                "4. Prüfen Sie, dass die URL '/auth/signin' enthält"
            ),
            "expected": (
                "Der Benutzer wird abgemeldet. Der Browser navigiert zu /auth/signin "
                "(zeigt E-Mail-Eingabe oder OTP-Schritt). Die Anmeldeseite bestätigt die erfolgreiche Abmeldung."
            ),
        },
        "FR": {
            "steps": (
                f"1. Naviguez vers {BASE}\n"
                "2. Cliquez sur l'icône de profil en bas à gauche de la barre latérale\n"
                "3. Cliquez sur 'Se déconnecter'\n"
                "4. Vérifiez que l'URL contient '/auth/signin'"
            ),
            "expected": (
                "L'utilisateur est déconnecté. Le navigateur va à /auth/signin "
                "(affiche la saisie e-mail ou OTP). La page de connexion confirme la déconnexion."
            ),
        },
        "IT": {
            "steps": (
                f"1. Navigare a {BASE}\n"
                "2. Fare clic sull'icona del profilo in basso a sinistra nella barra laterale\n"
                "3. Fare clic su 'Disconnetti'\n"
                "4. Verificare che l'URL contenga '/auth/signin'"
            ),
            "expected": (
                "L'utente è disconnesso. Il browser va a /auth/signin "
                "(mostra inserimento e-mail o OTP). La pagina di accesso conferma la disconnessione."
            ),
        },
    },

    # ── Settings > Company Profile ───────────────────────────────────────
    "ACC-010": {
        "EN": {
            "steps": (
                f"1. Navigate to {BASE}/settings?tab=company\n"
                "2. Verify the 'Company Profile' section is visible\n"
                "3. Fill in the 'Company Name' field with 'Test AG'\n"
                "4. Fill in the tax ID / UID field with 'CHE-123.456.789'\n"
                "5. Click the 'Save' button\n"
                "6. Verify a success toast message appears"
            ),
            "expected": "Company profile is saved. A success notification appears.",
        },
        "DE": {
            "steps": (
                f"1. Navigieren Sie zu {BASE}/settings?tab=company\n"
                "2. Prüfen Sie, dass der Bereich 'Firmenprofil' sichtbar ist\n"
                "3. Tragen Sie den 'Firmenname' ein (z. B. 'Muster AG')\n"
                "4. Tragen Sie die UID ein (z. B. 'CHE-123.456.789')\n"
                "5. Klicken Sie auf 'Speichern'\n"
                "6. Prüfen Sie, dass eine Erfolgsmeldung erscheint"
            ),
            "expected": "Das Firmenprofil wurde gespeichert. Eine Erfolgsmeldung erscheint.",
        },
        "FR": {
            "steps": (
                f"1. Naviguez vers {BASE}/settings?tab=company\n"
                "2. Vérifiez que la section 'Profil de l'entreprise' est visible\n"
                "3. Remplissez le champ 'Nom de l'entreprise' avec 'Test SA'\n"
                "4. Remplissez le numéro de TVA / UID avec 'CHE-123.456.789'\n"
                "5. Cliquez sur 'Enregistrer'\n"
                "6. Vérifiez qu'un message de succès apparaît"
            ),
            "expected": "Le profil d'entreprise est sauvegardé. Un message de succès apparaît.",
        },
        "IT": {
            "steps": (
                f"1. Navigare a {BASE}/settings?tab=company\n"
                "2. Verificare che la sezione 'Profilo Azienda' sia visibile\n"
                "3. Inserire il 'Nome Azienda' (es. 'Test SA')\n"
                "4. Inserire il numero IVA / UID 'CHE-123.456.789'\n"
                "5. Fare clic su 'Salva'\n"
                "6. Verificare che appaia un messaggio di successo"
            ),
            "expected": "Il profilo aziendale è salvato. Appare un messaggio di successo.",
        },
    },

    # ── Settings > Numbering ─────────────────────────────────────────────
    "ACC-011": {
        "EN": {
            "steps": (
                f"1. Navigate to {BASE}/settings?tab=numbering\n"
                "2. Verify the invoice prefix field is visible (e.g. placeholder 'RE-')\n"
                "3. Verify the invoice next number field is visible\n"
                "4. Change the invoice prefix to 'INV-'\n"
                "5. Click the 'Save' button\n"
                "6. Verify a success message appears"
            ),
            "expected": "Invoice numbering format is updated. A success message appears.",
        },
        "DE": {
            "steps": (
                f"1. Navigieren Sie zu {BASE}/settings?tab=numbering\n"
                "2. Prüfen Sie, dass das Rechnungspräfix-Feld sichtbar ist (z. B. 'RE-')\n"
                "3. Prüfen Sie, dass das Feld für die nächste Rechnungsnummer sichtbar ist\n"
                "4. Ändern Sie das Präfix auf 'RE-'\n"
                "5. Klicken Sie auf 'Speichern'\n"
                "6. Prüfen Sie, dass eine Erfolgsmeldung erscheint"
            ),
            "expected": "Das Rechnungsformat wurde aktualisiert. Eine Erfolgsmeldung erscheint.",
        },
        "FR": {
            "steps": (
                f"1. Naviguez vers {BASE}/settings?tab=numbering\n"
                "2. Vérifiez que le champ de préfixe de facture est visible (ex. 'RE-')\n"
                "3. Vérifiez que le champ du prochain numéro de facture est visible\n"
                "4. Changez le préfixe en 'FA-'\n"
                "5. Cliquez sur 'Enregistrer'\n"
                "6. Vérifiez qu'un message de succès apparaît"
            ),
            "expected": "Le format de numérotation des factures est mis à jour. Un message de succès apparaît.",
        },
        "IT": {
            "steps": (
                f"1. Navigare a {BASE}/settings?tab=numbering\n"
                "2. Verificare che il campo prefisso fattura sia visibile (es. 'RE-')\n"
                "3. Verificare che il campo numero successivo sia visibile\n"
                "4. Modificare il prefisso in 'FAT-'\n"
                "5. Fare clic su 'Salva'\n"
                "6. Verificare che appaia un messaggio di successo"
            ),
            "expected": "Il formato di numerazione è aggiornato. Appare un messaggio di successo.",
        },
    },

    # ── Settings > Payment Terms (Numbering tab) ─────────────────────────
    "ACC-012": {
        "EN": {
            "steps": (
                f"1. Navigate to {BASE}/settings?tab=numbering\n"
                "2. Scroll down to the 'Payment Terms' section\n"
                "3. Verify that existing payment terms (e.g. '30 days') are listed\n"
                "4. Verify that a button to add a new payment term is visible"
            ),
            "expected": "The Payment Terms section shows existing terms and an option to add new ones.",
        },
        "DE": {
            "steps": (
                f"1. Navigieren Sie zu {BASE}/settings?tab=numbering\n"
                "2. Scrollen Sie zum Bereich 'Zahlungsbedingungen'\n"
                "3. Prüfen Sie, dass bestehende Zahlungsbedingungen (z. B. '30 Tage') angezeigt werden\n"
                "4. Prüfen Sie, dass ein Button zum Hinzufügen vorhanden ist"
            ),
            "expected": "Der Bereich Zahlungsbedingungen zeigt bestehende Einträge und eine Hinzufügen-Option.",
        },
        "FR": {
            "steps": (
                f"1. Naviguez vers {BASE}/settings?tab=numbering\n"
                "2. Faites défiler jusqu'à la section 'Conditions de paiement'\n"
                "3. Vérifiez que les conditions existantes (ex. '30 jours') sont listées\n"
                "4. Vérifiez qu'un bouton pour en ajouter est visible"
            ),
            "expected": "La section Conditions de paiement affiche les entrées existantes et une option d'ajout.",
        },
        "IT": {
            "steps": (
                f"1. Navigare a {BASE}/settings?tab=numbering\n"
                "2. Scorrere fino alla sezione 'Termini di Pagamento'\n"
                "3. Verificare che i termini esistenti (es. '30 giorni') siano elencati\n"
                "4. Verificare che sia visibile un pulsante per aggiungerne"
            ),
            "expected": "La sezione Termini di Pagamento mostra le voci esistenti e un'opzione per aggiungerne.",
        },
    },

    # ── Settings > My Profile (Language) ────────────────────────────────
    "ACC-013": {
        "EN": {
            "steps": (
                f"1. Navigate to {BASE}/settings?tab=profile\n"
                "2. Verify the 'My Profile' section is visible\n"
                "3. Locate the display name field\n"
                "4. Verify a language selection dropdown is visible\n"
                "5. Change the language to 'English'\n"
                "6. Click 'Save'"
            ),
            "expected": "Profile settings are saved. UI language updates to the selected language.",
        },
        "DE": {
            "steps": (
                f"1. Navigieren Sie zu {BASE}/settings?tab=profile\n"
                "2. Prüfen Sie, dass der Bereich 'Mein Profil' sichtbar ist\n"
                "3. Suchen Sie das Feld für den Anzeigenamen\n"
                "4. Prüfen Sie, dass ein Dropdown für die Sprachauswahl vorhanden ist\n"
                "5. Wählen Sie 'Deutsch'\n"
                "6. Klicken Sie auf 'Speichern'"
            ),
            "expected": "Profileinstellungen gespeichert. Die Sprache der Oberfläche ändert sich.",
        },
        "FR": {
            "steps": (
                f"1. Naviguez vers {BASE}/settings?tab=profile\n"
                "2. Vérifiez que la section 'Mon Profil' est visible\n"
                "3. Localisez le champ de nom d'affichage\n"
                "4. Vérifiez qu'une liste déroulante de langue est visible\n"
                "5. Sélectionnez 'Français'\n"
                "6. Cliquez sur 'Enregistrer'"
            ),
            "expected": "Les paramètres de profil sont sauvegardés. La langue de l'interface se met à jour.",
        },
        "IT": {
            "steps": (
                f"1. Navigare a {BASE}/settings?tab=profile\n"
                "2. Verificare che la sezione 'Il Mio Profilo' sia visibile\n"
                "3. Individuare il campo nome visualizzato\n"
                "4. Verificare che sia visibile un menu a discesa per la lingua\n"
                "5. Selezionare 'Italiano'\n"
                "6. Fare clic su 'Salva'"
            ),
            "expected": "Le impostazioni del profilo sono salvate. La lingua dell'interfaccia si aggiorna.",
        },
    },

    # ── Settings > Email Settings ────────────────────────────────────────
    "ACC-014": {
        "EN": {
            "steps": (
                f"1. Navigate to {BASE}/settings?tab=email\n"
                "2. Verify the 'Email Settings' section is visible\n"
                "3. Verify sender name and sender email fields are present\n"
                "4. Fill in the sender name field\n"
                "5. Click 'Save'\n"
                "6. Verify a success message appears"
            ),
            "expected": "Email sender settings are saved. A success message appears.",
        },
        "DE": {
            "steps": (
                f"1. Navigieren Sie zu {BASE}/settings?tab=email\n"
                "2. Prüfen Sie, dass der Bereich 'E-Mail-Einstellungen' sichtbar ist\n"
                "3. Prüfen Sie, dass Absendername und E-Mail-Felder vorhanden sind\n"
                "4. Tragen Sie den Absendernamen ein\n"
                "5. Klicken Sie auf 'Speichern'\n"
                "6. Prüfen Sie, dass eine Erfolgsmeldung erscheint"
            ),
            "expected": "E-Mail-Absendereinstellungen gespeichert. Eine Erfolgsmeldung erscheint.",
        },
        "FR": {
            "steps": (
                f"1. Naviguez vers {BASE}/settings?tab=email\n"
                "2. Vérifiez que la section 'Paramètres e-mail' est visible\n"
                "3. Vérifiez que les champs nom d'expéditeur et e-mail sont présents\n"
                "4. Remplissez le champ nom d'expéditeur\n"
                "5. Cliquez sur 'Enregistrer'\n"
                "6. Vérifiez qu'un message de succès apparaît"
            ),
            "expected": "Les paramètres d'expéditeur e-mail sont sauvegardés.",
        },
        "IT": {
            "steps": (
                f"1. Navigare a {BASE}/settings?tab=email\n"
                "2. Verificare che la sezione 'Impostazioni Email' sia visibile\n"
                "3. Verificare che i campi nome mittente ed email siano presenti\n"
                "4. Inserire il nome mittente\n"
                "5. Fare clic su 'Salva'\n"
                "6. Verificare che appaia un messaggio di successo"
            ),
            "expected": "Le impostazioni email mittente sono salvate.",
        },
    },

    # ── Accounting > Chart of Accounts ──────────────────────────────────
    "ACC-015": {
        "EN": {
            "steps": (
                f"1. Navigate to {BASE}/accounting\n"
                "2. Click the 'Chart of Accounts' tab button\n"
                "3. Verify a table of accounts is displayed\n"
                "4. Verify rows contain account number and account name columns\n"
                "5. Verify accounts in the range 1000–9999 are present"
            ),
            "expected": "A table of accounts with account numbers and names is displayed. Default accounts (1000–9999) are present.",
        },
        "DE": {
            "steps": (
                f"1. Navigieren Sie zu {BASE}/accounting\n"
                "2. Klicken Sie auf den Tab 'Kontenplan'\n"
                "3. Prüfen Sie, dass eine Kontentabelle angezeigt wird\n"
                "4. Prüfen Sie, dass Zeilen Kontonummer und Kontoname enthalten\n"
                "5. Prüfen Sie, dass Konten im Bereich 1000–9999 vorhanden sind"
            ),
            "expected": "Eine Kontentabelle mit Kontonummern und -namen wird angezeigt. Standard-Konten (1000–9999) sind vorhanden.",
        },
        "FR": {
            "steps": (
                f"1. Naviguez vers {BASE}/accounting\n"
                "2. Cliquez sur l'onglet 'Plan comptable'\n"
                "3. Vérifiez qu'un tableau de comptes est affiché\n"
                "4. Vérifiez que les lignes contiennent numéro et nom de compte\n"
                "5. Vérifiez que des comptes dans la plage 1000–9999 sont présents"
            ),
            "expected": "Un tableau de comptes avec numéros et noms est affiché. Les comptes par défaut (1000–9999) sont présents.",
        },
        "IT": {
            "steps": (
                f"1. Navigare a {BASE}/accounting\n"
                "2. Fare clic sulla scheda 'Piano dei Conti'\n"
                "3. Verificare che sia visualizzata una tabella dei conti\n"
                "4. Verificare che le righe contengano numero e nome conto\n"
                "5. Verificare che siano presenti conti nell'intervallo 1000–9999"
            ),
            "expected": "Viene visualizzata una tabella dei conti con numeri e nomi. I conti predefiniti (1000–9999) sono presenti.",
        },
    },

    # ── Accounting > Chart of Accounts > Add Account ─────────────────────
    "ACC-016": {
        "EN": {
            "steps": (
                f"1. Navigate to {BASE}/accounting\n"
                "2. Click the 'Chart of Accounts' tab button\n"
                "3. Click the 'Add Account' or 'New Account' button\n"
                "4. Fill in the account number field\n"
                "5. Fill in the account name field\n"
                "6. Click 'Save' or 'Create'\n"
                "7. Verify the new account appears in the list"
            ),
            "expected": "A new account is created and appears in the chart of accounts.",
        },
        "DE": {
            "steps": (
                f"1. Navigieren Sie zu {BASE}/accounting\n"
                "2. Klicken Sie auf den Tab 'Kontenplan'\n"
                "3. Klicken Sie auf 'Konto hinzufügen' oder 'Neues Konto'\n"
                "4. Tragen Sie die Kontonummer ein\n"
                "5. Tragen Sie den Kontonamen ein\n"
                "6. Klicken Sie auf 'Speichern'\n"
                "7. Prüfen Sie, dass das neue Konto in der Liste erscheint"
            ),
            "expected": "Ein neues Konto wurde erstellt und erscheint im Kontenplan.",
        },
        "FR": {
            "steps": (
                f"1. Naviguez vers {BASE}/accounting\n"
                "2. Cliquez sur l'onglet 'Plan comptable'\n"
                "3. Cliquez sur 'Ajouter un compte' ou 'Nouveau compte'\n"
                "4. Remplissez le numéro de compte\n"
                "5. Remplissez le nom du compte\n"
                "6. Cliquez sur 'Enregistrer'\n"
                "7. Vérifiez que le nouveau compte apparaît dans la liste"
            ),
            "expected": "Un nouveau compte est créé et apparaît dans le plan comptable.",
        },
        "IT": {
            "steps": (
                f"1. Navigare a {BASE}/accounting\n"
                "2. Fare clic sulla scheda 'Piano dei Conti'\n"
                "3. Fare clic su 'Aggiungi Conto' o 'Nuovo Conto'\n"
                "4. Inserire il numero conto\n"
                "5. Inserire il nome conto\n"
                "6. Fare clic su 'Salva'\n"
                "7. Verificare che il nuovo conto appaia nell'elenco"
            ),
            "expected": "Un nuovo conto è creato e appare nel piano dei conti.",
        },
    },

    # ── Accounting > Chart of Accounts > Edit ────────────────────────────
    "ACC-017": {
        "EN": {
            "steps": (
                f"1. Navigate to {BASE}/accounting\n"
                "2. Click the 'Chart of Accounts' tab button\n"
                "3. Click on an existing account row to edit it\n"
                "4. Modify the account name field\n"
                "5. Click 'Save'\n"
                "6. Verify the updated name appears in the list"
            ),
            "expected": "The account name is updated and reflected in the chart of accounts.",
        },
        "DE": {
            "steps": (
                f"1. Navigieren Sie zu {BASE}/accounting\n"
                "2. Klicken Sie auf den Tab 'Kontenplan'\n"
                "3. Klicken Sie auf eine bestehende Kontozeile\n"
                "4. Ändern Sie den Kontonamen\n"
                "5. Klicken Sie auf 'Speichern'\n"
                "6. Prüfen Sie, dass der aktualisierte Name erscheint"
            ),
            "expected": "Der Kontoname wurde aktualisiert und erscheint im Kontenplan.",
        },
        "FR": {
            "steps": (
                f"1. Naviguez vers {BASE}/accounting\n"
                "2. Cliquez sur l'onglet 'Plan comptable'\n"
                "3. Cliquez sur une ligne de compte existante\n"
                "4. Modifiez le nom du compte\n"
                "5. Cliquez sur 'Enregistrer'\n"
                "6. Vérifiez que le nom mis à jour apparaît dans la liste"
            ),
            "expected": "Le nom du compte est mis à jour dans le plan comptable.",
        },
        "IT": {
            "steps": (
                f"1. Navigare a {BASE}/accounting\n"
                "2. Fare clic sulla scheda 'Piano dei Conti'\n"
                "3. Fare clic su una riga di conto esistente\n"
                "4. Modificare il nome conto\n"
                "5. Fare clic su 'Salva'\n"
                "6. Verificare che il nome aggiornato appaia nell'elenco"
            ),
            "expected": "Il nome del conto è aggiornato e visibile nel piano dei conti.",
        },
    },

    # ── ACC-018 Language switch ───────────────────────────────────────────
    "ACC-018": {
        "EN": {
            "steps": (
                f"1. Navigate to {BASE}/settings?tab=profile\n"
                "2. Locate the language dropdown in the profile section\n"
                "3. Select a different language (e.g. German)\n"
                "4. Click 'Save'\n"
                "5. Verify the UI language changes"
            ),
            "expected": "The UI language switches according to the selection.",
        },
        "DE": {
            "steps": (
                f"1. Navigieren Sie zu {BASE}/settings?tab=profile\n"
                "2. Suchen Sie das Sprachdropdown im Profilbereich\n"
                "3. Wählen Sie eine andere Sprache (z. B. Englisch)\n"
                "4. Klicken Sie auf 'Speichern'\n"
                "5. Prüfen Sie, dass die Oberflächensprache wechselt"
            ),
            "expected": "Die Sprache der Benutzeroberfläche wechselt entsprechend der Auswahl.",
        },
        "FR": {
            "steps": (
                f"1. Naviguez vers {BASE}/settings?tab=profile\n"
                "2. Localisez le menu déroulant de langue dans la section profil\n"
                "3. Sélectionnez une autre langue (ex. Allemand)\n"
                "4. Cliquez sur 'Enregistrer'\n"
                "5. Vérifiez que la langue de l'interface change"
            ),
            "expected": "La langue de l'interface change selon la sélection.",
        },
        "IT": {
            "steps": (
                f"1. Navigare a {BASE}/settings?tab=profile\n"
                "2. Individuare il menu a discesa della lingua nella sezione profilo\n"
                "3. Selezionare un'altra lingua (es. Tedesco)\n"
                "4. Fare clic su 'Salva'\n"
                "5. Verificare che la lingua dell'interfaccia cambi"
            ),
            "expected": "La lingua dell'interfaccia cambia in base alla selezione.",
        },
    },

    # ── ACC-019 Search/Filter Accounts ───────────────────────────────────
    "ACC-019": {
        "EN": {
            "steps": (
                f"1. Navigate to {BASE}/accounting\n"
                "2. Click the 'Chart of Accounts' tab button\n"
                "3. Locate the search input in the chart of accounts\n"
                "4. Type an account number or name to filter\n"
                "5. Verify the list filters to show matching accounts"
            ),
            "expected": "The account list filters to show only matching accounts.",
        },
        "DE": {
            "steps": (
                f"1. Navigieren Sie zu {BASE}/accounting\n"
                "2. Klicken Sie auf den Tab 'Kontenplan'\n"
                "3. Suchen Sie das Suchfeld im Kontenplan\n"
                "4. Geben Sie eine Kontonummer oder einen Namen ein\n"
                "5. Prüfen Sie, dass die Liste entsprechend gefiltert wird"
            ),
            "expected": "Die Kontenliste wird auf übereinstimmende Konten gefiltert.",
        },
        "FR": {
            "steps": (
                f"1. Naviguez vers {BASE}/accounting\n"
                "2. Cliquez sur l'onglet 'Plan comptable'\n"
                "3. Localisez le champ de recherche dans le plan comptable\n"
                "4. Saisissez un numéro ou un nom de compte\n"
                "5. Vérifiez que la liste est filtrée en conséquence"
            ),
            "expected": "La liste des comptes est filtrée pour afficher les comptes correspondants.",
        },
        "IT": {
            "steps": (
                f"1. Navigare a {BASE}/accounting\n"
                "2. Fare clic sulla scheda 'Piano dei Conti'\n"
                "3. Individuare il campo di ricerca nel piano dei conti\n"
                "4. Digitare un numero o nome conto per filtrare\n"
                "5. Verificare che l'elenco si filtri di conseguenza"
            ),
            "expected": "L'elenco dei conti viene filtrato per mostrare i conti corrispondenti.",
        },
    },

    # ── Banking ──────────────────────────────────────────────────────────
    "ACC-020": {
        "EN": {
            "steps": (
                f"1. Navigate to {BASE}/banking\n"
                "2. Click 'Add Bank Account' or 'New Bank Account'\n"
                "3. Fill in the account name field\n"
                "4. Fill in the IBAN field (e.g. CH44 3199 9123 0008 8901 2)\n"
                "5. Click 'Save'\n"
                "6. Verify the bank account appears in the list"
            ),
            "expected": "A new bank account is added and appears in the banking section.",
        },
        "DE": {
            "steps": (
                f"1. Navigieren Sie zu {BASE}/banking\n"
                "2. Klicken Sie auf 'Bankkonto hinzufügen' oder 'Neues Bankkonto'\n"
                "3. Tragen Sie den Kontonamen ein\n"
                "4. Tragen Sie die IBAN ein (z. B. CH44 3199 9123 0008 8901 2)\n"
                "5. Klicken Sie auf 'Speichern'\n"
                "6. Prüfen Sie, dass das Bankkonto in der Liste erscheint"
            ),
            "expected": "Ein neues Bankkonto wird hinzugefügt und erscheint in der Bankliste.",
        },
        "FR": {
            "steps": (
                f"1. Naviguez vers {BASE}/banking\n"
                "2. Cliquez sur 'Ajouter un compte bancaire'\n"
                "3. Remplissez le nom du compte\n"
                "4. Remplissez l'IBAN (ex. CH44 3199 9123 0008 8901 2)\n"
                "5. Cliquez sur 'Enregistrer'\n"
                "6. Vérifiez que le compte apparaît dans la liste"
            ),
            "expected": "Un nouveau compte bancaire est ajouté et apparaît dans la section banque.",
        },
        "IT": {
            "steps": (
                f"1. Navigare a {BASE}/banking\n"
                "2. Fare clic su 'Aggiungi Conto Bancario'\n"
                "3. Inserire il nome del conto\n"
                "4. Inserire l'IBAN (es. CH44 3199 9123 0008 8901 2)\n"
                "5. Fare clic su 'Salva'\n"
                "6. Verificare che il conto appaia nell'elenco"
            ),
            "expected": "Un nuovo conto bancario è aggiunto e appare nella sezione banca.",
        },
    },

    "ACC-021": {
        "EN": {
            "steps": (
                f"1. Navigate to {BASE}/banking\n"
                "2. Click 'Add Bank Account' or 'New Bank Account'\n"
                "3. Fill in the IBAN field with an invalid value (e.g. 'INVALID123')\n"
                "4. Click 'Save'\n"
                "5. Verify an error message about invalid IBAN is shown"
            ),
            "expected": "An error message is displayed indicating the IBAN format is invalid.",
        },
        "DE": {
            "steps": (
                f"1. Navigieren Sie zu {BASE}/banking\n"
                "2. Klicken Sie auf 'Bankkonto hinzufügen'\n"
                "3. Tragen Sie eine ungültige IBAN ein (z. B. 'UNGUELTIG123')\n"
                "4. Klicken Sie auf 'Speichern'\n"
                "5. Prüfen Sie, dass eine Fehlermeldung für ungültige IBAN erscheint"
            ),
            "expected": "Eine Fehlermeldung über eine ungültige IBAN wird angezeigt.",
        },
        "FR": {
            "steps": (
                f"1. Naviguez vers {BASE}/banking\n"
                "2. Cliquez sur 'Ajouter un compte bancaire'\n"
                "3. Saisissez un IBAN invalide (ex. 'INVALIDE123')\n"
                "4. Cliquez sur 'Enregistrer'\n"
                "5. Vérifiez qu'un message d'erreur d'IBAN invalide est affiché"
            ),
            "expected": "Un message d'erreur indique que le format IBAN est invalide.",
        },
        "IT": {
            "steps": (
                f"1. Navigare a {BASE}/banking\n"
                "2. Fare clic su 'Aggiungi Conto Bancario'\n"
                "3. Inserire un IBAN non valido (es. 'INVALIDO123')\n"
                "4. Fare clic su 'Salva'\n"
                "5. Verificare che venga mostrato un messaggio di errore IBAN non valido"
            ),
            "expected": "Viene mostrato un messaggio di errore che indica che il formato IBAN non è valido.",
        },
    },

    "ACC-022": {
        "EN": {
            "steps": (
                f"1. Navigate to {BASE}/banking\n"
                "2. Verify at least one bank account is listed\n"
                "3. Click the actions menu on a bank account\n"
                "4. Select 'Set as default' or 'Make default'\n"
                "5. Verify the account is marked as default"
            ),
            "expected": "The selected bank account is set as the default.",
        },
        "DE": {
            "steps": (
                f"1. Navigieren Sie zu {BASE}/banking\n"
                "2. Prüfen Sie, dass mindestens ein Bankkonto aufgelistet ist\n"
                "3. Klicken Sie auf das Aktionsmenü eines Bankkontos\n"
                "4. Wählen Sie 'Als Standard setzen'\n"
                "5. Prüfen Sie, dass das Konto als Standard markiert ist"
            ),
            "expected": "Das ausgewählte Bankkonto ist als Standard festgelegt.",
        },
        "FR": {
            "steps": (
                f"1. Naviguez vers {BASE}/banking\n"
                "2. Vérifiez qu'au moins un compte bancaire est listé\n"
                "3. Cliquez sur le menu d'actions d'un compte bancaire\n"
                "4. Sélectionnez 'Définir comme compte par défaut'\n"
                "5. Vérifiez que le compte est marqué comme compte par défaut"
            ),
            "expected": "Le compte bancaire sélectionné est défini comme compte par défaut.",
        },
        "IT": {
            "steps": (
                f"1. Navigare a {BASE}/banking\n"
                "2. Verificare che sia elencato almeno un conto bancario\n"
                "3. Fare clic sul menu azioni di un conto bancario\n"
                "4. Selezionare 'Imposta come predefinito'\n"
                "5. Verificare che il conto sia contrassegnato come predefinito"
            ),
            "expected": "Il conto bancario selezionato è impostato come predefinito.",
        },
    },

    # ── Dashboard ────────────────────────────────────────────────────────
    "ACC-086": {
        "EN": {
            "steps": (
                f"1. Navigate to {BASE}\n"
                "2. Verify the dashboard is displayed\n"
                "3. Verify financial KPIs are visible (open invoices, revenue, expenses)\n"
                "4. Verify amounts are shown in the company default currency"
            ),
            "expected": "The dashboard shows financial KPIs including open invoices, revenue and expenses.",
        },
        "DE": {
            "steps": (
                f"1. Navigieren Sie zu {BASE}\n"
                "2. Prüfen Sie, dass das Dashboard angezeigt wird\n"
                "3. Prüfen Sie, dass finanzielle KPIs sichtbar sind (offene Rechnungen, Einnahmen, Ausgaben)\n"
                "4. Prüfen Sie, dass Beträge in der Standardwährung angezeigt werden"
            ),
            "expected": "Das Dashboard zeigt finanzielle KPIs inkl. offene Rechnungen, Einnahmen und Ausgaben.",
        },
        "FR": {
            "steps": (
                f"1. Naviguez vers {BASE}\n"
                "2. Vérifiez que le tableau de bord est affiché\n"
                "3. Vérifiez que les KPIs financiers sont visibles (factures ouvertes, revenus, dépenses)\n"
                "4. Vérifiez que les montants sont en devise par défaut"
            ),
            "expected": "Le tableau de bord affiche les KPIs financiers dont les factures ouvertes, revenus et dépenses.",
        },
        "IT": {
            "steps": (
                f"1. Navigare a {BASE}\n"
                "2. Verificare che la dashboard sia visualizzata\n"
                "3. Verificare che i KPI finanziari siano visibili (fatture aperte, ricavi, spese)\n"
                "4. Verificare che gli importi siano nella valuta predefinita"
            ),
            "expected": "La dashboard mostra i KPI finanziari inclusi fatture aperte, ricavi e spese.",
        },
    },

    # ── Settings > Email Settings (email domain) ─────────────────────────
    "ACC-107": {
        "EN": {
            "steps": (
                f"1. Navigate to {BASE}/settings?tab=email\n"
                "2. Verify the 'Email Settings' section is visible\n"
                "3. Look for the sender email / domain configuration section\n"
                "4. Verify fields for sender name and sender address are present"
            ),
            "expected": "The Email Settings tab shows sender name and email address configuration fields.",
        },
        "DE": {
            "steps": (
                f"1. Navigieren Sie zu {BASE}/settings?tab=email\n"
                "2. Prüfen Sie, dass der Bereich 'E-Mail-Einstellungen' sichtbar ist\n"
                "3. Suchen Sie den Absender-E-Mail/Domain-Konfigurationsbereich\n"
                "4. Prüfen Sie, dass Felder für Absendername und -adresse vorhanden sind"
            ),
            "expected": "Der Tab E-Mail-Einstellungen zeigt Konfigurationsfelder für Absendername und -adresse.",
        },
        "FR": {
            "steps": (
                f"1. Naviguez vers {BASE}/settings?tab=email\n"
                "2. Vérifiez que la section 'Paramètres e-mail' est visible\n"
                "3. Cherchez la section de configuration de l'expéditeur\n"
                "4. Vérifiez que les champs nom et adresse d'expéditeur sont présents"
            ),
            "expected": "L'onglet Paramètres e-mail affiche les champs de configuration de l'expéditeur.",
        },
        "IT": {
            "steps": (
                f"1. Navigare a {BASE}/settings?tab=email\n"
                "2. Verificare che la sezione 'Impostazioni Email' sia visibile\n"
                "3. Cercare la sezione configurazione mittente\n"
                "4. Verificare che siano presenti i campi nome e indirizzo mittente"
            ),
            "expected": "La scheda Impostazioni Email mostra i campi di configurazione del mittente.",
        },
    },

    # ── Settings > My Profile (date/number format) ───────────────────────
    "ACC-108": {
        "EN": {
            "steps": (
                f"1. Navigate to {BASE}/settings?tab=profile\n"
                "2. Verify the 'My Profile' section is visible\n"
                "3. Locate the display name or locale preference fields\n"
                "4. Verify the language dropdown is present\n"
                "5. Select a different locale setting"
            ),
            "expected": "Profile locale settings are visible and can be changed.",
        },
        "DE": {
            "steps": (
                f"1. Navigieren Sie zu {BASE}/settings?tab=profile\n"
                "2. Prüfen Sie, dass der Bereich 'Mein Profil' sichtbar ist\n"
                "3. Suchen Sie die Felder für Anzeigename oder Locale\n"
                "4. Prüfen Sie, dass das Sprachdropdown vorhanden ist\n"
                "5. Wählen Sie eine andere Locale-Einstellung"
            ),
            "expected": "Locale-Einstellungen im Profil sind sichtbar und können geändert werden.",
        },
        "FR": {
            "steps": (
                f"1. Naviguez vers {BASE}/settings?tab=profile\n"
                "2. Vérifiez que la section 'Mon Profil' est visible\n"
                "3. Localisez les champs de nom d'affichage ou de préférence de locale\n"
                "4. Vérifiez que le menu déroulant de langue est présent\n"
                "5. Sélectionnez un autre paramètre de locale"
            ),
            "expected": "Les paramètres de locale du profil sont visibles et modifiables.",
        },
        "IT": {
            "steps": (
                f"1. Navigare a {BASE}/settings?tab=profile\n"
                "2. Verificare che la sezione 'Il Mio Profilo' sia visibile\n"
                "3. Individuare i campi nome visualizzato o preferenza locale\n"
                "4. Verificare che il menu a discesa della lingua sia presente\n"
                "5. Selezionare un'altra impostazione locale"
            ),
            "expected": "Le impostazioni locale del profilo sono visibili e modificabili.",
        },
    },

    # ── Settings > Payment terms (ACC-106) ───────────────────────────────
    "ACC-106": {
        "EN": {
            "steps": (
                f"1. Navigate to {BASE}/settings?tab=numbering\n"
                "2. Scroll to the 'Payment Terms' section\n"
                "3. Click 'Add' to create a new payment term\n"
                "4. Fill in the name field (e.g. 'Net 30')\n"
                "5. Fill in the days field with '30'\n"
                "6. Click 'Save'\n"
                "7. Verify the new payment term appears in the list"
            ),
            "expected": "A new payment term is created and listed in the payment terms section.",
        },
        "DE": {
            "steps": (
                f"1. Navigieren Sie zu {BASE}/settings?tab=numbering\n"
                "2. Scrollen Sie zum Bereich 'Zahlungsbedingungen'\n"
                "3. Klicken Sie auf 'Hinzufügen'\n"
                "4. Tragen Sie den Namen ein (z. B. 'Netto 30')\n"
                "5. Tragen Sie '30' in das Tage-Feld ein\n"
                "6. Klicken Sie auf 'Speichern'\n"
                "7. Prüfen Sie, dass die neue Zahlungsbedingung erscheint"
            ),
            "expected": "Eine neue Zahlungsbedingung wurde erstellt und erscheint in der Liste.",
        },
        "FR": {
            "steps": (
                f"1. Naviguez vers {BASE}/settings?tab=numbering\n"
                "2. Faites défiler vers la section 'Conditions de paiement'\n"
                "3. Cliquez sur 'Ajouter'\n"
                "4. Remplissez le nom (ex. 'Net 30')\n"
                "5. Remplissez le champ jours avec '30'\n"
                "6. Cliquez sur 'Enregistrer'\n"
                "7. Vérifiez que la nouvelle condition apparaît dans la liste"
            ),
            "expected": "Une nouvelle condition de paiement est créée et listée.",
        },
        "IT": {
            "steps": (
                f"1. Navigare a {BASE}/settings?tab=numbering\n"
                "2. Scorrere fino alla sezione 'Termini di Pagamento'\n"
                "3. Fare clic su 'Aggiungi'\n"
                "4. Inserire il nome (es. 'Netto 30')\n"
                "5. Inserire '30' nel campo giorni\n"
                "6. Fare clic su 'Salva'\n"
                "7. Verificare che il nuovo termine appaia nell'elenco"
            ),
            "expected": "Un nuovo termine di pagamento è creato e elencato.",
        },
    },

    # ── Audit Trail ──────────────────────────────────────────────────────
    "ACC-109": {
        "EN": {
            "steps": (
                f"1. Navigate to {BASE}/audit-trail\n"
                "2. Verify a list of audit trail entries is displayed\n"
                "3. Verify entries show user, action, date and entity information\n"
                "4. Verify the list is scrollable or paginated"
            ),
            "expected": "The audit trail page shows a log of user actions with timestamps.",
        },
        "DE": {
            "steps": (
                f"1. Navigieren Sie zu {BASE}/audit-trail\n"
                "2. Prüfen Sie, dass eine Liste von Audit-Trail-Einträgen angezeigt wird\n"
                "3. Prüfen Sie, dass Einträge Benutzer, Aktion, Datum und Entität enthalten\n"
                "4. Prüfen Sie, dass die Liste scrollbar oder paginiert ist"
            ),
            "expected": "Die Audit-Trail-Seite zeigt ein Protokoll von Benutzeraktionen mit Zeitstempeln.",
        },
        "FR": {
            "steps": (
                f"1. Naviguez vers {BASE}/audit-trail\n"
                "2. Vérifiez qu'une liste d'entrées de piste d'audit est affichée\n"
                "3. Vérifiez que les entrées montrent l'utilisateur, l'action, la date et l'entité\n"
                "4. Vérifiez que la liste est défilable ou paginée"
            ),
            "expected": "La page de piste d'audit affiche un journal des actions utilisateur avec horodatages.",
        },
        "IT": {
            "steps": (
                f"1. Navigare a {BASE}/audit-trail\n"
                "2. Verificare che sia visualizzato un elenco di voci di audit trail\n"
                "3. Verificare che le voci mostrino utente, azione, data ed entità\n"
                "4. Verificare che l'elenco sia scorrevole o paginato"
            ),
            "expected": "La pagina audit trail mostra un registro delle azioni utente con timestamp.",
        },
    },
}


def main():
    with open('/Users/michaellascar/Projects/mixel-test/apps.json', encoding='utf-8') as f:
        data = json.load(f)

    total = 0
    for lang in ['DE', 'FR', 'EN', 'IT']:
        app = data[lang][0]
        for cat in app['categories']:
            for case in cat.get('cases', []):
                cid = case.get('id', '')
                if cid in OVERRIDES and lang in OVERRIDES[cid]:
                    ov = OVERRIDES[cid][lang]
                    for field, value in ov.items():
                        case[field] = value
                    total += 1

    print(f"Applied {total} overrides")

    with open('/Users/michaellascar/Projects/mixel-test/apps.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print("Saved apps.json")

    # Verify
    app_en = data['EN'][0]
    for cat in app_en['categories']:
        for case in cat.get('cases', []):
            if case.get('id') in ['ACC-010', 'ACC-015', 'ACC-022', 'ACC-086']:
                print(f"\nEN {case['id']}: {case['steps'][:250]}")


if __name__ == '__main__':
    main()
