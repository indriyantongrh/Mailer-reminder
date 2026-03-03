const admin = require("firebase-admin");
const { Resend } = require("resend");

// ─── Configuration ───────────────────────────────────────────────────────────

const RESEND_FROM = "Sikasir Laundry <noreply@sikasirlaundry.web.id>";
const CTA_URL =
  "https://play.google.com/store/apps/details?id=com.sikasir.laundry.sikasirlaundry";
const WHATSAPP_CS_URL = "https://wa.me/6285161616169";
const BRAND_COLOR = "#0a57a2";

const TIERS = [
  { days: 7, label: "H-7", color: "#f59e0b", level: "informatif" },
  { days: 3, label: "H-3", color: "#f97316", level: "urgent" },
  { days: 1, label: "H-1", color: "#ef4444", level: "critical" },
];

const BULAN_INDONESIA = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Format a JS Date to Indonesian date string, e.g. "3 Maret 2026"
 */
function formatTanggalIndonesia(date) {
  const d = date.getDate();
  const m = BULAN_INDONESIA[date.getMonth()];
  const y = date.getFullYear();
  return `${d} ${m} ${y}`;
}

/**
 * Get the start and end of a day in UTC+7 (WIB), returned as UTC Date objects.
 * This ensures Firestore Timestamp comparisons work correctly.
 */
function getWIBDayRange(daysFromNow) {
  // Current time in WIB
  const nowUTC = new Date();
  const nowWIB = new Date(nowUTC.getTime() + 7 * 60 * 60 * 1000);

  // Target date at midnight WIB
  const target = new Date(nowWIB);
  target.setDate(target.getDate() + daysFromNow);
  target.setHours(0, 0, 0, 0);

  const startOfDayWIB = new Date(target);
  const endOfDayWIB = new Date(target);
  endOfDayWIB.setHours(23, 59, 59, 999);

  // Convert back to UTC for Firestore comparison
  const startUTC = new Date(startOfDayWIB.getTime() - 7 * 60 * 60 * 1000);
  const endUTC = new Date(endOfDayWIB.getTime() - 7 * 60 * 60 * 1000);

  return { start: startUTC, end: endUTC, displayDate: startOfDayWIB };
}

/**
 * Generate the email subject based on tier level.
 */
function getSubject(tier, daysLeft) {
  switch (tier.level) {
    case "informatif":
      return `📋 Langganan Sikasir Laundry Anda akan berakhir dalam ${daysLeft} hari`;
    case "urgent":
      return `⚠️ Segera Perpanjang! Langganan Anda berakhir ${daysLeft} hari lagi`;
    case "critical":
      return `🚨 BESOK Langganan Anda Berakhir — Perpanjang Sekarang!`;
    default:
      return `Reminder Langganan Sikasir Laundry`;
  }
}

/**
 * Build professional HTML email body.
 */
