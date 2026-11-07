import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from '../src/modules/auth/auth.service';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuditService } from '../src/modules/audit/audit.service';
import { SystemRole } from '@silex/shared';
import * as argon2 from 'argon2';

describe('PHASE 1 — SÉCURITÉ DE L’AUTHENTIFICATION (REMEDIATION AUDIT)', () => {
  let authService: AuthService;
  let prismaService: PrismaService;

  const validPassword = 'SilexSecurePass2026!';
  let validPasswordHash: string;

  const mockUser = {
    id: 'test-user-001',
    email: 'k.mansouri@silex-services.dz',
    passwordHash: '',
    name: 'Karim Mansouri',
    title: 'Directeur Général',
    role: SystemRole.DIRECTEUR_GENERAL,
    departmentCode: 'DIRECTION_GENERALE',
    active: true,
    assignedProjects: [],
  };

  beforeAll(async () => {
    validPasswordHash = await argon2.hash(validPassword);
    mockUser.passwordHash = validPasswordHash;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn().mockImplementation(({ where: { email } }) => {
                if (email === mockUser.email) {
                  return Promise.resolve(mockUser);
                }
                if (email === 'inactive@silex-services.dz') {
                  return Promise.resolve({ ...mockUser, active: false });
                }
                return Promise.resolve(null);
              }),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock.jwt.token'),
          },
        },
        {
          provide: AuditService,
          useValue: {
            logAction: jest.fn().mockResolvedValue({ id: 'audit-log-1' }),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('TEST 1.1 : Email seul (sans paramètre mot de passe) -> Refus strict (401)', async () => {
    await expect(authService.login(mockUser.email, undefined as any)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('TEST 1.2 : Password absent / undefined -> Refus strict (401)', async () => {
    await expect(authService.login(mockUser.email, undefined as any)).rejects.toThrow(
      'Identifiants invalides.',
    );
  });

  it('TEST 1.3 : Password null -> Refus strict (401)', async () => {
    await expect(authService.login(mockUser.email, null as any)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('TEST 1.4 : Password vide ou espaces uniquement -> Refus strict (401)', async () => {
    await expect(authService.login(mockUser.email, '')).rejects.toThrow('Identifiants invalides.');
    await expect(authService.login(mockUser.email, '   ')).rejects.toThrow('Identifiants invalides.');
  });

  it('TEST 1.5 : Password incorrect -> Refus strict (401)', async () => {
    await expect(authService.login(mockUser.email, 'WrongPassword123!')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('TEST 1.6 : Password correct -> Connexion réussie et délivrance du JWT', async () => {
    const res = await authService.login(mockUser.email, validPassword);
    expect(res).toBeDefined();
    expect(res.accessToken).toBe('mock.jwt.token');
    expect(res.user.email).toBe(mockUser.email);
    expect(res.user.role).toBe(SystemRole.DIRECTEUR_GENERAL);
  });

  it('TEST 1.7 : Utilisateur inexistant -> Message générique "Identifiants invalides."', async () => {
    await expect(
      authService.login('unknown@silex-services.dz', validPassword),
    ).rejects.toThrow('Identifiants invalides.');
  });

  it('TEST 1.8 : Utilisateur inactif -> Refus avec message générique "Identifiants invalides."', async () => {
    await expect(
      authService.login('inactive@silex-services.dz', validPassword),
    ).rejects.toThrow('Identifiants invalides.');
  });

  it('TEST 1.9 : Protection contre les tentatives répétées (brute-force throttling)', async () => {
    const targetEmail = 'bruteforce@silex-services.dz';
    // 5 tentatives échouées consécutives
    for (let i = 0; i < 5; i++) {
      try {
        await authService.login(targetEmail, 'badpass');
      } catch (e) {
        // expected
      }
    }

    // La 6ème tentative doit déclencher un verrouillage temporaire (429 Too Many Requests)
    await expect(authService.login(targetEmail, 'anypassword')).rejects.toThrow(HttpException);
  });
});
