import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false, // true si port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Liste d'anecdotes statiques sur l'Eurovision
const EUROVISION_ANECDOTES = [
  "Le concours Eurovision de la chanson a été créé en 1956 et est l'un des plus anciens concours télévisés au monde.",
  "ABBA, le célèbre groupe suédois, a gagné l'Eurovision en 1974 avec la chanson 'Waterloo'.",
  "La France a remporté l'Eurovision cinq fois, la dernière victoire datant de 1977.",
  "L'Irlande détient le record du plus grand nombre de victoires à l'Eurovision, avec sept titres.",
  "Le concours a inspiré de nombreux artistes internationaux à lancer leur carrière musicale.",
];

function getRandomAnecdote(): string {
  const idx = Math.floor(Math.random() * EUROVISION_ANECDOTES.length);
  return EUROVISION_ANECDOTES[idx];
}

export async function sendWelcomeEmail(to: string, displayName: string) {
  console.log('Sending email to:', to);

  let anecdote = '';
  if (process.env.AI_FEATURES_ENABLED === 'true') {
    try {
      // Dynamically import OpenAI and fetch anecdote
      const { OpenAI } = await import('openai');
      const openai = new OpenAI({
        apiKey: process.env.OPEN_ROUTER_API_KEY,
        baseURL: process.env.OPEN_ROUTER_API_URL,
        defaultHeaders: {
          'HTTP-Referer': 'https://eurogamble.paqueriaud.fr',
          'X-Title': 'EuroGamble',
        },
      });
      const prompt = `Raconte une anecdote intéressante sur l'Eurovision. Elle sera intégrée dans un mail après l'inscription d'une personne à un site internet de jeu autours de l'eurovision. Tu ne dois répondre que par l’anecdote. Elle doit être en texte plein, pas de formatage particulier, pas de markdown.`;
      const response = await openai.chat.completions.create({
        model: process.env.OPEN_ROUTER_MODEL || 'google/gemma-3-4b-it',
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 200,
        temperature: 0.8,
      });
      anecdote = response.choices[0].message.content?.trim() || '';
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'anecdote:', error);
      anecdote = getRandomAnecdote();
    }
  } else {
    anecdote = getRandomAnecdote();
  }

  await transporter.sendMail({
    from: '"EuroGamble" <noreply@paqueriaud.fr>',
    to,
    subject: 'Bienvenue sur EuroGamble !',
    text: `Bonjour ${displayName},\n\nMerci de t'être inscrit sur notre application ! 🎤\n\nUne petite anecdote sur l'Eurovision rien que pour toi :\n\n${anecdote}\n\nÀ ton avis, cette anecdote est-elle vraie ou fausse ? (Attention, elle a peut-être été inventée par une IA, donc elle est très probablement fausse... mais qui sait ? 🤖😉)`,
    html: `<p>Bonjour <strong>${displayName}</strong>,</p><p>Merci de t'être inscrit sur notre application EuroGamble ! 🎤</p><p><strong>Une petite anecdote sur l'Eurovision rien que pour toi :</strong><br><br>${anecdote}</p><p>À ton avis, cette anecdote est-elle <b>vraie</b> ou <b>fausse</b> ? <i>(Attention, elle a peut-être été inventée par une IA, donc elle est très probablement fausse... mais qui sait ? 🤖😉)</i></p>`,
  }).then(() => {
    console.log('Email sent successfully');
  }).catch((error) => {
    console.error('Error sending email:', error);
  });
}
