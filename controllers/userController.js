import { sendEmail } from "../config/mailer.js";
import User from "../models/User.js";

export const submitContact = async (req, res) => {
  try {
    const { name, email } = req.body;

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ name, email, likedPolishes: [] });
      await user.save();
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>New Contact Submission</title>
</head>
<body style="margin:0; padding:0; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background:#F9F9F9;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#F9F9F9" style="padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#FFFFFF" style="border-radius: 16px; box-shadow: 0 8px 25px rgba(0,0,0,0.1); padding: 40px;">
          <tr>
            <td style="text-align: center;">
              <h1 style="font-size: 32px; font-weight: 700; margin: 0 0 15px; color: #1A1A1A;">New Contact Submission</h1>
              <hr style="width: 70px; border: 2px solid #1A1A1A; margin: 20px auto 35px;" />
            </td>
          </tr>
          <tr>
            <td style="font-size: 16px; color: #333;">
              <p style="
                margin-bottom: 20px;
                font-size: 18px;
                font-weight: 600;
                color: #1A1A1A;
                background: #E3F2FD;
                padding: 12px 18px;
                border-radius: 12px;
                display: inline-block;
                box-shadow: 0 2px 8px rgba(227, 242, 253, 0.5);
                max-width: fit-content;
              ">
                <strong style="color: #0D47A1; margin-right: 8px;">Name:</strong> ${name}
              </p>
              <p style="
                margin-bottom: 30px;
                font-size: 18px;
                font-weight: 600;
                color: #1A1A1A;
                background: #FCE4EC;
                padding: 12px 18px;
                border-radius: 12px;
                display: inline-block;
                box-shadow: 0 2px 8px rgba(252, 228, 236, 0.6);
                max-width: fit-content;
              ">
                <strong style="color: #880E4F; margin-right: 8px;">Email:</strong> ${email}
              </p>
            </td>
          </tr>
          <tr>
            <td align="center">
              <a href="mailto:${email}" style="
                display: inline-block;
                padding: 14px 28px;
                background-color: #1976D2;
                color: #fff;
                text-decoration: none;
                font-weight: 700;
                border-radius: 8px;
                box-shadow: 0 6px 18px rgba(25, 118, 210, 0.4);
                transition: background-color 0.3s ease;
              " onmouseover="this.style.backgroundColor='#1565C0'" onmouseout="this.style.backgroundColor='#1976D2'">
                Reply to Contact
              </a>
            </td>
          </tr>
          <tr>
            <td style="text-align: center; font-size: 13px; color: #999; padding-top: 40px;">
              This message was sent via the Essie contact form.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    await sendEmail({
      to: process.env.BUSINESS_EMAIL,
      subject: "New Contact Submission",
      html: htmlContent,
    });

    res.status(200).json({ message: "User saved and email sent to business." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const likePostAndSendMail = async (req, res) => {
  try {
    const { email, likedPolishes } = req.body;

    const user = await User.findOneAndUpdate(
      { email },
      { likedPolishes },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });
    if (!likedPolishes || likedPolishes.length === 0) {
      return res.status(400).json({ message: "No liked polishes provided." });
    }

    // Prepare polish list HTML with Figma styling
    const polishListHTML = likedPolishes
      .map(
        (p) => `
      <li style="margin-bottom: 24px; font-size: 16px; list-style: none; display: flex; align-items: center;">
        <span style="display:inline-block; width: 24px; height: 24px; background-color:${p.hex}; border-radius:50%; margin-right: 16px; flex-shrink: 0;"></span>
        <div>
          <strong style="
            display: block;
            font-family: 'Poppins', Arial, sans-serif;
            font-weight: 600;
            font-size: 20px;
            line-height: 25px;
            letter-spacing: 0;
            margin-bottom: 4px;
            color: #000000;
          ">${p.name}</strong>
          <p style="margin:0; font-size:14px; color:#555;">${p.description}</p>
        </div>
      </li>
    `
      )
      .join("");

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Essie Shades</title>
  <!-- Poppins font for supported clients -->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600&display=swap');
  </style>
</head>
<body style="margin:0; padding:0; font-family: Arial, sans-serif; background:#FCE9F9;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#FCE9F9">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#FFFFFF" style="border-radius: 16px; box-shadow: 0 6px 15px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 30px 20px; text-align: center;">
              <h1 style="font-family: 'Arial Black', Arial, sans-serif; font-weight: 900; font-size: 48px; margin: 0;">essie</h1>
              <hr style="width: 80px; border: 2px solid #000000; margin: 12px auto 30px;" />
              <h2 style="font-size: 32px; font-weight: 900; margin: 0 0 20px;">shade snatched</h2>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 20px;">
              <ul style="padding: 0; margin: 0;">
                ${polishListHTML}
              </ul>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Send email using your existing SendGrid wrapper
    await sendEmail({
      to: email,
      subject: "Thanks for Liking Essie Shades 💅",
      html: htmlContent,
    });

    res.status(200).json({ message: "Polishes updated and email sent." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Extra

export const submitLikes = async (req, res) => {
  try {
    const { email, likedPolishes } = req.body;

    const user = await User.findOneAndUpdate(
      { email },
      { likedPolishes },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "Liked polishes saved successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const sendLikedPolishesEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.likedPolishes || user.likedPolishes.length === 0) {
      return res
        .status(400)
        .json({ message: "No liked polishes found to send." });
    }

    const polishListHTML = user.likedPolishes
      .map(
        (p) => `
      <li>
        <span style="background:${p.hex};width:24px;height:24px;display:inline-block;border-radius:50%;margin-right:8px;"></span>
        <strong>${p.name}</strong> - ${p.description}
      </li>
    `
      )
      .join("");

    const htmlContent = `
      <h2>Your Favorite Essie Shades 💅</h2>
      <ul>${polishListHTML}</ul>
    `;

    const textContent = user.likedPolishes
      .map((p) => `${p.name}: ${p.description} (${p.hex})`)
      .join("\n");

    await sendEmail({
      to: email,
      subject: "Your Favorite Essie Shades 💅",
      html: htmlContent,
    });

    res.status(200).json({ message: "Liked polishes email sent to user." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getLikes = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ likedPolishes: user.likedPolishes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
