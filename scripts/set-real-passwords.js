// Corrige la faille d'authentification: remplace les passwordHash factices
// ('$argon2id$...dummyhashdemo2026' / '...silexdemo2026hash') par de vrais
// hachages Argon2id calculés à partir de mots de passe définis ci-dessous.
// À exécuter une seule fois contre la base cible (Neon production ou locale).
const { PrismaClient } = require('../apps/web/node_modules/@prisma/client');
const argon2 = require('../apps/web/node_modules/argon2');

const neonUrl = "postgresql://neondb_owner:npg_mkEtYFN6HKr0@ep-solitary-sun-be7s53de.c-9.us-east-2.aws.neon.tech/neondb?sslmode=require";
const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL || neonUrl } },
});

// Mot de passe temporaire unique par compte pour la période d'essai.
// À communiquer uniquement de façon sécurisée et à faire changer par chaque
// utilisateur dès sa première connexion.
const passwords = {
  'a.benali@silex-services.dz': 'Silex-DG-2026!',
  'k.mansouri@silex-services.dz': 'Silex-RP-2026!',
  's.belkacem@silex-services.dz': 'Silex-RP-2026!',
  'f.brahimi@silex-services.dz': 'Silex-RH-2026!',
  't.meziani@silex-services.dz': 'Silex-ACH-2026!',
  'r.bouzid@silex-services.dz': 'Silex-FIN-2026!',
  's.haddad@silex-services.dz': 'Silex-QHSE-2026!',
  'y.khelifi@silex-services.dz': 'Silex-MAG-2026!',
  'n.chaib@silex-services.dz': 'Silex-COM-2026!',
  'admin@silex-services.dz': 'Silex-Admin-2026!',
  // Comptes "génériques" hérités d'une ancienne génération de seed, en doublon
  // des comptes nominaux ci-dessus pour le même rôle. Toujours réels en base
  // et actifs : on leur donne aussi un vrai mot de passe pour qu'ils ne
  // restent pas silencieusement verrouillés, mais le client devrait décider
  // s'il veut les désactiver pour éviter la confusion avec les comptes nominaux.
  'dg@silex-services.dz': 'Silex-DG2-2026!',
  'projets@silex-services.dz': 'Silex-RP2-2026!',
  'achats@silex-services.dz': 'Silex-ACH2-2026!',
  'magasin@silex-services.dz': 'Silex-MAG2-2026!',
  'finance@silex-services.dz': 'Silex-FIN2-2026!',
  'rh@silex-services.dz': 'Silex-RH2-2026!',
  'maintenance@silex-services.dz': 'Silex-MAINT2-2026!',
  'm.zitouni@silex-services.dz': 'Silex-MAINT3-2026!',
  'qualite@silex-services.dz': 'Silex-QHSE2-2026!',
};

async function main() {
  const results = [];
  for (const [email, password] of Object.entries(passwords)) {
    const passwordHash = await argon2.hash(password);
    const res = await prisma.user.updateMany({
      where: { email },
      data: { passwordHash },
    });
    results.push({ email, matched: res.count, password });
  }
  console.log('Mise à jour des mots de passe réels (Argon2id) :');
  for (const r of results) {
    console.log(`  ${r.matched ? 'OK ' : 'ABSENT '} ${r.email} -> ${r.password}`);
  }
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('Erreur:', err);
  await prisma.$disconnect();
  process.exit(1);
});
