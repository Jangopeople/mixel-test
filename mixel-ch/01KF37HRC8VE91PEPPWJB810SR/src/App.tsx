import { lazy, Suspense } from "react";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import { DefaultProviders } from "./components/providers/default.tsx";
import RouteAnalytics from "./components/analytics/RouteAnalytics.tsx";
import LocaleWrapper from "./components/providers/locale-wrapper.tsx";
import ScrollToTop from "./components/ScrollToTop.tsx";
import { SAVED_OR_DEFAULT_LOCALE, setLocaleInPath } from "./i18n.ts";
import "./i18n.ts";
import { useServiceWorker } from "./hooks/use-service-worker.ts";

const AuthCallback = lazy(() => import("./pages/auth/Callback.tsx"));
const Index = lazy(() => import("./pages/Index.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const Network = lazy(() => import("./pages/services/Network.tsx"));
const Server = lazy(() => import("./pages/services/Server.tsx"));
const Microsoft365 = lazy(() => import("./pages/services/Microsoft365.tsx"));
const VideoSecurity = lazy(() => import("./pages/services/VideoSecurity.tsx"));
const Telephony = lazy(() => import("./pages/services/Telephony.tsx"));
const ServiceDesk = lazy(() => import("./pages/services/ServiceDesk.tsx"));
const AI = lazy(() => import("./pages/services/AI.tsx"));
const Privacy = lazy(() => import("./pages/Privacy.tsx"));
const Terms = lazy(() => import("./pages/Terms.tsx"));
const DomainGateway = lazy(() => import("./pages/DomainGateway.tsx"));
const Apps = lazy(() => import("./pages/Apps.tsx"));
const Pricing = lazy(() => import("./pages/Pricing.tsx"));
const CaseStudies = lazy(() => import("./pages/CaseStudies.tsx"));
const About = lazy(() => import("./pages/About.tsx"));
const Insights = lazy(() => import("./pages/Insights.tsx"));
const Contact = lazy(() => import("./pages/Contact.tsx"));
const AccountingLayout = lazy(
  () => import("./pages/accounting/_components/AccountingLayout.tsx"),
);
const AccountingDashboard = lazy(() => import("./pages/accounting/page.tsx"));
const ClientsPage = lazy(() => import("./pages/accounting/clients/page.tsx"));
const UsersPage = lazy(() => import("./pages/accounting/users/page.tsx"));
const OffersPage = lazy(() => import("./pages/accounting/offers/page.tsx"));
const OfferDetailPage = lazy(
  () => import("./pages/accounting/offers/detail.tsx"),
);

export default function App() {
  useServiceWorker();

  return (
    <DefaultProviders>
      <BrowserRouter>
        <ScrollToTop />
        <RouteAnalytics />
        <Suspense fallback={<div></div>}>
          <Routes>
            {/* Root: redirect to saved/default locale */}
            <Route
              path="/"
              element={
                <Navigate
                  to={setLocaleInPath(SAVED_OR_DEFAULT_LOCALE, "/")}
                  replace
                />
              }
            />

            {/* Non-localized routes (auth, webhooks, etc.) */}
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/gateway" element={<DomainGateway />} />

            {/* All localized routes under /:lng */}
            <Route
              path="/:lng"
              element={
                <LocaleWrapper>
                  <main id="main">
                    <Outlet />
                  </main>
                </LocaleWrapper>
              }
            >
              <Route index element={<Index />} />
              <Route path="apps" element={<Apps />} />
              <Route path="pricing" element={<Pricing />} />
              <Route path="case-studies" element={<CaseStudies />} />
              <Route path="about" element={<About />} />
              <Route path="insights" element={<Insights />} />
              <Route path="contact" element={<Contact />} />
              <Route path="services/network" element={<Network />} />
              <Route path="services/server" element={<Server />} />
              <Route path="services/microsoft-365" element={<Microsoft365 />} />
              <Route
                path="services/video-security"
                element={<VideoSecurity />}
              />
              <Route path="services/telephony" element={<Telephony />} />
              <Route path="services/service-desk" element={<ServiceDesk />} />
              <Route path="services/ai" element={<AI />} />
              <Route path="privacy" element={<Privacy />} />
              <Route path="terms" element={<Terms />} />

              {/* Accounting system */}
              <Route path="accounting" element={<AccountingLayout />}>
                <Route index element={<AccountingDashboard />} />
                <Route path="clients" element={<ClientsPage />} />
                <Route path="offers" element={<OffersPage />} />
                <Route path="offers/:offerId" element={<OfferDetailPage />} />
                <Route path="users" element={<UsersPage />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </DefaultProviders>
  );
}
