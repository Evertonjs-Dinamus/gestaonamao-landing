import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { CONFIG } from './config.js';

const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

const { data: { session } } = await supabase.auth.getSession();
if (!session) window.location.href = './login.html';

const { data: ehAdmin, error: errAdmin } = await supabase.rpc('is_admin');
if (errAdmin || !ehAdmin) {
  alert('Acesso negado.');
  await supabase.auth.signOut();
  window.location.href = './login.html';
}

document.getElementById('user-email').textContent = session.user.email;
const meuUserId = session.user.id;

document.getElementById('btn-logout').onclick = async () => {
  await supabase.auth.signOut();
  window.location.href = './login.html';
};
document.getElementById('btn-refresh').onclick = () => carregarTudo();

function formatDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('pt-BR');
}
function formatDateTime(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}
// WhatsApp vem como 11 dígitos (DDD + 9 + 8). Mostra formatado e clicável, pra
// dar pra falar com a pessoa direto do painel.
function linkWhatsapp(wpp) {
  if (!wpp) return '<span class="text-slate-400 italic">—</span>';
  const d = String(wpp).replace(/\D/g, '');
  if (d.length < 10) return '<span class="text-slate-400 italic">—</span>';
  const bonito = `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
  return `<a href="https://wa.me/55${d}" target="_blank" rel="noopener noreferrer" class="text-green-700 hover:underline font-mono">${bonito}</a>`;
}
function badgeStatus(status, diasExpirar) {
  if (status === 'active') {
    if (diasExpirar !== null && diasExpirar <= 7) return '<span class="bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-xs font-medium">⚠️ Ativo</span>';
    return '<span class="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium">🟢 Ativo</span>';
  }
  if (status === 'trial') {
    if (diasExpirar !== null && diasExpirar < 0) return '<span class="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs font-medium">🔴 Trial expirado</span>';
    if (diasExpirar !== null && diasExpirar <= 3) return '<span class="bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-xs font-medium">⏰ Trial</span>';
    return '<span class="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium">🔵 Trial</span>';
  }
  if (status === 'sem_assinatura') return '<span class="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">Sem assinatura</span>';
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

function toast(mensagem, tipo) {
  const cor = tipo === 'error' ? 'bg-red-600' : tipo === 'warning' ? 'bg-orange-600' : 'bg-green-600';
  const div = document.createElement('div');
  div.className = `fixed bottom-4 right-4 ${cor} text-white px-4 py-3 rounded-lg shadow-lg z-50`;
  div.textContent = mensagem;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 4000);
}

async function carregarMetricas() {
  const { data, error } = await supabase.rpc('rpc_admin_metricas_gerais');
  if (error) { console.error('Erro métricas:', error); return; }

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
    blue:'bg-blue-50 text-blue-900 border-blue-200',green:'bg-green-50 text-green-900 border-green-200',
    orange:'bg-orange-50 text-orange-900 border-orange-200',red:'bg-red-50 text-red-900 border-red-200',
    indigo:'bg-indigo-50 text-indigo-900 border-indigo-200',purple:'bg-purple-50 text-purple-900 border-purple-200',
    yellow:'bg-yellow-50 text-yellow-900 border-yellow-200',slate:'bg-slate-100 text-slate-900 border-slate-200'
  };
  document.getElementById('cards-metricas').innerHTML = cards.map(c => `
    <div class="border ${cores[c.cor]} rounded-lg p-3">
      <div class="text-xs font-medium opacity-75">${c.label}</div>
      <div class="text-2xl font-bold mt-1">${c.valor ?? 0}</div>
    </div>`).join('');
}

let usuariosCache = [];
async function carregarUsuarios() {
  const { data, error } = await supabase.rpc('rpc_admin_lista_usuarios');
  if (error) { console.error('Erro lista usuários:', error); return; }
  usuariosCache = data || [];
  aplicarFiltros();
  gerarBannerAlertas(usuariosCache);
}

function aplicarFiltros() {
  const busca = document.getElementById('filtro-busca').value.toLowerCase();
  const statusFiltro = document.getElementById('filtro-status').value;
  let filtrados = usuariosCache;
  if (busca) {
    // busca tambem por WhatsApp (so digitos, pra achar mesmo digitando com mascara)
    const buscaDigitos = busca.replace(/\D/g, '');
    filtrados = filtrados.filter(u =>
      (u.email||'').toLowerCase().includes(busca)
      || (u.empresa_nome||'').toLowerCase().includes(busca)
      || (buscaDigitos.length >= 4 && String(u.whatsapp||'').includes(buscaDigitos))
    );
  }
  if (statusFiltro === 'active') filtrados = filtrados.filter(u => u.status==='active' && u.dias_ate_expirar>0);
  else if (statusFiltro === 'trial') filtrados = filtrados.filter(u => u.status==='trial' && u.dias_ate_expirar>=0);
  else if (statusFiltro === 'expirado') filtrados = filtrados.filter(u => u.dias_ate_expirar!==null && u.dias_ate_expirar<0);
  renderizarUsuarios(filtrados);
  document.getElementById('contagem-usuarios').textContent = `Mostrando ${filtrados.length} de ${usuariosCache.length} usuários`;
}

function renderizarUsuarios(lista) {
  const html = lista.map(u => {
    const ehVoce = u.user_id === meuUserId;
    const acaoBtn = ehVoce
      ? '<span class="text-slate-300 text-xs italic">você</span>'
      : `<button class="btn-acoes px-2 py-1 hover:bg-slate-200 rounded text-slate-600 text-lg font-bold" data-user-id="${u.user_id}" data-email="${u.email}" data-empresa="${u.empresa_nome || 'sem empresa'}" data-status="${u.status}" title="Ações">⋯</button>`;
    return `<tr class="hover:bg-slate-50">
      <td class="px-3 py-2 font-mono text-xs">${u.email || '-'}</td>
      <td class="px-3 py-2 text-center" title="${u.email_confirmado ? 'E-mail confirmado' : 'NUNCA confirmou o e-mail — não consegue entrar no app'}">${u.email_confirmado ? '✅' : '⚠️'}</td>
      <td class="px-3 py-2 text-xs">${linkWhatsapp(u.whatsapp)}</td>
      <td class="px-3 py-2">${u.empresa_nome || '<span class="text-slate-400 italic">sem empresa</span>'}</td>
      <td class="px-3 py-2">${badgeStatus(u.status, u.dias_ate_expirar)}</td>
      <td class="px-3 py-2 text-xs">${u.plano || '-'}</td>
      <td class="px-3 py-2">${badgeCobranca(u.tipo_cobranca)}</td>
      <td class="px-3 py-2 text-slate-600 text-xs">${formatDate(u.expira_em)}</td>
      <td class="px-3 py-2 text-right ${corDias(u.dias_ate_expirar)}">${u.dias_ate_expirar ?? '-'}</td>
      <td class="px-3 py-2 text-right font-semibold">${u.total_lancamentos || 0}</td>
      <td class="px-3 py-2 text-right ${corDias(u.dias_sem_uso !== null ? -u.dias_sem_uso : null)}">${u.dias_sem_uso !== null ? u.dias_sem_uso + 'd' : '-'}</td>
      <td class="px-3 py-2 text-slate-500 text-xs">${formatDate(u.conta_criada_em)}</td>
      <td class="px-3 py-2 text-center">${acaoBtn}</td>
    </tr>`;
  }).join('');
  document.getElementById('tabela-usuarios').innerHTML = html || '<tr><td colspan="13" class="text-center py-6 text-slate-400">Nenhum usuário com esses filtros</td></tr>';

  document.querySelectorAll('.btn-acoes').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const b = e.currentTarget;
      abrirModalAcao({ userId: b.dataset.userId, email: b.dataset.email, empresa: b.dataset.empresa, status: b.dataset.status });
    });
  });
}

document.getElementById('filtro-busca').addEventListener('input', aplicarFiltros);
document.getElementById('filtro-status').addEventListener('change', aplicarFiltros);

function abrirModalAcao(usuario) {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
  modal.innerHTML = `
    <div class="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl">
      <h3 class="font-bold text-lg mb-1">Ações para o usuário</h3>
      <p class="text-sm text-slate-600 mb-4"><strong>${usuario.email}</strong><br><span class="text-xs text-slate-500">${usuario.empresa}</span></p>
      <div class="space-y-2">
        <button class="btn-acao-modal w-full text-left px-4 py-3 border border-blue-200 rounded-lg hover:bg-blue-50 transition" data-acao="estender_trial_7d">
          <div class="font-medium text-blue-900">🔄 Estender trial em 7 dias</div>
          <div class="text-xs text-slate-600 mt-1">Adiciona 7 dias ao trial.</div>
        </button>
        <button class="btn-acao-modal w-full text-left px-4 py-3 border border-green-200 rounded-lg hover:bg-green-50 transition" data-acao="ativar_premium_30d">
          <div class="font-medium text-green-900">✅ Ativar Premium (30 dias)</div>
          <div class="text-xs text-slate-600 mt-1">Marca como ativo por 30 dias.</div>
        </button>
        <button class="btn-acao-modal w-full text-left px-4 py-3 border border-orange-200 rounded-lg hover:bg-orange-50 transition" data-acao="cancelar_assinatura">
          <div class="font-medium text-orange-900">🚫 Cancelar assinatura</div>
          <div class="text-xs text-slate-600 mt-1">Marca como expirada agora.</div>
        </button>
        <button class="btn-acao-modal w-full text-left px-4 py-3 border-2 border-red-300 rounded-lg hover:bg-red-50 transition" data-acao="deletar_conta">
          <div class="font-medium text-red-900">🗑️ Deletar conta permanentemente</div>
          <div class="text-xs text-slate-600 mt-1">Apaga TUDO. Irreversível!</div>
        </button>
      </div>
      <button id="btn-cancelar-modal" class="w-full mt-4 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
  modal.querySelector('#btn-cancelar-modal').onclick = () => modal.remove();
  modal.querySelectorAll('.btn-acao-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      const acao = btn.dataset.acao;
      modal.remove();
      confirmarAcao(usuario, acao);
    });
  });
}

