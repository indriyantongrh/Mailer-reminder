const admin = require("firebase-admin");
const { Resend } = require("resend");

// ─── Configuration ───────────────────────────────────────────────────────────

const RESEND_FROM = "Sikasir Laundry <admin@sikasirlaundry.web.id>";
const CTA_URL =
  "https://play.google.com/store/apps/details?id=com.sikasir.laundry.sikasirlaundry";
const WHATSAPP_CS_URL = "https://wa.me/6285144907717";
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
      return `${daysLeft} Hari Lagi Langganan Anda Berakhir - Jangan Sampai Terputus!`;
    case "urgent":
      return `Tinggal ${daysLeft} Hari! Perpanjang Langganan Sikasir Laundry Anda`;
    case "critical":
      return `BESOK Terakhir! Perpanjang Sekarang Sebelum Akses Ditutup`;
    default:
      return `Reminder Langganan Sikasir Laundry`;
  }
}

/**
 * Build professional HTML email body.
 */
function buildEmailHTML(userName, daysLeft, expiryDate, tier) {
  const formattedDate = formatTanggalIndonesia(expiryDate);
  const firstName = userName.split(" ")[0];

  const greetingText =
    daysLeft === 1
      ? `Ini adalah <strong>pengingat terakhir</strong> sebelum langganan Anda berakhir <strong>besok</strong>.`
      : `Langganan Sikasir Laundry Anda akan berakhir dalam <strong>${daysLeft} hari</strong>.`;

  const urgencyMessage =
    daysLeft === 1
      ? "Setelah besok, akses Anda ke seluruh fitur akan otomatis dihentikan. Perpanjang sekarang agar bisnis laundry Anda tetap berjalan lancar!"
      : daysLeft === 3
        ? "Waktu Anda semakin terbatas. Segera perpanjang agar tidak ada gangguan pada operasional laundry Anda."
        : "Kami ingin memastikan Anda tetap bisa mengelola bisnis laundry dengan mudah. Perpanjang sebelum masa aktif habis.";

  const bannerGradient =
    daysLeft === 1
      ? "background:linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #f87171 100%);"
      : daysLeft === 3
        ? "background:linear-gradient(135deg, #ea580c 0%, #f97316 50%, #fb923c 100%);"
        : "background:linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #fbbf24 100%);";

  const countdownBg =
    daysLeft === 1 ? "#fef2f2" : daysLeft === 3 ? "#fff7ed" : "#fffbeb";
  const countdownBorder =
    daysLeft === 1 ? "#fca5a5" : daysLeft === 3 ? "#fdba74" : "#fcd34d";

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reminder Langganan Sikasir Laundry</title>
</head>
<body style="margin:0;padding:0;background-color:#eef2f7;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#eef2f7;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(10,87,162,0.12);">
          
          <!-- Header Banner with Gradient -->
          <tr>
            <td style="${bannerGradient}padding:36px 32px 28px;text-align:center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:16px;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background-color:rgba(255,255,255,0.2);border-radius:12px;padding:10px 20px;">
                          <span style="color:#ffffff;font-size:18px;font-weight:800;letter-spacing:1px;">SIKASIR LAUNDRY</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;line-height:1.3;">
                      Langganan Anda Segera Berakhir
                    </h1>
                    <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:15px;font-weight:400;">
                      Jangan biarkan operasional laundry Anda terganggu
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Countdown Box -->
          <tr>
            <td style="padding:0 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:-36px;">
                <tr>
                  <td style="background-color:${countdownBg};border:2px solid ${countdownBorder};border-radius:12px;padding:20px;text-align:center;">
                    <p style="margin:0 0 4px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">
                      Sisa Waktu
                    </p>
                    <p style="margin:0 0 4px;font-size:42px;color:${tier.color};font-weight:800;line-height:1;">
                      ${daysLeft}
                    </p>
                    <p style="margin:0;font-size:14px;color:#64748b;font-weight:600;">
                      hari lagi &bull; ${formattedDate}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding:28px 32px 16px;">
              <p style="margin:0 0 16px;font-size:16px;color:#1e293b;line-height:1.7;">
                Halo <strong>${firstName}</strong>,
              </p>
              <p style="margin:0 0 12px;font-size:16px;color:#1e293b;line-height:1.7;">
                ${greetingText}
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.7;">
                ${urgencyMessage}
              </p>
            </td>
          </tr>

          <!-- Features Section -->
          <tr>
            <td style="padding:0 32px 24px;">
              <p style="margin:0 0 16px;font-size:14px;color:#64748b;text-transform:uppercase;letter-spacing:1px;font-weight:700;">
                Fitur yang akan Anda kehilangan:
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:10px 16px;background-color:#f8fafc;border-radius:8px;margin-bottom:8px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="32" valign="top" style="padding-right:12px;font-size:18px;">&#10060;</td>
                        <td style="font-size:14px;color:#334155;line-height:1.5;">
                          <strong>Pencatatan Transaksi</strong> - Input order, cetak nota, laporan harian
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
                <tr>
                  <td style="padding:10px 16px;background-color:#f8fafc;border-radius:8px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="32" valign="top" style="padding-right:12px;font-size:18px;">&#10060;</td>
                        <td style="font-size:14px;color:#334155;line-height:1.5;">
                          <strong>Manajemen Pelanggan</strong> - Data pelanggan, riwayat order, notifikasi
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
                <tr>
                  <td style="padding:10px 16px;background-color:#f8fafc;border-radius:8px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="32" valign="top" style="padding-right:12px;font-size:18px;">&#10060;</td>
                        <td style="font-size:14px;color:#334155;line-height:1.5;">
                          <strong>Laporan Keuangan</strong> - Rekap pendapatan, grafik, export data
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding:0 32px 8px;" align="center">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg, ${BRAND_COLOR} 0%, #1e7dd9 100%);border-radius:10px;box-shadow:0 4px 16px rgba(10,87,162,0.3);">
                    <a href="${CTA_URL}" target="_blank" 
                       style="display:inline-block;color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;padding:16px 48px;letter-spacing:0.5px;">
                      Perpanjang Sekarang
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:12px 32px 28px;">
              <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.5;">
                Proses perpanjangan cepat &amp; mudah melalui aplikasi
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-top:1px solid #e2e8f0;"></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Help Section -->
          <tr>
            <td style="padding:24px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#f0f9ff;border-radius:10px;padding:20px 24px;text-align:center;">
                    <p style="margin:0 0 8px;font-size:15px;color:#1e293b;font-weight:600;">
                      Butuh bantuan perpanjangan?
                    </p>
                    <p style="margin:0 0 16px;font-size:14px;color:#64748b;line-height:1.5;">
                      Tim Customer Service kami siap membantu Anda
                    </p>
                    <a href="${WHATSAPP_CS_URL}" target="_blank" 
                       style="display:inline-block;background-color:#25d366;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:10px 28px;border-radius:8px;">
                      Chat via WhatsApp
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;padding:24px 32px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0 0 8px;font-size:13px;color:#64748b;line-height:1.5;">
                Email ini dikirim otomatis oleh sistem <strong>Sikasir Laundry</strong>.
              </p>
              <p style="margin:0 0 12px;font-size:12px;color:#94a3b8;line-height:1.5;">
                Anda menerima email ini karena langganan Anda akan segera berakhir.
              </p>
              <p style="margin:0;font-size:12px;color:#cbd5e1;">
                &copy; ${new Date().getFullYear()} Sikasir Laundry &bull; Solusi Kasir Laundry Terpercaya
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

      // Delay to avoid Resend rate limit (max 2 req/sec)
      await new Promise((resolve) => setTimeout(resolve, 600));
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
