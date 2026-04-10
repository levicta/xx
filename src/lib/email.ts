import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendOrderConfirmation(email: string, orderId: string, itemName: string, amount: number) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "your_resend_api_key_here") {
    console.log("Resend not configured, skipping email:", { type: "order_confirmation", email, orderId })
    return
  }

  try {
    await resend.emails.send({
      from: "RobloxMarket <noreply@robloxmarket.com>",
      to: email,
      subject: `Order Confirmed - ${itemName}`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #00e5a0;">Order Confirmed!</h1>
          <p>Your order #${orderId.slice(-8).toUpperCase()} has been confirmed.</p>
          <p><strong>Item:</strong> ${itemName}</p>
          <p><strong>Total:</strong> $${amount.toFixed(2)}</p>
          <p>Your seller has been notified and will deliver your item soon.</p>
          <p><a href="${process.env.NEXTAUTH_URL}/orders/${orderId}" style="background: #00e5a0; color: black; padding: 12px 24px; text-decoration: none; border-radius: 999px; display: inline-block;">View Order</a></p>
        </div>
      `,
    })
  } catch (error) {
    console.error("Failed to send order confirmation email:", error)
  }
}

export async function sendNewSaleAlert(email: string, itemName: string, amount: number, buyerUsername: string) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "your_resend_api_key_here") {
    console.log("Resend not configured, skipping email:", { type: "new_sale", email, itemName })
    return
  }

  try {
    await resend.emails.send({
      from: "RobloxMarket <noreply@robloxmarket.com>",
      to: email,
      subject: `New Sale! You sold ${itemName}`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #00e5a0;">New Sale!</h1>
          <p>Congratulations! You made a sale.</p>
          <p><strong>Item:</strong> ${itemName}</p>
          <p><strong>Buyer:</strong> ${buyerUsername}</p>
          <p><strong>Earnings:</strong> $${amount.toFixed(2)}</p>
          <p>Deliver the item to the buyer as soon as possible!</p>
          <p><a href="${process.env.NEXTAUTH_URL}/sell/orders" style="background: #00e5a0; color: black; padding: 12px 24px; text-decoration: none; border-radius: 999px; display: inline-block;">View Orders</a></p>
        </div>
      `,
    })
  } catch (error) {
    console.error("Failed to send new sale email:", error)
  }
}
