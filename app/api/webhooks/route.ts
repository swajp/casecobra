import { db } from "@/db";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import OrderReceivedEmail from "@/components/emails/order-received-email";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = headers().get("stripe-signature");

    if (!signature) {
      return new NextResponse("Invalid signature", { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === "checkout.session.completed") {
      if (!event.data.object.customer_details?.email) {
        throw new Error("Missing user email");
      }

      const session = event.data.object as Stripe.Checkout.Session;

      const { userId, orderId } = session.metadata || {
        userId: null,
        orderId: null,
      };

      if (!userId || !orderId) {
        throw new Error("Missing metadata");
      }

      const billingAdress = session.customer_details!.address;
      const shippingAdress = session.shipping_details!.address;

      const updatedOrder = await db.order.update({
        where: { id: orderId },
        data: {
          isPaid: true,
          ShippingAddress: {
            create: {
              name: session.customer_details!.name!,
              city: shippingAdress!.city!,
              country: shippingAdress!.country!,
              postalCode: shippingAdress!.postal_code!,
              street: shippingAdress!.line1!,
            },
          },
          BillingAddress: {
            create: {
              name: session.customer_details!.name!,
              city: billingAdress!.city!,
              country: billingAdress!.country!,
              postalCode: billingAdress!.postal_code!,
              street: billingAdress!.line1!,
            },
          },
        },
      });
      await resend.emails.send({
        from: "CaseCobra <stejsalmira@icloud.com>",
        to: [event.data.object.customer_details.email],
        subject: "Thanks for your order!",
        react: OrderReceivedEmail({
          orderId,
          orderDate: updatedOrder.createdAt.toLocaleDateString(),
          // @ts-ignore
          shippingAddress: {
            name: session.customer_details!.name!,
            city: shippingAdress!.city!,
            country: shippingAdress!.country!,
            postalCode: shippingAdress!.postal_code!,
            street: shippingAdress!.line1!,
            state: shippingAdress!.state,
          },
        }),
      });
    }
    return NextResponse.json({ result: "recieved", ok: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { result: "Something went wrong.", ok: false },
      { status: 500 }
    );
  }
}
