export function buildEmailHtml({
  style = "branded",
  headline = "",
  subheadline = "",
  greeting = "Dear {{FIRST_NAME}},",
  bodyParagraphs = [],
  ctaText = "Register Now",
  ctaUrl = "",
  eventDate = "",
  eventTime = "",
  location = "",
  orgName = "evara",
  headerImageUrl = null,
  bodyImageUrl = null,
  footerImageUrl = null,
  psLine = "",
}) {
  const themes = {
    minimal: {
      headerBg: "#F8F8F6",
      headerColor: "#1A1A18",
      headerSubColor: "#777777",
      accentColor: "#1A1A18",
      chipBg: "transparent",
      chipColor: "#999999",
      showChip: false,
      orgColor: "#999999",
    },
    branded: {
      headerBg: "#1E3A5F",
      headerColor: "#FFFFFF",
      headerSubColor: "rgba(255,255,255,0.75)",
      accentColor: "#1E3A5F",
      chipBg: "rgba(79,195,247,0.18)",
      chipColor: "#4FC3F7",
      showChip: true,
      orgColor: "rgba(255,255,255,0.7)",
    },
    vibrant: {
      headerBg: "#FF5C35",
      headerColor: "#FFFFFF",
      headerSubColor: "rgba(255,255,255,0.88)",
      accentColor: "#FF5C35",
      chipBg: "rgba(0,0,0,0.12)",
      chipColor: "#FFFFFF",
      showChip: true,
      orgColor: "rgba(255,255,255,0.7)",
    },
  };
  const t = themes[style] || themes.branded;

  const headerSection = headerImageUrl
    ? `<img src="${headerImageUrl}" width="600" alt="" style="display:block;width:100%;max-width:600px;height:auto;border:0;">`
    : `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${t.headerBg}">
        <tr><td style="padding:36px 40px 32px;">
          <p style="margin:0 0 22px;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:${t.orgColor};font-family:Arial,Helvetica,sans-serif;">${orgName}</p>
          ${t.showChip ? `<p style="margin:0 0 14px;"><span style="display:inline-block;background:${t.chipBg};color:${t.chipColor};font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:5px 14px;border-radius:20px;font-family:Arial,Helvetica,sans-serif;">You're Invited</span></p>` : ""}
          <h1 style="margin:0;font-size:30px;font-weight:700;line-height:1.15;color:${t.headerColor};letter-spacing:-0.5px;font-family:Arial,Helvetica,sans-serif;">${headline}</h1>
          ${subheadline ? `<p style="margin:10px 0 0;font-size:15px;color:${t.headerSubColor};line-height:1.6;font-family:Arial,Helvetica,sans-serif;">${subheadline}</p>` : ""}
          ${eventDate || location ? `<table cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;"><tr>
            ${eventDate ? `<td style="font-size:12px;color:${t.headerSubColor};font-family:Arial,Helvetica,sans-serif;padding-right:20px;">&#128197;&nbsp;${eventDate}${eventTime ? " &middot; " + eventTime : ""}</td>` : ""}
            ${location ? `<td style="font-size:12px;color:${t.headerSubColor};font-family:Arial,Helvetica,sans-serif;">&#128205;&nbsp;${location}</td>` : ""}
          </tr></table>` : ""}
        </td></tr>
      </table>`;

  const bodyHtml = bodyParagraphs
    .filter(Boolean)
    .map(p => `<p style="margin:0 0 18px;font-size:15px;color:#444444;line-height:1.8;font-family:Arial,Helvetica,sans-serif;">${p}</p>`)
    .join("");

  const detailsCard = (eventDate || eventTime || location)
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 28px;background:#F8F8F8;border-radius:6px;border-left:3px solid ${t.accentColor};">
        <tr><td style="padding:18px 22px;">
          <p style="margin:0 0 12px;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${t.accentColor};font-family:Arial,Helvetica,sans-serif;">Event Details</p>
          <table cellpadding="0" cellspacing="4" border="0" style="width:100%;">
            ${eventDate ? `<tr><td style="font-size:12px;color:#999999;font-family:Arial,Helvetica,sans-serif;width:70px;padding:3px 0;">Date</td><td style="font-size:13px;color:#111111;font-weight:600;font-family:Arial,Helvetica,sans-serif;padding:3px 0;">${eventDate}</td></tr>` : ""}
            ${eventTime ? `<tr><td style="font-size:12px;color:#999999;font-family:Arial,Helvetica,sans-serif;padding:3px 0;">Time</td><td style="font-size:13px;color:#111111;font-weight:600;font-family:Arial,Helvetica,sans-serif;padding:3px 0;">${eventTime}</td></tr>` : ""}
            ${location ? `<tr><td style="font-size:12px;color:#999999;font-family:Arial,Helvetica,sans-serif;padding:3px 0;">Venue</td><td style="font-size:13px;color:#111111;font-weight:600;font-family:Arial,Helvetica,sans-serif;padding:3px 0;">${location}</td></tr>` : ""}
          </table>
        </td></tr>
      </table>`
    : "";

  const ctaSection = ctaUrl
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 32px;">
        <tr><td align="center">
          <table cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="center" bgcolor="${t.accentColor}" style="border-radius:6px;mso-padding-alt:14px 40px;">
                <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${ctaUrl}" style="height:48px;v-text-anchor:middle;width:220px;" arcsize="12%" strokecolor="${t.accentColor}" fillcolor="${t.accentColor}"><w:anchorlock/><center style="color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:600;">${ctaText}</center></v:roundrect><![endif]-->
                <!--[if !mso]><!--><a href="${ctaUrl}" style="display:inline-block;padding:14px 40px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;letter-spacing:0.3px;font-family:Arial,Helvetica,sans-serif;mso-hide:all;">${ctaText}</a><!--<![endif]-->
              </td>
            </tr>
          </table>
        </td></tr>
      </table>`
    : "";

  const bodyImageSection = bodyImageUrl
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;"><tr><td><img src="${bodyImageUrl}" width="100%" alt="" style="display:block;width:100%;border-radius:6px;border:0;"></td></tr></table>`
    : "";

  const footerImageSection = footerImageUrl
    ? `<tr><td style="padding:0;"><img src="${footerImageUrl}" width="600" alt="" style="display:block;width:100%;max-width:600px;border:0;"></td></tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<!--[if !mso]><!-->
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<!--<![endif]-->
<!--[if mso]>
<noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
<![endif]-->
<title>Email</title>
</head>
<body style="margin:0;padding:0;background-color:#EBEBEB;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;word-break:break-word;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#EBEBEB">
<tr><td align="center" style="padding:24px 12px;">

  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.09);">

    <!-- HEADER -->
    <tr><td style="padding:0;line-height:0;">${headerSection}</td></tr>

    <!-- BODY -->
    <tr><td style="padding:32px 40px 16px;">
      ${greeting ? `<p style="margin:0 0 22px;font-size:16px;color:#111111;font-weight:500;font-family:Arial,Helvetica,sans-serif;">${greeting}</p>` : ""}
      ${bodyHtml}
    </td></tr>

    <!-- EVENT DETAILS CARD -->
    ${detailsCard ? `<tr><td style="padding:0 40px;">${detailsCard}</td></tr>` : ""}

    <!-- BODY IMAGE -->
    ${bodyImageSection ? `<tr><td style="padding:0 40px 24px;">${bodyImageSection}</td></tr>` : ""}

    <!-- CTA BUTTON -->
    ${ctaSection ? `<tr><td style="padding:0 40px;">${ctaSection}</td></tr>` : ""}

    <!-- PS LINE -->
    ${psLine ? `<tr><td style="padding:0 40px 28px;"><p style="margin:0;font-size:13px;color:#AAAAAA;font-style:italic;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">${psLine}</p></td></tr>` : ""}

    <!-- FOOTER IMAGE -->
    ${footerImageSection}

    <!-- FOOTER -->
    <tr><td bgcolor="#F8F8F8" style="padding:22px 40px;border-top:1px solid #EEEEEE;text-align:center;">
      <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#AAAAAA;font-family:Arial,Helvetica,sans-serif;">${orgName}</p>
      <p style="margin:0;font-size:11px;color:#CCCCCC;font-family:Arial,Helvetica,sans-serif;">
        <a href="#" style="color:#CCCCCC;text-decoration:underline;font-family:Arial,Helvetica,sans-serif;">Unsubscribe</a>
        &nbsp;&middot;&nbsp;
        <a href="#" style="color:#CCCCCC;text-decoration:underline;font-family:Arial,Helvetica,sans-serif;">View in browser</a>
        &nbsp;&middot;&nbsp;
        <a href="#" style="color:#CCCCCC;text-decoration:underline;font-family:Arial,Helvetica,sans-serif;">Privacy Policy</a>
      </p>
    </td></tr>

  </table>

</td></tr>
</table>
</body>
</html>`;
}

// ─── IMAGE UPLOAD ZONE ───────────────────────────────────────