function confirmarAcao(usuario, acao) {
  const textos = {
    'estender_trial_7d':  { titulo: 'Estender trial?', desc: `Vai adicionar 7 dias ao trial de <strong>${usuario.email}</strong>.`, btn: 'Estender', cor: 'blue' },
    'ativar_premium_30d': { titulo: 'Ativar Premium?',  desc: `Vai marcar <strong>${usuario.email}</strong> como ativo por 30 dias.`, btn: 'Ativar', cor: 'green' },
    'cancelar_assinatura':{ titulo: 'Cancelar assinatura?', desc: `Vai marcar <strong>${usuario.email}</strong> como expirado agora.`, btn: 'Cancelar', cor: 'orange' },
    'deletar_conta':      { titulo: '⚠️ DELETAR conta?', desc: `Vai apagar PERMANENTEMENTE a conta <strong>${usuario.email}</strong> e TODOS os dados.<br><br><strong>Esta ação é IRREVERSÍVEL.</strong>`, btn: 'DELETAR', cor: 'red' }
  };
  const t = textos[acao];
  const precisaDigitar = acao === 'deletar_conta';

  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
  modal.innerHTML = `
    <div class="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl">
      <h3 class="font-bold text-lg mb-3">${t.titulo}</h3>
      <p class="text-sm text-slate-700 mb-4">${t.desc}</p>
      ${precisaDigitar ? `
        <div class="mb-4">
          <label class="block text-xs font-medium text-red-700 mb-1">Para confirmar, digite o email exato: <strong>${usuario.email}</strong></label>
          <input id="input-confirmacao" type="text" class="w-full px-3 py-2 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm font-mono" placeholder="digite o email aqui...">
        </div>` : ''}
      <div class="flex gap-2">
        <button id="btn-cancelar-conf" class="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">Cancelar</button>
        <button id="btn-confirmar" class="flex-1 px-4 py-2 bg-${t.cor}-600 hover:bg-${t.cor}-700 text-white font-semibold rounded-lg disabled:opacity-50">${t.btn}</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.querySelector('#btn-cancelar-conf').onclick = () => modal.remove();
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
  modal.querySelector('#btn-confirmar').onclick = async () => {
    const btn = modal.querySelector('#btn-confirmar');
    const confirmacao = precisaDigitar ? modal.querySelector('#input-confirmacao').value.trim() : null;
    if (precisaDigitar && confirmacao !== usuario.email) {
      toast('Email digitado não bate. Cópia exata é necessária.', 'error');
      return;
    }
    btn.disabled = true;
    btn.textContent = 'Executando...';
    const { data, error } = await supabase.rpc('rpc_admin_acao_usuario', {
      _target_user_id: usuario.userId, _acao: acao, _confirmacao: confirmacao
    });
    if (error) {
      toast('Erro: ' + (error.message || 'desconhecido'), 'error');
      btn.disabled = false;
      btn.textContent = t.btn;
      return;
    }
    toast(data?.mensagem || 'Ação executada!', 'success');
    modal.remove();
    await carregarTudo();
  };
}

function gerarBannerAlertas(usuarios) {
  const alertas = [];
  const cobrManualUrgente = usuarios.filter(u => u.tipo_cobranca === 'manual' && u.dias_ate_expirar !== null && u.dias_ate_expirar >= 0 && u.dias_ate_expirar <= 15);
  cobrManualUrgente.forEach(u => {
    alertas.push({ cor: u.dias_ate_expirar <= 7 ? 'red' : 'orange',
      texto: `<strong>${u.email}</strong> (${u.empresa_nome || 'sem empresa'}) — cobrança MANUAL vence em ${u.dias_ate_expirar} dias (${formatDate(u.expira_em)}). Precisa avisar pra inserir cartão de novo.` });
  });
  const trialsUrgentes = usuarios.filter(u => u.status === 'trial' && u.dias_ate_expirar !== null && u.dias_ate_expirar >= 0 && u.dias_ate_expirar <= 3);
  trialsUrgentes.forEach(u => {
    alertas.push({ cor: 'orange',
      texto: `<strong>${u.email}</strong> — trial termina em ${u.dias_ate_expirar} dia(s). ${u.total_lancamentos > 0 ? `${u.total_lancamentos} lançamentos feitos` : 'Nunca usou'}.` });
  });
  const banner = document.getElementById('banner-alertas');
  if (alertas.length === 0) { banner.classList.add('hidden'); return; }
  const corClasses = { red: 'bg-red-50 border-red-300 text-red-900', orange: 'bg-orange-50 border-orange-300 text-orange-900' };
  banner.innerHTML = `
    <div class="border-2 rounded-lg p-4 ${corClasses[alertas[0].cor]}">
      <h3 class="font-bold mb-2">🚨 Atenção — ${alertas.length} item(ns) precisam de ação</h3>
      <ul class="text-sm space-y-1">${alertas.map(a => `<li>• ${a.texto}</li>`).join('')}</ul>
    </div>`;
  banner.classList.remove('hidden');
}

async function carregarTamanhoBanco() {
  const { data, error } = await supabase.rpc('rpc_admin_tamanho_por_empresa');
  if (error) { console.error('Erro tamanho banco:', error); return; }
  document.getElementById('tabela-banco').innerHTML = (data || []).map(e => `
    <tr class="hover:bg-slate-50">
      <td class="px-3 py-2">${e.empresa_nome || '<span class="text-slate-400 italic">-</span>'}</td>
      <td class="px-3 py-2 text-xs font-mono text-slate-600">${e.user_email || '-'}</td>
      <td class="px-3 py-2 text-right">${e.qtd_receitas}</td>
      <td class="px-3 py-2 text-right">${e.qtd_despesas}</td>
      <td class="px-3 py-2 text-right">${e.qtd_manutencoes}</td>
      <td class="px-3 py-2 text-right">${e.qtd_hodometro}</td>
      <td class="px-3 py-2 text-right font-semibold">${e.qtd_total}</td>
      <td class="px-3 py-2 text-right text-slate-600">${e.tamanho_estimado_kb}</td>
    </tr>`).join('') || '<tr><td colspan="8" class="text-center py-6 text-slate-400">Nenhuma empresa</td></tr>';
}

async function carregarAuditLog() {
  const { data, error } = await supabase.rpc('rpc_admin_listar_audit_log', { _limite: 20 });
  if (error) { console.error('Erro audit log:', error); return; }
  const tbody = document.getElementById('tabela-audit');
  if (!tbody) return;
  const acaoLabel = {
    'estender_trial_7d':   '🔄 Estender trial 7d',
    'ativar_premium_30d':  '✅ Ativar premium 30d',
    'cancelar_assinatura': '🚫 Cancelar',
    'deletar_conta':       '🗑️ DELETAR'
  };
  tbody.innerHTML = (data || []).map(l => `
    <tr class="hover:bg-slate-50">
      <td class="px-3 py-2 text-xs text-slate-600">${formatDateTime(l.created_at)}</td>
      <td class="px-3 py-2 text-xs">${l.admin_email}</td>
      <td class="px-3 py-2 text-xs">${l.target_email || '-'}</td>
      <td class="px-3 py-2 text-xs">${acaoLabel[l.acao] || l.acao}</td>
    </tr>`).join('') || '<tr><td colspan="4" class="text-center py-4 text-slate-400 text-sm">Nenhuma ação registrada ainda</td></tr>';
}

async function carregarTudo() {
  document.getElementById('loading').classList.remove('hidden');
  document.getElementById('content').classList.add('hidden');
  await Promise.all([carregarMetricas(), carregarUsuarios(), carregarTamanhoBanco(), carregarAuditLog()]);
  document.getElementById('ultima-atualizacao').textContent = new Date().toLocaleString('pt-BR');
  document.getElementById('loading').classList.add('hidden');
  document.getElementById('content').classList.remove('hidden');
}

carregarTudo();