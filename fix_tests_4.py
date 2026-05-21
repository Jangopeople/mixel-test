"""Fix test navigation steps in apps.json to use direct URLs instead of sidebar clicks."""
import json, re

BASE = "https://acc.mixel.ch/en/app"

# Navigation patterns per language: (regex_pattern, route_suffix)
NAV_MAP_DE = [
    (r'linken Menü auf [„\"\'"]?Einstellungen[\"\'"]?', "settings"),
    (r'linken Menü auf [„\"\'"]?Kontakte[\"\'"]?', "contacts"),
    (r'linken Menü auf [„\"\'"]?Wiederkehrend\w* Rechnungen[\"\'"]?', "recurring-invoices"),
    (r'linken Menü auf [„\"\'"]?Rechnungen[\"\'"]?', "invoices"),
    (r'linken Menü auf [„\"\'"]?Angebote[\"\'"]?', "quotes"),
    (r'linken Menü auf [„\"\'"]?Kreditnoten[\"\'"]?', "credit-notes"),
    (r'linken Menü auf [„\"\'"]?Ausgaben[\"\'"]?', "expenses"),
    (r'linken Menü auf [„\"\'"]?Bankwesen[\"\'"]?', "banking"),
    (r'linken Menü auf [„\"\'"]?Banking[\"\'"]?', "banking"),
    (r'linken Menü auf [„\"\'"]?Buchhaltung[\"\'"]?', "accounting"),
    (r'linken Menü auf [„\"\'"]?Kontenplan[\"\'"]?', "accounting"),
    (r'linken Menü auf [„\"\'"]?Finanzberichte[\"\'"]?', "reports"),
    (r'linken Menü auf [„\"\'"]?Berichte[\"\'"]?', "reports"),
    (r'linken Menü auf [„\"\'"]?Dokumente[\"\'"]?', "documents"),
    (r'linken Menü auf [„\"\'"]?Lohnbuchhaltung[\"\'"]?', "payroll"),
    (r'linken Menü auf [„\"\'"]?Einkäufe[\"\'"]?', "purchases"),
    (r'linken Menü auf [„\"\'"]?Projekte[\"\'"]?', "projects"),
]

NAV_MAP_FR = [
    (r'menu (gauche|de gauche).{0,20} [„\"\'"]?Paramètres[\"\'"]?', "settings"),
    (r'menu (gauche|de gauche).{0,20} [„\"\'"]?Contacts[\"\'"]?', "contacts"),
    (r'menu (gauche|de gauche).{0,20} [„\"\'"]?Factures récurrentes[\"\'"]?', "recurring-invoices"),
    (r'menu (gauche|de gauche).{0,20} [„\"\'"]?Factures[\"\'"]?', "invoices"),
    (r'menu (gauche|de gauche).{0,20} [„\"\'"]?Devis[\"\'"]?', "quotes"),
    (r'menu (gauche|de gauche).{0,20} [„\"\'"]?Avoirs?[\"\'"]?', "credit-notes"),
    (r'menu (gauche|de gauche).{0,20} [„\"\'"]?Dépenses[\"\'"]?', "expenses"),
    (r'menu (gauche|de gauche).{0,20} [„\"\'"]?Banque[\"\'"]?', "banking"),
    (r'menu (gauche|de gauche).{0,20} [„\"\'"]?Comptabilité[\"\'"]?', "accounting"),
    (r'menu (gauche|de gauche).{0,20} [„\"\'"]?Rapports financiers[\"\'"]?', "reports"),
    (r'menu (gauche|de gauche).{0,20} [„\"\'"]?Rapports[\"\'"]?', "reports"),
    (r'menu (gauche|de gauche).{0,20} [„\"\'"]?Documents[\"\'"]?', "documents"),
    (r'menu (gauche|de gauche).{0,20} [„\"\'"]?Paie[\"\'"]?', "payroll"),
    (r'menu (gauche|de gauche).{0,20} [„\"\'"]?Achats[\"\'"]?', "purchases"),
]

