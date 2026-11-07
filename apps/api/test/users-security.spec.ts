import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, ConflictException } from '@nestjs/common';
import { UsersService } from '../src/modules/users/users.service';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { AuditService } from '../src/modules/audit/audit.service';
import { SystemRole, DepartmentCode, UserSessionPayload } from '@silex/shared';

describe('PHASE 2 — PROTECTION DES DONNÉES UTILISATEURS (REMEDIATION AUDIT)', () => {
  let usersService: UsersService;
  let prismaMock: any;
  let auditMock: any;

  const mockUsersFromDb = [
    {
      id: 'usr-1',
      email: 'admin@silex-services.dz',
      name: 'Lyes Hamidi',
      title: 'Administrateur Système',
      role: SystemRole.ADMINISTRATEUR,
      departmentCode: 'INFORMATIQUE_ADMIN',
      avatarUrl: '/avatars/admin.webp',
      active: true,
      createdAt: new Date(),
      department: { id: 'dep-1', code: 'INFORMATIQUE_ADMIN', name: 'Informatique' },
      assignedProjects: [],
    },
    {
      id: 'usr-2',
      email: 'k.mansouri@silex-services.dz',
      name: 'Karim Mansouri',
      title: 'Directeur Général',
      role: SystemRole.DIRECTEUR_GENERAL,
      departmentCode: 'DIRECTION_GENERALE',
      avatarUrl: '/avatars/dg.webp',
      active: true,
      createdAt: new Date(),
      department: { id: 'dep-2', code: 'DIRECTION_GENERALE', name: 'Direction Générale' },
      assignedProjects: [],
    },
  ];

  beforeAll(async () => {
    auditMock = {
      logAction: jest.fn().mockResolvedValue({ id: 'log-1' }),
    };

    prismaMock = {
      user: {
        findMany: jest.fn().mockImplementation((args: any) => {
          // Verify that passwordHash is NEVER in the select fields
          if (args?.select?.passwordHash) {
            throw new Error('SECURITY VIOLATION: passwordHash requested in select!');
          }
          return Promise.resolve(mockUsersFromDb);
        }),
        findUnique: jest.fn().mockImplementation(({ where }: any) => {
          if (where?.email === 'admin@silex-services.dz' || where?.id === 'usr-1') {
            return Promise.resolve(mockUsersFromDb[0]);
          }
          return Promise.resolve(null);
        }),
        update: jest.fn().mockImplementation(({ where, data, select }: any) => {
          if (select?.passwordHash) {
            throw new Error('SECURITY VIOLATION: passwordHash requested in select!');
          }
          return Promise.resolve({
            ...mockUsersFromDb[0],
            ...data,
          });
        }),
        create: jest.fn().mockImplementation(({ data, select }: any) => {
          if (select?.passwordHash) {
            throw new Error('SECURITY VIOLATION: passwordHash requested in select!');
          }
          return Promise.resolve({
            id: 'usr-new-001',
            email: data.email,
            name: data.name,
            title: data.title,
            role: data.role,
            departmentCode: data.departmentCode,
            avatarUrl: null,
            active: true,
            createdAt: new Date(),
            department: {
              id: data.departmentId || 'dep-1',
              code: data.departmentCode,
              name: 'Opérations',
            },
          });
        }),
      },
      department: {
        findUnique: jest.fn().mockResolvedValue({ id: 'dep-1', code: 'OPERATIONS_PROJETS', name: 'Opérations' }),
        create: jest.fn().mockResolvedValue({ id: 'dep-1', code: 'OPERATIONS_PROJETS', name: 'Opérations' }),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: AuditService,
          useValue: auditMock,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
  });

  const createSessionUser = (role: SystemRole): UserSessionPayload => ({
    userId: 'test-user-id',
    email: 'test@silex-services.dz',
    name: 'Test User',
    role,
    departmentCode: 'DIRECTION_GENERALE' as any,
    permissions: [],
  });

  it('TEST 2.1 : Rôle non autorisé (Magasinier) -> Refus d’accès à la liste des utilisateurs (403)', async () => {
    const magasinier = createSessionUser(SystemRole.RESPONSABLE_MAGASIN);
    await expect(usersService.listUsers(magasinier)).rejects.toThrow(ForbiddenException);
  });

  it('TEST 2.2 : Rôle non autorisé (Chef de projet) -> Refus d’accès (403)', async () => {
    const chefProjet = createSessionUser(SystemRole.RESPONSABLE_PROJET);
    await expect(usersService.listUsers(chefProjet)).rejects.toThrow(ForbiddenException);
  });

  it('TEST 2.3 : Rôle autorisé (Administrateur) -> Accès autorisé', async () => {
    const admin = createSessionUser(SystemRole.ADMINISTRATEUR);
    const users = await usersService.listUsers(admin);
    expect(users).toBeDefined();
    expect(Array.isArray(users)).toBe(true);
  });

  it('TEST 2.4 : Rôle autorisé (Directeur Général) -> Accès autorisé', async () => {
    const dg = createSessionUser(SystemRole.DIRECTEUR_GENERAL);
    const users = await usersService.listUsers(dg);
    expect(users).toBeDefined();
    expect(users.length).toBe(2);
  });

  it('TEST 2.5 : Rôle autorisé (Responsable RH) -> Accès autorisé', async () => {
    const rh = createSessionUser(SystemRole.RESPONSABLE_RH);
    const users = await usersService.listUsers(rh);
    expect(users).toBeDefined();
  });

  it('TEST 2.6 : passwordHash n’est JAMAIS présent dans les objets utilisateurs retournés', async () => {
    const admin = createSessionUser(SystemRole.ADMINISTRATEUR);
    const users = await usersService.listUsers(admin);
    for (const u of users as any[]) {
      expect(u.passwordHash).toBeUndefined();
      expect(u.password).toBeUndefined();
    }
  });

  it('TEST 2.7 : Pagination respectée (skip et take calculés correctement)', async () => {
    const admin = createSessionUser(SystemRole.ADMINISTRATEUR);
    await usersService.listUsers(admin, 2, 10);
    expect(prismaMock.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
      }),
    );
  });

  it('TEST 2.8 : Rôle non autorisé (Responsable Projet) -> Refus de création d’utilisateur (403)', async () => {
    const chefProjet = createSessionUser(SystemRole.RESPONSABLE_PROJET);
    await expect(
      usersService.createUser(
        {
          name: 'Nouveau Salarié',
          email: 'nouveau@silex-services.dz',
          role: SystemRole.RESPONSABLE_PROJET,
          departmentCode: DepartmentCode.OPERATIONS_PROJETS,
        },
        chefProjet,
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('TEST 2.9 : Administrateur crée un utilisateur avec succès, mot de passe haché et sans fuite de hash', async () => {
    const admin = createSessionUser(SystemRole.ADMINISTRATEUR);
    const result = await usersService.createUser(
      {
        name: 'Ingénieur Chantier',
        email: 'ingenieur@silex-services.dz',
        role: SystemRole.RESPONSABLE_PROJET,
        departmentCode: DepartmentCode.OPERATIONS_PROJETS,
        title: 'Ingénieur Projet Tuyauterie',
      },
      admin,
    );

    expect(result).toBeDefined();
    expect(result.id).toBe('usr-new-001');
    expect(result.email).toBe('ingenieur@silex-services.dz');
    expect((result as any).passwordHash).toBeUndefined();
    expect((result as any).password).toBeUndefined();
    expect(prismaMock.user.create).toHaveBeenCalled();
    expect(auditMock.logAction).toHaveBeenCalledWith(
      expect.objectContaining({
        entityName: 'USER',
        action: 'USER_CREATE',
      }),
    );
  });

  it('TEST 2.10 : Conflit si l’email existe déjà (409)', async () => {
    const admin = createSessionUser(SystemRole.ADMINISTRATEUR);
    await expect(
      usersService.createUser(
        {
          name: 'Doublon Admin',
          email: 'admin@silex-services.dz',
          role: SystemRole.ADMINISTRATEUR,
          departmentCode: DepartmentCode.INFORMATIQUE_ADMIN,
        },
        admin,
      ),
    ).rejects.toThrow(ConflictException);
  });

  it('TEST 2.11 : Mise à jour utilisateur par un rôle non autorisé -> Refus (403)', async () => {
    const chefProjet = createSessionUser(SystemRole.RESPONSABLE_PROJET);
    await expect(
      usersService.updateUser('usr-1', { name: 'Nouveau Nom' }, chefProjet),
    ).rejects.toThrow(ForbiddenException);
  });

  it('TEST 2.12 : Administrateur met à jour un profil utilisateur avec succès et trace l’action', async () => {
    const admin = createSessionUser(SystemRole.ADMINISTRATEUR);
    const updated = await usersService.updateUser('usr-1', { name: 'Lyes Hamidi Modifié', title: 'Lead Admin' }, admin);
    expect(updated).toBeDefined();
    expect(prismaMock.user.update).toHaveBeenCalled();
    expect(auditMock.logAction).toHaveBeenCalledWith(
      expect.objectContaining({
        entityName: 'USER',
        action: 'USER_UPDATE',
      }),
    );
  });
});
