'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [language, setLanguage] = useState<'pt' | 'zh'>('pt');

  const translations = {
    pt: {
      title: 'TL Sistemas',
      subtitle: 'Sistema Futurístico de Gestão',
      login: 'Login',
      userPlaceholder: 'Usuário',
      passPlaceholder: 'Senha',
      loginButton: 'Entrar no Sistema',
      error: 'Usuário ou senha incorretos!',
    },
    zh: {
      title: 'TL 系统',
      subtitle: '未来主义管理系统',
      login: '登录',
      userPlaceholder: '用户名',
      passPlaceholder: '密码',
      loginButton: '进入系统',
      error: '用户名或密码错误！',
    },
  };

  const t = translations[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === '1234') {
      router.push('/dashboard');
    } else {
      alert(t.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
      {/* Fundo animado */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.1),transparent_50%)] animate-pulse"></div>
      <div className="absolute top-10 left-10 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
      <div className="absolute top-20 right-20 w-1 h-1 bg-blue-400 rounded-full animate-ping"></div>
      <div className="absolute bottom-20 left-20 w-3 h-3 bg-purple-400 rounded-full animate-ping"></div>

      <div className="bg-white/5 backdrop-blur-xl p-10 rounded-2xl shadow-2xl border border-cyan-300/30 relative z-10 max-w-md w-full">
        {/* Botões de idioma */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => setLanguage('pt')}
            className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all duration-300 ${
              language === 'pt' ? 'bg-cyan-400 text-gray-900' : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            PT
          </button>
          <button
            onClick={() => setLanguage('zh')}
            className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all duration-300 ${
              language === 'zh' ? 'bg-cyan-400 text-gray-900' : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            中文
          </button>
        </div>

        {/* Logo e título */}
        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg">
              <span className="text-4xl font-black text-white">TL</span>
            </div>
          </div>
          <h1 className="text-5xl font-extrabold text-cyan-400 drop-shadow-2xl mb-2">{t.title}</h1>
          <p className="text-sm text-gray-300 tracking-wide">{t.subtitle}</p>
        </div>

        {/* Formulário de login */}
        <h2 className="text-center text-2xl mb-6 text-white font-semibold">{t.login}</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <span className="text-cyan-400 text-xl group-hover:scale-110 transition-transform duration-300">👤</span>
            </div>
            <input
              type="text"
              placeholder={t.userPlaceholder}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/10 border-2 border-cyan-400/50 rounded-xl text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none transition-all duration-300 hover:bg-white/20"
              required
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <span className="text-cyan-400 text-xl group-hover:scale-110 transition-transform duration-300">🔒</span>
            </div>
            <input
              type="password"
              placeholder={t.passPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/10 border-2 border-cyan-400/50 rounded-xl text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none transition-all duration-300 hover:bg-white/20"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 px-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-xl font-bold text-white hover:scale-105 transition-all duration-300 shadow-lg relative overflow-hidden"
          >
            <span className="relative z-10">{t.loginButton}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </form>
      </div>
    </div>
  );
}