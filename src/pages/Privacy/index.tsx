import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/services/api';

export default function Privacy() {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  return <main className="max-w-3xl mx-auto p-6 space-y-6 text-foreground bg-background">
    <h1 className="text-3xl font-bold">Compus privacy & account deletion</h1>
    <p className="text-sm text-muted-foreground">Effective 2 October 2026</p>
    <section className="space-y-2"><h2 className="text-xl font-bold">What we collect and why</h2><p>We store your email, password hash, verification records, profile details, posts, comments, images, community memberships, event registrations, opportunity applications, messages, feedback and reports to operate Compus. Login sessions include device information, IP address and expiry information for account security. Passwords are stored as hashes.</p></section>
    <section className="space-y-2"><h2 className="text-xl font-bold">Who can see your information</h2><p>Your profile visibility and contact preferences control information shown to other students. Campus posts and public community activity are visible within the app. Messages are available to conversation participants. Organizers can see registrations and attendance; opportunity creators can review applications. The owner can administer accounts, review feedback and reports, and access data when needed to operate and protect the service. Messages are not end-to-end encrypted.</p></section>
    <section className="space-y-2"><h2 className="text-xl font-bold">Service providers and storage</h2><p>The app uses hosting, PostgreSQL database, Cloudinary image storage and email-delivery providers. PostgreSQL stores the secure Cloudinary URL for each migrated or newly uploaded image instead of its image bytes. Operational error monitoring may send technical diagnostics to Sentry when enabled. We do not sell your personal information.</p></section>
    <section className="space-y-2"><h2 className="text-xl font-bold">Your controls</h2><p>You can edit your profile and privacy preferences in Settings, remove your own content, cancel registrations, leave communities, and change your password. A permanent club account belongs to the club: the incoming team should change its password at every handover. Password changes sign out all sessions.</p><Link className="text-primary underline" to="/settings">Open Settings</Link></section>
    <section className="space-y-2"><h2 className="text-xl font-bold">Deletion and retention</h2><p>Request account deletion below or email <a className="text-primary underline" href="mailto:tharunrajr2007@gmail.com">tharunrajr2007@gmail.com</a> using your registered address. The owner verifies the request, arranges transfer of communities you own, disables access, revokes sessions and reviews associated data for erasure. Account removal in owner tools is initially a soft deletion: it prevents access but does not permanently erase all data. Automatic erasure and a guaranteed deletion deadline are not currently available.</p><p>Records may be retained for security, abuse investigation or unresolved disputes. Backup copies remain until the configured provider retention window expires. The owner will explain retained records and the applicable backup window when responding to your request. Completed deletion requests must be reapplied before reopening access after a backup restoration.</p>
      {user ? <button disabled={busy || !!notice} className="bg-destructive text-white rounded-xl p-3 disabled:opacity-50" onClick={async () => {
        if (!window.confirm('Send an account deletion request to the owner? The owner will review it before removing your account.')) return;
        setBusy(true); setError('');
        try { await apiRequest('/feedback', 'POST', { category: 'DELETION_REQUEST', message: 'Please delete my Compus account and review associated personal data for erasure.', page: '/privacy' }); setNotice('Your deletion request was recorded. The owner will review it and contact your registered email.'); }
        catch (e) { setError(e instanceof Error ? e.message : 'Unable to submit request'); }
        finally { setBusy(false); }
      }}>Request account deletion</button> : <Link className="text-primary underline" to="/login">Sign in to request deletion</Link>}
      {notice && <p role="status">{notice}</p>}{error && <p role="alert" className="text-destructive">{error}</p>}
    </section>
    <section className="space-y-2"><h2 className="text-xl font-bold">Updates and contact</h2><p>Material changes will be published on this page with an updated effective date. Contact the owner using the email above for privacy questions, corrections or deletion follow-up.</p></section>
    <Link className="text-primary underline" to={user ? '/campus' : '/login'}>Back to Compus</Link>
  </main>;
}
