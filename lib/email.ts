const FROM = process.env.EMAIL_FROM || 'Encantari <contato@encantari.com.br>'
const WA_NUM = process.env.STORE_WHATSAPP || '5541995872092'
const ENDERECO = 'R. Léa Vialle Cury, 146 - Centro, Matinhos - PR, 83260-000'

export async function enviarEmail({ to, subject, html }: { to: string; subject: string; html: string }): Promise<{ ok: boolean; erro?: string }> {
  const key = process.env.RESEND_API_KEY
  if (!key) return { ok: false, erro: 'RESEND_API_KEY não configurado' }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: [to], subject, html }),
    })
    if (!res.ok) {
      const txt = await res.text()
      return { ok: false, erro: `Resend ${res.status}: ${txt.slice(0, 200)}` }
    }
    return { ok: true }
  } catch (err: any) {
    return { ok: false, erro: err?.message || String(err) }
  }
}

function base(conteudo: string) {
  return `<!DOCTYPE html><html><body style="margin:0;padding:16px;background:#f5f0ef">
    <div style="font-family:Georgia,serif;max-width:580px;margin:0 auto;padding:32px;background:#FEF4F3;border-radius:16px">
      <div style="margin-bottom:28px">
        <h1 style="color:#491E2F;font-size:26px;margin:0;font-weight:600;letter-spacing:-0.5px">encantari</h1>
        <p style="color:#b89090;font-size:12px;margin:2px 0 0">sua loja de presentes</p>
      </div>
      ${conteudo}
      <div style="border-top:1px solid #f0e0de;margin-top:28px;padding-top:16px;display:flex;flex-wrap:wrap;gap:12px">
        <a href="https://wa.me/${WA_NUM}" style="color:#EF9493;font-size:12px;text-decoration:none">💬 WhatsApp</a>
        <span style="color:#e0d0d0;font-size:12px">•</span>
        <span style="color:#b89090;font-size:12px">${ENDERECO}</span>
      </div>
    </div>
  </body></html>`
}

type Item = { title: string; quantity: number; unit_price: number }

function tabelaItens(itens: Item[], frete?: { nome: string; preco: number }, total?: number) {
  if (!itens?.length) return ''
  const linhas = itens.map(i =>
    `<tr>
      <td style="color:#555;font-size:14px;padding:7px 0;border-bottom:1px solid #f5eded">${i.title} <span style="color:#aaa">×${i.quantity}</span></td>
      <td style="color:#491E2F;font-size:14px;text-align:right;padding:7px 0;border-bottom:1px solid #f5eded;white-space:nowrap">R$ ${(Number(i.unit_price) * Number(i.quantity)).toFixed(2).replace('.', ',')}</td>
    </tr>`
  ).join('')

  const linhaFrete = frete
    ? `<tr>
        <td style="color:#aaa;font-size:13px;padding:7px 0;border-bottom:1px solid #f5eded">Frete — ${frete.nome}</td>
        <td style="color:#aaa;font-size:13px;text-align:right;padding:7px 0;border-bottom:1px solid #f5eded">${frete.preco > 0 ? `R$ ${Number(frete.preco).toFixed(2).replace('.', ',')}` : 'Grátis'}</td>
      </tr>`
    : ''

  const linhaTotal = total != null
    ? `<tr>
        <td style="color:#491E2F;font-weight:700;font-size:15px;padding:12px 0 0">Total</td>
        <td style="color:#491E2F;font-weight:700;font-size:16px;text-align:right;padding:12px 0 0">R$ ${Number(total).toFixed(2).replace('.', ',')}</td>
      </tr>`
    : ''

  return `
    <div style="background:white;border-radius:12px;padding:20px;margin-bottom:20px">
      <p style="color:#491E2F;font-weight:600;margin:0 0 12px;font-size:13px;text-transform:uppercase;letter-spacing:.5px">Itens do pedido</p>
      <table style="width:100%;border-collapse:collapse">
        ${linhas}${linhaFrete}${linhaTotal}
      </table>
    </div>`
}

