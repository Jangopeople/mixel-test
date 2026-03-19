import Header from "@/components/layout/Header.tsx";
import Footer from "@/components/layout/Footer.tsx";
import SeoHead from "@/components/seo/SeoHead.tsx";
import { useTranslation } from "react-i18next";

export default function Privacy() {
  const { t } = useTranslation("common");

  return (
    <div className="min-h-screen bg-background">
      <SeoHead title={t("privacy.title")} description={t("privacy.subtitle")} />
      <Header />
      <main className="container mx-auto px-4 md:px-6 py-24">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("privacy.title")}</h1>
            <p className="text-lg text-muted-foreground">{t("privacy.subtitle")}</p>
          </div>

          <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("privacy.section1.title")}</h2>
              <p className="mb-4">{t("privacy.section1.intro")}</p>
              <div className="bg-card p-4 rounded-lg border">
                <p className="font-semibold mb-2">{t("privacy.section1.company")}</p>
                <p className="text-sm">
                  {t("footer.company")}<br />
                  {t("footer.address")}<br />
                  {t("contact.phone")}: 044 433 14 00<br />
                  {t("contact.email")}: info@mixel.ch
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("privacy.section2.title")}</h2>
              <p className="mb-4">{t("privacy.section2.content")}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("privacy.section3.title")}</h2>
              <p className="mb-4">{t("privacy.section3.intro")}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>{t("privacy.section3.contact_title")}:</strong> {t("privacy.section3.contact_desc")}</li>
                <li><strong>{t("privacy.section3.contract_title")}:</strong> {t("privacy.section3.contract_desc")}</li>
                <li><strong>{t("privacy.section3.technical_title")}:</strong> {t("privacy.section3.technical_desc")}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("privacy.section4.title")}</h2>
              <p className="mb-4">{t("privacy.section4.intro")}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t("privacy.section4.purpose1")}</li>
                <li>{t("privacy.section4.purpose2")}</li>
                <li>{t("privacy.section4.purpose3")}</li>
                <li>{t("privacy.section4.purpose4")}</li>
                <li>{t("privacy.section4.purpose5")}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("privacy.section5.title")}</h2>
              <p className="mb-4">{t("privacy.section5.content")}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("privacy.section6.title")}</h2>
              <p className="mb-4">{t("privacy.section6.content")}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("privacy.section7.title")}</h2>
              <p className="mb-4">{t("privacy.section7.intro")}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>{t("privacy.section7.hosting_title")}:</strong> {t("privacy.section7.hosting_desc")}</li>
                <li><strong>{t("privacy.section7.analytics_title")}:</strong> {t("privacy.section7.analytics_desc")}</li>
                <li><strong>{t("privacy.section7.email_title")}:</strong> {t("privacy.section7.email_desc")}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("privacy.section8.title")}</h2>
              <p className="mb-4">{t("privacy.section8.intro")}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>{t("privacy.section8.right1_title")}:</strong> {t("privacy.section8.right1_desc")}</li>
                <li><strong>{t("privacy.section8.right2_title")}:</strong> {t("privacy.section8.right2_desc")}</li>
                <li><strong>{t("privacy.section8.right3_title")}:</strong> {t("privacy.section8.right3_desc")}</li>
                <li><strong>{t("privacy.section8.right4_title")}:</strong> {t("privacy.section8.right4_desc")}</li>
                <li><strong>{t("privacy.section8.right5_title")}:</strong> {t("privacy.section8.right5_desc")}</li>
                <li><strong>{t("privacy.section8.right6_title")}:</strong> {t("privacy.section8.right6_desc")}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("privacy.section9.title")}</h2>
              <p className="mb-4">{t("privacy.section9.content")}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("privacy.section10.title")}</h2>
              <p className="mb-4">{t("privacy.section10.content")}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("privacy.section11.title")}</h2>
              <p className="mb-4">{t("privacy.section11.content")}</p>
            </section>

            <section className="bg-muted p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">{t("privacy.contact.title")}</h2>
              <p className="mb-4">{t("privacy.contact.content")}</p>
              <p className="font-semibold">
                {t("contact.email")}: info@mixel.ch<br />
                {t("contact.phone")}: 044 433 14 00
              </p>
            </section>

            <p className="text-sm text-muted-foreground text-center">{t("privacy.updated")}</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
