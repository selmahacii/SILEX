import { 
  PrismaClient, 
  SystemRole, 
  DepartmentCode 
} from '@prisma/client';
import * as argon2 from 'argon2';
import * as fs from 'fs';
import * as path from 'path';

let dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || '';
try {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const directMatch = envContent.match(/DIRECT_URL=["']?([^"'\r\n]+)["']?/);
    const dbMatch = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
    dbUrl = (directMatch ? directMatch[1] : (dbMatch ? dbMatch[1] : dbUrl));
  }
} catch {
  // ignore
}

dbUrl = dbUrl.replace('-pooler', '') + (dbUrl.includes('?') ? '&' : '?') + 'connect_timeout=25';

const prisma = new PrismaClient({
  datasources: { db: { url: dbUrl } }
});

async function main() {
  console.log('🚀 [SEED] Initialisation sécurisée de la plateforme SILEX SERVICES (Base Vierge)...');

  const passwordHash = await argon2.hash('Password123!');

  // 1. DÉPARTEMENTS OFFICIELS SILEX
  const departmentsData = [
    { code: DepartmentCode.DIRECTION_GENERALE, name: 'Direction Générale', description: 'Gouvernance, stratégie et pilotage exécutif' },
    { code: DepartmentCode.OPERATIONS_PROJETS, name: 'Opérations & Projets', description: 'Direction technique, conduite des chantiers et ingénierie' },
    { code: DepartmentCode.ACHATS_LOGISTIQUE, name: 'Achats & Approvisionnements', description: 'Sourcing, consultations fournisseurs et logistique chantier' },
    { code: DepartmentCode.MAGASIN_STOCKS, name: 'Magasins & Stocks', description: 'Gestion des réceptions, entreposage et sorties matériels' },
    { code: DepartmentCode.RESSOURCES_HUMAINES, name: 'Ressources Humaines', description: 'Gestion du personnel, habilitations soudage et présences' },
    { code: DepartmentCode.FINANCE_COMPTABILITE, name: 'Finance & Trésorerie', description: 'Budgets projets, facturation, trésorerie et engagements' },
    { code: DepartmentCode.PARC_MAINTENANCE, name: 'Parc Matériel & Maintenance', description: 'Disponibilité des engins, équipements de soudage et révisions' },
    { code: DepartmentCode.QHSE, name: 'Qualité, Hygiène, Sécurité & CND', description: 'Qualité, sécurité chantier, traçabilité et conformité ISO' },
    { code: DepartmentCode.INFORMATIQUE_ADMIN, name: 'Systèmes d’Information', description: 'Systèmes d’information et administration de la plateforme' },
  ];

  for (const dep of departmentsData) {
    await prisma.department.upsert({
      where: { code: dep.code },
      update: { name: dep.name, description: dep.description },
      create: dep,
    });
  }

  const deptMap = await prisma.department.findMany();
  const getDeptId = (code: DepartmentCode) => deptMap.find(d => d.code === code)?.id;

  // 2. UTILISATEURS DU SYSTÈME (Comptes officiels pour accès aux rôles)
  const usersData = [
    { id: 'usr-dg-001', email: 'dg@silex-services.dz', name: 'Amine Benali', title: 'Directeur Général', role: SystemRole.DIRECTEUR_GENERAL, deptCode: DepartmentCode.DIRECTION_GENERALE },
    { id: 'usr-dg-002', email: 'a.benali@silex-services.dz', name: 'Amine Benali', title: 'Directeur Général', role: SystemRole.DIRECTEUR_GENERAL, deptCode: DepartmentCode.DIRECTION_GENERALE },
    { id: 'usr-com-001', email: 'commercial@silex-services.dz', name: 'Yacine Hamidi', title: 'Responsable Commercial & Devis', role: SystemRole.RESPONSABLE_PROJET, deptCode: DepartmentCode.DIRECTION_GENERALE },
    { id: 'usr-rp-001', email: 'projets@silex-services.dz', name: 'Karim Mansouri', title: 'Directeur des Opérations & Chantiers', role: SystemRole.RESPONSABLE_PROJET, deptCode: DepartmentCode.OPERATIONS_PROJETS },
    { id: 'usr-rp-002', email: 'k.mansouri@silex-services.dz', name: 'Karim Mansouri', title: 'Directeur des Opérations & Chantiers', role: SystemRole.RESPONSABLE_PROJET, deptCode: DepartmentCode.OPERATIONS_PROJETS },
    { id: 'usr-ach-001', email: 'achats@silex-services.dz', name: 'Farouk Brahimi', title: 'Responsable Achats & Logistique', role: SystemRole.RESPONSABLE_ACHATS, deptCode: DepartmentCode.ACHATS_LOGISTIQUE },
    { id: 'usr-ach-002', email: 'f.brahimi@silex-services.dz', name: 'Farouk Brahimi', title: 'Responsable Achats & Logistique', role: SystemRole.RESPONSABLE_ACHATS, deptCode: DepartmentCode.ACHATS_LOGISTIQUE },
    { id: 'usr-rh-001', email: 'rh@silex-services.dz', name: 'Sabrina Haddad', title: 'Responsable Ressources Humaines', role: SystemRole.RESPONSABLE_RH, deptCode: DepartmentCode.RESSOURCES_HUMAINES },
    { id: 'usr-rh-002', email: 's.haddad@silex-services.dz', name: 'Sabrina Haddad', title: 'Responsable Ressources Humaines', role: SystemRole.RESPONSABLE_RH, deptCode: DepartmentCode.RESSOURCES_HUMAINES },
    { id: 'usr-fin-001', email: 'finance@silex-services.dz', name: 'Réda Bouzid', title: 'Directeur Financier & Trésorerie', role: SystemRole.RESPONSABLE_FINANCIER, deptCode: DepartmentCode.FINANCE_COMPTABILITE },
    { id: 'usr-fin-002', email: 'r.bouzid@silex-services.dz', name: 'Réda Bouzid', title: 'Directeur Financier & Trésorerie', role: SystemRole.RESPONSABLE_FINANCIER, deptCode: DepartmentCode.FINANCE_COMPTABILITE },
    { id: 'usr-mag-001', email: 'magasin@silex-services.dz', name: 'Tarek Meziani', title: 'Responsable Magasin & Stocks', role: SystemRole.RESPONSABLE_MAGASIN, deptCode: DepartmentCode.MAGASIN_STOCKS },
    { id: 'usr-adm-001', email: 'admin@silex-services.dz', name: 'Super Administrateur SILEX', title: 'Administrateur Plateforme', role: SystemRole.ADMINISTRATEUR, deptCode: DepartmentCode.INFORMATIQUE_ADMIN },
  ];

  for (const u of usersData) {
    const depId = getDeptId(u.deptCode);
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        title: u.title,
        role: u.role,
        departmentCode: u.deptCode,
        departmentId: depId,
        passwordHash,
        active: true,
      },
      create: {
        id: u.id,
        email: u.email,
        passwordHash,
        name: u.name,
        title: u.title,
        role: u.role,
        departmentCode: u.deptCode,
        departmentId: depId,
        active: true,
      },
    });
  }

  console.log('✅ [SEED] Utilisateurs et départements configurés avec succès.');
  console.log('ℹ️ Base de données vierge : aucun projet, devis ou fausse donnée n’a été injecté.');
}

main()
  .catch((e) => {
    console.error('❌ [SEED] Erreur critique :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
