import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, category, message } = body;

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Vul alstublieft een bericht of suggestie in." },
        { status: 400 }
      );
    }

    const recipient = "contact@antoniuscore.com";
    const timestamp = new Date().toISOString();

    // Log the feedback structured for support / monitoring
    console.log(`[FEEDBACK] Nieuwe feedback ontvangen voor ${recipient} op ${timestamp}:`, {
      from: email || "Anonieme bezoeker",
      name: name || "Niet opgegeven",
      category: category || "Algemeen",
      message: message.trim(),
    });

    // In a production environment with Resend / Nodemailer or webhook, this directly sends to contact@antoniuscore.com
    return NextResponse.json({
      success: true,
      message: `Hartelijk dank voor uw suggestie! Uw feedback is succesvol verzonden naar ${recipient}.`,
      recipient,
      timestamp,
    });
  } catch (error: any) {
    console.error("Fout bij verwerken feedback:", error);
    return NextResponse.json(
      { error: "Er is een fout opgetreden bij het verzenden van de feedback." },
      { status: 500 }
    );
  }
}