export function emailConfirmacaoPedido({ nome, paymentId, itens, total, frete }: {
  nome: string
  paymentId: string
  itens: Item[]
  total: number
  frete?: { nome: string; preco: number }
}) {
  const primeiroNome = nome.split(' ')[0] || 'cliente'
  return base(`
    <p style="color:#491E2F;font-size:18px;margin:0 0 6px;font-weight:500">Obrigada pela sua compra, ${primeiroNome}! ✨</p>
    <p style="color:#9d7070;font-size:14px;margin:0 0 24px">Pedido <strong>#${paymentId}</strong> confirmado. Vamos preparar tudo com muito carinho.</p>
    ${tabelaItens(itens, frete, total)}
    <p style="color:#9d7070;font-size:13px;margin:0">Assim que seu pedido for despachado, você receberá um email com o código de rastreamento. 📦</p>
  `)
}

export function emailPedidoEnviado({ nome, paymentId, rastreio, transportadora, itens, total, frete }: {
  nome: string
  paymentId: string
  rastreio: string
  transportadora?: string
  itens?: Item[]
  total?: number
  frete?: { nome: string; preco: number }
}) {
  const primeiroNome = nome.split(' ')[0] || 'cliente'
  const ehCorreios = /^[A-Z]{2}\d{9}[A-Z]{2}$/.test(rastreio)

  return base(`
    <p style="color:#491E2F;font-size:18px;margin:0 0 6px;font-weight:500">Seu pedido foi enviado! 📦</p>
    <p style="color:#9d7070;font-size:14px;margin:0 0 20px">Pedido <strong>#${paymentId}</strong></p>

    <div style="background:white;border-radius:12px;padding:20px;margin-bottom:20px">
      <p style="color:#491E2F;font-weight:600;margin:0 0 4px;font-size:13px;text-transform:uppercase;letter-spacing:.5px">Código de rastreamento</p>
      ${transportadora ? `<p style="color:#9d7070;font-size:13px;margin:4px 0 10px">${transportadora}</p>` : '<div style="margin-bottom:10px"></div>'}
      <p style="font-family:monospace;font-size:22px;color:#491E2F;font-weight:700;letter-spacing:3px;margin:0 0 14px;background:#FEF4F3;padding:12px 16px;border-radius:8px;display:inline-block">${rastreio}</p>
      <br>
      ${ehCorreios
        ? `<a href="https://rastreamento.correios.com.br/app/index.php" style="display:inline-block;color:#EF9493;font-size:13px;text-decoration:none;border:1px solid #EF9493;padding:6px 16px;border-radius:20px">Rastrear nos Correios →</a>`
        : `<a href="https://www.melhorenvio.com.br/rastreamento/${rastreio}" style="display:inline-block;color:#EF9493;font-size:13px;text-decoration:none;border:1px solid #EF9493;padding:6px 16px;border-radius:20px">Rastrear envio →</a>`
      }
    </div>

    ${tabelaItens(itens || [], frete, total)}

    <p style="color:#9d7070;font-size:13px;margin:0">Qualquer dúvida sobre o envio, fale com a gente pelo WhatsApp. Boa entrega, ${primeiroNome}! 🌸</p>
  `)
}

export function emailPedidoProntoRetirada({ nome, paymentId, itens, total, frete }: {
  nome: string
  paymentId: string
  itens?: Item[]
  total?: number
  frete?: { nome: string; preco: number }
}) {
  const primeiroNome = nome.split(' ')[0] || 'cliente'
  return base(`
    <p style="color:#491E2F;font-size:18px;margin:0 0 6px;font-weight:500">Seu pedido está pronto para retirada! 🎀</p>
    <p style="color:#9d7070;font-size:14px;margin:0 0 20px">Pedido <strong>#${paymentId}</strong></p>

    <div style="background:white;border-radius:12px;padding:20px;margin-bottom:20px">
      <p style="color:#491E2F;font-weight:600;margin:0 0 10px;font-size:13px;text-transform:uppercase;letter-spacing:.5px">Local de retirada</p>
      <p style="color:#491E2F;font-size:15px;font-weight:500;margin:0 0 4px">Encantari</p>
      <p style="color:#555;font-size:14px;margin:0 0 12px">${ENDERECO}</p>
      <a href="https://wa.me/${WA_NUM}" style="display:inline-block;background:#25D366;color:white;font-size:13px;text-decoration:none;padding:8px 18px;border-radius:20px;font-weight:500">💬 Combinar pelo WhatsApp</a>
    </div>

    ${tabelaItens(itens || [], frete, total)}

    <p style="color:#9d7070;font-size:13px;margin:0">Te esperamos, ${primeiroNome}! Avise pelo WhatsApp antes de vir para garantir que estaremos prontos para te atender. 🌸</p>
  `)
}
