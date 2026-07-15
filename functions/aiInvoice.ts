// AI Invoice & Quote Generator — GPT-4o powered backend
// Multi-country tax logic: Canada (GST/HST/PST/QST by province), USA (state sales tax, approximate),
// and international (manual/no tax) so the app can be marketed worldwide.

const CA_PROVINCE_TAX: Record<string, { name: string; rate: number }> = {
  AB: { name: "GST", rate: 0.05 },
  BC: { name: "GST+PST", rate: 0.12 },
  MB: { name: "GST+PST", rate: 0.12 },
  NB: { name: "HST", rate: 0.15 },
  NL: { name: "HST", rate: 0.15 },
  NS: { name: "HST", rate: 0.15 },
  NT: { name: "GST", rate: 0.05 },
  NU: { name: "GST", rate: 0.05 },
  ON: { name: "HST", rate: 0.13 },
  PE: { name: "HST", rate: 0.15 },
  QC: { name: "GST+QST", rate: 0.14975 },
  SK: { name: "GST+PST", rate: 0.11 },
  YT: { name: "GST", rate: 0.05 },
};

// Approximate state-level general sales tax rates (2026). Local/county add-ons are NOT included —
// flagged to the user as an estimate they should confirm for their jurisdiction.
const US_STATE_TAX: Record<string, { name: string; rate: number }> = {
  AL: { name: "Sales Tax", rate: 0.04 }, AK: { name: "Sales Tax", rate: 0.0 }, AZ: { name: "Sales Tax", rate: 0.056 },
  AR: { name: "Sales Tax", rate: 0.065 }, CA: { name: "Sales Tax", rate: 0.0725 }, CO: { name: "Sales Tax", rate: 0.029 },
  CT: { name: "Sales Tax", rate: 0.0635 }, DE: { name: "Sales Tax", rate: 0.0 }, FL: { name: "Sales Tax", rate: 0.06 },
  GA: { name: "Sales Tax", rate: 0.04 }, HI: { name: "Sales Tax", rate: 0.04 }, ID: { name: "Sales Tax", rate: 0.06 },
  IL: { name: "Sales Tax", rate: 0.0625 }, IN: { name: "Sales Tax", rate: 0.07 }, IA: { name: "Sales Tax", rate: 0.06 },
  KS: { name: "Sales Tax", rate: 0.065 }, KY: { name: "Sales Tax", rate: 0.06 }, LA: { name: "Sales Tax", rate: 0.0445 },
  ME: { name: "Sales Tax", rate: 0.055 }, MD: { name: "Sales Tax", rate: 0.06 }, MA: { name: "Sales Tax", rate: 0.0625 },
  MI: { name: "Sales Tax", rate: 0.06 }, MN: { name: "Sales Tax", rate: 0.06875 }, MS: { name: "Sales Tax", rate: 0.07 },
  MO: { name: "Sales Tax", rate: 0.04225 }, MT: { name: "Sales Tax", rate: 0.0 }, NE: { name: "Sales Tax", rate: 0.055 },
  NV: { name: "Sales Tax", rate: 0.0685 }, NH: { name: "Sales Tax", rate: 0.0 }, NJ: { name: "Sales Tax", rate: 0.06625 },
  NM: { name: "Sales Tax", rate: 0.05125 }, NY: { name: "Sales Tax", rate: 0.04 }, NC: { name: "Sales Tax", rate: 0.0475 },
  ND: { name: "Sales Tax", rate: 0.05 }, OH: { name: "Sales Tax", rate: 0.0575 }, OK: { name: "Sales Tax", rate: 0.045 },
  OR: { name: "Sales Tax", rate: 0.0 }, PA: { name: "Sales Tax", rate: 0.06 }, RI: { name: "Sales Tax", rate: 0.07 },
  SC: { name: "Sales Tax", rate: 0.06 }, SD: { name: "Sales Tax", rate: 0.042 }, TN: { name: "Sales Tax", rate: 0.07 },
  TX: { name: "Sales Tax", rate: 0.0625 }, UT: { name: "Sales Tax", rate: 0.061 }, VT: { name: "Sales Tax", rate: 0.06 },
  VA: { name: "Sales Tax", rate: 0.053 }, WA: { name: "Sales Tax", rate: 0.065 }, WV: { name: "Sales Tax", rate: 0.06 },
  WI: { name: "Sales Tax", rate: 0.05 }, WY: { name: "Sales Tax", rate: 0.04 }, DC: { name: "Sales Tax", rate: 0.06 },
};

