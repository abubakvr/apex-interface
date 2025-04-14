// app/api/generate-csv/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getOrdersServerSide } from "@/lib/server/getOrders";
import { parse } from "json2csv";
import { matchBank } from "@/lib/matchBank";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return new NextResponse("Missing token", { status: 400 });
    }

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const orders = await getOrdersServerSide({ token });

    const csvData = orders.map((order) => {
      const term = order.result.paymentTermList?.[0] || {};
      return {
        Account_Number: term.accountNo || "",
        Amount: order.result.amount || "",
        Bank_Codes: matchBank(term.bankName)?.BANK_CODE || "",
        Narration: `Payment for goods on ${new Date().toLocaleDateString(
          "en-US",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        )}`,
      };
    });

    const csv = parse(csvData, {
      fields: ["Account_Number", "Amount", "Bank_Codes", "Narration"],
    });

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
      },
    });
  } catch (error) {
    console.error("CSV generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate CSV" },
      { status: 500 }
    );
  }
}