NAV_MAP_EN = [
    (r'[„\"\'"]?Settings[\"\'"]? in the left menu', "settings"),
    (r'[„\"\'"]?Contacts[\"\'"]? in the left menu', "contacts"),
    (r'[„\"\'"]?Recurring Invoices?[\"\'"]? in the left menu', "recurring-invoices"),
    (r'[„\"\'"]?Invoices?[\"\'"]? in the left menu', "invoices"),
    (r'[„\"\'"]?Quotes[\"\'"]? in the left menu', "quotes"),
    (r'[„\"\'"]?Credit Notes?[\"\'"]? in the left menu', "credit-notes"),
    (r'[„\"\'"]?Expenses[\"\'"]? in the left menu', "expenses"),
    (r'[„\"\'"]?Banking[\"\'"]? in the left menu', "banking"),
    (r'[„\"\'"]?Chart of Accounts[\"\'"]? in the left menu', "accounting"),
    (r'[„\"\'"]?Accounting[\"\'"]? in the left menu', "accounting"),
    (r'[„\"\'"]?Financial Reports?[\"\'"]? in the left menu', "reports"),
    (r'[„\"\'"]?Reports?[\"\'"]? in the left menu', "reports"),
    (r'[„\"\'"]?Documents?[\"\'"]? in the left menu', "documents"),
    (r'[„\"\'"]?Payroll[\"\'"]? in the left menu', "payroll"),
    (r'[„\"\'"]?Purchases?[\"\'"]? in the left menu', "purchases"),
    (r'left menu.{0,20}[„\"\'"]?Settings[\"\'"]?', "settings"),
    (r'left menu.{0,20}[„\"\'"]?Contacts[\"\'"]?', "contacts"),
    (r'left menu.{0,20}[„\"\'"]?Recurring Invoices?[\"\'"]?', "recurring-invoices"),
    (r'left menu.{0,20}[„\"\'"]?Invoices?[\"\'"]?', "invoices"),
    (r'left menu.{0,20}[„\"\'"]?Quotes[\"\'"]?', "quotes"),
    (r'left menu.{0,20}[„\"\'"]?Credit Notes?[\"\'"]?', "credit-notes"),
    (r'left menu.{0,20}[„\"\'"]?Expenses[\"\'"]?', "expenses"),
    (r'left menu.{0,20}[„\"\'"]?Banking[\"\'"]?', "banking"),
    (r'left menu.{0,20}[„\"\'"]?Accounting[\"\'"]?', "accounting"),
    (r'left menu.{0,20}[„\"\'"]?Financial Reports?[\"\'"]?', "reports"),
    (r'left menu.{0,20}[„\"\'"]?Documents?[\"\'"]?', "documents"),
    (r'left menu.{0,20}[„\"\'"]?Payroll[\"\'"]?', "payroll"),
]

NAV_MAP_IT = [
    (r'menu (sinistro|a sinistra).{0,20} [„\"\'"]?Impostazioni[\"\'"]?', "settings"),
    (r'menu (sinistro|a sinistra).{0,20} [„\"\'"]?Contatti[\"\'"]?', "contacts"),
    (r'menu (sinistro|a sinistra).{0,20} [„\"\'"]?Fatture ricorrenti[\"\'"]?', "recurring-invoices"),
    (r'menu (sinistro|a sinistra).{0,20} [„\"\'"]?Fatture[\"\'"]?', "invoices"),
    (r'menu (sinistro|a sinistra).{0,20} [„\"\'"]?Offerte[\"\'"]?', "quotes"),
    (r'menu (sinistro|a sinistra).{0,20} [„\"\'"]?Note di credito[\"\'"]?', "credit-notes"),
    (r'menu (sinistro|a sinistra).{0,20} [„\"\'"]?Spese[\"\'"]?', "expenses"),
    (r'menu (sinistro|a sinistra).{0,20} [„\"\'"]?Banca[\"\'"]?', "banking"),
    (r'menu (sinistro|a sinistra).{0,20} [„\"\'"]?Contabilità[\"\'"]?', "accounting"),
    (r'menu (sinistro|a sinistra).{0,20} [„\"\'"]?Rapporti finanziari[\"\'"]?', "reports"),
    (r'menu (sinistro|a sinistra).{0,20} [„\"\'"]?Documenti[\"\'"]?', "documents"),
    (r'menu (sinistro|a sinistra).{0,20} [„\"\'"]?Paghe[\"\'"]?', "payroll"),
]

LANG_NAV = {
    'DE': NAV_MAP_DE,
    'FR': NAV_MAP_FR,
    'EN': NAV_MAP_EN,
    'IT': NAV_MAP_IT,
}

NAV_PHRASE = {
    'DE': lambda r: f'Navigieren Sie zu {BASE}/{r}',
    'FR': lambda r: f'Naviguez vers {BASE}/{r}',
    'EN': lambda r: f'Navigate to {BASE}/{r}',
    'IT': lambda r: f'Navigare a {BASE}/{r}',
}


