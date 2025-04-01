import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="luxury-container min-h-[calc(100vh-64px)] flex items-center justify-center">
      <div className="luxury-card p-8 text-center">
        <h1 className="luxury-heading mb-4">Unauthorized Access</h1>
        <p className="luxury-text mb-6">You do not have permission to access this page.</p>
        <Link href="/" className="luxury-button">
          Return to Home
        </Link>
      </div>
    </div>
  );
}
