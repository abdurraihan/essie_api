
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

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: process.env.BUSINESS_EMAIL,
      subject: 'New User Submission',
      html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p>`,
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

    const polishListHTML = user.likedPolishes.map(
      p =>
        `<li><strong>${p.name}</strong>: ${p.description} (<span style="color:${p.hex};">${p.hex}</span>)</li>`
    ).join('');

    const polishListText = user.likedPolishes.map(
      p => `${p.name}: ${p.description} (${p.hex})`
    ).join('\n');

    const htmlContent = `
      <p>Hey ${user.name},</p>
      <p>Here are your selected Essie shades:</p>
      <ul>${polishListHTML}</ul>
      <p style="font-size: 12px; color: gray;">
        You are receiving this email because you liked some polishes on our site.<br/>
        If this wasn't you, please ignore this message or <a href="#">unsubscribe</a>.
      </p>
    `;

    const textContent = `
Hey ${user.name},

Here are your selected Essie shades:

${polishListText}

You are receiving this email because you liked some polishes on our site.
If this wasn't you, please ignore this message or unsubscribe.
`;

    await transporter.sendMail({
      from: `"Essie Polish Bot" <${process.env.MAIL_USER}>`, // ✅ Use friendly name
      to: email,
      subject: 'Your Favorite Essie Shades 💅',
      text: textContent, // ✅ Plain text version
      html: htmlContent, // ✅ HTML version
      headers: {
        'X-Mailer': 'Nodemailer', // ✅ Helpful header
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

