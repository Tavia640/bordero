import LocalAuthService from '@/lib/localAuth';
import Logger from '@/lib/logger';

// Auth fix utility to resolve signin issues
export const fixAuthSystem = () => {
  Logger.log('🔧 Running auth system fix...');
  
  // Clear all existing auth data
  localStorage.removeItem('local_auth_users');
  localStorage.removeItem('current_user_session');
  localStorage.removeItem('login_attempts');
  
  // Recreate demo users with correct password hashes
  const hashPassword = (password: string, salt: string): string => {
    let hash = 0;
    const str = password + salt + 'property-sales-secret';
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return Math.abs(hash).toString(36);
  };

  const FIXED_DEMO_USERS = [
    {
      id: 'user_1',
      email: 'admin@vendas.com',
      passwordHash: hashPassword('Admin123!', 'salt123'),
      fullName: 'Administrador',
      createdAt: new Date().toISOString(),
      isActive: true
    },
    {
      id: 'user_2', 
      email: 'vendedor@vendas.com',
      passwordHash: hashPassword('Vendas2024!', 'salt456'),
      fullName: 'João Vendedor',
      createdAt: new Date().toISOString(),
      isActive: true
    }
  ];

  localStorage.setItem('local_auth_users', JSON.stringify(FIXED_DEMO_USERS));
  
  Logger.log('✅ Auth system fixed! Demo users recreated.');
  
  // Test the credentials
  const testCredentials = async () => {
    for (const cred of [
      { email: 'admin@vendas.com', password: 'Admin123!' },
      { email: 'vendedor@vendas.com', password: 'Vendas2024!' }
    ]) {
      const result = await LocalAuthService.signIn(cred.email, cred.password);
      Logger.log(`Test login ${cred.email}:`, result.success ? '✅ SUCCESS' : '❌ FAILED');
    }
  };
  
  testCredentials();
};

// Auto-run fix in development
if (import.meta.env.DEV) {
  (window as any).fixAuthSystem = fixAuthSystem;
}
