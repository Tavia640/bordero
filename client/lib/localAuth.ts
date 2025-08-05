import { LoginRateLimit, validateEmail, sanitizeInput, sanitizePassword, validatePasswordStrength } from './security';
import Logger from './logger';

export interface LocalUser {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface AuthResult {
  success: boolean;
  user?: LocalUser;
  error?: string;
}

// Função simples de hash de senha (em produção, use bcrypt ou similar)
const hashPassword = (password: string, salt: string): string => {
  // Simples hash combinando senha e salt
  let hash = 0;
  const str = password + salt + 'property-sales-secret';

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return Math.abs(hash).toString(36);
};

const generateSalt = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

// Usuários demo fixos com hashes calculados
const DEMO_USERS: LocalUser[] = [
  {
    id: 'user_1',
    email: 'admin@vendas.com',
    passwordHash: 'demo_admin_hash',
    fullName: 'Administrador',
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'user_2',
    email: 'vendedor@vendas.com',
    passwordHash: 'demo_vendedor_hash',
    fullName: 'João Vendedor',
    createdAt: new Date().toISOString(),
    isActive: true
  }
];

class LocalAuthService {
  private static readonly USERS_KEY = 'local_auth_users';
  private static readonly CURRENT_USER_KEY = 'current_user_session';

  static initializeUsers(): void {
    const existingUsers = this.getStoredUsers();
    if (existingUsers.length === 0) {
      Logger.log('Initializing demo users for the first time');
      localStorage.setItem(this.USERS_KEY, JSON.stringify(DEMO_USERS));
    } else {
      Logger.log('Users already initialized', { count: existingUsers.length });
    }
  }

  // Force reinitialize users (for debugging)
  static forceReinitializeUsers(): void {
    Logger.log('Force reinitializing demo users');
    localStorage.setItem(this.USERS_KEY, JSON.stringify(DEMO_USERS));
  }

  // Clear all authentication data
  static clearAllAuthData(): void {
    Logger.log('Clearing all auth data');
    localStorage.removeItem(this.USERS_KEY);
    localStorage.removeItem(this.CURRENT_USER_KEY);
    localStorage.removeItem('login_attempts');
  }

  static getStoredUsers(): LocalUser[] {
    const stored = localStorage.getItem(this.USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static saveUsers(users: LocalUser[]): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  static async signIn(email: string, password: string): Promise<AuthResult> {
    Logger.log('Local signin attempt', { email });

    // Sanitizar inputs
    const cleanEmail = sanitizeInput(email.toLowerCase());
    const cleanPassword = sanitizePassword(password);

    // Validar email
    const emailValidation = validateEmail(cleanEmail);
    if (!emailValidation.isValid) {
      Logger.validationError('email', cleanEmail, emailValidation.error || 'Invalid email');
      return { success: false, error: emailValidation.error };
    }

    // Verificar rate limiting
    const rateLimitCheck = LoginRateLimit.checkRateLimit(cleanEmail);
    Logger.rateLimitEvent(cleanEmail, rateLimitCheck.allowed, rateLimitCheck.attemptsLeft);

    if (!rateLimitCheck.allowed) {
      if (rateLimitCheck.lockoutUntil) {
        const remainingTime = Math.ceil((rateLimitCheck.lockoutUntil - Date.now()) / 60000);
        return {
          success: false,
          error: `Muitas tentativas de login. Tente novamente em ${remainingTime} minutos.`
        };
      }
      return {
        success: false,
        error: `Limite de tentativas excedido. ${rateLimitCheck.attemptsLeft} tentativas restantes.`
      };
    }

    // Simular delay de autenticação (para evitar ataques de força bruta)
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    this.initializeUsers();
    const users = this.getStoredUsers();
    Logger.log('Available users:', users.map(u => ({ email: u.email, id: u.id })));

    const user = users.find(u => u.email === cleanEmail && u.isActive);

    Logger.log('User lookup result:', {
      searchEmail: cleanEmail,
      foundUser: !!user,
      totalUsers: users.length
    });

    if (!user) {
      Logger.error('User not found', `Email: ${cleanEmail}, Available: ${users.map(u => u.email).join(', ')}`);
      LoginRateLimit.recordAttempt(cleanEmail, false);
      return { success: false, error: 'Email ou senha incorretos' };
    }

    // Verificação de senha para usuários demo e criados dinamicamente
    Logger.log('Password verification for:', user.email);

    let isValidPassword = false;

    // Verificar usuários demo primeiro
    if (user.email === 'admin@vendas.com' && password === 'Admin123!') {
      isValidPassword = true;
    } else if (user.email === 'vendedor@vendas.com' && password === 'Vendas2024!') {
      isValidPassword = true;
    } else {
      // Para usuários criados dinamicamente, usar salt baseado no email
      const salt = 'salt_' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '');

      // Tentar com senha original e sanitizada
      const originalHash = hashPassword(password, salt);
      const cleanHash = hashPassword(cleanPassword, salt);

      isValidPassword = user.passwordHash === originalHash || user.passwordHash === cleanHash;

      Logger.log('Dynamic user verification:', {
        email: cleanEmail,
        salt: salt,
        storedHash: user.passwordHash,
        originalHash: originalHash,
        cleanHash: cleanHash,
        matches: isValidPassword
      });
    }

    Logger.log('Password check result:', isValidPassword);

    if (!isValidPassword) {
      Logger.error('Password verification failed', { cleanEmail });
      LoginRateLimit.recordAttempt(cleanEmail, false);
      return { success: false, error: 'Email ou senha incorretos' };
    }

    // Login bem-sucedido
    LoginRateLimit.recordAttempt(cleanEmail, true);
    LoginRateLimit.clearAttempts(cleanEmail);

    // Atualizar último login
    const updatedUser = { ...user, lastLogin: new Date().toISOString() };
    const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
    this.saveUsers(updatedUsers);

    // Salvar sessão
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(updatedUser));

    return { success: true, user: updatedUser };
  }