function buildEmailHTML(userName, daysLeft, expiryDate, tier) {
  const formattedDate = formatTanggalIndonesia(expiryDate);

  const urgencyText =
    daysLeft === 1
      ? "Langganan Anda akan berakhir <strong>besok</strong>!"
      : `Langganan Anda akan berakhir dalam <strong>${daysLeft} hari</strong>.`;

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reminder Langganan Sikasir Laundry</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Banner -->
          <tr>
            <td style="background-color:${tier.color};padding:24px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;">
                ${tier.level === "critical" ? "🚨" : tier.level === "urgent" ? "⚠️" : "📋"} Reminder Langganan
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;font-size:16px;color:#1a1a2e;line-height:1.6;">
                Halo <strong>${userName}</strong>,
              </p>
              <p style="margin:0 0 16px;font-size:16px;color:#1a1a2e;line-height:1.6;">
                ${urgencyText}
              </p>

              <!-- Info Box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
                <tr>
                  <td style="background-color:#f0f4f8;border-left:4px solid ${BRAND_COLOR};border-radius:0 8px 8px 0;padding:20px 24px;">
                    <p style="margin:0 0 8px;font-size:14px;color:#64748b;text-transform:uppercase;letter-spacing:1px;font-weight:600;">
                      Tanggal Berakhir
                    </p>
                    <p style="margin:0;font-size:20px;color:${BRAND_COLOR};font-weight:700;">
                      ${formattedDate}
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 24px;font-size:16px;color:#1a1a2e;line-height:1.6;">
                Pastikan Anda memperpanjang langganan agar tetap bisa menggunakan seluruh fitur 
                <strong style="color:${BRAND_COLOR};">Sikasir Laundry</strong> tanpa gangguan.
              </p>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 16px;">
                    <a href="${CTA_URL}" target="_blank" 
                       style="display:inline-block;background-color:${BRAND_COLOR};color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;padding:14px 40px;border-radius:8px;letter-spacing:0.5px;">
                      Perpanjang Sekarang
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 32px;">
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:0;">
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;text-align:center;">
              <p style="margin:0 0 8px;font-size:13px;color:#94a3b8;line-height:1.5;">
                Butuh bantuan? Hubungi Customer Service kami:
              </p>
              <a href="${WHATSAPP_CS_URL}" target="_blank" 
                 style="display:inline-block;color:${BRAND_COLOR};text-decoration:none;font-size:14px;font-weight:600;">
                💬 Chat WhatsApp CS
              </a>
              <p style="margin:16px 0 0;font-size:12px;color:#cbd5e1;">
                &copy; ${new Date().getFullYear()} Sikasir Laundry. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== Sikasir Laundry — Subscription Reminder ===\n");

  // 1. Init Firebase
  const serviceAccountJSON = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountJSON) {
    console.error("❌ FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.");
    process.exit(1);
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(serviceAccountJSON);
  } catch (err) {
    console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", err.message);
    process.exit(1);
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: "kasirlaundryapps",
  });

  const db = admin.firestore();

  // 2. Init Resend
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.error("❌ RESEND_API_KEY environment variable is not set.");
    process.exit(1);
  }

  const resend = new Resend(resendApiKey);

  // 3. Process each tier
  let totalSent = 0;
  let totalFailed = 0;
  let totalSkipped = 0;

  for (const tier of TIERS) {
    const { start, end, displayDate } = getWIBDayRange(tier.days);

    console.log(
      `\n📌 Checking ${tier.label} (${formatTanggalIndonesia(displayDate)})...`
    );
    console.log(
      `   Query range: ${start.toISOString()} → ${end.toISOString()}`
    );

    let snapshot;
    try {
      snapshot = await db
        .collection("users")
        .where("accessUntil", ">=", admin.firestore.Timestamp.fromDate(start))
        .where("accessUntil", "<=", admin.firestore.Timestamp.fromDate(end))
        .get();
    } catch (err) {
      console.error(`   ❌ Firestore query failed for ${tier.label}:`, err.message);
      continue;
    }

    if (snapshot.empty) {
      console.log(`   ℹ️  No users found for ${tier.label}.`);
      continue;
    }

    console.log(`   👥 Found ${snapshot.size} user(s).`);

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const userId = doc.id;
      const userName = data.name || "Pengguna";
      const userEmail = data.email;

      // Skip users without email
      if (!userEmail) {
        console.log(`   ⏭️  [${userId}] "${userName}" — no email, skipped.`);
        totalSkipped++;
        continue;
      }

      // Build and send email
      const expiryDate = data.accessUntil.toDate();
      const subject = getSubject(tier, tier.days);
      const html = buildEmailHTML(userName, tier.days, expiryDate, tier);

      try {
        const { data: sendResult, error } = await resend.emails.send({
          from: RESEND_FROM,
          to: [userEmail],
          subject: subject,
          html: html,
        });

        if (error) {
          console.error(
            `   ❌ [${userId}] "${userName}" <${userEmail}> — Resend error:`,
            error.message
          );
          totalFailed++;
        } else {
          console.log(
            `   ✅ [${userId}] "${userName}" <${userEmail}> — sent (ID: ${sendResult?.id || "n/a"})`
          );
          totalSent++;
        }
      } catch (err) {
        console.error(
          `   ❌ [${userId}] "${userName}" <${userEmail}> — exception:`,
          err.message
        );
        totalFailed++;
      }
    }
  }

  // 4. Summary
  console.log("\n========================================");
  console.log("📊 Summary:");
  console.log(`   ✅ Sent:    ${totalSent}`);
  console.log(`   ❌ Failed:  ${totalFailed}`);
  console.log(`   ⏭️  Skipped: ${totalSkipped}`);
  console.log("========================================\n");

  // Exit with error code if any failures
  if (totalFailed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("💥 Unhandled error:", err);
  process.exit(1);
});
