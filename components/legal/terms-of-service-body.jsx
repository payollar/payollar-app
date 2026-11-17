import Link from "next/link";
import {
  LegalSection,
  LegalSubheading,
  LegalList,
} from "@/components/legal/legal-page-shell";

export const TERMS_META = {
  title: "Terms of Service",
  description:
    "The rules for using Payollar as a client, creator, or media agency — including talent bookings, campaigns, and media buying.",
  updated: "17 November 2026",
};

export function TermsOfServiceBody({
  compact = false,
  onOpenPrivacy,
}) {
  const linkClass = compact
    ? "font-medium text-primary underline-offset-2 hover:underline"
    : "font-medium text-slate-800 underline-offset-2 hover:underline";

  return (
    <>
      <LegalSection id="agreement" title="1. Agreement to Terms">
        <p>
          By accessing or using Payollar (“the Platform,” “we,” “us,” or “our”),
          you agree to these Terms of Service (“Terms”). If you do not agree, do
          not use the Platform.
        </p>
        <p>
          These Terms apply to clients, creators, media agencies, admins, and
          visitors. By creating an account you confirm you are at least 18 years
          old and able to enter a binding agreement.
        </p>
      </LegalSection>

      <LegalSection id="service" title="2. Description of service">
        <p>Payollar provides tools to:</p>
        <LegalList
          items={[
            "Book creator appointments and video sessions",
            "Buy and sell digital products",
            "Create campaigns and manage talent applications",
            "Browse and request media inventory (TV, radio, digital, billboard)",
            "Publish agency listings, custom packages, and smart rate cards",
            "Negotiate quotes, message counterparties, and track booking requests",
            "Manage credits, invoices, certificates, and related workflows",
          ]}
        />
        <p>
          Payollar is an intermediary platform. Unless we expressly say
          otherwise, agreements for services or media placements are between
          users. We do not guarantee the quality, legality, or outcome of
          user-provided services or inventory.
        </p>
      </LegalSection>

      <LegalSection id="accounts" title="3. Accounts">
        <LegalSubheading>3.1 Account creation</LegalSubheading>
        <p>You agree to:</p>
        <LegalList
          items={[
            "Provide accurate and complete registration information",
            "Keep your credentials secure and update your details when they change",
            "Accept responsibility for activity under your account",
            "Notify us promptly of unauthorized access",
          ]}
        />
        <LegalSubheading>3.2 Account types</LegalSubheading>
        <LegalList
          items={[
            "Client — book creators, run campaigns, buy media",
            "Creator — offer services, sell products, apply to campaigns",
            "Media agency — list inventory, packages, and rate cards; handle requests",
            "Admin — platform administration",
          ]}
        />
        <LegalSubheading>3.3 Suspension and termination</LegalSubheading>
        <p>
          We may suspend or terminate accounts for Terms violations, fraud,
          abuse, or to protect users and the Platform. You may request account
          closure via Settings or support.
        </p>
      </LegalSection>

      <LegalSection id="creators" title="4. Creator responsibilities">
        <LegalList
          items={[
            "Keep skills, rates, and portfolio information accurate",
            "Honor bookings and deliver as described",
            "Behave professionally in calls, chats, and campaigns",
            "Comply with applicable laws and licensing requirements",
            "Protect confidential client information",
            "Provide correct payout details",
            "Complete verification when required",
          ]}
        />
      </LegalSection>

      <LegalSection id="clients" title="5. Client responsibilities">
        <LegalList
          items={[
            "Provide accurate booking and campaign information",
            "Attend scheduled sessions on time or cancel according to policy",
            "Pay for services and media as agreed",
            "Respect creators, agencies, and intellectual property",
            "Avoid fraud, abuse, or misuse of marketplace features",
          ]}
        />
      </LegalSection>

      <LegalSection id="agencies" title="6. Media agency responsibilities">
        <p>If you operate as a media agency, you agree to:</p>
        <LegalList
          items={[
            "Publish accurate listing details, pricing, reach, and availability",
            "Keep Active listings current; use Draft/Inactive when inventory is not for sale",
            "Respond to Requests, Negotiations, and Messages in good faith",
            "Honor confirmed bookings and provide agreed proof of delivery (for example transmission certificates or reports)",
            "Ensure you have rights to offer the inventory you list",
            "Comply with advertising, broadcasting, and outdoor media regulations that apply to you",
          ]}
        />
        <p>
          Map pins and location data you add for outdoor sites must be accurate
          to the best of your knowledge.
        </p>
      </LegalSection>

      <LegalSection id="media-buying" title="7. Media buying & marketplace">
        <p>
          Quotes, Get Quote / Book flows, negotiations, and messages help users
          discuss inventory. A quote or chat is not a confirmed booking until
          accepted under the Platform’s booking or invoice process. Demo or
          sample inventory may be labeled as such and is for preview only.
        </p>
        <p>
          Rates shown on packages or rate cards may change until a booking is
          confirmed. Agencies and buyers are responsible for final commercial
          terms they accept.
        </p>
      </LegalSection>

      <LegalSection id="payments" title="8. Payments, credits, and fees">
        <LegalSubheading>8.1 Credits</LegalSubheading>
        <p>
          Some talent services use credits. Credits are generally non-refundable
          except where required by law or stated in a specific refund policy.
        </p>
        <LegalSubheading>8.2 Pricing</LegalSubheading>
        <p>
          Prices may be shown in Ghana cedi or other currencies indicated on the
          Platform. We may update displayed prices; changes do not alter already
          confirmed bookings or purchases unless required by law.
        </p>
        <LegalSubheading>8.3 Payouts and fees</LegalSubheading>
        <p>
          Creator and eligible partner payouts follow our schedule and fee
          disclosures. Platform, processing, or service fees shown at checkout
          or in product terms apply. Keep payout details accurate.
        </p>
        <LegalSubheading>8.4 Refunds</LegalSubheading>
        <p>
          Refunds depend on product type and cancellation timing. Digital product
          sales are typically final unless defective or materially not as
          described. Media booking refunds follow the agency terms and any
          Platform policies applicable to that booking.
        </p>
      </LegalSection>

      <LegalSection id="products" title="9. Digital products">
        <p>
          Creators who list products represent that they have rights to sell
          them, that descriptions are accurate, and that content is lawful.
          Buyers receive a license as described on the listing; resale or
          redistribution may be restricted.
        </p>
      </LegalSection>

      <LegalSection id="campaigns" title="10. Campaigns">
        <p>
          Campaign owners must provide accurate briefs and honor commitments to
          selected talent. Applicants must provide truthful information and
          deliver if hired. Advertising and marketing laws remain the
          responsibility of the parties running the campaign.
        </p>
      </LegalSection>

      <LegalSection id="prohibited" title="11. Prohibited conduct">
        <LegalList
          items={[
            "Breaking applicable laws or regulations",
            "Infringing intellectual property or privacy rights",
            "Fraud, deception, harassment, or hate speech",
            "Spam, phishing, or unauthorized scraping",
            "Interfering with Platform security or availability",
            "Circumventing fees or payment systems",
            "Impersonation or unauthorized data harvesting",
          ]}
        />
      </LegalSection>

      <LegalSection id="ip" title="12. Intellectual property">
        <LegalSubheading>12.1 Platform</LegalSubheading>
        <p>
          Payollar branding, software, and site design are owned by Payollar or
          its licensors and protected by applicable IP laws.
        </p>
        <LegalSubheading>12.2 User content</LegalSubheading>
        <p>
          You retain ownership of content you upload. You grant Payollar a
          worldwide, non-exclusive, royalty-free license to host, display, and
          use that content as needed to operate and promote the Platform.
        </p>
      </LegalSection>

      <LegalSection id="disclaimers" title="13. Disclaimers and liability">
        <p>
          THE PLATFORM IS PROVIDED “AS IS” AND “AS AVAILABLE” WITHOUT WARRANTIES
          OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT WARRANT UNINTERRUPTED OR
          ERROR-FREE SERVICE.
        </p>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, PAYOLLAR IS NOT LIABLE FOR
          INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR
          LOSS OF PROFITS, DATA, OR GOODWILL, ARISING FROM YOUR USE OF THE
          PLATFORM.
        </p>
        <p>
          We are not responsible for the quality or legality of user services or
          media inventory. Transactions are between users unless we expressly
          state otherwise.
        </p>
      </LegalSection>

      <LegalSection id="indemnity" title="14. Indemnification">
        <p>
          You agree to indemnify and hold harmless Payollar and its team from
          claims, damages, and expenses (including reasonable legal fees)
          arising from your use of the Platform, your content, your listings, or
          your violation of these Terms or others’ rights.
        </p>
      </LegalSection>

      <LegalSection id="disputes" title="15. Disputes">
        <LegalSubheading>15.1 Between users</LegalSubheading>
        <p>
          Users should try to resolve disputes directly. We may help facilitate
          resolution but are not obligated to, and assistance does not make us a
          party to the dispute.
        </p>
        <LegalSubheading>15.2 Governing law</LegalSubheading>
        <p>
          These Terms are governed by the laws of Ghana, without regard to
          conflict-of-law rules.
        </p>
        <LegalSubheading>15.3 Resolution</LegalSubheading>
        <p>
          Where permitted, disputes with Payollar may be resolved through
          negotiation and, if needed, binding arbitration or courts in Ghana as
          applicable law allows.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="16. Changes">
        <p>
          We may update these Terms. Material changes will be indicated by the
          “Last updated” date on this page. Continued use after changes
          constitutes acceptance.
        </p>
      </LegalSection>

      <LegalSection id="misc" title="17. General">
        <p>
          If any provision is unenforceable, the rest remain in effect. These
          Terms, together with the{" "}
          {onOpenPrivacy ? (
            <button type="button" onClick={onOpenPrivacy} className={linkClass}>
              Privacy Policy
            </button>
          ) : (
            <Link href="/privacy" className={linkClass}>
              Privacy Policy
            </Link>
          )}
          , form the main agreement between you and Payollar regarding the
          Platform.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="18. Contact">
        <LegalList
          items={[
            <span key="e">
              Email:{" "}
              <a href="mailto:hey@payollar.com" className={linkClass}>
                hey@payollar.com
              </a>
            </span>,
            <span key="p">
              Phone:{" "}
              <a href="tel:+233558207902" className={linkClass}>
                +233 (55) 820-7902
              </a>
            </span>,
            "Address: Osabu link, Accra Ghana, Adenta",
            <span key="s">
              Support form:{" "}
              <Link href="/contact-support" className={linkClass}>
                /contact-support
              </Link>
            </span>,
          ]}
        />
      </LegalSection>
    </>
  );
}