const COUNTRY_CURRENCY: Record<string, string> = {
  CA: "CAD",
  US: "USD",
};

Deno.serve(async (req: Request): Promise<Response> => {
  const cors = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const {
      prompt,
      invoice_type = "invoice",
      country = "CA",           // "CA" | "US" | "OTHER"
      province = "ON",          // CA province code OR US state code, used when country is CA/US
      currency,                 // optional explicit override, e.g. "EUR", "GBP", "AUD"
      tax_rate: manualTaxRate,  // optional manual tax rate override (0-1), used for OTHER or to override
      tax_name: manualTaxName,  // optional manual tax label
    } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), { status: 400, headers: cors });
    }

    const countryCode = String(country).toUpperCase();
    let tax = { name: "Tax", rate: 0 };
    let taxNote = "";

    if (countryCode === "CA") {
      tax = CA_PROVINCE_TAX[province?.toUpperCase()] || { name: "GST", rate: 0.05 };
    } else if (countryCode === "US") {
      tax = US_STATE_TAX[province?.toUpperCase()] || { name: "Sales Tax", rate: 0 };
      taxNote = "US sales tax shown is an approximate state-level rate and does not include county/city add-ons. Confirm the exact rate for your jurisdiction.";
    } else {
      // OTHER / international: no auto tax unless the user supplied one
      tax = { name: manualTaxName || "Tax", rate: typeof manualTaxRate === "number" ? manualTaxRate : 0 };
      taxNote = "No automatic tax calculation is available for this country yet. Add your local tax rate manually if needed.";
    }

    // Explicit manual override always wins if provided
    if (typeof manualTaxRate === "number") {
      tax = { name: manualTaxName || tax.name, rate: manualTaxRate };
    }

    const resolvedCurrency = (currency || COUNTRY_CURRENCY[countryCode] || "USD").toUpperCase();

    const systemPrompt = `You are a professional invoicing assistant serving clients worldwide. Parse the user's description and return a structured JSON invoice/quote.

Country: ${countryCode}${province ? `, Region/Province/State: ${province.toUpperCase()}` : ""}
Tax to apply: ${tax.name} at ${(tax.rate * 100).toFixed(3)}%
Currency: ${resolvedCurrency}

Return ONLY valid JSON with this exact structure:
{
  "invoice_type": "${invoice_type}",
  "client_name": "string or empty",
  "client_email": "string or empty",
  "line_items": [
    { "description": "string", "quantity": number, "unit_price": number, "total": number }
  ],
  "subtotal": number,
  "tax_rate": ${tax.rate},
  "tax_name": "${tax.name}",
  "tax_total": number,
  "total": number,
  "currency": "${resolvedCurrency}",
  "notes": "string or empty",
  "due_days": 30
}

Rules:
- All amounts in ${resolvedCurrency}
- Calculate totals accurately
- If client name/email not mentioned, leave empty
- Be professional with descriptions
- Round to 2 decimal places`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("OPENAI_PROJECT_KEY")}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI error: ${response.status}`);
    }

    const data = await response.json();
    const invoice = JSON.parse(data.choices[0].message.content);

    // Add metadata
    const now = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (invoice.due_days || 30));

    invoice.issue_date = now.toISOString().split("T")[0];
    invoice.due_date = dueDate.toISOString().split("T")[0];
    invoice.country = countryCode;
    invoice.province = province ? province.toUpperCase() : "";
    invoice.status = "draft";
    if (taxNote) invoice.tax_note = taxNote;

    return new Response(JSON.stringify(invoice), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });

  } catch (err: any) {
    console.error("aiInvoice error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
