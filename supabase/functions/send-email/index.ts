import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
    to: string[];
    subject: string;
    html: string;
    from?: string;
}

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
        if (!RESEND_API_KEY) {
            throw new Error("RESEND_API_KEY is not set");
        }

        const resend = new Resend(RESEND_API_KEY);
        const { to, subject, html, from } = await req.json() as EmailRequest;

        if (!to || !subject || !html) {
            throw new Error("Missing required fields: to, subject, html");
        }

        // En producción cambiar onboarding@resend.dev por tu dominio verificado
        const fromEmail = from || "GPMedical <onboarding@resend.dev>";

        const data = await resend.emails.send({
            from: fromEmail,
            to,
            subject,
            html,
        });

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error: any) {
        console.error("Error sending email:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
