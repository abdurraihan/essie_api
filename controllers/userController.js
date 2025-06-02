
import User from '../models/User.js';
import transporter from '../config/mailer.js';



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
                background: #E3F2FD; /* subtle light blue */
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
                background: #FCE4EC;  /* soft pastel pink */
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

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: process.env.BUSINESS_EMAIL,
      subject: 'New Contact Submission',
      html: htmlContent,
    });

    res.status(200).json({ message: 'User saved and email sent to business.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



export const submitLikes = async (req, res) => {
  try {
    const { email, likedPolishes } = req.body;

    const user = await User.findOneAndUpdate(
      { email },
      { likedPolishes },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'Liked polishes saved successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};




export const sendLikedPolishesEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.likedPolishes || user.likedPolishes.length === 0) {
      return res.status(400).json({ message: 'No liked polishes found to send.' });
    }

    const polishListHTML = user.likedPolishes.map(p => `
      <li style="margin-bottom: 24px; font-size: 16px; list-style: none; display: flex; align-items: center;">
        <span style="display:inline-block; width: 24px; height: 24px; background-color:${p.hex}; border-radius:50%; margin-right: 16px; flex-shrink: 0;"></span>
        <div>
          <strong style="display:block; font-size:18px; margin-bottom:4px;">${p.name}</strong>
          <p style="margin:0; font-size:14px; color:#555;">${p.description}</p>
        </div>
      </li>
    `).join('');

    const polishListText = user.likedPolishes.map(
      p => `${p.name}: ${p.description} (${p.hex})`
    ).join('\n');

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Essie Shades</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, sans-serif; background:#FCE9F9;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#FCE9F9" style="background-repeat: no-repeat; background-position: center top;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#FFFFFF" style="border-radius: 16px; box-shadow: 0 6px 15px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 30px 20px; text-align: center;">
              <h1 style="font-family: 'Arial Black', Arial, sans-serif; font-weight: 900; font-size: 48px; margin: 0; letter-spacing: -0.02em;">essie</h1>
              <hr style="width: 80px; border: 2px solid #000000; margin: 12px auto 30px;" />
              <h2 style="font-size: 32px; font-weight: 900; margin: 0 0 20px; line-height: 1.2;">shade snatched</h2>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 20px;">
              <ul style="padding: 0; margin: 0;">
                ${polishListHTML}
              </ul>
          
  </table>
</body>
</html>
    `;

    const textContent = `
Hey ${user.name},

Here are your selected Essie shades:

${polishListText}

You are receiving this email because you liked some polishes on our site.
If this wasn't you, please ignore this message or unsubscribe.
    `;

    await transporter.sendMail({
      from: `"Essie Polish Bot" <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'Your Favorite Essie Shades 💅',
      text: textContent,
      html: htmlContent,
      headers: {
        'X-Mailer': 'Nodemailer',
      }
    });

    res.status(200).json({ message: 'Liked polishes email sent to user.' });
  } catch (err) {
    console.error('Email sending failed:', err);
    res.status(500).json({ error: err.message });
  }
};


export const getLikes = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ likedPolishes: user.likedPolishes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

