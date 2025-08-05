// Hash verification utility to debug password issues

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

export const verifyHashes = () => {
  console.group('🔐 Hash Verification');
  
  const testCases = [
    { email: 'admin@vendas.com', password: 'Admin123!', salt: 'salt123' },
    { email: 'vendedor@vendas.com', password: 'Vendas2024!', salt: 'salt456' }
  ];
  
  testCases.forEach(test => {
    const hash = hashPassword(test.password, test.salt);
    console.log(`${test.email}:`);
    console.log(`  Password: "${test.password}"`);
    console.log(`  Salt: "${test.salt}"`);
    console.log(`  Hash: "${hash}"`);
    console.log('');
  });
  
  // Verify against stored users
  const storedUsers = JSON.parse(localStorage.getItem('local_auth_users') || '[]');
  console.log('Stored users:', storedUsers);
  
  console.groupEnd();
};

// Make available globally
if (import.meta.env.DEV) {
  (window as any).verifyHashes = verifyHashes;
}
