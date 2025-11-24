import { useEffect } from 'react';

export function GoogleCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    // Check if this is a new user needing organization
    if (params.get('action') === 'signup' && params.get('email')) {
      window.opener?.postMessage({
        type: 'GOOGLE_AUTH_NEEDS_ORG',
        email: params.get('email'),
        firstName: params.get('firstName') || '',
        lastName: params.get('lastName') || '',
        picture: params.get('picture') || '',
      }, window.location.origin);
      window.close();
      return;
    }

    // Check if user is logged in (has tokens)
    if (params.get('accessToken') && params.get('refreshToken')) {
      try {
        const user = JSON.parse(params.get('user') || '{}');
        window.opener?.postMessage({
          type: 'GOOGLE_AUTH_SUCCESS',
          accessToken: params.get('accessToken'),
          refreshToken: params.get('refreshToken'),
          user,
        }, window.location.origin);
        window.close();
      } catch (error) {
        window.opener?.postMessage({
          type: 'GOOGLE_AUTH_ERROR',
          message: 'Failed to parse user data',
        }, window.location.origin);
        window.close();
      }
      return;
    }

    // Error case
    window.opener?.postMessage({
      type: 'GOOGLE_AUTH_ERROR',
      message: params.get('error') || 'Authentication failed',
    }, window.location.origin);
    window.close();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
}

