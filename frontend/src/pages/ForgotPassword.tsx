import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [devToken, setDevToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    setDevToken(null);

    try {
      const { data } = await authService.forgotPassword(email);
      setSuccessMessage('Password reset link generated successfully!');
      
      // In development mode, the backend forgotPassword returns the token in message for ease of dev testing
      const msg = (data as { message?: string }).message || '';
      const match = msg.match(/Reset token: ([a-f0-9]+)/i);
      if (match && match[1]) {
        setDevToken(match[1]);
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to request password reset. Please check the email.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 text-2xl shadow-sm">
            🧭
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-zinc-900">
            Reset password
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            Remember your credentials?{' '}
            <Link to="/login" className="font-medium text-zinc-900 hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <div className="card">
          {successMessage ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700 border border-emerald-200">
                {successMessage} If SMTP is not configured, please copy the development link below.
              </div>

              {devToken && (
                <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                    Developer Mode Bypassing Email
                  </p>
                  <p className="text-sm text-zinc-600 mb-3">
                    We detected a dev reset token. Click the button below to reset now.
                  </p>
                  <Link
                    to={`/reset-password/${devToken}`}
                    className="btn-primary w-full justify-center py-2 text-center text-xs"
                  >
                    Reset Password Now
                  </Link>
                </div>
              )}

              <Link to="/login" className="btn-secondary w-full justify-center py-2">
                Back to Sign in
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="label">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="you@example.com"
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full justify-center py-2.5"
              >
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-400 border-t-white" />
                ) : (
                  'Send Reset Instructions'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
