const FROM = process.env.EMAIL_FROM || 'Encantari <contato@encantari.com.br>'

export async function enviarEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const key = process.env.RESEND_API_KEY
  if (!key) { console.warn('RESEND_API_KEY não configurado'); return }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to: [to], subject, html }),
  })
  if (!res.ok) console.error('Resend erro:', res.status, await res.text())
}

function base(conteudo: string) {
  return `<!DOCTYPE html><html><body style="margin:0;padding:16px;background:#f5f0ef">
    <div style="font-family:Georgia,serif;max-width:580px;margin:0 auto;padding:32px;background:#FEF4F3;border-radius:16px">
      <div style="margin-bottom:28px">
        <h1 style="color:#491E2F;font-size:26px;margin:0;font-weight:600;letter-spacing:-0.5px">encantari</h1>
        <p style="color:#b89090;font-size:12px;margin:2px 0 0">sua loja de presentes</p>
      </div>
      ${conteudo}
      <div style="border-top:1px solid #f0e0de;margin-top:28px;padding-top:16px">
        <p style="color:#b89090;font-size:12px;margin:0">Dúvidas? Responda este email ou fale pelo WhatsApp.</p>
      </div>
    </div>
  </body></html>`
}

type Item = { title: string; quantity: number; unit_price: number }

export function emailConfirmacaoPedido({ nome, paymentId, itens, total, frete }: {
  nome: string
  paymentId: string
  itens: Item[]
  total: number
  frete?: { nome: string; preco: number }
}) {
  const primeiroNome = nome.split(' ')[0] || 'cliente'
  const linhasItens = itens.map(i =>
    `<tr>
      <td style="color:#555;font-size:14px;padding:7px 0;border-bottom:1px solid #f5eded">${i.title} <span style="color:#aaa">×${i.quantity}</span></td>
      <td style="color:#491E2F;font-size:14px;text-align:right;padding:7px 0;border-bottom:1px solid #f5eded;white-space:nowrap">R$ ${(Number(i.unit_price) * Number(i.quantity)).toFixed(2).replace('.', ',')}</td>
    </tr>`
  ).join('')

  const linhaFrete = frete
    ? `<tr>
        <td style="color:#aaa;font-size:13px;padding:7px 0;border-bottom:1px solid #f5eded">Frete — ${frete.nome}</td>
        <td style="color:#aaa;font-size:13px;text-align:right;padding:7px 0;border-bottom:1px solid #f5eded">${frete.preco > 0 ? `R$ ${frete.preco.toFixed(2).replace('.', ',')}` : 'Grátis'}</td>
      </tr>`
    : ''

  return base(`
    <p style="color:#491E2F;font-size:18px;margin:0 0 6px;font-weight:500">Obrigada pela sua compra, ${primeiroNome}! ✨</p>
    <p style="color:#9d7070;font-size:14px;margin:0 0 24px">Pedido <strong>#${paymentId}</strong> confirmado. Vamos preparar tudo com muito carinho.</p>

    <div style="background:white;border-radius:12px;padding:20px;margin-bottom:20px">
      <p style="color:#491E2F;font-weight:600;margin:0 0 12px;font-size:13px;text-transform:uppercase;letter-spacing:.5px">Resumo do pedido</p>
      <table style="width:100%;border-collapse:collapse">
        ${linhasItens}
        ${linhaFrete}
        <tr>
          <td style="color:#491E2F;font-weight:700;font-size:15px;padding:12px 0 0">Total</td>
          <td style="color:#491E2F;font-weight:700;font-size:16px;text-align:right;padding:12px 0 0">R$ ${Number(total).toFixed(2).replace('.', ',')}</td>
        </tr>
      </table>
    </div>

    <p style="color:#9d7070;font-size:13px;margin:0">Assim que seu pedido for despachado, você receberá um email com o código de rastreamento. 📦</p>
  `)
}

export function emailPedidoEnviado({ nome, paymentId, rastreio, transportadora }: {
  nome: string
  paymentId: string
  rastreio: string
  transportadora?: string
}) {
  const primeiroNome = nome.split(' ')[0] || 'cliente'
  return base(`
    <p style="color:#491E2F;font-size:18px;margin:0 0 6px;font-weight:500">Seu pedido foi enviado! 📦</p>
    <p style="color:#9d7070;font-size:14px;margin:0 0 24px">Pedido <strong>#${paymentId}</strong></p>

    <div style="background:white;border-radius:12px;padding:20px;margin-bottom:20px">
      <p style="color:#491E2F;font-weight:600;margin:0 0 4px;font-size:13px;text-transform:uppercase;letter-spacing:.5px">Código de rastreamento</p>
      ${transportadora ? `<p style="color:#9d7070;font-size:13px;margin:4px 0 12px">${transportadora}</p>` : '<div style="margin-bottom:12px"></div>'}
      <p style="font-family:monospace;font-size:20px;color:#491E2F;font-weight:700;letter-spacing:3px;margin:0 0 16px;background:#FEF4F3;padding:12px 16px;border-radius:8px;display:inline-block">${rastreio}</p>
      <br>
      <a href="https://rastreamento.correios.com.br/app/index.php" style="display:inline-block;margin-top:4px;color:#EF9493;font-size:13px;text-decoration:none;border:1px solid #EF9493;padding:6px 14px;border-radius:20px">Rastrear nos Correios →</a>
    </div>

    <p style="color:#9d7070;font-size:13px;margin:0">Boa entrega, ${primeiroNome}! Se tiver qualquer dúvida sobre o envio, é só nos chamar.</p>
  `)
}

export function emailPedidoProntoRetirada({ nome, paymentId }: {
  nome: string
  paymentId: string
}) {
  const primeiroNome = nome.split(' ')[0] || 'cliente'
  return base(`
    <p style="color:#491E2F;font-size:18px;margin:0 0 6px;font-weight:500">Seu pedido está pronto para retirada! 🎀</p>
    <p style="color:#9d7070;font-size:14px;margin:0 0 24px">Pedido <strong>#${paymentId}</strong></p>

    <div style="background:white;border-radius:12px;padding:20px;margin-bottom:20px">
      <p style="color:#491E2F;font-weight:600;margin:0 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:.5px">Local de retirada</p>
      <p style="color:#555;font-size:14px;margin:0 0 4px">Encantari — Matinhos/PR</p>
      <p style="color:#9d7070;font-size:13px;margin:0">Combine o horário pelo WhatsApp antes de vir.</p>
    </div>

    <p style="color:#9d7070;font-size:13px;margin:0">Te esperamos, ${primeiroNome}! 🌸</p>
  `)
}
