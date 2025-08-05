import LocalAuthService from '@/lib/localAuth';
import Logger from '@/lib/logger';

// Simple auth test to verify the system
export const testAuthSystem = async () => {
  Logger.log('🧪 Starting auth system test...');
  
  // Clear everything first
  localStorage.removeItem('local_auth_users');
  localStorage.removeItem('current_user_session');
  localStorage.removeItem('login_attempts');
  
  // Initialize fresh
  LocalAuthService.initializeUsers();
  
  // Get users and verify
  const users = (LocalAuthService as any).getStoredUsers();
  Logger.log('📊 Users in storage:', users);
  
  // Test each credential
  const testCredentials = [
    { email: 'admin@vendas.com', password: 'Admin123!' },
    { email: 'vendedor@vendas.com', password: 'Vendas2024!' }
  ];
  
  for (const cred of testCredentials) {
    Logger.log(`\n🔍 Testing: ${cred.email}`);
    
    try {
      const result = await LocalAuthService.signIn(cred.email, cred.password);
      
      if (result.success) {
        Logger.log(`✅ SUCCESS: ${cred.email}`);
        // Sign out immediately
        LocalAuthService.signOut();
      } else {
        Logger.error(`❌ FAILED: ${cred.email} - ${result.error}`);
      }
    } catch (error) {
      Logger.error(`💥 EXCEPTION: ${cred.email}`, error);
    }
  }
  
  Logger.log('🏁 Auth test completed');
};

// Make available globally in dev
if (import.meta.env.DEV) {
  (window as any).testAuthSystem = testAuthSystem;
}
