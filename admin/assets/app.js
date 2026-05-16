// ============================================================
// app.js - Painel Admin Gestão na Mão
// Conecta com 3 RPCs: rpc_admin_metricas_gerais, 
// rpc_admin_lista_usuarios, rpc_admin_tamanho_por_empresa
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { CONFIG } from './config.js';

const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

// ============================================
// 1. Autenticação + checagem de admin
// ============================================
const { data: { session } } = await supabase.auth.getSession();

if (!session) {
  window.location.href = './login.html';
}

const { data: ehAdmin, error: errAdmin } = await supabase.rpc('is_admin');
if (errAdmin || !ehAdmin) {
  alert('Acesso negado.');
  await supabase.auth.signOut();
  window.location.href = './login.html';
}

document.getElementById('user-email').textContent = session.user.email;

// ============================================
// 2. Botões do header
// ============================================
document.getElementById('btn-logout').onclick = async () => {
  await supabase.auth.signOut();
  window.location.href = './login.html';
};

document.getElementById('btn-refresh').onclick = () => carregarTudo();

// ============================================
// 3. Helpers
// ============================================
function formatDate(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR');
}

function formatDateTime(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR') + ' ' + 
    d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function badgeStatus(status, diasExpirar) {
  if (status === 'active') {
    if (diasExpirar !== null && diasExpirar <= 7) {
      return `<span class="bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-xs font-medium">⚠️ Ativo</span>`;
    }
    return `<span class="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium">🟢 Ativo</span>`;
  }
  if (status === 'trial') {
    if (diasExpirar !== null && diasExpirar < 0) {
      return `<span class="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs font-medium">🔴 Trial expirado</span>`;
    }
    if (diasExpirar !== null && diasExpirar <= 3) {
      return `<span class="bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-xs font-medium">⏰ Trial</span>`;
    }
    return `<span class="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium">🔵 Trial</span>`;
  }
  if (status === 'sem_assinatura') {
    return `<span class="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">Sem assinatura</span>`;
  }
  return `<span class="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">${status}</span>`;
}

function badgeCobranca(tipo) {
  const mapa = {
    'recorrente': '<span class="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-xs">🔄 Recorrente</span>',
    'manual':     '<span class="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs">⚠️ Manual</span>',
    'pix':        '<span class="bg-teal-100 text-teal-800 px-2 py-0.5 rounded text-xs">💵 PIX</span>',
    'trial':      '<span class="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">trial</span>',
    '-':          '<span class="text-slate-400 text-xs">-</span>'
  };
  return mapa[tipo] || `<span class="text-xs">${tipo}</span>`;
}

function corDias(dias) {
  if (dias === null || dias === undefined) return 'text-slate-400';
  if (dias < 0) return 'text-red-600 font-bold';
  if (dias <= 3) return 'text-orange-600 font-bold';
  if (dias <= 7) return 'text-yellow-600';
  return 'text-slate-600';
}

// ============================================
// 4. Carregar cards de métricas
// ============================================
async function carregarMetricas() {
  const { data, error } = await supabase.rpc('rpc_admin_metricas_gerais');
  if (error) {
    console.error('Erro métricas:', error);
    return;
  }

  const cards = [
    { label: 'Usuários',         valor: data.total_usuarios,         cor: 'blue' },
    { label: 'Empresas',         valor: data.total_empresas,         cor: 'blue' },
    { label: '🟢 Ativos',        valor: data.ativos,                 cor: 'green' },
    { label: '🔵 Trial',         valor: data.em_trial,               cor: 'indigo' },
    { label: '🔴 Expirados',     valor: data.expirados,              cor: 'red' },
    { label: 'Mensal',           valor: data.plano_mensal,           cor: 'purple' },
    { label: 'Anual',            valor: data.plano_anual,            cor: 'purple' },
    { label: '⚠️ Cobr. Manual',  valor: data.cobranca_manual,        cor: 'yellow' },
    { label: '🔄 Recorrente',    valor: data.cobranca_recorrente,    cor: 'purple' },
    { label: '⏰ Renov. 7d',     valor: data.renovacoes_7d,          cor: 'orange' },
    { label: 'Onbd. incompleto', valor: data.onboarding_incompleto,  cor: 'slate' },
    { label: 'Ativos 7d',        valor: data.usuarios_ativos_7d,     cor: 'green' },
    { label: 'Ativos 30d',       valor: data.usuarios_ativos_30d,    cor: 'green' },
    { label: 'Lançamentos',      valor: data.total_lancamentos,      cor: 'slate' },
    { label: 'Banco (MB)',       valor: data.tamanho_banco_mb,       cor: 'slate' }
  ];

  const cores = {
    blue:   'bg-blue-50 text-blue-900 border-blue-200',
    green:  'bg-green-50 text-green-900 border-green-200',
    orange: 'bg-orange-50 text-orange-900 border-orange-200',
    red:    'bg-red-50 text-red-900 border-red-200',
    indigo: 'bg-indigo-50 text-indigo-900 border-indigo-200',
    purple: 'bg-purple-50 text-purple-900 border-purple-200',
    yellow: 'bg-yellow-50 text-yellow-900 border-yellow-200',
    slate:  'bg-slate-100 text-slate-900 border-slate-200'
  };

  const html = cards.map(c => `
    <div class="border ${cores[c.cor]} rounded-lg p-3">
      <div class="text-xs font-medium opacity-75">${c.label}</div>
      <div class="text-2xl font-bold mt-1">${c.valor ?? 0}</div>
    </div>
  `).join('');

  document.getElementById('cards-metricas').innerHTML = html;
}

// ============================================
// 5. Carregar usuários
// ============================================
let usuariosCache = [];

async function carregarUsuarios() {
  const { data, error } = await supabase.rpc('rpc_admin_lista_usuarios');
  if (error) {
    console.error('Erro lista usuários:', error);
    return;
  }
  usuariosCache = data || [];
  aplicarFiltros();
  gerarBannerAlertas(usuariosCache);
}

function aplicarFiltros() {
  const busca = document.getElementById('filtro-busca').value.toLowerCase();
  const statusFiltro = document.getElementById('filtro-status').value;

  let filtrados = usuariosCache;

  if (busca) {
    filtrados = filtrados.filter(u =>
      (u.email || '').toLowerCase().includes(busca) ||
      (u.empresa_nome || '').toLowerCase().includes(busca)
    );
  }

  if (statusFiltro === 'active') {
    filtrados = filtrados.filter(u => u.status === 'active' && u.dias_ate_expirar > 0);
  } else if (statusFiltro === 'trial') {
    filtrados = filtrados.filter(u => u.status === 'trial' && u.dias_ate_expirar >= 0);
  } else if (statusFiltro === 'expirado') {
    filtrados = filtrados.filter(u => u.dias_ate_expirar !== null && u.dias_ate_expirar < 0);
  }

  renderizarUsuarios(filtrados);
  document.getElementById('contagem-usuarios').textContent =
    `Mostrando ${filtrados.length} de ${usuariosCache.length} usuários`;
}

function renderizarUsuarios(lista) {
  const html = lista.map(u => `
    <tr class="hover:bg-slate-50">
      <td class="px-3 py-2 font-mono text-xs">${u.email || '-'}</td>
      <td class="px-3 py-2">${u.empresa_nome || '<span class="text-slate-400 italic">sem empresa</span>'}</td>
      <td class="px-3 py-2">${badgeStatus(u.status, u.dias_ate_expirar)}</td>
      <td class="px-3 py-2 text-xs">${u.plano || '-'}</td>
      <td class="px-3 py-2">${badgeCobranca(u.tipo_cobranca)}</td>
      <td class="px-3 py-2 text-slate-600 text-xs">${formatDate(u.expira_em)}</td>
      <td class="px-3 py-2 text-right ${corDias(u.dias_ate_expirar)}">${u.dias_ate_expirar ?? '-'}</td>
      <td class="px-3 py-2 text-right font-semibold">${u.total_lancamentos || 0}</td>
      <td class="px-3 py-2 text-right ${corDias(u.dias_sem_uso !== null ? -u.dias_sem_uso : null)}">
        ${u.dias_sem_uso !== null ? u.dias_sem_uso + 'd' : '-'}
      </td>
      <td class="px-3 py-2 text-slate-500 text-xs">${formatDate(u.conta_criada_em)}</td>
    </tr>
  `).join('');

  document.getElementById('tabela-usuarios').innerHTML = html ||
    '<tr><td colspan="10" class="text-center py-6 text-slate-400">Nenhum usuário com esses filtros</td></tr>';
}

document.getElementById('filtro-busca').addEventListener('input', aplicarFiltros);
document.getElementById('filtro-status').addEventListener('change', aplicarFiltros);

// ============================================
// 6. Banner de alertas críticos
// ============================================
function gerarBannerAlertas(usuarios) {
  const alertas = [];

  // Cobrança manual vencendo em 7 dias = você ou Fabrício
  const cobrManualUrgente = usuarios.filter(u =>
    u.tipo_cobranca === 'manual' && 
    u.dias_ate_expirar !== null && 
    u.dias_ate_expirar >= 0 && 
    u.dias_ate_expirar <= 15
  );

  if (cobrManualUrgente.length > 0) {
    cobrManualUrgente.forEach(u => {
      alertas.push({
        cor: u.dias_ate_expirar <= 7 ? 'red' : 'orange',
        texto: `<strong>${u.email}</strong> (${u.empresa_nome || 'sem empresa'}) — cobrança MANUAL vence em ${u.dias_ate_expirar} dias (${formatDate(u.expira_em)}). Precisa avisar pra inserir cartão de novo.`
      });
    });
  }

  // Trials terminando em 3 dias
  const trialsUrgentes = usuarios.filter(u =>
    u.status === 'trial' && 
    u.dias_ate_expirar !== null && 
    u.dias_ate_expirar >= 0 && 
    u.dias_ate_expirar <= 3
  );

  if (trialsUrgentes.length > 0) {
    trialsUrgentes.forEach(u => {
      alertas.push({
        cor: 'orange',
        texto: `<strong>${u.email}</strong> — trial termina em ${u.dias_ate_expirar} dia(s). ${u.total_lancamentos > 0 ? `${u.total_lancamentos} lançamentos feitos` : 'Nunca usou'}.`
      });
    });
  }

  if (alertas.length === 0) {
    document.getElementById('banner-alertas').classList.add('hidden');
    return;
  }

  const corClasses = {
    red:    'bg-red-50 border-red-300 text-red-900',
    orange: 'bg-orange-50 border-orange-300 text-orange-900'
  };

  const html = `
    <div class="border-2 rounded-lg p-4 ${corClasses[alertas[0].cor]}">
      <h3 class="font-bold mb-2">🚨 Atenção — ${alertas.length} item(ns) precisam de ação</h3>
      <ul class="text-sm space-y-1">
        ${alertas.map(a => `<li>• ${a.texto}</li>`).join('')}
      </ul>
    </div>
  `;

  const banner = document.getElementById('banner-alertas');
  banner.innerHTML = html;
  banner.classList.remove('hidden');
}

// ============================================
// 7. Carregar tamanho por empresa
// ============================================
async function carregarTamanhoBanco() {
  const { data, error } = await supabase.rpc('rpc_admin_tamanho_por_empresa');
  if (error) {
    console.error('Erro tamanho banco:', error);
    return;
  }

  const html = (data || []).map(e => `
    <tr class="hover:bg-slate-50">
      <td class="px-3 py-2">${e.empresa_nome || '<span class="text-slate-400 italic">-</span>'}</td>
      <td class="px-3 py-2 text-xs font-mono text-slate-600">${e.user_email || '-'}</td>
      <td class="px-3 py-2 text-right">${e.qtd_receitas}</td>
      <td class="px-3 py-2 text-right">${e.qtd_despesas}</td>
      <td class="px-3 py-2 text-right">${e.qtd_manutencoes}</td>
      <td class="px-3 py-2 text-right">${e.qtd_hodometro}</td>
      <td class="px-3 py-2 text-right font-semibold">${e.qtd_total}</td>
      <td class="px-3 py-2 text-right text-slate-600">${e.tamanho_estimado_kb}</td>
    </tr>
  `).join('');

  document.getElementById('tabela-banco').innerHTML = html ||
    '<tr><td colspan="8" class="text-center py-6 text-slate-400">Nenhuma empresa</td></tr>';
}

// ============================================
// 8. Orquestração
// ============================================
async function carregarTudo() {
  document.getElementById('loading').classList.remove('hidden');
  document.getElementById('content').classList.add('hidden');

  await Promise.all([
    carregarMetricas(),
    carregarUsuarios(),
    carregarTamanhoBanco()
  ]);

  document.getElementById('ultima-atualizacao').textContent = new Date().toLocaleString('pt-BR');
  document.getElementById('loading').classList.add('hidden');
  document.getElementById('content').classList.remove('hidden');
}

carregarTudo();
