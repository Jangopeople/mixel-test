import Header from "@/components/layout/Header.tsx";
import Footer from "@/components/layout/Footer.tsx";
import SeoHead from "@/components/seo/SeoHead.tsx";
import { useTranslation } from "react-i18next";

export default function Terms() {
  const { t } = useTranslation("common");

  return (
    <div className="min-h-screen bg-background">
      <SeoHead title={t("terms.title")} description={t("terms.subtitle")} />
      <Header />
      <main className="container mx-auto px-4 md:px-6 py-24">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-4xl md:text-5xl font-bold">{t("terms.title")}</h1>
          <p className="text-lg text-muted-foreground">{t("terms.subtitle")}</p>
          
          <div className="space-y-12 text-foreground">
            {/* Section 1 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">{t("terms.section1.title")}</h2>
              <p className="leading-relaxed">{t("terms.section1.content")}</p>
            </section>

            {/* Section 2 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">{t("terms.section2.title")}</h2>
              <p className="leading-relaxed">{t("terms.section2.content")}</p>
            </section>

            {/* Section 3 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">{t("terms.section3.title")}</h2>
              <p className="leading-relaxed">{t("terms.section3.content")}</p>
            </section>

            {/* Section 4 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">{t("terms.section4.title")}</h2>
              <p className="leading-relaxed">{t("terms.section4.content")}</p>
            </section>

            {/* Section 5 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">{t("terms.section5.title")}</h2>
              <p className="leading-relaxed">{t("terms.section5.content")}</p>
            </section>

            {/* Section 6 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">{t("terms.section6.title")}</h2>
              <p className="leading-relaxed">{t("terms.section6.content")}</p>
            </section>

            {/* Section 7 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">{t("terms.section7.title")}</h2>
              <p className="leading-relaxed">{t("terms.section7.content")}</p>
            </section>

            {/* Section 8 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">{t("terms.section8.title")}</h2>
              <p className="leading-relaxed">{t("terms.section8.content")}</p>
            </section>

            {/* Section 9 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">{t("terms.section9.title")}</h2>
              <p className="leading-relaxed">{t("terms.section9.content")}</p>
            </section>

            {/* Section 10 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">{t("terms.section10.title")}</h2>
              <p className="leading-relaxed">{t("terms.section10.content")}</p>
            </section>

            {/* Contact */}
            <section className="mt-12 p-6 bg-muted rounded-lg">
              <h3 className="text-xl font-semibold mb-2">{t("terms.contact.title")}</h3>
              <p>{t("terms.contact.content")}</p>
              <p className="mt-2">
                <a href="tel:0444331400" className="text-primary hover:underline">044 433 14 00</a>
                {" "}{t("terms.contact.or")}{" "}
                <a href="mailto:info@mixel.ch" className="text-primary hover:underline">info@mixel.ch</a>
              </p>
            </section>

            <p className="text-sm text-muted-foreground italic mt-8">{t("terms.updated")}</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
