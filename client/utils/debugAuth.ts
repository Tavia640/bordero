import LocalAuthService from '@/lib/localAuth';

// Debug utility for testing local authentication
export const debugLocalAuth = () => {
  console.group('🔍 Local Auth Debug');
  
  // Initialize users
  LocalAuthService.initializeUsers();
  const users = (LocalAuthService as any).getStoredUsers();
  
  console.log('📁 Stored users:', users);
  
  // Test credentials
  const testCredentials = [
    { email: 'admin@vendas.com', password: 'Admin123!' },
    { email: 'vendedor@vendas.com', password: 'Vendas2024!' }
  ];
  
  testCredentials.forEach(async (cred, index) => {
    console.log(`\n🧪 Testing credential ${index + 1}:`);
    console.log('Email:', cred.email);
    console.log('Password:', cred.password);
    
    try {
      const result = await LocalAuthService.signIn(cred.email, cred.password);
      console.log('Result:', result);
      
      if (result.success) {
        console.log('✅ Login successful');
      } else {
        console.log('❌ Login failed:', result.error);
      }
    } catch (error) {
      console.error('💥 Exception:', error);
    }
  });
  
  console.groupEnd();
};

// Test password hashing
export const debugPasswordHashing = () => {
  console.group('🔐 Password Hashing Debug');
  
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
  
  const testCases = [
    { password: 'Admin123!', salt: 'salt123' },
    { password: 'Vendas2024!', salt: 'salt456' }
  ];
  
  testCases.forEach((test, index) => {
    const hash = hashPassword(test.password, test.salt);
    console.log(`Test ${index + 1}:`, {
      password: test.password,
      salt: test.salt,
      hash: hash
    });
  });
  
  console.groupEnd();
};

// Run debug when in development
if (import.meta.env.DEV) {
  (window as any).debugLocalAuth = debugLocalAuth;
  (window as any).debugPasswordHashing = debugPasswordHashing;
}
