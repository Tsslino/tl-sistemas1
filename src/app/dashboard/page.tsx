'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Tipos TypeScript
type Funcionario = {
  id: number;
  nome: string;
  funcao: string;
  cpf: string;
  dataAdmissao: string;
  ativo: boolean;
};

type Vale = {
  id: number;
  funcionarioId: number;
  funcionarioNome: string;
  valor: number;
  data: string;
  descricao: string;
  status: 'pendente' | 'pago' | 'cancelado';
};

type Item = {
  id: number;
  nome: string;
  preco: number;
  estoque: number;
  categoria: string;
};

export default function Dashboard() {
  const router = useRouter();
  const [language, setLanguage] = useState<'pt' | 'zh'>('pt');
  const [activeTab, setActiveTab] = useState<'funcionarios' | 'vales' | 'itens' | 'relatorios'>('funcionarios');
  const [isHydrated, setIsHydrated] = useState(false);

  // Estados para Funcionários
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [novoFuncionario, setNovoFuncionario] = useState({ nome: '', funcao: '', cpf: '', dataAdmissao: '' });

  // Estados para Vales
  const [vales, setVales] = useState<Vale[]>([]);
  const [novoVale, setNovoVale] = useState({ 
    funcionarioId: '', 
    valor: '', 
    data: new Date().toISOString().split('T')[0], // Data atual
    descricao: '' 
  });

  // Estados para Itens
  const [itens, setItens] = useState<Item[]>([]);
  const [novoItem, setNovoItem] = useState({ nome: '', preco: '', estoque: '', categoria: '' });

  // Estados para Modal de Autorização
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authAction, setAuthAction] = useState<(() => void) | null>(null);
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Estados para Filtros de Relatório
  const [filtroFuncionario, setFiltroFuncionario] = useState<string>('todos');

  // Traduções
  const translations = {
    pt: {
      title: 'TL Sistemas - Dashboard',
      logout: 'Sair',
      tabFuncionarios: 'Funcionários',
      tabVales: 'Vales',
      tabItens: 'Itens da Loja',
      tabRelatorios: 'Relatórios',
      funcionariosTitle: 'Cadastro de Funcionários',
      addFuncionario: '+ Adicionar Funcionário',
      nomeLabel: 'Nome Completo',
      funcaoLabel: 'Função',
      cpfLabel: 'CPF',
      dataAdmissaoLabel: 'Data de Admissão',
      ativoLabel: 'Ativo',
      inativoLabel: 'Inativo',
      valesTitle: 'Gestão de Vales',
      addVale: '+ Adicionar Vale',
      funcionarioLabel: 'Funcionário',
      valorLabel: 'Valor (R$)',
      dataLabel: 'Data',
      descricaoLabel: 'Descrição',
      statusLabel: 'Status',
      actions: 'Ações',
      pendente: 'Pendente',
      pago: 'Pago',
      cancelado: 'Cancelado',
      delete: 'Excluir',
      markPaid: 'Marcar como Pago',
      cancel: 'Cancelar',
      totalVales: 'Total de Vales',
      valesPendentes: 'Pendentes',
      valesPagos: 'Pagos',
      itensTitle: 'Gestão de Itens',
      addItem: '+ Adicionar Item',
      nomeItemLabel: 'Nome do Item',
      precoLabel: 'Preço (R$)',
      estoqueLabel: 'Estoque',
      categoriaLabel: 'Categoria',
      relatoriosTitle: 'Relatórios Financeiros',
      valesReport: 'Resumo de Vales',
      filtroGeral: 'Todos os Colaboradores',
      filtrarPor: 'Filtrar por Colaborador',
      itensReport: 'Resumo de Itens com Desconto (15%)',
      valorOriginal: 'Valor Original',
      desconto: 'Desconto (15%)',
      valorFinal: 'Valor Final',
      quantidade: 'Quantidade',
      authTitle: 'Autorização Necessária',
      authMessage: 'Digite suas credenciais para confirmar a exclusão',
      authUser: 'Usuário',
      authPass: 'Senha',
      confirm: 'Confirmar',
      cancelar: 'Cancelar',
      authErrorMsg: 'Usuário ou senha incorretos!',
    },
    zh: {
      title: 'TL 系统 - 控制面板',
      logout: '退出',
      tabFuncionarios: '员工',
      tabVales: '代金券',
      tabItens: '商店物品',
      tabRelatorios: '报告',
      funcionariosTitle: '员工登记',
      addFuncionario: '+ 添加员工',
      nomeLabel: '全名',
      funcaoLabel: '职位',
      cpfLabel: '身份证号',
      dataAdmissaoLabel: '入职日期',
      ativoLabel: '在职',
      inativoLabel: '离职',
      valesTitle: '代金券管理',
      addVale: '+ 添加代金券',
      funcionarioLabel: '员工',
      valorLabel: '金额 (R$)',
      dataLabel: '日期',
      descricaoLabel: '描述',
      statusLabel: '状态',
      actions: '操作',
      pendente: '待处理',
      pago: '已支付',
      cancelado: '已取消',
      delete: '删除',
      markPaid: '标记为已支付',
      cancel: '取消',
      totalVales: '代金券总额',
      valesPendentes: '待处理',
      valesPagos: '已支付',
      itensTitle: '物品管理',
      addItem: '+ 添加物品',
      nomeItemLabel: '物品名称',
      precoLabel: '价格 (R$)',
      estoqueLabel: '库存',
      categoriaLabel: '类别',
      relatoriosTitle: '财务报告',
      valesReport: '代金券摘要',
      filtroGeral: '所有员工',
      filtrarPor: '按员工筛选',
      itensReport: '物品摘要（15%折扣）',
      valorOriginal: '原价',
      desconto: '折扣（15%）',
      valorFinal: '最终价格',
      quantidade: '数量',
      authTitle: '需要授权',
      authMessage: '输入您的凭据以确认删除',
      authUser: '用户名',
      authPass: '密码',
      confirm: '确认',
      cancelar: '取消',
      authErrorMsg: '用户名或密码错误！',
    },
  };

  const t = translations[language];

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Funções Funcionários
  const adicionarFuncionario = () => {
    if (novoFuncionario.nome && novoFuncionario.funcao && novoFuncionario.cpf && novoFuncionario.dataAdmissao) {
      setFuncionarios([
        ...funcionarios,
        {
          id: funcionarios.length + 1,
          nome: novoFuncionario.nome,
          funcao: novoFuncionario.funcao,
          cpf: novoFuncionario.cpf,
          dataAdmissao: novoFuncionario.dataAdmissao,
          ativo: true,
        },
      ]);
      setNovoFuncionario({ nome: '', funcao: '', cpf: '', dataAdmissao: '' });
    }
  };

  const excluirFuncionario = (id: number) => {
    setAuthAction(() => () => {
      setFuncionarios(funcionarios.filter((func) => func.id !== id));
      setShowAuthModal(false);
      resetAuthModal();
    });
    setShowAuthModal(true);
  };

  const toggleAtivoFuncionario = (id: number) => {
    setFuncionarios(funcionarios.map((func) => (func.id === id ? { ...func, ativo: !func.ativo } : func)));
  };

  // Funções Vales
  const adicionarVale = () => {
    if (novoVale.funcionarioId && novoVale.valor) {
      const funcionario = funcionarios.find(f => f.id === parseInt(novoVale.funcionarioId));
      if (funcionario) {
        const dataAtual = new Date().toISOString().split('T')[0]; // Data atual
        setVales([
          ...vales,
          {
            id: vales.length + 1,
            funcionarioId: parseInt(novoVale.funcionarioId),
            funcionarioNome: funcionario.nome,
            valor: parseFloat(novoVale.valor),
            data: dataAtual, // Usa data atual
            descricao: novoVale.descricao,
            status: 'pendente',
          },
        ]);
        setNovoVale({ 
          funcionarioId: '', 
          valor: '', 
          data: new Date().toISOString().split('T')[0], // Reseta para data atual
          descricao: '' 
        });
      }
    }
  };

  const excluirVale = (id: number) => {
    setAuthAction(() => () => {
      setVales(vales.filter((vale) => vale.id !== id));
      setShowAuthModal(false);
      resetAuthModal();
    });
    setShowAuthModal(true);
  };

  const marcarPago = (id: number) => {
    setVales(vales.map((vale) => (vale.id === id ? { ...vale, status: 'pago' } : vale)));
  };

  const cancelarVale = (id: number) => {
    setVales(vales.map((vale) => (vale.id === id ? { ...vale, status: 'cancelado' } : vale)));
  };

  const valesPendentes = vales.filter(v => v.status === 'pendente').reduce((acc, vale) => acc + vale.valor, 0);
  const valesPagos = vales.filter(v => v.status === 'pago').reduce((acc, vale) => acc + vale.valor, 0);
  const totalValesGeral = vales.reduce((acc, vale) => acc + vale.valor, 0);
  const valesPendentesGeral = valesPendentes;
  const valesPagosGeral = valesPagos;

  // Funções Itens
  const adicionarItem = () => {
    if (novoItem.nome && novoItem.preco && novoItem.estoque && novoItem.categoria) {
      setItens([
        ...itens,
        {
          id: itens.length + 1,
          nome: novoItem.nome,
          preco: parseFloat(novoItem.preco),
          estoque: parseInt(novoItem.estoque),
          categoria: novoItem.categoria,
        },
      ]);
      setNovoItem({ nome: '', preco: '', estoque: '', categoria: '' });
    }
  };

  const excluirItem = (id: number) => {
    setAuthAction(() => () => {
      setItens(itens.filter((item) => item.id !== id));
      setShowAuthModal(false);
      resetAuthModal();
    });
    setShowAuthModal(true);
  };

  // Funções Modal de Autorização
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authUsername === 'admin' && authPassword === '1234') {
      if (authAction) {
        authAction();
      }
    } else {
      setAuthError(t.authErrorMsg);
    }
  };

  const resetAuthModal = () => {
    setAuthUsername('');
    setAuthPassword('');
    setAuthError('');
    setAuthAction(null);
  };

  const cancelAuth = () => {
    setShowAuthModal(false);
    resetAuthModal();
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      <header className="bg-white/5 backdrop-blur-xl border-b border-cyan-300/30 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <span className="text-xl font-black">TL</span>
            </div>
            <h1 className="text-2xl font-bold text-cyan-400">{t.title}</h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setLanguage('pt')}
              className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
                language === 'pt' ? 'bg-cyan-400 text-gray-900' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              PT
            </button>
            <button
              onClick={() => setLanguage('zh')}
              className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
                language === 'zh' ? 'bg-cyan-400 text-gray-900' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              中文
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-red-500/80 hover:bg-red-600 rounded-lg font-semibold transition"
            >
              {t.logout}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto mt-8 px-4">
        <div className="flex gap-4 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab('funcionarios')}
            className={`px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${
              activeTab === 'funcionarios'
                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white scale-105'
                : 'bg-white/10 hover:bg-white/20 hover:scale-105'
            }`}
          >
            👥 {t.tabFuncionarios}
          </button>
          <button
            onClick={() => setActiveTab('vales')}
            className={`px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${
              activeTab === 'vales'
                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white scale-105'
                : 'bg-white/10 hover:bg-white/20 hover:scale-105'
            }`}
          >
            💰 {t.tabVales}
          </button>
          <button
            onClick={() => setActiveTab('itens')}
            className={`px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${
              activeTab === 'itens'
                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white scale-105'
                : 'bg-white/10 hover:bg-white/20 hover:scale-105'
            }`}
          >
            🏪 {t.tabItens}
          </button>
          <button
            onClick={() => setActiveTab('relatorios')}
            className={`px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${
              activeTab === 'relatorios'
                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white scale-105'
                : 'bg-white/10 hover:bg-white/20 hover:scale-105'
            }`}
          >
            📊 {t.tabRelatorios}
          </button>
        </div>

        {/* Conteúdo Funcionários */}
        {activeTab === 'funcionarios' && (
          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-cyan-300/30 shadow-2xl">
            <h2 className="text-3xl font-bold text-cyan-400 mb-6 flex items-center gap-3">
              👥 {t.funcionariosTitle}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <input
                type="text"
                placeholder={t.nomeLabel}
                value={novoFuncionario.nome}
                onChange={(e) => setNovoFuncionario({ ...novoFuncionario, nome: e.target.value })}
                className="p-3 bg-white/10 border-2 border-cyan-400/50 rounded-xl text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none transition-all"
              />
              <input
                type="text"
                placeholder={t.funcaoLabel}
                value={novoFuncionario.funcao}
                onChange={(e) => setNovoFuncionario({ ...novoFuncionario, funcao: e.target.value })}
                className="p-3 bg-white/10 border-2 border-cyan-400/50 rounded-xl text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none transition-all"
              />
              <input
                type="text"
                placeholder={t.cpfLabel}
                value={novoFuncionario.cpf}
                onChange={(e) => setNovoFuncionario({ ...novoFuncionario, cpf: e.target.value })}
                className="p-3 bg-white/10 border-2 border-cyan-400/50 rounded-xl text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none transition-all"
              />
              <input
                type="date"
                value={novoFuncionario.dataAdmissao}
                onChange={(e) => setNovoFuncionario({ ...novoFuncionario, dataAdmissao: e.target.value })}
                className="p-3 bg-white/10 border-2 border-cyan-400/50 rounded-xl text-white focus:border-cyan-400 focus:outline-none transition-all"
              />
              <button
                onClick={adicionarFuncionario}
                className="bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 rounded-xl font-bold hover:scale-105 hover:shadow-xl transition-all text-white"
              >
                {t.addFuncionario}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-cyan-400/30">
                    <th className="text-left p-3 text-cyan-400">{t.nomeLabel}</th>
                    <th className="text-left p-3 text-cyan-400">{t.funcaoLabel}</th>
                    <th className="text-left p-3 text-cyan-400">{t.cpfLabel}</th>
                    <th className="text-left p-3 text-cyan-400">{t.dataAdmissaoLabel}</th>
                    <th className="text-left p-3 text-cyan-400">{t.statusLabel}</th>
                    <th className="text-left p-3 text-cyan-400">{t.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {funcionarios.map((funcionario) => (
                    <tr key={funcionario.id} className="border-b border-white/10 hover:bg-white/5 transition-all">
                      <td className="p-3">{funcionario.nome}</td>
                      <td className="p-3">{funcionario.funcao}</td>
                      <td className="p-3">{funcionario.cpf}</td>
                      <td className="p-3">{new Date(funcionario.dataAdmissao).toLocaleDateString('pt-BR')}</td>
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          funcionario.ativo ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {funcionario.ativo ? t.ativoLabel : t.inativoLabel}
                        </span>
                      </td>
                      <td className="p-3 flex gap-2">
                        <button
                          onClick={() => toggleAtivoFuncionario(funcionario.id)}
                          className={`px-3 py-1 rounded-lg transition-all text-sm font-semibold ${
                            funcionario.ativo ? 'bg-yellow-500/80 hover:bg-yellow-600' : 'bg-green-500/80 hover:bg-green-600'
                          }`}
                        >
                          {funcionario.ativo ? 'Desativar' : 'Ativar'}
                        </button>
                        <button
                          onClick={() => excluirFuncionario(funcionario.id)}
                          className="bg-red-500/80 px-3 py-1 rounded-lg hover:bg-red-600 hover:scale-105 transition-all text-sm font-semibold"
                        >
                          {t.delete}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Conteúdo Vales */}
        {activeTab === 'vales' && (
          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-cyan-300/30 shadow-2xl">
            <h2 className="text-3xl font-bold text-cyan-400 mb-6 flex items-center gap-3">
              💰 {t.valesTitle}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-4 rounded-xl border border-cyan-400/30">
                <p className="text-sm text-gray-300">{t.totalVales}</p>
                <p className="text-2xl font-bold text-cyan-400">R$ {totalValesGeral.toFixed(2)}</p>
              </div>
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-4 rounded-xl border border-yellow-400/30">
                <p className="text-sm text-gray-300">{t.valesPendentes}</p>
                <p className="text-2xl font-bold text-yellow-400">R$ {valesPendentesGeral.toFixed(2)}</p>
              </div>
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4 rounded-xl border border-green-400/30">
                <p className="text-sm text-gray-300">{t.valesPagos}</p>
                <p className="text-2xl font-bold text-green-400">R$ {valesPagosGeral.toFixed(2)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <select
                value={novoVale.funcionarioId}
                onChange={(e) => setNovoVale({ ...novoVale, funcionarioId: e.target.value })}
                className="p-3 bg-white/10 border-2 border-cyan-400/50 rounded-xl text-white focus:border-cyan-400 focus:outline-none transition-all"
              >
                <option value="" className="bg-gray-800">{t.funcionarioLabel}</option>
                {funcionarios.filter(f => f.ativo).map(func => (
                  <option key={func.id} value={func.id} className="bg-gray-800">{func.nome}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder={t.valorLabel}
                value={novoVale.valor}
                onChange={(e) => setNovoVale({ ...novoVale, valor: e.target.value })}
                className="p-3 bg-white/10 border-2 border-cyan-400/50 rounded-xl text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none transition-all"
              />
              <input
                type="date"
                value={novoVale.data}
                onChange={(e) => setNovoVale({ ...novoVale, data: e.target.value })}
                className="p-3 bg-white/10 border-2 border-cyan-400/50 rounded-xl text-white focus:border-cyan-400 focus:outline-none transition-all"
                readOnly
                title="Data é definida automaticamente como hoje"
              />
              <input
                type="text"
                placeholder={t.descricaoLabel}
                value={novoVale.descricao}
                onChange={(e) => setNovoVale({ ...novoVale, descricao: e.target.value })}
                className="p-3 bg-white/10 border-2 border-cyan-400/50 rounded-xl text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none transition-all"
              />
              <button
                onClick={adicionarVale}
                className="bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 rounded-xl font-bold hover:scale-105 hover:shadow-xl transition-all text-white"
              >
                {t.addVale}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-cyan-400/30">
                    <th className="text-left p-3 text-cyan-400">{t.funcionarioLabel}</th>
                    <th className="text-left p-3 text-cyan-400">{t.valorLabel}</th>
                    <th className="text-left p-3 text-cyan-400">{t.dataLabel}</th>
                    <th className="text-left p-3 text-cyan-400">{t.descricaoLabel}</th>
                    <th className="text-left p-3 text-cyan-400">{t.statusLabel}</th>
                    <th className="text-left p-3 text-cyan-400">{t.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {vales.map((vale) => (
                    <tr key={vale.id} className="border-b border-white/10 hover:bg-white/5 transition-all">
                      <td className="p-3 font-semibold">{vale.funcionarioNome}</td>
                      <td className="p-3 text-cyan-400 font-bold">R$ {vale.valor.toFixed(2)}</td>
                      <td className="p-3">{new Date(vale.data).toLocaleDateString('pt-BR')}</td>
                      <td className="p-3 text-gray-300">{vale.descricao || '-'}</td>
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          vale.status === 'pago'
                            ? 'bg-green-500/20 text-green-400 border border-green-400/30'
                            : vale.status === 'pendente'
                              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/30'
                              : 'bg-red-500/20 text-red-400 border border-red-400/30'
                        }`}>
                          {t[vale.status]}
                        </span>
                      </td>
                      <td className="p-3 flex gap-2">
                        {vale.status === 'pendente' && (
                          <>
                            <button
                              onClick={() => marcarPago(vale.id)}
                              className="bg-green-500/80 px-3 py-1 rounded-lg hover:bg-green-600 hover:scale-105 transition-all text-sm font-semibold"
                            >
                              ✓ {t.markPaid}
                            </button>
                            <button
                              onClick={() => cancelarVale(vale.id)}
                              className="bg-orange-500/80 px-3 py-1 rounded-lg hover:bg-orange-600 hover:scale-105 transition-all text-sm font-semibold"
                            >
                              ✗ {t.cancel}
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => excluirVale(vale.id)}
                          className="bg-red-500/80 px-3 py-1 rounded-lg hover:bg-red-600 hover:scale-105 transition-all text-sm font-semibold"
                        >
                          🗑 {t.delete}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Conteúdo Itens */}
        {activeTab === 'itens' && (
          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-cyan-300/30 shadow-2xl">
            <h2 className="text-3xl font-bold text-cyan-400 mb-6 flex items-center gap-3">
              🏪 {t.itensTitle}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <input
                type="text"
                placeholder={t.nomeItemLabel}
                value={novoItem.nome}
                onChange={(e) => setNovoItem({ ...novoItem, nome: e.target.value })}
                className="p-3 bg-white/10 border-2 border-cyan-400/50 rounded-xl text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none transition-all"
              />
              <input
                type="number"
                placeholder={t.precoLabel}
                value={novoItem.preco}
                onChange={(e) => setNovoItem({ ...novoItem, preco: e.target.value })}
                className="p-3 bg-white/10 border-2 border-cyan-400/50 rounded-xl text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none transition-all"
              />
              <input
                type="number"
                placeholder={t.estoqueLabel}
                value={novoItem.estoque}
                onChange={(e) => setNovoItem({ ...novoItem, estoque: e.target.value })}
                className="p-3 bg-white/10 border-2 border-cyan-400/50 rounded-xl text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none transition-all"
              />
              <input
                type="text"
                placeholder={t.categoriaLabel}
                value={novoItem.categoria}
                onChange={(e) => setNovoItem({ ...novoItem, categoria: e.target.value })}
                className="p-3 bg-white/10 border-2 border-cyan-400/50 rounded-xl text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none transition-all"
              />
              <button
                onClick={adicionarItem}
                className="bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 rounded-xl font-bold hover:scale-105 hover:shadow-xl transition-all text-white"
              >
                {t.addItem}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-cyan-400/30">
                    <th className="text-left p-3 text-cyan-400">{t.nomeItemLabel}</th>
                    <th className="text-left p-3 text-cyan-400">{t.precoLabel}</th>
                    <th className="text-left p-3 text-cyan-400">{t.estoqueLabel}</th>
                    <th className="text-left p-3 text-cyan-400">{t.categoriaLabel}</th>
                    <th className="text-left p-3 text-cyan-400">{t.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {itens.map((item) => (
                    <tr key={item.id} className="border-b border-white/10 hover:bg-white/5 transition-all">
                      <td className="p-3 font-semibold">{item.nome}</td>
                      <td className="p-3 text-green-400 font-bold">R$ {item.preco.toFixed(2)}</td>
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          item.estoque > 10 
                            ? 'bg-green-500/20 text-green-400' 
                            : item.estoque > 0 
                              ? 'bg-yellow-500/20 text-yellow-400' 
                              : 'bg-red-500/20 text-red-400'
                        }`}>
                          {item.estoque} un.
                        </span>
                      </td>
                      <td className="p-3">{item.categoria}</td>
                      <td className="p-3">
                        <button
                          onClick={() => excluirItem(item.id)}
                          className="bg-red-500/80 px-3 py-1 rounded-lg hover:bg-red-600 hover:scale-105 transition-all text-sm font-semibold"
                        >
                          🗑 {t.delete}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Conteúdo Relatórios */}
        {activeTab === 'relatorios' && (
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-cyan-300/30 shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-3">
                  💰 {t.valesReport}
                </h2>
                <select
                  value={filtroFuncionario}
                  onChange={(e) => setFiltroFuncionario(e.target.value)}
                  className="p-2 bg-white/10 border-2 border-cyan-400/50 rounded-lg text-white focus:border-cyan-400 focus:outline-none transition-all"
                >
                  <option value="todos" className="bg-gray-800">{t.filtroGeral}</option>
                  {funcionarios.map(func => (
                    <option key={func.id} value={func.id.toString()} className="bg-gray-800">{func.nome}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-4 rounded-xl border border-cyan-400/30">
                  <p className="text-sm text-gray-300">{t.totalVales}</p>
                  <p className="text-3xl font-bold text-cyan-400">R$ {(vales.reduce((acc, vale) => acc + vale.valor, 0)).toFixed(2)}</p>
                </div>
                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-4 rounded-xl border border-yellow-400/30">
                  <p className="text-sm text-gray-300">{t.valesPendentes}</p>
                  <p className="text-3xl font-bold text-yellow-400">R$ {valesPendentes.toFixed(2)}</p>
                </div>
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4 rounded-xl border border-green-400/30">
                  <p className="text-sm text-gray-300">{t.valesPagos}</p>
                  <p className="text-3xl font-bold text-green-400">R$ {valesPagos.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-cyan-300/30 shadow-2xl">
              <h2 className="text-2xl font-bold text-cyan-400 mb-4 flex items-center gap-3">
                🏪 {t.itensReport}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-cyan-400/30">
                      <th className="text-left p-3 text-cyan-400">{t.nomeItemLabel}</th>
                      <th className="text-left p-3 text-cyan-400">{t.quantidade}</th>
                      <th className="text-left p-3 text-cyan-400">{t.valorOriginal}</th>
                      <th className="text-left p-3 text-cyan-400">{t.desconto}</th>
                      <th className="text-left p-3 text-cyan-400">{t.valorFinal}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itens.map((item) => {
                      const valorOriginal = item.preco * item.estoque;
                      const desconto = valorOriginal * 0.15;
                      const valorFinal = valorOriginal - desconto;
                      return (
                        <tr key={item.id} className="border-b border-white/10 hover:bg-white/5 transition-all">
                          <td className="p-3 font-semibold">{item.nome}</td>
                          <td className="p-3">{item.estoque} un.</td>
                          <td className="p-3 text-gray-300">R$ {valorOriginal.toFixed(2)}</td>
                          <td className="p-3 text-orange-400 font-semibold">- R$ {desconto.toFixed(2)}</td>
                          <td className="p-3 text-green-400 font-bold text-lg">R$ {valorFinal.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-cyan-400/30">
                      <td colSpan={2} className="p-3 font-bold text-cyan-400">TOTAL GERAL</td>
                      <td className="p-3 font-bold text-gray-300">
                        R$ {itens.reduce((acc, item) => acc + (item.preco * item.estoque), 0).toFixed(2)}
                      </td>
                      <td className="p-3 font-bold text-orange-400">
                        - R$ {(itens.reduce((acc, item) => acc + (item.preco * item.estoque), 0) * 0.15).toFixed(2)}
                      </td>
                      <td className="p-3 font-bold text-green-400 text-xl">
                        R$ {(itens.reduce((acc, item) => acc + (item.preco * item.estoque), 0) * 0.85).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Autorização */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border-2 border-cyan-400 rounded-2xl p-8 w-96 shadow-2xl">
            <h3 className="text-2xl font-bold text-cyan-400 mb-2 text-center">{t.authTitle}</h3>
            <p className="text-gray-300 text-center mb-6">{t.authMessage}</p>
            
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <input
                type="text"
                placeholder={t.authUser}
                value={authUsername}
                onChange={(e) => setAuthUsername(e.target.value)}
                className="w-full p-3 bg-white/10 border-2 border-cyan-400/50 rounded-xl text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none transition-all"
                required
              />
              <input
                type="password"
                placeholder={t.authPass}
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full p-3 bg-white/10 border-2 border-cyan-400/50 rounded-xl text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none transition-all"
                required
              />
              
              {authError && <p className="text-red-400 text-center text-sm">{authError}</p>}
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 rounded-xl font-bold hover:scale-105 transition-all"
                >
                  ✓ {t.confirm}
                </button>
                <button
                  type="button"
                  onClick={cancelAuth}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 rounded-xl font-bold hover:scale-105 transition-all"
                >
                  ✗ {t.cancelar}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}