// Sistema de autenticação simples e robusto que funciona SEMPRE
import Logger from './logger';

export interface SimpleUser {
  id: string;
  email: string;
  password: string; // Senha em texto claro para simplicidade
  fullName: string;
  createdAt: string;
  isActive: boolean;
}

export interface AuthResult {
  success: boolean;
  user?: SimpleUser;
  error?: string;
}

class SimpleAuthService {
  private static readonly USERS_KEY = 'simple_auth_users';
  private static readonly CURRENT_USER_KEY = 'simple_current_user';

  // Usuários demo garantidos
  private static readonly DEMO_USERS: SimpleUser[] = [
    {
      id: 'demo_admin',
      email: 'admin@vendas.com',
      password: 'Admin123!',
      fullName: 'Administrador',
      createdAt: new Date().toISOString(),
      isActive: true
    },
    {
      id: 'demo_vendedor',
      email: 'vendedor@vendas.com',
      password: 'Vendas2024!',
      fullName: 'João Vendedor',
      createdAt: new Date().toISOString(),
      isActive: true
    },
    {
      id: 'demo_luan',
      email: 'luan.andrade@gavresorts.com.br',
      password: '123456',
      fullName: 'Luan Andrade',
      createdAt: new Date().toISOString(),
      isActive: true
    }
  ];

  static initialize(): void {
    Logger.log('🚀 Initializing bulletproof auth system');
    
    // Sempre força a inicialização dos usuários demo
    localStorage.setItem(this.USERS_KEY, JSON.stringify(this.DEMO_USERS));
    
    Logger.log('✅ Demo users initialized:', this.DEMO_USERS.map(u => u.email));
  }

  static getUsers(): SimpleUser[] {
    const stored = localStorage.getItem(this.USERS_KEY);
    const users = stored ? JSON.parse(stored) : [];
    
    // Se não há usuários, força inicialização
    if (users.length === 0) {
      this.initialize();
      return this.DEMO_USERS;
    }
    
    return users;
  }

  static saveUsers(users: SimpleUser[]): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    Logger.log('👥 Users saved:', users.length);
  }

  static async signIn(email: string, password: string): Promise<AuthResult> {
    Logger.log('🔐 Simple signin attempt:', { email });

    const cleanEmail = email.toLowerCase().trim();
    const users = this.getUsers();
    
    Logger.log('📊 Available users:', users.map(u => ({ email: u.email, password: u.password })));

    // Busca simples e direta
    const user = users.find(u => 
      u.email.toLowerCase() === cleanEmail && 
      u.password === password && 
      u.isActive
    );

    if (user) {
      // Login bem-sucedido
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
      Logger.log('✅ Login successful:', user.email);
      return { success: true, user };
    } else {
      Logger.error('❌ Login failed:', { 
        email: cleanEmail, 
        password,
        availableUsers: users.map(u => `${u.email}:${u.password}`)
      });
      return { success: false, error: 'Email ou senha incorretos' };
    }
  }

  static async signUp(email: string, password: string, fullName: string): Promise<AuthResult> {
    Logger.log('📝 Simple signup attempt:', { email, fullName });

    const cleanEmail = email.toLowerCase().trim();
    const cleanFullName = fullName.trim();

    // Validações básicas
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Email inválido' };
    }

    if (!password || password.length < 3) {
      return { success: false, error: 'Senha deve ter pelo menos 3 caracteres' };
    }

    if (!cleanFullName || cleanFullName.length < 2) {
      return { success: false, error: 'Nome deve ter pelo menos 2 caracteres' };
    }

    const users = this.getUsers();

    // Verifica se email já existe
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'Este email já está cadastrado' };
    }

    // Cria novo usuário
    const newUser: SimpleUser = {
      id: 'user_' + Date.now(),
      email: cleanEmail,
      password: password,
      fullName: cleanFullName,
      createdAt: new Date().toISOString(),
      isActive: true
    };

    // Salva usuário
    users.push(newUser);
    this.saveUsers(users);

    // Login automático
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(newUser));

    Logger.log('✅ Signup successful:', newUser.email);
    return { success: true, user: newUser };
  }

  static getCurrentUser(): SimpleUser | null {
    const stored = localStorage.getItem(this.CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  static signOut(): void {
    localStorage.removeItem(this.CURRENT_USER_KEY);
    Logger.log('🚪 User signed out');
  }

  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  static clearAll(): void {
    localStorage.removeItem(this.USERS_KEY);
    localStorage.removeItem(this.CURRENT_USER_KEY);
    Logger.log('🧹 All auth data cleared');
  }

  // Função para adicionar usuário diretamente (para debug)
  static addUserDirect(email: string, password: string, fullName: string): boolean {
    const users = this.getUsers();
    
    // Remove usuário existente se houver
    const filteredUsers = users.filter(u => u.email.toLowerCase() !== email.toLowerCase());
    
    const newUser: SimpleUser = {
      id: 'direct_' + Date.now(),
      email: email.toLowerCase().trim(),
      password: password,
      fullName: fullName,
      createdAt: new Date().toISOString(),
      isActive: true
    };

    filteredUsers.push(newUser);
    this.saveUsers(filteredUsers);

    Logger.log('➕ User added directly:', newUser.email);
    return true;
  }

  // Função para listar credenciais (para debug)
  static listCredentials(): { email: string; password: string; name: string }[] {
    const users = this.getUsers();
    return users.map(u => ({
      email: u.email,
      password: u.password,
      name: u.fullName
    }));
  }
}

export default SimpleAuthService;
