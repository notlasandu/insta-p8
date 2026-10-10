export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: October 2026</p>

      <section className="space-y-4">
        <p>
          This app (&quot;Insta P8&quot;) is owned and operated by <strong>Copium Builder</strong>. The app uses the Facebook and Instagram Graph APIs to help users manage their accounts by automating replies to messages, comments, and story interactions, as well as viewing account analytics.
        </p>

        <h2 className="text-xl font-semibold mt-6">Data We Collect</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Facebook and Instagram profile information (username, name, profile picture)</li>
          <li>Comments made on your posts and reels</li>
          <li>Direct messages and conversation history (strictly for triggering automated replies)</li>
          <li>Basic account analytics and engagement metrics</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6">How We Use Data</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>To monitor for specific keywords and send automated replies to your Facebook and Instagram DMs</li>
          <li>To automatically reply to or manage comments on your Facebook and Instagram content</li>
          <li>To display analytics about your account performance within our dashboard</li>
          <li>We do <strong>not</strong> post content to your feed or stories</li>
          <li>We do <strong>not</strong> sell your data to third parties</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6">Data Storage</h2>
        <p>
          Your Facebook and Instagram access tokens and profile data are stored securely in
          our database (Supabase). You can disconnect your account at any time,
          which will permanently remove your stored tokens from our systems.
        </p>

        <h2 className="text-xl font-semibold mt-6">Contact</h2>
        <p>
          For any questions, privacy concerns, or data deletion requests, please reach out via the app dashboard or contact the developer directly.
        </p>
      </section>
    </div>
  )
}
