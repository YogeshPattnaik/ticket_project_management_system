import { MFELoader } from '../components/MFELoader';

export default function AuthPage() {
  return (
    <main className="min-h-screen p-0 m-0 overflow-hidden">
      <MFELoader 
        remote="auth_mfe" 
        module="./App"
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white">Loading authentication...</p>
            </div>
          </div>
        }
      />
    </main>
  );
}

