import Footer from "@/components/layout/Footer.tsx";
import Header from "@/components/layout/Header.tsx";
import SeoHead from "@/components/seo/SeoHead.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { LOCAL_BUSINESS_SCHEMA } from "@/lib/seo.ts";
import { CheckCircle2, Mail, MapPin, Phone } from "lucide-react";
import { type FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";

export default function Contact() {
  const { t } = useTranslation("common");
  const [submitted, setSubmitted] = useState(false);

  const handleContactSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const company = String(formData.get("company") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();

    const subject = encodeURIComponent(
      `IT consultation request - ${company || name || "Mixel lead"}`,
    );
    const body = encodeURIComponent(
      [
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone}`,
        `Company: ${company}`,
        "",
        "Requirements:",
        message,
      ].join("\n"),
    );

    window.location.href = `mailto:info@mixel.ch?subject=${subject}&body=${body}`;
    setSubmitted(true);
    event.currentTarget.reset();
  };

  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title={t("contact.title")}
        description={t("contact.subtitle")}
        schema={LOCAL_BUSINESS_SCHEMA}
      />
      <Header />

      <section className="border-b bg-slate-100/90 py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-3xl space-y-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{t("nav.contact")}</p>
            <h1 className="text-balance text-4xl font-semibold md:text-5xl">{t("contact.title")}</h1>
            <p className="text-muted-foreground">{t("contact.subtitle")}</p>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-5">
              <Card className="border-border/70 bg-card/95">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <MapPin className="h-5 w-5 text-primary" />
                    {t("contact.address")}
                  </CardTitle>
                  <CardDescription>{t("footer.address")}</CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-border/70 bg-card/95">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Phone className="h-5 w-5 text-primary" />
                    {t("contact.phone")}
                  </CardTitle>
                  <CardDescription>
                    <a href="tel:0444331400" className="hover:text-foreground">
                      044 433 14 00
                    </a>
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-border/70 bg-card/95">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Mail className="h-5 w-5 text-primary" />
                    {t("contact.email")}
                  </CardTitle>
                  <CardDescription>
                    <a href="mailto:info@mixel.ch" className="hover:text-foreground">
                      info@mixel.ch
                    </a>
                  </CardDescription>
                </CardHeader>
              </Card>

              <div className="rounded-2xl border bg-muted/40 p-4 text-sm text-muted-foreground">
                <p>{t("contact.hours")}</p>
                <p className="mt-1">{t("contact.response")}</p>
              </div>
            </div>

            <Card className="border-border/70 bg-card/95 shadow-sm">
              <CardHeader>
                <CardTitle>{t("contact.form.title")}</CardTitle>
                <CardDescription>{t("contact.form.subtitle")}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input name="name" placeholder={t("contact.form.name")} aria-label={t("contact.form.name")} required />
                    <Input name="email" type="email" placeholder={t("contact.form.email")} aria-label={t("contact.form.email")} required />
                    <Input name="phone" placeholder={t("contact.form.phone")} aria-label={t("contact.form.phone")} />
                    <Input name="company" placeholder={t("contact.form.company")} aria-label={t("contact.form.company")} />
                  </div>
                  <Textarea
                    name="message"
                    placeholder={t("contact.form.message")}
                    aria-label={t("contact.form.message")}
                    className="min-h-36"
                    required
                  />
                  <p className="text-xs text-muted-foreground">{t("contact.form.privacy_notice")}</p>
                  <Button type="submit" className="w-full md:w-auto">
                    {t("contact.form.submit")}
                  </Button>
                  {submitted ? (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                      <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-emerald-600" />
                      <p className="text-sm font-semibold text-emerald-800">{t("contact.form.success")}</p>
                      <p className="mt-1 text-xs text-emerald-600">{t("contact.form.success_detail")}</p>
                    </div>
                  ) : null}
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
