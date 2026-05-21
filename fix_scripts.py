import re

def fix_file(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # Force French
    content = re.sub(r'let viewPrefs = \{[^}]*\};', 'let viewPrefs = {\n  language: "FR",\n  completedTests: {},\n  testNotes: {}\n};', content)

    # Fix ACC-009 DE
    content = content.replace('"where":"Einstellungen > Firmen-Setup"', '"where":"Einstellungen > Finanzen / Buchhaltung"')
    content = content.replace('Gehen Sie zu Unternehmenseinstellungen > Buchhaltung oder Geschäftsjahr', 'Gehen Sie zu Buchhaltung > Geschäftsjahr oder Einstellungen > Finanzen')
    
    # Fix ACC-009 FR
    content = content.replace('"where":"Paramètres > Configuration de l\'entreprise"', '"where":"Paramètres > Finance / Comptabilité"')
    content = content.replace('Accédez aux paramètres de l\'entreprise > Comptabilité ou Exercice', 'Allez dans Comptabilité > Exercice fiscal ou Paramètres > Finance')
    
    # Fix ACC-010 FR
    content = content.replace('Accédez à Paramètres de l\'entreprise > TVA/Taxes', 'Allez dans Paramètres > Finance > TVA')

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Fixed {filename}")

fix_file("script.js")
fix_file("script2.js")
