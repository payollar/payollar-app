import Link from "next/link";
import {
  LegalPageShell,
  LegalSection,
  LegalSubheading,
  LegalList,
} from "@/components/legal/legal-page-shell";

export default function PrivacyPolicyPage() {
  return (
    <LegalPageShell
      title="Privacy Policy"
      description="How Payollar collects, uses, and protects information when you use our talent marketplace, campaigns, and media buying services."
      updated="17 November 2026"
      otherHref="/terms"
      otherLabel="Terms of Service"
    >
      <LegalSection id="introduction" title="1. Introduction">
        <p>
          Payollar (“we,” “us,” or “our”) operates a platform that connects
          clients with creators and media agencies for bookings, campaigns,
          digital products, and media inventory (TV, radio, digital, and
          billboard). This Privacy Policy explains what we collect, why we
          collect it, and the choices you have.
        </p>
        <p>
          By using Payollar, you agree to this Policy. If you do not agree,
          please do not use the platform. For questions, email{" "}
          <a
            href="mailto:hey@payollar.com"
            className="font-medium text-slate-800 underline-offset-2 hover:underline"
          >
            hey@payollar.com
          </a>{" "}
          or use{" "}
          <Link
            href="/contact-support"
            className="font-medium text-slate-800 underline-offset-2 hover:underline"
          >
            Contact support
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection id="collect" title="2. Information we collect">
        <LegalSubheading>2.1 Information you provide</LegalSubheading>
        <LegalList
          items={[
            <span key="account">
              <strong className="text-slate-800">Account details:</strong> name,
              email, password or OAuth credentials (via Better Auth), and profile
              photo.
            </span>,
            <span key="profile">
              <strong className="text-slate-800">Profile & verification:</strong>{" "}
              specialty, experience, portfolio links, skills, bio, and documents
              you upload for creator or agency verification.
            </span>,
            <span key="agency">
              <strong className="text-slate-800">Media agency details:</strong>{" "}
              agency name, contact person, location, listings, packages, rate
              cards, cover images, and optional map coordinates for outdoor /
              billboard sites.
            </span>,
            <span key="booking">
              <strong className="text-slate-800">Bookings & campaigns:</strong>{" "}
              appointment times, campaign briefs, applications, deliverables,
              and related notes.
            </span>,
            <span key="media">
              <strong className="text-slate-800">Media buying activity:</strong>{" "}
              quote requests, negotiations, messages, booking requests,
              transmission certificates, and performance reports.
            </span>,
            <span key="payments">
              <strong className="text-slate-800">Payments & payouts:</strong>{" "}
              credit purchases, transaction records, and payout details you
              submit (for example bank or mobile money information).
            </span>,
            <span key="support">
              <strong className="text-slate-800">Support:</strong> messages,
              categories, and optional file attachments you send through Contact
              support.
            </span>,
          ]}
        />

        <LegalSubheading>2.2 Information collected automatically</LegalSubheading>
        <LegalList
          items={[
            "Usage data such as pages viewed, features used, and approximate activity times",
            "Device and connection data such as IP address, browser type, and device identifiers",
            "Cookies and similar technologies used for sessions, preferences, and security",
            "Video call metadata for appointments (not the content of the call itself)",
          ]}
        />

        <LegalSubheading>2.3 Information from service providers</LegalSubheading>
        <LegalList
          items={[
            "Authentication and session data via Better Auth and related identity providers (for example Google)",
            "Payment and payout processors for transaction confirmation",
            "File storage providers (for example UploadThing) for images, certificates, and attachments",
            "Email delivery providers for transactional and support messages",
          ]}
        />
      </LegalSection>

      <LegalSection id="use" title="3. How we use information">
        <p>We use information to:</p>
        <LegalList
          items={[
            "Operate accounts, dashboards, and role-based access (client, creator, media agency)",
            "Power bookings, campaigns, marketplace listings, quotes, negotiations, and messages",
            "Process credits, fees, invoices, and creator or agency payouts",
            "Verify profiles and maintain platform quality and safety",
            "Show relevant media inventory and support map-based billboard locations you choose to share",
            "Provide customer support and respond to requests",
            "Send service notifications; marketing only where permitted and with opt-out options",
            "Detect abuse, secure the platform, and meet legal obligations",
            "Improve product experience through aggregated analytics",
          ]}
        />
      </LegalSection>

      <LegalSection id="sharing" title="4. How we share information">
        <p>
          We do not sell your personal information. We share it only as needed to
          run the platform:
        </p>
        <LegalSubheading>4.1 With other users</LegalSubheading>
        <p>
          Public profile and listing details (such as name, agency name,
          portfolio highlights, Active media listings, and package information)
          are visible to help buyers and sellers connect. Private payment details
          are not shown publicly.
        </p>
        <LegalSubheading>4.2 With service providers</LegalSubheading>
        <p>
          Trusted providers help with authentication, hosting, file storage,
          payments, email, and analytics. They may process data only to perform
          services for us under appropriate safeguards.
        </p>
        <LegalSubheading>4.3 Legal and safety</LegalSubheading>
        <p>
          We may disclose information if required by law, to respond to lawful
          requests, or to protect Payollar, our users, or the public from harm
          or fraud.
        </p>
        <LegalSubheading>4.4 Business transfers</LegalSubheading>
        <p>
          If we are involved in a merger, acquisition, or asset sale, information
          may transfer to the successor entity subject to this Policy or
          equivalent protections.
        </p>
      </LegalSection>

      <LegalSection id="security" title="5. Security">
        <p>
          We use technical and organizational measures such as encrypted
          transport, access controls, and secure authentication. No online
          service is perfectly secure; please protect your password and notify us
          of suspected unauthorized access.
        </p>
      </LegalSection>

      <LegalSection id="rights" title="6. Your rights and choices">
        <LegalList
          items={[
            "Access and update account information in Settings",
            "Request deletion of your account where legally permitted",
            "Request a copy of certain personal data we hold about you",
            "Opt out of non-essential marketing emails",
            "Control cookies through your browser settings (note that some features need cookies to work)",
          ]}
        />
        <p>
          To exercise these rights, contact{" "}
          <a
            href="mailto:hey@payollar.com"
            className="font-medium text-slate-800 underline-offset-2 hover:underline"
          >
            hey@payollar.com
          </a>{" "}
          or use Contact support. We may need to verify your identity before
          fulfilling a request.
        </p>
      </LegalSection>

      <LegalSection id="retention" title="7. Data retention">
        <p>
          We keep information for as long as your account is active and as needed
          to provide services, resolve disputes, enforce agreements, and comply
          with law. After account deletion we delete or anonymize personal data
          except where retention is required (for example transaction records).
        </p>
      </LegalSection>

      <LegalSection id="children" title="8. Children">
        <p>
          Payollar is not directed to anyone under 18. We do not knowingly
          collect personal information from children. If you believe a child has
          provided data, contact us and we will take appropriate steps.
        </p>
      </LegalSection>

      <LegalSection id="international" title="9. International transfers">
        <p>
          We primarily serve users in Ghana and may process data on servers or
          with providers in other countries. By using Payollar you understand
          that information may be transferred to jurisdictions with different
          data-protection laws.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="10. Changes to this Policy">
        <p>
          We may update this Privacy Policy from time to time. Material changes
          will be reflected by revising the “Last updated” date on this page.
          Continued use after changes means you accept the updated Policy.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="11. Contact">
        <p>Payollar — privacy and data requests:</p>
        <LegalList
          items={[
            <span key="e">
              Email:{" "}
              <a
                href="mailto:hey@payollar.com"
                className="font-medium text-slate-800 underline-offset-2 hover:underline"
              >
                hey@payollar.com
              </a>
            </span>,
            <span key="p">
              Phone:{" "}
              <a
                href="tel:+233558207902"
                className="font-medium text-slate-800 underline-offset-2 hover:underline"
              >
                +233 (55) 820-7902
              </a>
            </span>,
            "Address: Osabu link, Accra Ghana, Adenta",
          ]}
        />
      </LegalSection>
    </LegalPageShell>
  );
}
