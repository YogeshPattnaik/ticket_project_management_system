import { MFELoader } from '../components/MFELoader';

export default function AuthPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden min-h-[500px]">
          <MFELoader 
            remote="auth_mfe" 
            module="./App"
            fallback={
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading authentication...</p>
              </div>
            }
          />
        </div>
      </div>
    </main>
  );
}