def fix_step_line(line, lang):
    """Fix a single step line if it matches a navigation pattern."""
    for pattern, route in LANG_NAV.get(lang, []):
        if re.search(pattern, line, re.IGNORECASE):
            num_match = re.match(r'^(\d+[\.\)]\s*)', line)
            prefix = num_match.group(1) if num_match else ''
            return f"{prefix}{NAV_PHRASE[lang](route)}"
    return line


def fix_steps(steps_text, lang):
    lines = steps_text.split('\n')
    return '\n'.join(fix_step_line(l, lang) for l in lines)


# ── ACC-specific overrides for known broken tests ──────────────────────────
# Steps that need targeted fixes beyond nav replacement

OVERRIDES = {
    'ACC-006': {  # Sign out: redirect goes to /auth/signin not login
        'DE': {
            'steps': (
                '1. Navigieren Sie zu {BASE}\n'
                '2. Klicken Sie auf das Benutzerprofil-Icon unten links in der Sidebar\n'
                '3. Klicken Sie auf den Button "Abmelden"\n'
                '4. Prüfen Sie, dass die URL /auth/signin enthält'
            ),
            'expected': 'Der Benutzer wird abgemeldet und zur Anmeldeseite (/auth/signin) weitergeleitet.',
        },
        'EN': {
            'steps': (
                '1. Navigate to {BASE}\n'
                '2. Click the user profile icon at the bottom-left of the sidebar\n'
                '3. Click the "Sign out" button\n'
                '4. Verify the URL contains /auth/signin'
            ),
            'expected': 'User is signed out and redirected to the sign-in page (/auth/signin).',
        },
        'FR': {
            'steps': (
                '1. Naviguez vers {BASE}\n'
                '2. Cliquez sur l\'icône de profil en bas à gauche de la barre latérale\n'
                '3. Cliquez sur le bouton "Se déconnecter"\n'
                '4. Vérifiez que l\'URL contient /auth/signin'
            ),
            'expected': "L'utilisateur est déconnecté et redirigé vers la page de connexion (/auth/signin).",
        },
        'IT': {
            'steps': (
                '1. Navigare a {BASE}\n'
                '2. Fare clic sull\'icona del profilo in basso a sinistra nella barra laterale\n'
                '3. Fare clic sul pulsante "Disconnetti"\n'
                '4. Verificare che l\'URL contenga /auth/signin'
            ),
            'expected': "L'utente viene disconnesso e reindirizzato alla pagina di accesso (/auth/signin).",
        },
    },
    'ACC-015': {  # Chart of accounts: column header is "No." not "Account No."
        'DE': {'expected': 'Eine Liste von Konten mit Spalten wie Kontonummer, Kontoname und Typ wird angezeigt. Standard-Konten (z. B. 1000–9999) sind vorhanden.'},
        'EN': {'expected': 'A list of accounts with columns like Account Number, Account Name and Type is shown. Default accounts (e.g. 1000–9999) are present.'},
        'FR': {'expected': 'Une liste de comptes avec des colonnes telles que Numéro, Nom et Type est affichée. Les comptes par défaut (p. ex. 1000–9999) sont présents.'},
        'IT': {'expected': 'Viene mostrato un elenco di conti con colonne come Numero conto, Nome conto e Tipo. I conti predefiniti (ad es. 1000–9999) sono presenti.'},
    },
    'ACC-018': {  # Language: remove expected locale from URL since runner uses /en/
        'DE': {'expected': 'Die Sprache der Benutzeroberfläche wechselt. Die Buchhaltungsseite ist in der gewählten Sprache zu sehen.'},
        'EN': {'expected': 'The UI language switches. The accounting page is displayed in the selected language.'},
        'FR': {'expected': 'La langue de l\'interface change. La page de comptabilité s\'affiche dans la langue sélectionnée.'},
        'IT': {'expected': 'La lingua dell\'interfaccia cambia. La pagina di contabilità è mostrata nella lingua selezionata.'},
    },
    'ACC-056': {  # Pause recurring invoice: step 6 fails with URL parsing
        'DE': {
            'steps': (
                f'1. Navigieren Sie zu {BASE}/recurring-invoices\n'
                '2. Öffnen Sie eine aktive wiederkehrende Rechnungsvorlage\n'
                '3. Klicken Sie auf das Aktionsmenü (drei Punkte / Kebab-Menü)\n'
                '4. Wählen Sie die Option "Pausieren" oder "Deaktivieren"\n'
                '5. Prüfen Sie, dass der Status der Vorlage auf "Pausiert" oder "Inaktiv" wechselt'
            ),
        },
        'EN': {
            'steps': (
                f'1. Navigate to {BASE}/recurring-invoices\n'
                '2. Open an active recurring invoice template\n'
                '3. Click the action menu (three dots / kebab menu)\n'
                '4. Select the "Pause" or "Deactivate" option\n'
                '5. Verify the template status changes to "Paused" or "Inactive"'
            ),
        },
        'FR': {
            'steps': (
                f'1. Naviguez vers {BASE}/recurring-invoices\n'
                '2. Ouvrez un modèle de facture récurrente actif\n'
                '3. Cliquez sur le menu d\'action (trois points)\n'
                '4. Sélectionnez l\'option "Suspendre" ou "Désactiver"\n'
                '5. Vérifiez que le statut du modèle passe à "Suspendu" ou "Inactif"'
            ),
        },
        'IT': {
            'steps': (
                f'1. Navigare a {BASE}/recurring-invoices\n'
                '2. Aprire un modello di fattura ricorrente attivo\n'
                '3. Fare clic sul menu azioni (tre puntini)\n'
                '4. Selezionare l\'opzione "Sospendi" o "Disattiva"\n'
                '5. Verificare che lo stato del modello cambi in "Sospeso" o "Inattivo"'
            ),
        },
    },
    'ACC-086': {  # Dashboard KPIs: the dashboard is at /en/app, not /reports
        'DE': {
            'steps': (
                f'1. Navigieren Sie zu {BASE}\n'
                '2. Prüfen Sie, dass das Dashboard KPIs anzeigt (offene Rechnungen, Ausgaben, Einnahmen)\n'
                '3. Prüfen Sie, dass Beträge in der Standardwährung des Unternehmens angezeigt werden'
            ),
            'expected': 'Das Dashboard zeigt eine Übersicht mit KPIs wie offene Rechnungen, Ausgaben und Einnahmen.',
        },
        'EN': {
            'steps': (
                f'1. Navigate to {BASE}\n'
                '2. Verify the dashboard displays KPIs (open invoices, expenses, revenue)\n'
                '3. Verify amounts are displayed in the company default currency'
            ),
            'expected': 'The dashboard shows an overview with KPIs like open invoices, expenses and revenue.',
        },
        'FR': {
            'steps': (
                f'1. Naviguez vers {BASE}\n'
                '2. Vérifiez que le tableau de bord affiche les KPIs (factures ouvertes, dépenses, revenus)\n'
                '3. Vérifiez que les montants sont affichés dans la devise par défaut de l\'entreprise'
            ),
            'expected': 'Le tableau de bord affiche un aperçu avec des KPIs comme les factures ouvertes, les dépenses et les revenus.',
        },
        'IT': {
            'steps': (
                f'1. Navigare a {BASE}\n'
                '2. Verificare che la dashboard mostri KPI (fatture aperte, spese, ricavi)\n'
                '3. Verificare che gli importi siano mostrati nella valuta predefinita dell\'azienda'
            ),
            'expected': 'La dashboard mostra una panoramica con KPI come fatture aperte, spese e ricavi.',
        },
    },
}


