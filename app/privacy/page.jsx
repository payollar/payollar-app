export const metadata = {
  title: "Privacy Policy | PAYOLA",
  description: "Privacy Policy for PAYOLA platform",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-400 mb-8">Last updated: January 2026</p>

          <div className="prose prose-invert max-w-none space-y-8 text-gray-300">
            <section>
              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. Introduction</h2>
              <p>
                Welcome to PAYOLA ("we," "our," or "us"). We are committed to protecting your privacy and ensuring you have a positive experience on our platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform, which connects creators, talents, and clients for appointments, digital products, campaigns, and media services.
              </p>
              <p>
                By using PAYOLA, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.1 Information You Provide</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Information:</strong> Name, email address, profile picture, and authentication credentials through Clerk</li>
                <li><strong>Profile Information:</strong> Specialty, experience, portfolio URLs, skills, description, and verification documents</li>
                <li><strong>Payment Information:</strong> Bank account details (account name, number, bank name, routing number, country) for payouts</li>
                <li><strong>Booking Information:</strong> Appointment details, availability schedules, and consultation preferences</li>
                <li><strong>Product Information:</strong> Digital products you create, sell, or purchase, including descriptions, prices, and media files</li>
                <li><strong>Campaign Information:</strong> Campaign details, applications, and related communications</li>
                <li><strong>Media Agency Information:</strong> Business details, services offered, and registration information</li>
                <li><strong>Communications:</strong> Messages, inquiries, and feedback you send to us or other users</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.2 Automatically Collected Information</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Usage Data:</strong> Pages visited, features used, time spent, and navigation patterns</li>
                <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
                <li><strong>Cookies and Tracking:</strong> We use cookies and similar technologies to enhance your experience</li>
                <li><strong>Video Call Data:</strong> Metadata related to video consultations (not the content itself)</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.3 Third-Party Information</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Clerk Authentication:</strong> User authentication and identity verification data</li>
                <li><strong>Payment Processors:</strong> Transaction data from payment providers</li>
                <li><strong>UploadThing/Storage:</strong> File uploads and media storage metadata</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. How We Use Your Information</h2>
              <p>We use the collected information for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>To provide, maintain, and improve our platform services</li>
                <li>To process transactions, manage credits, and facilitate payouts</li>
                <li>To match creators with clients and facilitate appointments</li>
                <li>To verify creator credentials and maintain platform quality</li>
                <li>To enable digital product sales and purchases</li>
                <li>To manage campaigns and applications</li>
                <li>To provide customer support and respond to inquiries</li>
                <li>To send important updates, notifications, and marketing communications (with your consent)</li>
                <li>To detect, prevent, and address technical issues and security threats</li>
                <li>To comply with legal obligations and enforce our terms</li>
                <li>To analyze usage patterns and improve user experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">4. Information Sharing and Disclosure</h2>
              <p>We do not sell your personal information. We may share your information in the following circumstances:</p>
              
              <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.1 Public Profile Information</h3>
              <p>Your public profile information (name, specialty, portfolio, skills, description) is visible to other users to facilitate connections and bookings.</p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.2 Service Providers</h3>
              <p>We share information with trusted third-party service providers who assist us in:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Authentication services (Clerk)</li>
                <li>Payment processing</li>
                <li>File storage and hosting (UploadThing)</li>
                <li>Analytics and performance monitoring</li>
                <li>Email delivery and communication services</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.3 Legal Requirements</h3>
              <p>We may disclose information if required by law, court order, or government regulation, or to protect our rights, property, or safety, or that of our users.</p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.4 Business Transfers</h3>
              <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">5. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication through Clerk</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication requirements</li>
                <li>Secure payment processing</li>
              </ul>
              <p className="mt-4">
                However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">6. Your Rights and Choices</h2>
              <p>You have the following rights regarding your personal information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information through your account settings</li>
                <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
                <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Cookie Preferences:</strong> Manage cookie settings through your browser</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, please contact us at <a href="mailto:hello@payollar.com" className="text-emerald-400 hover:text-emerald-300">hello@payollar.com</a>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">7. Data Retention</h2>
              <p>
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When you delete your account, we will delete or anonymize your personal information, except where we are required to retain it for legal, regulatory, or business purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">8. Children's Privacy</h2>
              <p>
                Our platform is not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately, and we will take steps to delete such information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">9. International Data Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from those in your country. By using our platform, you consent to the transfer of your information to these countries.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">10. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">11. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy or our privacy practices, please contact us:
              </p>
              <ul className="list-none pl-0 space-y-2 mt-4">
                <li><strong>Email:</strong> <a href="mailto:hello@payollar.com" className="text-emerald-400 hover:text-emerald-300">hello@payollar.com</a></li>
                <li><strong>Phone:</strong> +1 (555) 123-4567</li>
                <li><strong>Address:</strong> Osabu Link, Accra Ghana, Adenta</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
