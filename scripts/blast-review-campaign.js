const admin = require("firebase-admin");
const { Resend } = require("resend");

// ─── Configuration ───────────────────────────────────────────────────────────

const RESEND_FROM = "Sikasir Laundry <admin@sikasirlaundry.web.id>";
const PLAYSTORE_URL =
    "https://play.google.com/store/apps/details?id=com.sikasir.laundry.sikasirlaundry";
const WHATSAPP_CS_URL = "https://wa.me/6285144907717";
const BRAND_COLOR = "#0a57a2";

// ─── Email Template ──────────────────────────────────────────────────────────

function buildReviewEmailHTML(userName) {
    const firstName = userName.split(" ")[0];

    return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dapatkan FREE 1 Bulan - Sikasir Laundry</title>
</head>
<body style="margin:0;padding:0;background-color:#eef2f7;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#eef2f7;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(10,87,162,0.12);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background:linear-gradient(135deg, ${BRAND_COLOR} 0%, #1e7dd9 50%, #3b93f0 100%);padding:40px 32px;text-align:center;">
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
                    <p style="margin:0 0 8px;font-size:40px;line-height:1;">&#11088;</p>
                    <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;line-height:1.3;">
                      Kasih Review,<br>Dapat FREE 1 Bulan!
                    </h1>
                    <p style="margin:12px 0 0;color:rgba(255,255,255,0.9);font-size:15px;font-weight:400;">
                      Apresiasi dari kami untuk pengguna setia Sikasir Laundry
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Gift Card -->
          <tr>
            <td style="padding:0 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:-28px;">
                <tr>
                  <td style="background-color:#ffffff;border-radius:16px;padding:24px;text-align:center;box-shadow:0 6px 24px rgba(0,0,0,0.12);">
                    <p style="margin:0 0 8px;font-size:12px;color:#ffffff;text-transform:uppercase;letter-spacing:2px;font-weight:700;">
                      <span style="background-color:#10b981;padding:4px 14px;border-radius:20px;">
                        PROMO SPESIAL
                      </span>
                    </p>
                    <p style="margin:12px 0 0;font-size:15px;color:#64748b;font-weight:500;">
                      Anda mendapatkan
                    </p>
                    <p style="margin:4px 0;font-size:32px;color:${BRAND_COLOR};font-weight:900;line-height:1.2;">
                      FREE 1 BULAN
                    </p>
                    <p style="margin:0;font-size:14px;color:#64748b;">
                      pemakaian Sikasir Laundry
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
              <p style="margin:0 0 16px;font-size:16px;color:#1e293b;line-height:1.7;">
                Terima kasih sudah menggunakan <strong style="color:${BRAND_COLOR};">Sikasir Laundry</strong> untuk mengelola bisnis laundry Anda! Kami ingin mengajak Anda memberikan review di Play Store.
              </p>
              <p style="margin:0 0 24px;font-size:16px;color:#1e293b;line-height:1.7;">
                Sebagai apresiasi, Anda akan mendapatkan <strong style="color:#10b981;">gratis 1 bulan pemakaian</strong> setelah memberikan review.
              </p>
            </td>
          </tr>

          <!-- Steps Section -->
          <tr>
            <td style="padding:0 32px 24px;">
              <p style="margin:0 0 16px;font-size:14px;color:#64748b;text-transform:uppercase;letter-spacing:1px;font-weight:700;">
                Caranya mudah:
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:12px 16px;background-color:#f0f9ff;border-radius:10px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="36" valign="top" style="padding-right:12px;">
                          <span style="display:inline-block;background-color:${BRAND_COLOR};color:#ffffff;font-size:14px;font-weight:700;width:28px;height:28px;line-height:28px;text-align:center;border-radius:50%;">1</span>
                        </td>
                        <td style="font-size:15px;color:#1e293b;line-height:1.6;">
                          Buka <strong>Sikasir Laundry</strong> di Play Store
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
                <tr>
                  <td style="padding:12px 16px;background-color:#f0f9ff;border-radius:10px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="36" valign="top" style="padding-right:12px;">
                          <span style="display:inline-block;background-color:${BRAND_COLOR};color:#ffffff;font-size:14px;font-weight:700;width:28px;height:28px;line-height:28px;text-align:center;border-radius:50%;">2</span>
                        </td>
                        <td style="font-size:15px;color:#1e293b;line-height:1.6;">
                          Berikan <strong>rating bintang 5</strong> dan tulis review pengalaman Anda
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
                <tr>
                  <td style="padding:12px 16px;background-color:#f0f9ff;border-radius:10px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="36" valign="top" style="padding-right:12px;">
                          <span style="display:inline-block;background-color:${BRAND_COLOR};color:#ffffff;font-size:14px;font-weight:700;width:28px;height:28px;line-height:28px;text-align:center;border-radius:50%;">3</span>
                        </td>
                        <td style="font-size:15px;color:#1e293b;line-height:1.6;">
                          Screenshot review Anda dan kirim ke <strong>WhatsApp CS</strong> kami
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
                <tr>
                  <td style="padding:12px 16px;background-color:#ecfdf5;border-radius:10px;border-left:4px solid #10b981;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="36" valign="top" style="padding-right:12px;">
                          <span style="font-size:22px;">&#127881;</span>
                        </td>
                        <td style="font-size:15px;color:#1e293b;line-height:1.6;">
                          <strong style="color:#10b981;">FREE 1 bulan</strong> akan langsung ditambahkan ke akun Anda!
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
                  <td style="background:linear-gradient(135deg, #f59e0b 0%, #f97316 100%);border-radius:10px;box-shadow:0 4px 16px rgba(245,158,11,0.4);">
                    <a href="${PLAYSTORE_URL}" target="_blank" 
                       style="display:inline-block;color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;padding:16px 40px;letter-spacing:0.5px;">
                      Beri Review Sekarang &#9733;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:16px 32px 28px;">
              <a href="${WHATSAPP_CS_URL}" target="_blank" 
                 style="display:inline-block;background-color:#25d366;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 32px;border-radius:8px;">
                Kirim Screenshot Review via WhatsApp
              </a>
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

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;padding:24px 32px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0 0 8px;font-size:13px;color:#64748b;line-height:1.5;">
                Promo ini berlaku untuk semua pengguna <strong>Sikasir Laundry</strong>.
              </p>
              <p style="margin:0 0 12px;font-size:12px;color:#94a3b8;line-height:1.5;">
                Satu review per akun. FREE 1 bulan akan ditambahkan setelah verifikasi screenshot.
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
    console.log("=== Sikasir Laundry — Blast Email Review Campaign ===\n");

    // 1. Init Firebase
    const serviceAccountJSON = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountJSON) {
        console.error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.");
        process.exit(1);
    }

    let serviceAccount;
    try {
        serviceAccount = JSON.parse(serviceAccountJSON);
    } catch (err) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", err.message);
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
        console.error("RESEND_API_KEY environment variable is not set.");
        process.exit(1);
    }

    const resend = new Resend(resendApiKey);

    // 3. Get all users with email
    console.log("Fetching all users from Firestore...\n");

    let snapshot;
    try {
        snapshot = await db.collection("users").get();
    } catch (err) {
        console.error("Firestore query failed:", err.message);
        process.exit(1);
    }

    if (snapshot.empty) {
        console.log("No users found in Firestore.");
        return;
    }

    console.log(`Total users in Firestore: ${snapshot.size}\n`);

    // 4. Send emails
    let totalSent = 0;
    let totalFailed = 0;
    let totalSkipped = 0;
    const subject = "Kasih Review, Dapat FREE 1 Bulan Pemakaian Sikasir Laundry!";

    for (const doc of snapshot.docs) {
        const data = doc.data();
        const userId = doc.id;
        const userName = data.name || "Pengguna";
        const userEmail = data.email;

        // Skip users without email
        if (!userEmail) {
            console.log(`   [${userId}] "${userName}" — no email, skipped.`);
            totalSkipped++;
            continue;
        }

        const html = buildReviewEmailHTML(userName);

        try {
            const { data: sendResult, error } = await resend.emails.send({
                from: RESEND_FROM,
                to: [userEmail],
                subject: subject,
                html: html,
            });

            if (error) {
                console.error(
                    `   [${userId}] "${userName}" <${userEmail}> — Resend error:`,
                    error.message
                );
                totalFailed++;
            } else {
                console.log(
                    `   [${userId}] "${userName}" <${userEmail}> — sent (ID: ${sendResult?.id || "n/a"})`
                );
                totalSent++;
            }
        } catch (err) {
            console.error(
                `   [${userId}] "${userName}" <${userEmail}> — exception:`,
                err.message
            );
            totalFailed++;
        }

        // Delay to avoid Resend rate limit (max 2 req/sec)
        await new Promise((resolve) => setTimeout(resolve, 600));
    }

    // 5. Summary
    console.log("\n========================================");
    console.log("Summary:");
    console.log(`   Sent:    ${totalSent}`);
    console.log(`   Failed:  ${totalFailed}`);
    console.log(`   Skipped: ${totalSkipped}`);
    console.log("========================================\n");

    if (totalFailed > 0) {
        process.exit(1);
    }
}

main().catch((err) => {
    console.error("Unhandled error:", err);
    process.exit(1);
});
