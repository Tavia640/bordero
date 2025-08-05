import LocalAuthService from '@/lib/localAuth';

// Quick fix to directly add the problematic user
export const quickFixUser = () => {
  console.log('🔧 Quick fix: Adding problematic user directly');
  
  // Get current users
  const users = JSON.parse(localStorage.getItem('local_auth_users') || '[]');
  console.log('Current users before fix:', users);
  
  // Add the problematic user directly
  const problemUser = {
    id: 'user_luan_fix',
    email: 'luan.andrade@gavresorts.com.br',
    passwordHash: 'direct_fix_hash',
    fullName: 'Luan Andrade',
    createdAt: new Date().toISOString(),
    isActive: true
  };
  
  // Check if user already exists
  const userExists = users.some((u: any) => u.email === problemUser.email);
  
  if (!userExists) {
    users.push(problemUser);
    localStorage.setItem('local_auth_users', JSON.stringify(users));
    console.log('✅ User added directly');
  } else {
    console.log('ℹ️ User already exists');
  }
  
  // Verify it was saved
  const updatedUsers = JSON.parse(localStorage.getItem('local_auth_users') || '[]');
  const wasAdded = updatedUsers.some((u: any) => u.email === problemUser.email);
  
  console.log('Verification:', {
    wasAdded,
    totalUsers: updatedUsers.length,
    userEmails: updatedUsers.map((u: any) => u.email)
  });
  
  return wasAdded;
};

// Test localStorage directly
export const testLocalStorage = () => {
  console.log('🧪 Testing localStorage directly...');
  
  // Test write
  const testKey = 'test_key_' + Date.now();
  const testData = { test: 'data', timestamp: Date.now() };
  
  try {
    localStorage.setItem(testKey, JSON.stringify(testData));
    
    // Test read
    const retrieved = localStorage.getItem(testKey);
    const parsed = retrieved ? JSON.parse(retrieved) : null;
    
    // Clean up
    localStorage.removeItem(testKey);
    
    const success = parsed && parsed.test === 'data';
    console.log('localStorage test result:', success ? '✅ Working' : '❌ Failed');
    
    return success;
  } catch (error) {
    console.error('localStorage test error:', error);
    return false;
  }
};

// Make available globally
if (import.meta.env.DEV) {
  (window as any).quickFixUser = quickFixUser;
  (window as any).testLocalStorage = testLocalStorage;
}