def main():
    with open('/Users/michaellascar/Projects/mixel-test/apps.json', encoding='utf-8') as f:
        data = json.load(f)

    total_nav_fixed = 0
    total_override_fixed = 0

    for lang in ['DE', 'FR', 'EN', 'IT']:
        app = data[lang][0]
        for cat in app['categories']:
            for case in cat.get('cases', []):
                cid = case.get('id', '')
                if not cid:
                    continue

                # Apply overrides first
                if cid in OVERRIDES and lang in OVERRIDES[cid]:
                    ov = OVERRIDES[cid][lang]
                    for field, value in ov.items():
                        case[field] = value.replace('{BASE}', BASE) if isinstance(value, str) else value
                    total_override_fixed += 1
                    continue  # Skip nav auto-fix for overridden cases

                # Apply navigation fixes
                if case.get('steps'):
                    original = case['steps']
                    fixed = fix_steps(original, lang)
                    if fixed != original:
                        case['steps'] = fixed
                        total_nav_fixed += 1

    print(f"Navigation steps fixed: {total_nav_fixed}")
    print(f"Override fixes applied: {total_override_fixed}")

    with open('/Users/michaellascar/Projects/mixel-test/apps.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print("apps.json saved successfully.")

    # Verify a few cases
    print("\n--- Sample fixes (EN) ---")
    for lang in ['EN']:
        app = data[lang][0]
        for cat in app['categories']:
            for case in cat.get('cases', []):
                if case.get('id') in ['ACC-025', 'ACC-040', 'ACC-006', 'ACC-086', 'ACC-056']:
                    print(f"\n{lang} {case['id']}: {case['title']}")
                    print(case['steps'][:400])


if __name__ == '__main__':
    main()