  static async signUp(email: string, password: string, fullName: string): Promise<AuthResult> {
    // Sanitizar inputs
    const cleanEmail = sanitizeInput(email.toLowerCase());
    const cleanPassword = sanitizePassword(password);
    const cleanFullName = sanitizeInput(fullName);

    // Validar email
    const emailValidation = validateEmail(cleanEmail);
    if (!emailValidation.isValid) {
      return { success: false, error: emailValidation.error };
    }

    // Validar nome
    if (!cleanFullName || cleanFullName.length < 2) {
      return { success: false, error: 'Nome deve ter pelo menos 2 caracteres' };
    }

    // Validar força da senha
    const passwordStrength = validatePasswordStrength(cleanPassword);
    if (!passwordStrength.isStrong) {
      return { success: false, error: 'Senha não atende aos requisitos de segurança' };
    }

    this.initializeUsers();
    const users = this.getStoredUsers();

    // Verificar se email já existe
    if (users.some(u => u.email === cleanEmail)) {
      return { success: false, error: 'Este email já está cadastrado' };
    }

    // Criar novo usuário com salt baseado no email para consistência
    const salt = 'salt_' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '');
    const newUser: LocalUser = {
      id: 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2),
      email: cleanEmail,
      passwordHash: hashPassword(cleanPassword, salt),
      fullName: cleanFullName,
      createdAt: new Date().toISOString(),
      isActive: true
    };

    // Salvar usuário
    users.push(newUser);
    Logger.log('Saving new user:', { email: newUser.email, id: newUser.id });
    this.saveUsers(users);

    // Verificar se foi salvo corretamente
    const savedUsers = this.getStoredUsers();
    const userWasSaved = savedUsers.some(u => u.email === cleanEmail);
    Logger.log('User save verification:', {
      email: cleanEmail,
      wasSaved: userWasSaved,
      totalUsers: savedUsers.length
    });

    // Fazer login automático
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(newUser));

    return { success: true, user: newUser };
  }

  static getCurrentUser(): LocalUser | null {
    const stored = localStorage.getItem(this.CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  static signOut(): void {
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }

  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  // Método para listar credenciais válidas (apenas para demonstração)
  static getValidCredentials(): { email: string; password: string; name: string }[] {
    return [
      { email: 'admin@vendas.com', password: 'Admin123!', name: 'Administrador' },
      { email: 'vendedor@vendas.com', password: 'Vendas2024!', name: 'João Vendedor' }
    ];
  }

  // Check if email exists in the system
  static async checkEmailExists(email: string): Promise<boolean> {
    const cleanEmail = sanitizeInput(email);

    this.initializeUsers();
    const users = this.getStoredUsers();
    return users.some(user => user.email === cleanEmail && user.isActive);
  }

  // Reset password for a user
  static async resetPassword(email: string, newPassword: string): Promise<AuthResult> {
    try {
      const cleanEmail = sanitizeInput(email);
      const cleanPassword = sanitizePassword(newPassword);

      // Validate email
      const emailValidation = validateEmail(cleanEmail);
      if (!emailValidation.isValid) {
        return { success: false, error: emailValidation.error };
      }

      // Password strength validation
      if (cleanPassword.length < 6) {
        return { success: false, error: 'A senha deve ter pelo menos 6 caracteres' };
      }

      this.initializeUsers();
      const users = this.getStoredUsers();
      const userIndex = users.findIndex(u => u.email === cleanEmail && u.isActive);

      if (userIndex === -1) {
        return { success: false, error: 'Usuário não encontrado' };
      }

      // Update password
      const salt = generateSalt();
      const passwordHash = hashPassword(cleanPassword, salt);

      users[userIndex].passwordHash = passwordHash;

      // Save updated users
      this.saveUsers(users);

      // Clear any existing rate limiting for this user
      LoginRateLimit.clearRateLimit(cleanEmail);

      return {
        success: true,
        user: users[userIndex]
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: 'Erro interno do sistema' };
    }
  }
}

export default LocalAuthService;
