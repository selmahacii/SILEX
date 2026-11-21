import { prisma } from './prisma';
import { serverStore } from './server-store';
import { SystemRole } from '@silex/shared';
import * as argon2 from 'argon2';

const hasDb = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres'));
const isProductionStrict = process.env.NODE_ENV === 'production' && process.env.SILEX_ENABLE_DEMO_MODE !== 'true';

function handleDbPersistenceError(context: string, err: any): never | void {
  console.error(`[DB Bridge] ${context} error:`, err);
  if (isProductionStrict) {
    throw new Error(`[DB Bridge] Échec de persistance base de données lors de "${context}".`);
  }
}

function handleFinancePersistenceError(context: string, err: any, rollbackFn?: () => void): never {
  console.error(`[DB Bridge Critical Financial Persistence Failure] ${context}:`, err);
  if (rollbackFn) {
    try {
      rollbackFn();
    } catch (rbErr) {
      console.error(`[DB Bridge Rollback Failure] ${context}:`, rbErr);
    }
  }
  const error = new Error(`[DB_PERSISTENCE_FAILED] Échec de persistance pour "${context}": ${err?.message || err}`);
  (error as any).code = 'DB_PERSISTENCE_FAILED';
  (error as any).originalError = err;
  throw error;
}

function mapToSector(sector?: string): any {
  if (!sector) return 'OIL_AND_GAS';
  const clean = sector.toUpperCase();
  if (clean.includes('PETRO') || clean.includes('GAZ') || clean.includes('OIL')) return 'OIL_AND_GAS';
  if (clean.includes('ENERG')) return 'ENERGIE';
  if (clean.includes('AGRO') || clean.includes('ALIM')) return 'AGROALIMENTAIRE';
  if (clean.includes('SIDER') || clean.includes('ACIER')) return 'SIDERURGIE';
  if (clean.includes('CIMENT')) return 'CIMENTERIE';
  if (['OIL_AND_GAS', 'ENERGIE', 'AGROALIMENTAIRE', 'SIDERURGIE', 'CIMENTERIE', 'AUTRE_INDUSTRIE'].includes(clean)) return clean;
  return 'AUTRE_INDUSTRIE';
}

export const dbBridge = {
  isDbConnected(): boolean {
    return hasDb;
  },

  // --- TRAÇABILITÉ & AUDIT TRAIL UNIVERSEL ---
  async logAudit(action: string, entityType: string, entityId: string, details: string, user?: any) {
    serverStore.addAuditLog(action, entityType, entityId, details, user);
    if (hasDb) {
      try {
        const performerId = user?.id || 'usr-dg-001';
        await prisma.auditLog.create({
          data: {
            action,
            entityName: entityType,
            entityId: String(entityId || 'SYS'),
            description: details || `${action} sur ${entityType}`,
            performerId,
            performerName: user?.name || 'Direction Générale SILEX',
            performerRole: (user?.role || 'DIRECTEUR_GENERAL') as any,
            ipAddress: '127.0.0.1',
          },
        });
      } catch (err) {
        // Fallback silencieux vers serverStore
      }
    }
  },

  // --- USERS & AUTH ---
  async getUserByRole(role: SystemRole) {
    if (hasDb) {
      try {
        const user = await prisma.user.findFirst({ where: { role: role as any } });
        if (user) return user;
      } catch (err) {
        console.warn('[DB Bridge] Fallback store for getUserByRole:', err);
      }
    }
    return serverStore.getUserByRole(role);
  },

  async getUserByEmail(email: string) {
    if (hasDb) {
      try {
        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (user) return user;
      } catch (err) {
        console.warn('[DB Bridge] Fallback store for getUserByEmail:', err);
      }
    }
    return serverStore.getUserByEmail(email);
  },

  // Authentifie un utilisateur par email + mot de passe en clair (Argon2id strict).
  // Retourne l'utilisateur si et seulement si le mot de passe correspond au hash stocké.
  async authenticateUser(email: string, password: string) {
    if (!email || !password) return null;
    const user = await this.getUserByEmail(email);
    if (!user || !(user as any).passwordHash) return null;
    try {
      const valid = await argon2.verify((user as any).passwordHash, password);
      return valid ? user : null;
    } catch (err) {
      console.warn('[DB Bridge] Error verifying password:', err);
      return null;
    }
  },

  async getUserById(id: string) {
    if (hasDb) {
      try {
        const user = await prisma.user.findUnique({ where: { id } });
        if (user) return user;
      } catch (err) {
        console.warn('[DB Bridge] Fallback store for getUserById:', err);
      }
    }
    return serverStore.getUserById(id);
  },

  async getUsers() {
    if (hasDb) {
      try {
        const users = await (prisma.user.findMany as any)({
          orderBy: { createdAt: 'asc' },
          omit: { passwordHash: true },
        });
        return users || [];
      } catch (err) {
        console.warn('[DB Bridge] Fallback store for getUsers:', err);
      }
    }
    return serverStore.getUsers();
  },

  async createUser(data: any) {
    if (!data.password || String(data.password).length < 8) {
      throw new Error('Un mot de passe d\'au moins 8 caractères est obligatoire pour créer un utilisateur.');
    }
    const passwordHash = await argon2.hash(String(data.password));
    if (hasDb) {
      try {
        const created = await (prisma.user.create as any)({
          data: {
            name: data.name,
            email: data.email.toLowerCase(),
            passwordHash,
            title: data.title || 'Collaborateur SILEX',
            role: data.role || 'RESPONSABLE_PROJET',
            departmentCode: data.departmentCode || 'OPERATIONS_PROJETS',
            active: data.active ?? true,
          },
          omit: { passwordHash: true },
        });
        await this.logAudit('CREATE_USER', 'USER', created.id, `Création utilisateur : ${created.name} (${created.email})`, data.user);
        return created;
      } catch (err) {
        console.warn('[DB Bridge] Error creating user in DB:', err);
      }
    }
    const res = serverStore.createUser(data);
    await this.logAudit('CREATE_USER', 'USER', res.id, `Création utilisateur : ${res.name}`, data.user);
    return res;
  },

  async updateUser(id: string, data: any, operator?: any) {
    if (hasDb) {
      try {
        const updateData: any = {};
        if (data.name) updateData.name = data.name;
        if (data.title) updateData.title = data.title;
        if (data.role) updateData.role = data.role;
        if (data.departmentCode) updateData.departmentCode = data.departmentCode;
        if (typeof data.active === 'boolean') updateData.active = data.active;
        if (data.password) {
          if (String(data.password).length < 8) {
            throw new Error('Le mot de passe doit comporter au moins 8 caractères.');
          }
          updateData.passwordHash = await argon2.hash(String(data.password));
        }

        const updated = await (prisma.user.update as any)({
          where: { id },
          data: updateData,
          omit: { passwordHash: true },
        });
        await this.logAudit('UPDATE_USER', 'USER', updated.id, `Mise à jour collaborateur ${updated.name} (Rôle: ${updated.role})`, operator);
        return updated;
      } catch (err) {
        console.warn('[DB Bridge] Error updating user in DB:', err);
      }
    }
    const res = serverStore.updateUser(id, data);
    await this.logAudit('UPDATE_USER', 'USER', id, `Mise à jour collaborateur ${id}`, operator);
    return res;
  },

  async deleteUser(id: string, operator?: any) {
    if (hasDb) {
      try {
        await prisma.user.delete({ where: { id } });
        await this.logAudit('DELETE_USER', 'USER', id, `Suppression collaborateur ID ${id}`, operator);
        return { success: true };
      } catch (err) {
        console.warn('[DB Bridge] Error deleting user in DB:', err);
      }
    }
    const res = serverStore.deleteUser(id);
    await this.logAudit('DELETE_USER', 'USER', id, `Suppression collaborateur ${id}`, operator);
    return { success: Boolean(res) };
  },

  async getRolePermissions() {
    return serverStore.getRolePermissions();
  },

  async updateRolePermissions(role: string, permissions: any, operator?: any) {
    const updated = serverStore.updateRolePermissions(role, permissions);
    await this.logAudit('UPDATE_RBAC', 'SECURITY', role, `Mise à jour matrice RBAC rôle ${role}`, operator);
    return updated;
  },

  // --- PROJECTS ---
  async getProjects() {
    if (hasDb) {
      try {
        const projects = await prisma.project.findMany({
          orderBy: { createdAt: 'desc' },
          include: {
            milestones: true,
            serviceOrders: true,
            workSituations: true,
            costEntries: true,
            manager: { select: { id: true, name: true } },
          },
        });
        return projects.map((p: any) => ({
          ...p,
          managerName: p.manager?.name,
        }));
      } catch (err) {
        console.warn('[DB Bridge] Fallback store for getProjects:', err);
      }
    }
    return serverStore.getProjects();
  },

  // Isolation ABAC : liste des codes projet auxquels un utilisateur est affecté
  // (UserProjectAssignment). Utilisé pour restreindre les Chefs de Projet à leurs
  // seuls chantiers assignés, conformément à PERMISSIONS_MATRIX.md ([A]).
  async getAssignedProjectCodes(userId: string): Promise<string[]> {
    if (!hasDb) return [];
    try {
      const assignments = await prisma.userProjectAssignment.findMany({
        where: { userId },
        include: { project: { select: { code: true } } },
      });
      return assignments.map(a => a.project.code);
    } catch (err) {
      console.warn('[DB Bridge] Error fetching project assignments:', err);
      return [];
    }
  },

  async isUserAssignedToProject(userId: string, projectIdOrCode: string | undefined | null): Promise<boolean> {
    if (!projectIdOrCode) return false;
    if (!hasDb) return true;
    try {
      const count = await prisma.userProjectAssignment.count({
        where: { userId, project: { OR: [{ id: projectIdOrCode }, { code: projectIdOrCode }] } },
      });
      return count > 0;
    } catch (err) {
      console.warn('[DB Bridge] Error checking project assignment:', err);
      return true; // ne jamais bloquer sur une panne technique de vérification
    }
  },

  async getProject(codeOrId: string) {
    if (hasDb) {
      try {
        const project = await prisma.project.findFirst({
          where: {
            OR: [
              { code: codeOrId },
              { id: codeOrId },
            ],
          },
          include: {
            manager: true,
            milestones: true,
            serviceOrders: true,
            workSituations: true,
            costEntries: { orderBy: { recordedAt: 'desc' } },
            assignedUsers: {
              include: { user: true },
            },
          },
        });
        if (project) {
          const storeP = serverStore.getProject(codeOrId);
          return {
            ...project,
            contractItems: storeP?.contractItems || [],
            tasks: storeP?.tasks || [],
            dailyReports: storeP?.dailyReports || [],
            situationReports: storeP?.situationReports || [],
            constraints: storeP?.constraints || [],
            hseIncidents: storeP?.hseIncidents || [],
          };
        }
      } catch (err) {
        console.warn('[DB Bridge] Fallback store for getProject:', err);
      }
    }
    return serverStore.getProject(codeOrId);
  },

  async createProject(data: any) {
    if (hasDb) {
      try {
        const count = await prisma.project.count();
        const code = data.code || `PRJ-2026-${String(count + 1).padStart(3, '0')}`;
        const created = await prisma.project.create({
          data: {
            code,
            name: data.name,
            clientName: data.clientName,
            sector: mapToSector(data.sector),
            siteLocation: data.siteLocation || 'Chantier Algérie',
            status: (data.status || 'IN_PROGRESS') as any,
            riskLevel: (data.riskLevel || 'LOW') as any,
            contractAmount: Number(data.contractAmount || 0),
            budgetAmount: Number(data.budgetAmount || 0),
            startDate: data.startDate ? new Date(data.startDate) : new Date(),
            contractEndDate: data.contractEndDate ? new Date(data.contractEndDate) : new Date(Date.now() + 90 * 86400000),
            description: data.description || '',
            managerId: data.managerId || 'usr-rp-002',
          },
        });
        await this.logAudit('CREATE_PROJECT', 'PROJECT', created.code, `Projet créé : ${created.name} (${created.code})`, data.user);
        return created;
      } catch (err) {
        console.warn('[DB Bridge] Error creating project in DB:', err);
      }
    }
    const res = serverStore.createProject(data);
    await this.logAudit('CREATE_PROJECT', 'PROJECT', res.code, `Projet créé : ${res.name}`, data.user);
    return res;
  },

  async updateProject(codeOrId: string, data: any) {
    if (hasDb) {
      try {
        const project = await prisma.project.findFirst({
          where: { OR: [{ code: codeOrId }, { id: codeOrId }] },
        });
        if (project) {
          const updated = await prisma.project.update({
            where: { id: project.id },
            data: {
              name: data.name !== undefined ? data.name : undefined,
              clientName: data.clientName !== undefined ? data.clientName : undefined,
              sector: data.sector !== undefined ? data.sector : undefined,
              siteLocation: data.siteLocation !== undefined ? data.siteLocation : undefined,
              status: data.status !== undefined ? data.status : undefined,
              riskLevel: data.riskLevel !== undefined ? data.riskLevel : undefined,
              contractAmount: data.contractAmount !== undefined ? Number(data.contractAmount) : undefined,
              budgetAmount: data.budgetAmount !== undefined ? Number(data.budgetAmount) : undefined,
              description: data.description !== undefined ? data.description : undefined,
              objectives: data.objectives !== undefined ? data.objectives : undefined,
              managerId: data.managerId !== undefined ? data.managerId : undefined,
              startDate: data.contractStartDate || data.startDate ? new Date(data.contractStartDate || data.startDate) : undefined,
              contractEndDate: data.contractEndDate ? new Date(data.contractEndDate) : undefined,
            },
            include: {
              manager: true,
              milestones: true,
              serviceOrders: true,
              workSituations: true,
              assignedUsers: {
                include: { user: true },
              },
            },
          });
          await this.logAudit('UPDATE_PROJECT', 'PROJECT', updated.code, `Mise à jour du projet ${updated.code} (Responsable: ${updated.manager?.name || updated.managerId})`, data.user);
          return updated;
        }
      } catch (err) {
        console.warn('[DB Bridge] Error updating project in DB:', err);
      }
    }
    const res = serverStore.updateProject(codeOrId, data);
    await this.logAudit('UPDATE_PROJECT', 'PROJECT', codeOrId, `Mise à jour du projet ${codeOrId}`, data.user);
    return res;
  },

  async assignMemberToProject(projectIdOrCode: string, userId: string, user?: any) {
    if (hasDb) {
      try {
        const proj = await prisma.project.findFirst({
          where: { OR: [{ id: projectIdOrCode }, { code: projectIdOrCode }] },
        });
        if (proj) {
          const assignment = await prisma.userProjectAssignment.upsert({
            where: {
              userId_projectId: {
                userId,
                projectId: proj.id,
              },
            },
            create: {
              userId,
              projectId: proj.id,
            },
            update: {},
            include: { user: true },
          });
          await this.logAudit('ASSIGN_PROJECT_MEMBER', 'PROJECT', proj.code, `Affectation de ${assignment.user?.name || userId} au projet ${proj.code}`, user);
          return assignment;
        }
      } catch (err) {
        console.warn('[DB Bridge] Error assigning member in DB:', err);
      }
    }
    const res = serverStore.assignMemberToProject(projectIdOrCode, userId);
    await this.logAudit('ASSIGN_PROJECT_MEMBER', 'PROJECT', projectIdOrCode, `Affectation du collaborateur ${userId} au projet ${projectIdOrCode}`, user);
    return res;
  },

  async removeMemberFromProject(projectIdOrCode: string, userId: string, user?: any) {
    if (hasDb) {
      try {
        const proj = await prisma.project.findFirst({
          where: { OR: [{ id: projectIdOrCode }, { code: projectIdOrCode }] },
        });
        if (proj) {
          await prisma.userProjectAssignment.deleteMany({
            where: {
              userId,
              projectId: proj.id,
            },
          });
          await this.logAudit('REMOVE_PROJECT_MEMBER', 'PROJECT', proj.code, `Retrait du collaborateur ${userId} du projet ${proj.code}`, user);
          return { success: true };
        }
      } catch (err) {
        console.warn('[DB Bridge] Error removing member in DB:', err);
      }
    }
    const res = serverStore.removeMemberFromProject(projectIdOrCode, userId);
    await this.logAudit('REMOVE_PROJECT_MEMBER', 'PROJECT', projectIdOrCode, `Retrait du collaborateur ${userId} du projet ${projectIdOrCode}`, user);
    return res;
  },

  async deleteProject(idOrCode: string, user?: any) {
    if (hasDb) {
      try {
        const proj = await prisma.project.findFirst({
          where: { OR: [{ id: idOrCode }, { code: idOrCode }] },
        });
        if (proj) {
          await prisma.projectMilestone.deleteMany({ where: { projectId: proj.id } });
          await prisma.projectTask.deleteMany({ where: { projectId: proj.id } });
          await prisma.serviceOrder.deleteMany({ where: { projectId: proj.id } });
          await prisma.workSituation.deleteMany({ where: { projectId: proj.id } });
          await prisma.projectCostEntry.deleteMany({ where: { projectId: proj.id } });
          await prisma.projectMaterialAllocation.deleteMany({ where: { projectId: proj.id } });
          await prisma.userProjectAssignment.deleteMany({ where: { projectId: proj.id } });
          await prisma.purchaseRequest.deleteMany({ where: { projectId: proj.id } });
          await prisma.stockMovement.deleteMany({ where: { projectId: proj.id } });
          await prisma.project.delete({ where: { id: proj.id } });
          await this.logAudit('DELETE_PROJECT', 'PROJECT', proj.code, `Suppression projet ${proj.code}`, user);
          return { success: true };
        }
      } catch (err) {
        console.warn('[DB Bridge] Error deleting project in DB:', err);
      }
    }
    return { success: true };
  },

  async updateProgress(codeOrId: string, physical: number, financial: number) {
    if (hasDb) {
      try {
        const project = await prisma.project.findFirst({
          where: { OR: [{ code: codeOrId }, { id: codeOrId }] },
        });
        if (project) {
          const updated = await prisma.project.update({
            where: { id: project.id },
            data: {
              physicalProgress: Math.min(100, Math.max(0, physical)),
              financialProgress: Math.min(100, Math.max(0, financial)),
            },
          });
          await this.logAudit('ADJUST_PROGRESS', 'PROJECT', updated.code, `Avancement ajusté : Physique ${physical}%, Financier ${financial}%`, null);
          return updated;
        }
      } catch (err) {
        console.warn('[DB Bridge] Error updating progress in DB:', err);
      }
    }
    const res = serverStore.updateProgress(codeOrId, physical, financial);
    await this.logAudit('ADJUST_PROGRESS', 'PROJECT', codeOrId, `Avancement physique: ${physical}%, financier: ${financial}%`, null);
    return res;
  },

  async addMilestone(codeOrId: string, data: any) {
    if (hasDb) {
      try {
        const project = await prisma.project.findFirst({
          where: { OR: [{ code: codeOrId }, { id: codeOrId }] },
        });
        if (project) {
          const count = await prisma.projectMilestone.count({ where: { projectId: project.id } });
          const created = await prisma.projectMilestone.create({
            data: {
              projectId: project.id,
              orderIndex: count + 1,
              title: data.title || data.name || 'Jalon Contractuel',
              description: data.description || '',
              targetDate: data.targetDate || data.dueDate ? new Date(data.targetDate || data.dueDate) : new Date(),
              status: data.status || 'PENDING',
            },
          });
          await this.logAudit('ADD_MILESTONE', 'PROJECT_MILESTONE', project.code, `Jalon ajouté : ${created.title}`, data.user);
          return created;
        }
      } catch (err) {
        console.warn('[DB Bridge] Error adding milestone in DB:', err);
      }
    }
    const res = serverStore.addMilestone(codeOrId, data);
    await this.logAudit('ADD_MILESTONE', 'PROJECT_MILESTONE', codeOrId, `Jalon ajouté : ${data.title || data.name}`, data.user);
    return res;
  },

  async updateMilestone(codeOrId: string, milestoneId: string, data: any) {
    if (hasDb) {
      try {
        const updateData: any = {};
        if (data.status) updateData.status = data.status;
        if (data.status === 'COMPLETED' || data.completed === true) {
          updateData.status = 'COMPLETED';
          updateData.completedDate = data.completedDate ? new Date(data.completedDate) : new Date();
        }
        if (data.title) updateData.title = data.title;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.targetDate) updateData.targetDate = new Date(data.targetDate);

        const updated = await prisma.projectMilestone.update({
          where: { id: milestoneId },
          data: updateData,
        });

        // Recalcul avancement physique projet
        const allMilestones = await prisma.projectMilestone.findMany({
          where: { projectId: updated.projectId },
        });
        if (allMilestones.length > 0) {
          const completedCount = allMilestones.filter((m) => m.status === 'COMPLETED').length;
          const progressPercent = Math.round((completedCount / allMilestones.length) * 100);
          await prisma.project.update({
            where: { id: updated.projectId },
            data: { physicalProgress: progressPercent },
          });
        }

        await this.logAudit(
          'UPDATE_MILESTONE',
          'PROJECT_MILESTONE',
          milestoneId,
          `Jalon '${updated.title}' marqué COMPLETED (franchi) avec succès`,
          data.user
        );
        return updated;
      } catch (err) {
        console.warn('[DB Bridge] Error updating milestone in DB:', err);
      }
    }
    const res = serverStore.updateMilestone(codeOrId, milestoneId, data);
    await this.logAudit(
      'UPDATE_MILESTONE',
      'PROJECT_MILESTONE',
      milestoneId,
      `Jalon franchi : ${milestoneId}`,
      data.user
    );
    return res;
  },

  async addCostEntry(codeOrId: string, data: any) {
    const amt = Number(data.amount !== undefined ? data.amount : (data.amountHT !== undefined ? data.amountHT : 0));
    if (hasDb) {
      try {
        const project = await prisma.project.findFirst({
          where: { OR: [{ code: codeOrId }, { id: codeOrId }] },
        });
        if (project) {
          const updated = await prisma.project.update({
            where: { id: project.id },
            data: {
              actualCost: { increment: amt },
            },
          });
          let costRecord = null;
          try {
            costRecord = await prisma.projectCostEntry.create({
              data: {
                projectId: project.id,
                category: (data.category || 'MATERIEL'),
                amount: amt,
                description: data.description || 'Dépense imputée',
                sourceModule: 'DIRECT_ENTRY',
                recordedAt: data.date ? new Date(data.date) : new Date(),
              },
            });
          } catch {}
          await this.logAudit(
            'ADD_COST',
            'PROJECT',
            project.code,
            `Dépense imputée (${data.category || 'CHEF_PROJET'}) : ${amt} DA`,
            data.user
          );
          return { success: true, id: costRecord?.id || `cst-${Date.now()}`, amount: amt, amountHT: amt, project: updated };
        }
      } catch (err) {
        console.warn('[DB Bridge] Error adding cost entry in DB:', err);
      }
    }
    const res = serverStore.addCostEntry(codeOrId, { ...data, amount: amt, amountHT: amt });
    return res;
  },

  async addServiceOrder(codeOrId: string, data: any) {
    if (hasDb) {
      try {
        const project = await prisma.project.findFirst({
          where: { OR: [{ code: codeOrId }, { id: codeOrId }] },
        });
        if (project) {
          const count = await prisma.serviceOrder.count({ where: { projectId: project.id } });
          const orderNumber = data.orderNumber || data.number || `ODS-${project.code}-${String(count + 1).padStart(2, '0')}`;
          const delayDays = Number(data.delayDays || data.delayImpactDays || 0);
          const costImpact = Number(data.costImpact || data.costImpactAmount || 0);
          const created = await prisma.serviceOrder.create({
            data: {
              projectId: project.id,
              orderNumber,
              type: (data.type || 'DEMARRAGE') as any,
              description: data.description || data.title || '',
              delayImpactDays: delayDays,
              costImpactAmount: costImpact,
              status: (data.status || 'ISSUED') as any,
              issueDate: data.issueDate || data.effectiveDate ? new Date(data.issueDate || data.effectiveDate) : new Date(),
            },
          });
          if (costImpact > 0) {
            await prisma.project.update({
              where: { id: project.id },
              data: { contractAmount: { increment: costImpact } },
            });
          }
          await this.logAudit('ADD_SERVICE_ORDER', 'SERVICE_ORDER', created.orderNumber, `ODS émis : ${created.orderNumber} (${created.type})`, data.user);
          return created;
        }
      } catch (err) {
        console.warn('[DB Bridge] Error adding service order in DB:', err);
      }
    }
    const res = serverStore.addServiceOrder(codeOrId, data);
    await this.logAudit('ADD_SERVICE_ORDER', 'SERVICE_ORDER', codeOrId, `ODS émis (${data.type})`, data.user);
    return res;
  },

  async addWorkSituation(codeOrId: string, data: any) {
    if (hasDb) {
      try {
        const project = await prisma.project.findFirst({
          where: { OR: [{ code: codeOrId }, { id: codeOrId }] },
        });
        if (project) {
          const count = await prisma.workSituation.count({ where: { projectId: project.id } });
          const situationNumber = data.situationNumber || data.number || `SIT-${project.code}-${String(count + 1).padStart(2, '0')}`;
          const amountHT = Number(data.totalHT || data.amountHT || 0);
          const created = await prisma.workSituation.create({
            data: {
              projectId: project.id,
              situationNumber,
              periodStart: data.periodStart ? new Date(data.periodStart) : new Date(),
              periodEnd: data.periodEnd ? new Date(data.periodEnd) : new Date(),
              status: 'DRAFT',
              amountHT,
              cumulativeAmountHT: amountHT,
              notes: data.notes || '',
            },
          });

          await this.createWorkflow({
            title: `Situation de Travaux ${situationNumber} — ${project.name}`,
            reference: situationNumber,
            type: 'WORK_SITUATION',
            targetId: created.id,
            targetCode: situationNumber,
            projectCode: project.code,
            projectName: project.name,
            clientName: project.clientName,
            amountHT,
            amountTVA: amountHT * 0.19,
            amountTTC: amountHT * 1.14,
            justification: `Attachement contradictoire pour situation ${situationNumber}`,
            items: data.lines || [],
          });

          await this.logAudit('ADD_WORK_SITUATION', 'WORK_SITUATION', situationNumber, `Situation de travaux ${situationNumber} émise (${amountHT.toLocaleString()} DA HT)`, data.user);
          return created;
        }
      } catch (err) {
        console.warn('[DB Bridge] Error adding work situation in DB:', err);
      }
    }
    const res = serverStore.addWorkSituation(codeOrId, data);
    await this.logAudit('ADD_WORK_SITUATION', 'WORK_SITUATION', codeOrId, `Situation de travaux émise`, data.user);
    return res;
  },

  async getProjectKpis() {
    if (hasDb) {
      try {
        const [totalProjects, activeProjects, agg] = await Promise.all([
          prisma.project.count(),
          prisma.project.count({ where: { status: 'IN_PROGRESS' } }),
          prisma.project.aggregate({
            _sum: {
              contractAmount: true,
              budgetAmount: true,
              actualCost: true,
              committedCost: true,
            },
          }),
        ]);
        const totalContracted = Number(agg._sum.contractAmount || 0);
        const totalBudget = Number(agg._sum.budgetAmount || 0);
        const totalSpent = Number(agg._sum.actualCost || 0);
        const totalCommitted = Number(agg._sum.committedCost || 0);

        const marginDA = Math.max(0, totalContracted - totalBudget);
        const projectedMarginRate = totalContracted > 0 ? ((marginDA / totalContracted) * 100).toFixed(1) : '0.0';
        const pendingWfs = (serverStore.workflows || []).filter((w: any) =>
          w.status === 'PENDING' ||
          w.status === 'PENDING_DG' ||
          w.status === 'PENDING_APPROVAL' ||
          w.status === 'SUBMITTED' ||
          w.status === 'PRETE_POUR_VALIDATION'
        ).length;

        return {
          totalProjects,
          activeProjects,
          activeProjectsCount: activeProjects,
          totalTurnover: totalContracted,
          totalContractValue: totalContracted,
          totalContracted,
          totalBudgetAllocated: totalBudget,
          totalProjectBudgets: totalBudget,
          totalBudget,
          totalSpent,
          totalActualCosts: totalSpent,
          totalCommitted,
          totalCommittedCosts: totalCommitted,
          monthlyExpenditure: totalSpent,
          avgPhysicalProgress: 0,
          projectedMarginRate,
          pendingApprovalsCount: pendingWfs,
          clientReceivables: 0,
          supplierPayables: 0,
        };
      } catch (err) {
        console.warn('[DB Bridge] Fallback store for getProjectKpis:', err);
      }
    }
    return serverStore.getProjectKpis();
  },

  // --- WORKFLOWS (Circuit QCD & Boîte d'Arbitrage DG) ---
  async getWorkflows(filter?: any) {
    return serverStore.getWorkflows(filter);
  },

  async getWorkflowsInbox() {
    return serverStore.getWorkflowsInbox();
  },

  async createWorkflow(data: any) {
    const wf = serverStore.createWorkflow(data);
    await this.logAudit('CREATE_WORKFLOW', 'WORKFLOW', wf.code, `Dossier workflow ${wf.reference} soumis au circuit QCD`, null);
    return wf;
  },

  async approveWorkflow(id: string, notes: string = '', user?: any) {
    const res = serverStore.approveWorkflow(id, notes, user);
    if (hasDb && res) {
      try {
        if (res.type === 'PURCHASE_REQUEST' && (res.targetId || res.targetCode)) {
          await prisma.purchaseRequest.updateMany({
            where: { OR: [{ id: res.targetId || '' }, { reference: res.targetCode || '' }] },
            data: { status: 'APPROVED' },
          });
        }
        if (res.type === 'COST_SHEET' && (res.targetId || res.targetCode || res.reference)) {
          const dbSheet = await (prisma as any).costSheet.findFirst({
            where: { OR: [{ id: res.targetId || '' }, { reference: res.targetCode || res.reference || '' }] },
          });
          if (dbSheet) {
            await (prisma as any).costSheet.update({
              where: { id: dbSheet.id },
              data: {
                status: 'VALIDEE',
                dgDecision: 'APPROVED',
                dgDecisionNotes: notes || 'Approbation Direction Générale accordée.',
                dgDecisionDate: new Date(),
                dgDecisionBy: user?.name || 'Direction Générale',
                isImmutable: true,
              },
            });
          }
        }
        if (res.type === 'WORK_SITUATION' && (res.targetId || res.targetCode)) {
          await (prisma as any).workSituation.updateMany({
            where: { OR: [{ id: res.targetId || '' }, { situationNumber: res.targetCode || '' }] },
            data: { status: 'APPROVED' },
          });
        }
      } catch (e) {
        console.warn('[DB Bridge] Error updating target record in DB on workflow approval:', e);
      }
    }
    await this.logAudit('APPROVE_WORKFLOW', 'WORKFLOW', id, `Dossier approuvé avec mention: ${notes || 'Validé'}`, user);
    return res;
  },

  async rejectWorkflow(id: string, reason: string = '', user?: any) {
    const res = serverStore.rejectWorkflow(id, reason, user);
    if (hasDb && res) {
      try {
        if (res.type === 'PURCHASE_REQUEST' && (res.targetId || res.targetCode)) {
          await prisma.purchaseRequest.updateMany({
            where: { OR: [{ id: res.targetId || '' }, { reference: res.targetCode || '' }] },
            data: { status: 'REJECTED' },
          });
        }
        if (res.type === 'COST_SHEET' && (res.targetId || res.targetCode || res.reference)) {
          const dbSheet = await (prisma as any).costSheet.findFirst({
            where: { OR: [{ id: res.targetId || '' }, { reference: res.targetCode || res.reference || '' }] },
          });
          if (dbSheet) {
            await (prisma as any).costSheet.update({
              where: { id: dbSheet.id },
              data: {
                status: 'REFUSEE',
                dgDecision: 'REJECTED',
                dgDecisionNotes: reason,
                dgDecisionDate: new Date(),
                dgDecisionBy: user?.name || 'Direction Générale',
              },
            });
          }
        }
        if (res.type === 'WORK_SITUATION' && (res.targetId || res.targetCode)) {
          await (prisma as any).workSituation.updateMany({
            where: { OR: [{ id: res.targetId || '' }, { situationNumber: res.targetCode || '' }] },
            data: { status: 'REJECTED' },
          });
        }
      } catch (e) {
        console.warn('[DB Bridge] Error updating target record in DB on workflow rejection:', e);
      }
    }
    await this.logAudit('REJECT_WORKFLOW', 'WORKFLOW', id, `Dossier rejeté. Motif: ${reason}`, user);
    return res;
  },

  async requestRevisionWorkflow(id: string, instructions: string = '', user?: any) {
    const res = serverStore.requestRevisionWorkflow(id, instructions, user);
    await this.logAudit('REVISE_WORKFLOW', 'WORKFLOW', id, `Demande de révision: ${instructions}`, user);
    return res;
  },

  // --- PROCUREMENT ---
  async getPurchaseRequests() {
    if (hasDb) {
      try {
        const prs = await prisma.purchaseRequest.findMany({
          include: {
            lines: { include: { item: true } },
            project: true,
            createdBy: true,
            quotes: { include: { supplier: true } },
            purchaseOrders: { include: { supplier: true } },
          },
          orderBy: { createdAt: 'desc' },
        });
        if (prs) {
          return prs.map((pr: any) => {
            const linesHT = (pr.lines || []).reduce(
              (acc: number, l: any) => acc + (Number(l.quantity || 1) * Number(l.estimatedUnitPrice || l.unitPrice || 0)),
              0
            );
            const totalHT = Number(pr.totalEstimatedAmount) > 0 ? Number(pr.totalEstimatedAmount) : linesHT;
            const vatRate = Number(pr.vatRate !== undefined ? pr.vatRate : 19);
            const amountTVA = totalHT * (vatRate / 100);
            const amountTTC = totalHT + amountTVA;

            return {
              ...pr,
              code: pr.reference || pr.code,
              reference: pr.reference || pr.code,
              amountHT: totalHT,
              totalHT,
              vatRate,
              amountTVA,
              amountTTC,
              desiredDeliveryDate: pr.desiredDate || pr.desiredDeliveryDate,
              urgency: pr.urgencyLevel || pr.urgency || 'NORMAL',
              urgencyLevel: pr.urgencyLevel || pr.urgency || 'NORMAL',
              requester: pr.createdBy || { name: 'Chef de Projets SILEX' },
              department: pr.project?.name ? `Projet ${pr.project.code}` : 'Direction Projets Chantiers',
            };
          });
        }
      } catch (err) {
        console.warn('[DB Bridge] Fallback store for getPurchaseRequests:', err);
      }
    }
    return serverStore.getPurchaseRequests();
  },

  async getPurchaseRequest(idOrCode: string) {
    if (hasDb) {
      try {
        const pr = await prisma.purchaseRequest.findFirst({
          where: { OR: [{ id: idOrCode }, { reference: idOrCode }] },
          include: {
            lines: { include: { item: true } },
            project: true,
            createdBy: true,
            quotes: { include: { supplier: true } },
            purchaseOrders: { include: { supplier: true } },
          },
        });
        if (pr) {
          const linesHT = (pr.lines || []).reduce(
            (acc: number, l: any) => acc + (Number(l.quantity || 1) * Number(l.estimatedUnitPrice || l.unitPrice || 0)),
            0
          );
          const totalHT = Number(pr.totalEstimatedAmount) > 0 ? Number(pr.totalEstimatedAmount) : linesHT;
          const vatRate = Number((pr as any).vatRate !== undefined ? (pr as any).vatRate : 19);
          const amountTVA = totalHT * (vatRate / 100);
          const amountTTC = totalHT + amountTVA;

          return {
            ...pr,
            code: pr.reference || pr.id,
            reference: pr.reference || pr.id,
            amountHT: totalHT,
            totalHT,
            vatRate,
            amountTVA,
            amountTTC,
            desiredDeliveryDate: pr.desiredDate,
            urgency: pr.urgencyLevel || 'NORMAL',
            urgencyLevel: pr.urgencyLevel || 'NORMAL',
            requester: pr.createdBy || { name: 'Chef de Projets SILEX' },
            department: pr.project?.name ? `Projet ${pr.project.code}` : 'Direction Projets Chantiers',
          };
        }
      } catch (err) {
        console.warn('[DB Bridge] Error fetching purchase request:', err);
      }
    }
    return serverStore.getPurchaseRequest(idOrCode);
  },

  async getPurchaseRequestById(idOrCode: string) {
    return this.getPurchaseRequest(idOrCode);
  },

  async createPurchaseRequest(data: any) {
    if (hasDb) {
      try {
        const count = await prisma.purchaseRequest.count();
        const code = `DA-2026-${String(count + 1).padStart(4, '0')}`;
        const rawLines = Array.isArray(data.items) ? data.items : (Array.isArray(data.lines) ? data.lines : []);
        let amountHT = Number(data.totalHT || data.amountHT || data.estimatedAmount || 0);
        if (amountHT === 0 && rawLines.length > 0) {
          amountHT = rawLines.reduce((acc: number, l: any) => acc + (Number(l.quantity || 1) * Number(l.estimatedUnitPrice !== undefined ? l.estimatedUnitPrice : (l.unitPrice || 0))), 0);
        }
        const vatRate = Number(data.vatRate !== undefined ? data.vatRate : 19);
        const vatAmount = amountHT * (vatRate / 100);
        const totalTTC = amountHT + vatAmount;

        let resolvedProjectId = data.projectId;
        if (!resolvedProjectId && data.projectCode) {
          const prj = await prisma.project.findFirst({
            where: { OR: [{ code: data.projectCode }, { id: data.projectCode }] },
          });
          if (prj) resolvedProjectId = prj.id;
        }
        if (!resolvedProjectId) {
          let firstPrj = await prisma.project.findFirst();
          if (!firstPrj) {
            firstPrj = await prisma.project.create({
              data: {
                code: 'PRJ-INT-001',
                name: 'Opérations Générales & Approvisionnements SILEX',
                clientName: 'SILEX SERVICES INTERNE',
                sector: 'AUTRE_INDUSTRIE',
                siteLocation: 'Siège Social & Magasin Central',
                description: 'Projet interne de gestion des approvisionnements',
                startDate: new Date(),
                contractEndDate: new Date(Date.now() + 365 * 86400000),
                contractAmount: 0,
                budgetAmount: 0,
                managerId: 'usr-rp-002',
              },
            });
          }
          resolvedProjectId = firstPrj.id;
        }

        const created = await prisma.purchaseRequest.create({
          data: {
            reference: code,
            projectId: resolvedProjectId,
            createdById: data.requestedById || data.createdById || 'usr-rp-002',
            urgencyLevel: (data.urgency || data.urgencyLevel || 'NORMAL'),
            status: 'SUBMITTED',
            desiredDate: data.desiredDeliveryDate ? new Date(data.desiredDeliveryDate) : (data.desiredDate ? new Date(data.desiredDate) : new Date(Date.now() + 7 * 86400000)),
            totalEstimatedAmount: amountHT,
            justification: data.justification || 'Demande d’achat matériel chantier',
          },
        });

        // Lignes de DA
        if (rawLines.length > 0) {
          let defaultItem = await prisma.item.findFirst();
          if (!defaultItem) {
            let cat = await prisma.itemCategory.findFirst();
            if (!cat) cat = await prisma.itemCategory.create({ data: { code: 'TUYAUTERIE', name: 'Tuyauterie & Raccords' } });
            defaultItem = await prisma.item.create({
              data: {
                code: 'ART-GEN-01',
                name: 'Composant industriel',
                description: 'Article catalogue standard',
                categoryId: cat.id,
                unit: 'UNITE',
                unitCost: 1000,
                currentStock: 0,
              },
            });
          }

          for (const line of rawLines) {
            const lineQty = Number(line.quantity || 1);
            const linePrice = Number(line.estimatedUnitPrice !== undefined ? line.estimatedUnitPrice : (line.unitPrice || 0));
            let resolvedItemId = defaultItem.id;
            if (line.itemId) {
              const itemExists = await prisma.item.findUnique({ where: { id: line.itemId } }).catch(() => null);
              if (itemExists) resolvedItemId = itemExists.id;
            }
            await prisma.purchaseRequestLine.create({
              data: {
                purchaseRequestId: created.id,
                itemId: resolvedItemId,
                description: line.customName || line.description || defaultItem.name,
                quantity: lineQty,
                unit: line.unit || 'UNITE',
                technicalSpecs: line.customNuance || line.technicalSpecs || '',
                estimatedUnitPrice: linePrice,
                subtotal: lineQty * linePrice,
              },
            });
          }
        }

        // Génération automatique workflow QCD
        await this.createWorkflow({
          title: `Demande d’Achat ${code}`,
          reference: code,
          type: 'PURCHASE_REQUEST',
          priority: data.urgency,
          targetId: created.id,
          targetCode: code,
          amountHT,
          amountTVA: vatAmount,
          amountTTC: totalTTC,
          justification: data.justification,
          items: rawLines,
        });

        const enriched = {
          ...created,
          code,
          reference: code,
          amountHT,
          vatRate,
          amountTVA: vatAmount,
          amountTTC: totalTTC,
        };

        await this.logAudit('CREATE_PURCHASE_REQUEST', 'PURCHASE_REQUEST', code, `DA ${code} émise (${amountHT.toLocaleString()} DA HT)`, data.user);
        return enriched;
      } catch (err) {
        console.warn('[DB Bridge] Error creating DA in DB:', err);
      }
    }
    const res = serverStore.createPurchaseRequest(data);
    await this.logAudit('CREATE_PURCHASE_REQUEST', 'PURCHASE_REQUEST', res.code, `DA ${res.code} émise`, data.user);
    return res;
  },

  async getSuppliers() {
    if (hasDb) {
      try {
        const supps = await prisma.supplier.findMany({ orderBy: { name: 'asc' } });
        return supps;
      } catch (err) {
        console.warn('[DB Bridge] Fallback store for getSuppliers:', err);
      }
    }
    return serverStore.getSuppliers();
  },

  async createSupplier(data: any) {
    if (hasDb) {
      try {
        const count = await prisma.supplier.count();
        const code = `FOURN-${String(count + 1).padStart(3, '0')}`;
        const created = await prisma.supplier.create({
          data: {
            code,
            name: data.name,
            contactName: data.contactName || 'Responsable Commercial',
            phone: data.phone || '+213 29 00 00 00',
            email: data.email || 'contact@fournisseur.dz',
            taxId: data.taxId || null,
            address: data.address || 'Algérie',
            specialties: data.specialties || 'Fournitures Industrielles',
          },
        });
        await this.logAudit('CREATE_SUPPLIER', 'SUPPLIER', created.code, `Fournisseur qualifié : ${created.name}`, data.user);
        return created;
      } catch (err) {
        console.warn('[DB Bridge] Error creating supplier in DB:', err);
      }
    }
    const res = serverStore.createSupplier(data);
    await this.logAudit('CREATE_SUPPLIER', 'SUPPLIER', res.code, `Fournisseur qualifié : ${res.name}`, data.user);
    return res;
  },

  async getPurchaseOrders() {
    if (hasDb) {
      try {
        const pos = await prisma.purchaseOrder.findMany({
          include: { supplier: true, project: true, lines: { include: { item: true } } },
          orderBy: { createdAt: 'desc' },
        });
        if (pos) {
          return pos.map((po: any) => ({
            ...po,
            code: po.orderNumber || po.code,
            orderNumber: po.orderNumber || po.code,
            totalHT: Number(po.totalAmountHT || po.totalHT || 0),
            totalAmountHT: Number(po.totalAmountHT || po.totalHT || 0),
            totalTTC: Number(po.totalAmountTTC || po.totalTTC || 0),
            totalAmountTTC: Number(po.totalAmountTTC || po.totalTTC || 0),
            vatAmount: Number(po.totalAmountTTC || 0) - Number(po.totalAmountHT || 0),
          }));
        }
      } catch (err) {
        console.warn('[DB Bridge] Fallback store for getPurchaseOrders:', err);
      }
    }
    return serverStore.getPurchaseOrders();
  },

  async createPurchaseOrder(data: any) {
    if (hasDb) {
      try {
        const count = await prisma.purchaseOrder.count();
        const code = `BC-2026-${String(count + 1).padStart(4, '0')}`;
        const totalHT = Number(data.totalHT || data.totalAmountHT || 0);
        const vatRate = Number(data.vatRate || 19);
        const vatAmount = Number(data.vatAmount || totalHT * (vatRate / 100));
        const totalTTC = Number(data.totalTTC || data.totalAmountTTC || totalHT + vatAmount);

        // Find or fallback valid supplier and purchase request
        let supId = data.supplierId;
        if (supId) {
          const supExists = await prisma.supplier.findUnique({ where: { id: supId } }).catch(() => null);
          if (!supExists) supId = null;
        }
        if (!supId) {
          const firstSup = await prisma.supplier.findFirst();
          supId = firstSup?.id;
        }

        let prId = data.purchaseRequestId;
        if (prId) {
          const prExists = await prisma.purchaseRequest.findFirst({
            where: { OR: [{ id: prId }, { reference: prId }] },
          }).catch(() => null);
          prId = prExists ? prExists.id : null;
        }
        if (!prId) {
          const firstPr = await prisma.purchaseRequest.findFirst();
          prId = firstPr?.id;
        }

        const created = await prisma.purchaseOrder.create({
          data: {
            orderNumber: code,
            projectId: data.projectId,
            purchaseRequestId: prId,
            supplierId: supId,
            status: 'ISSUED',
            totalAmountHT: totalHT,
            totalAmountTTC: totalTTC,
            vatRate,
          },
        });

        // Lignes de BC
        const rawLines = Array.isArray(data.items) ? data.items : (Array.isArray(data.lines) ? data.lines : []);
        if (rawLines.length > 0) {
          let defaultItem = await prisma.item.findFirst();
          if (defaultItem) {
            for (const line of rawLines) {
              const lineQty = Number(line.quantity || 1);
              const linePrice = Number(line.unitPrice || 0);
              let resolvedItemId = defaultItem.id;
              if (line.itemId) {
                const itemExists = await prisma.item.findUnique({ where: { id: line.itemId } }).catch(() => null);
                if (itemExists) resolvedItemId = itemExists.id;
              }
              await prisma.purchaseOrderLine.create({
                data: {
                  purchaseOrderId: created.id,
                  itemId: resolvedItemId,
                  description: line.customName || line.name || line.description || defaultItem.name,
                  quantity: lineQty,
                  unit: line.unit || 'UNITE',
                  unitPrice: linePrice,
                  subtotal: lineQty * linePrice,
                },
              });
            }
          }
        }

        // Engagement budgétaire sur le projet
        if (data.projectId && totalHT > 0) {
          await prisma.project.update({
            where: { id: data.projectId },
            data: { committedCost: { increment: totalHT } },
          });
        }

        const enriched = {
          ...created,
          code,
          orderNumber: code,
          totalHT,
          totalTTC,
          vatAmount,
        };

        (serverStore as any).purchaseOrders.push(enriched as any);
        await this.logAudit('CREATE_PURCHASE_ORDER', 'PURCHASE_ORDER', code, `Bon de Commande ${code} émis (${totalHT.toLocaleString()} DA HT)`, data.user);
        return enriched;
      } catch (err) {
        console.warn('[DB Bridge] Error creating PO in DB:', err);
      }
    }
    const res = serverStore.createPurchaseOrder(data);
    await this.logAudit('CREATE_PURCHASE_ORDER', 'PURCHASE_ORDER', res.code, `Bon de Commande émis`, data.user);
    return res;
  },

  // --- INVENTORY ---
  async getWarehouses() {
    if (hasDb) {
      try {
        const whs = await prisma.warehouse.findMany({ orderBy: { name: 'asc' } });
        return whs;
      } catch (err) {
        console.warn('[DB Bridge] Fallback store for getWarehouses:', err);
      }
    }
    return serverStore.getWarehouses();
  },

  async createWarehouse(data: any) {
    if (hasDb) {
      try {
        const count = await prisma.warehouse.count();
        const code = data.code || `MAG-${String(count + 1).padStart(2, '0')}`;
        const created = await prisma.warehouse.create({
          data: {
            code,
            name: data.name,
            location: data.location || '',
            managerName: data.managerName || data.responsibleName || 'Gestionnaire Magasin',
            active: true,
          },
        });
        await this.logAudit('CREATE_WAREHOUSE', 'INVENTORY', created.code, `Magasin créé : ${created.name}`, data.user);
        return created;
      } catch (err) {
        console.warn('[DB Bridge] Error creating warehouse in DB:', err);
      }
    }
    const res = serverStore.createWarehouse(data);
    await this.logAudit('CREATE_WAREHOUSE', 'INVENTORY', res.code, `Magasin créé : ${res.name}`, data.user);
    return res;
  },

  async getInventoryItems() {
    if (hasDb) {
      try {
        const items = await prisma.item.findMany({ orderBy: { name: 'asc' } });
        return items;
      } catch (err) {
        console.warn('[DB Bridge] Fallback store for getInventoryItems:', err);
      }
    }
    return serverStore.getInventoryItems();
  },

  async createInventoryItem(data: any) {
    if (hasDb) {
      try {
        let cat = await prisma.itemCategory.findFirst();
        if (!cat) {
          cat = await prisma.itemCategory.create({
            data: {
              code: data.category || 'TUYAUTERIE',
              name: data.category || 'Tuyauterie & Raccords',
            },
          });
        }

        const count = await prisma.item.count();
        const code = data.code || `ART-2026-${String(count + 1).padStart(4, '0')}`;
        const created = await prisma.item.create({
          data: {
            code,
            name: data.name || data.designation || 'Article Industriel',
            description: data.description || data.designation || data.name || 'Article standard',
            categoryId: cat.id,
            unit: data.unit || 'UNITE',
            unitCost: Number(data.unitCost !== undefined ? data.unitCost : (data.unitPrice || 0)),
            minStockLevel: Number(data.minStock || data.minStockLevel || 10),
            currentStock: Number(data.currentStock || 0),
            active: true,
          },
        });
        await this.logAudit('CREATE_ITEM', 'INVENTORY', created.code, `Article référencé : ${created.name} (${created.code})`, data.user);
        return created;
      } catch (err) {
        console.warn('[DB Bridge] Error creating inventory item in DB:', err);
      }
    }
    const res = serverStore.createInventoryItem(data);
    await this.logAudit('CREATE_ITEM', 'INVENTORY', res.code, `Article référencé : ${res.name}`, data.user);
    return res;
  },

  async deleteInventoryItem(id: string, user?: any) {
    if (hasDb) {
      try {
        await prisma.stockMovement.deleteMany({ where: { itemId: id } });
        await prisma.purchaseRequestLine.deleteMany({ where: { itemId: id } });
        await prisma.purchaseOrderLine.deleteMany({ where: { itemId: id } });
        await prisma.goodsReceiptLine.deleteMany({ where: { itemId: id } });
        await prisma.item.delete({ where: { id } });
        await this.logAudit('DELETE_ITEM', 'INVENTORY', id, `Suppression article ${id}`, user);
        return { success: true };
      } catch (err) {
        console.warn('[DB Bridge] Error deleting item in DB:', err);
      }
    }
    return { success: true };
  },

  async getStockMovements() {
    if (hasDb) {
      try {
        const mvts = await prisma.stockMovement.findMany({
          include: { item: true, warehouse: true, purchaseOrder: true },
          orderBy: { createdAt: 'desc' },
        });
        return mvts;
      } catch (err) {
        console.warn('[DB Bridge] Fallback store for getStockMovements:', err);
      }
    }
    return serverStore.getStockMovements();
  },

  async recordStockMovement(data: any) {
    if (hasDb) {
      try {
        const mvtNumber = `MVT-${Date.now()}`;
        const qty = Number(data.quantity || 0);
        const isEntry = data.type === 'ENTRY' || data.type === 'IN' || data.type === 'RECEPTION';
        const unitCost = Number(data.unitCost || 0);
        const totalCost = qty * unitCost;

        let wh = data.warehouseId ? await prisma.warehouse.findUnique({ where: { id: data.warehouseId } }) : null;
        if (!wh) {
          wh = await prisma.warehouse.findFirst();
          if (!wh) {
            wh = await prisma.warehouse.create({
              data: {
                code: 'MAG-CENTRAL',
                name: 'Magasin Central Arzew',
                location: 'Zone Industrielle Arzew',
                managerName: 'Tarek Meziani',
                active: true,
              },
            });
          }
        }

        let itm = data.itemId ? await prisma.item.findUnique({ where: { id: data.itemId } }) : null;
        if (!itm) {
          itm = await prisma.item.findFirst();
          if (!itm) {
            let cat = await prisma.itemCategory.findFirst();
            if (!cat) cat = await prisma.itemCategory.create({ data: { code: 'GEN', name: 'Général' } });
            itm = await prisma.item.create({
              data: {
                code: 'ART-GEN-01',
                name: data.itemName || 'Article Magasin',
                description: 'Article standard',
                categoryId: cat.id,
                unit: data.unit || 'UNITE',
                unitCost,
                currentStock: 100,
              },
            });
          }
        }

        let resolvedProjectId: string | null = null;
        if (data.projectId) {
          const prj = await prisma.project.findFirst({
            where: { OR: [{ id: data.projectId }, { code: data.projectId }] },
          });
          if (prj) resolvedProjectId = prj.id;
        } else if (data.projectCode) {
          const prj = await prisma.project.findFirst({
            where: { OR: [{ id: data.projectCode }, { code: data.projectCode }] },
          });
          if (prj) resolvedProjectId = prj.id;
        }

        const mvtType = isEntry ? 'PURCHASE_RECEIPT' : 'PROJECT_ISSUE';
        const created = await prisma.stockMovement.create({
          data: {
            movementNumber: mvtNumber,
            movementType: mvtType as any,
            warehouseId: wh.id,
            itemId: itm.id,
            quantity: qty,
            unitCost,
            totalCost,
            projectId: resolvedProjectId,
            referenceDocument: data.documentRef || data.deliveryNoteNumber || '',
            notes: data.notes || '',
            createdById: data.createdById || 'usr-mag-001',
          },
        });

        const newStock = isEntry
          ? Number(itm.currentStock || 0) + qty
          : Math.max(0, Number(itm.currentStock || 0) - qty);

        await prisma.item.update({
          where: { id: itm.id },
          data: {
            currentStock: newStock,
          },
        });

        if (!isEntry && resolvedProjectId && totalCost > 0) {
          await prisma.project.update({
            where: { id: resolvedProjectId },
            data: { actualCost: { increment: totalCost } },
          });
        }

        await this.logAudit('STOCK_MOVEMENT', 'INVENTORY', mvtNumber, `${isEntry ? 'Entrée' : 'Sortie'} de ${qty} ${itm.unit} pour ${itm.name}`, data.user);
        return created;
      } catch (err) {
        console.warn('[DB Bridge] Error recording stock movement in DB:', err);
      }
    }
    const res = serverStore.recordStockMovement(data);
    await this.logAudit('STOCK_MOVEMENT', 'INVENTORY', res.movementNumber, `Mouvement de stock enregistré`, data.user);
    return res;
  },

  // --- HR ---
  async getEmployees() {
    if (hasDb) {
      try {
        const emps = await prisma.employee.findMany({
          include: { department: true, certifications: true },
          orderBy: { lastName: 'asc' },
        });
        return emps;
      } catch (err) {
        console.warn('[DB Bridge] Fallback store for getEmployees:', err);
      }
    }
    return serverStore.getEmployees();
  },

  async createEmployee(data: any) {
    if (hasDb) {
      try {
        let dept = await prisma.department.findFirst();
        if (!dept) {
          dept = await prisma.department.create({
            data: {
              code: 'OPERATIONS_PROJETS',
              name: 'Opérations & Chantiers',
            },
          });
        }

        const count = await prisma.employee.count();
        const registrationNumber = `MAT-${String(count + 1).padStart(4, '0')}`;
        const created = await prisma.employee.create({
          data: {
            registrationNumber,
            firstName: data.firstName || 'Collaborateur',
            lastName: data.lastName || 'SILEX',
            title: data.title || 'Technicien Chantier',
            departmentId: dept.id,
            email: data.email || `emp.${Date.now()}@silex.dz`,
            phone: data.phone || '+213 29 00 00 00',
            contractType: data.contractType || 'CDI',
            hireDate: data.hireDate ? new Date(data.hireDate) : new Date(),
            status: 'ACTIF',
          },
        });
        await this.logAudit('CREATE_EMPLOYEE', 'HR', created.registrationNumber, `Collaborateur créé : ${created.firstName} ${created.lastName}`, data.user);
        return created;
      } catch (err) {
        handleDbPersistenceError('createEmployee', err);
      }
    }
    const res = serverStore.createEmployee(data);
    await this.logAudit('CREATE_EMPLOYEE', 'HR', res.matricule, `Collaborateur créé : ${res.firstName} ${res.lastName}`, data.user);
    return res;
  },

  async getCertifications() {
    if (hasDb) {
      try {
        const certs = await prisma.employeeCertification.findMany({
          include: { employee: true },
          orderBy: { expiryDate: 'asc' },
        });
        return certs;
      } catch (err) {
        console.warn('[DB Bridge] Fallback store for getCertifications:', err);
      }
    }
    return serverStore.getCertifications();
  },

  async createCertification(data: any) {
    if (hasDb) {
      try {
        let emp = data.employeeId ? await prisma.employee.findUnique({ where: { id: data.employeeId } }) : null;
        if (!emp) emp = await prisma.employee.findFirst();
        if (emp) {
          const created = await prisma.employeeCertification.create({
            data: {
              employeeId: emp.id,
              certName: data.name || data.certName || 'Qualification Soudage CQS',
              issuingBody: data.issuingBody || 'Bureau Veritas',
              issueDate: data.issuedDate ? new Date(data.issuedDate) : new Date(),
              expiryDate: data.expiryDate ? new Date(data.expiryDate) : new Date(Date.now() + 365 * 86400000),
              status: 'VALIDE',
            },
          });
          await this.logAudit('CREATE_CERTIFICATION', 'HR', created.id, `Certification enregistrée : ${created.certName}`, data.user);
          return created;
        }
      } catch (err) {
        handleDbPersistenceError('createCertification', err);
      }
    }
    const res = serverStore.createCertification(data);
    await this.logAudit('CREATE_CERTIFICATION', 'HR', res.certificateNumber, `Certification enregistrée : ${res.name}`, data.user);
    return res;
  },

  async getAttendances() {
    if (hasDb) {
      try {
        const atts = await prisma.attendance.findMany({
          include: { employee: true, project: true },
          orderBy: { date: 'desc' },
        });
        return atts;
      } catch (err) {
        console.warn('[DB Bridge] Fallback store for getAttendances:', err);
      }
    }
    return serverStore.getAttendances();
  },

  async recordAttendance(data: any) {
    if (hasDb) {
      try {
        let emp = data.employeeId ? await prisma.employee.findUnique({ where: { id: data.employeeId } }) : null;
        if (!emp) emp = await prisma.employee.findFirst();
        if (emp) {
          const regularHours = Number(data.hoursWorked || data.regularHours || 8);
          const overtimeHours = Number(data.overtimeHours || 0);

          const created = await prisma.attendance.create({
            data: {
              employeeId: emp.id,
              projectId: data.projectId || null,
              date: data.date ? new Date(data.date) : new Date(),
              regularHours,
              overtimeHours,
              isAbsent: data.type === 'ABSENT',
              absenceReason: data.absenceReason || null,
            },
          });

          // Allocation coût main d'oeuvre sur chantier
          if (data.projectId) {
            const dailyCost = (regularHours * 600) + (overtimeHours * 900);
            await prisma.project.update({
              where: { id: data.projectId },
              data: { actualCost: { increment: dailyCost } },
            });
          }

          await this.logAudit('RECORD_ATTENDANCE', 'HR', created.id, `Pointage enregistré pour ${emp.firstName} ${emp.lastName}`, data.user);
          return created;
        }
      } catch (err) {
        handleDbPersistenceError('recordAttendance', err);
      }
    }
    const res = serverStore.recordAttendance(data);
    await this.logAudit('RECORD_ATTENDANCE', 'HR', res.id, `Pointage enregistré`, data.user);
    return res;
  },

  // --- FLEET & MAINTENANCE ---
  async getFleetAssets() {
    if (hasDb) {
      try {
        const asts = await prisma.asset.findMany({
          include: { currentProject: true, maintenanceOrders: true },
          orderBy: { name: 'asc' },
        });
        return asts;
      } catch (err) {
        console.warn('[DB Bridge] Fallback store for getFleetAssets:', err);
      }
    }
    return serverStore.getFleetAssets();
  },

  async createFleetAsset(data: any) {
    if (hasDb) {
      try {
        const count = await prisma.asset.count();
        const assetTag = data.code || data.assetTag || `EQP-${String(count + 1).padStart(3, '0')}`;
        let assetType: any = 'ENGIN_LEVAGE';
        if (data.type === 'VEHICULE' || data.assetType === 'VEHICULE') assetType = 'VEHICULE';
        if (data.type === 'MACHINE_OUTIL' || data.assetType === 'MACHINE_OUTIL') assetType = 'MACHINE_OUTIL';
        if (data.type === 'POSTE_SOUDURE' || data.assetType === 'POSTE_SOUDURE') assetType = 'POSTE_SOUDURE';
        if (data.type === 'GROUPE_ELECTROGENE' || data.assetType === 'GROUPE_ELECTROGENE') assetType = 'GROUPE_ELECTROGENE';
        if (data.type === 'EQUIPEMENT_HVAC' || data.assetType === 'EQUIPEMENT_HVAC') assetType = 'EQUIPEMENT_HVAC';

        const created = await prisma.asset.create({
          data: {
            assetTag,
            name: data.name,
            assetType,
            brand: data.brand || 'Caterpillar',
            model: data.model || 'Standard',
            serialNumber: data.serialNumber || `SN-${Date.now()}`,
            status: 'OPERATIONAL',
            acquisitionDate: data.acquisitionDate ? new Date(data.acquisitionDate) : new Date(),
          },
        });
        await this.logAudit('CREATE_ASSET', 'MAINTENANCE', created.assetTag, `Équipement parc enregistré : ${created.name} (${created.assetTag})`, data.user);
        return created;
      } catch (err) {
        console.warn('[DB Bridge] Error creating asset in DB:', err);
      }
    }
    const res = serverStore.createFleetAsset(data);
    await this.logAudit('CREATE_ASSET', 'MAINTENANCE', res.code, `Équipement enregistré : ${res.name}`, data.user);
    return res;
  },

  async getMaintenanceOrders() {
    if (hasDb) {
      try {
        const orders = await prisma.maintenanceOrder.findMany({
          include: { asset: true },
          orderBy: { scheduledDate: 'desc' },
        });
        return orders;
      } catch (err) {
        console.warn('[DB Bridge] Fallback store for getMaintenanceOrders:', err);
      }
    }
    return serverStore.getMaintenanceOrders();
  },

  async createMaintenanceOrder(data: any) {
    if (hasDb) {
      try {
        let asset = data.assetId ? await prisma.asset.findUnique({ where: { id: data.assetId } }) : null;
        if (!asset) asset = await prisma.asset.findFirst();
        if (asset) {
          const count = await prisma.maintenanceOrder.count();
          const orderNumber = data.code || data.orderNumber || `OT-2026-${String(count + 1).padStart(4, '0')}`;
          const created = await prisma.maintenanceOrder.create({
            data: {
              orderNumber,
              assetId: asset.id,
              type: (data.type || 'PREVENTIVE') as any,
              priority: data.priority || 'MEDIUM',
              status: 'SCHEDULED',
              description: data.description || 'Intervention de maintenance',
              scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : new Date(),
              cost: Number(data.orderCost || data.estimatedCost || 0),
              technician: data.technician || 'Technicien SILEX',
            },
          });
          await this.logAudit('CREATE_MAINTENANCE_ORDER', 'MAINTENANCE', created.orderNumber, `OT ${created.orderNumber} émis pour ${asset.name}`, data.user);
          return created;
        }
      } catch (err) {
        console.warn('[DB Bridge] Error creating maintenance order in DB:', err);
      }
    }
    const res = serverStore.createMaintenanceOrder(data);
    await this.logAudit('CREATE_MAINTENANCE_ORDER', 'MAINTENANCE', res.code, `OT émis pour matériel`, data.user);
    return res;
  },

  // --- QUALITY & QHSE ---
  async getNonConformities(projectId?: string) {
    if (hasDb) {
      try {
        const whereClause = projectId ? { OR: [{ projectId }, { project: { code: projectId } }] } : {};
        const ncs = await prisma.nonConformity.findMany({
          where: whereClause,
          include: { project: true, actions: true },
          orderBy: { detectedDate: 'desc' },
        });
        return ncs || [];
      } catch (err) {
        console.warn('[DB Bridge] Fallback store for getNonConformities:', err);
      }
    }
    return serverStore.getNonConformities(projectId);
  },

  async getNonConformity(idOrCode: string) {
    if (hasDb) {
      try {
        const nc = await prisma.nonConformity.findFirst({
          where: { OR: [{ id: idOrCode }, { ncNumber: idOrCode }] },
          include: { project: true, actions: true },
        });
        if (nc) return nc;
      } catch (err) {
        console.warn('[DB Bridge] Fallback store for getNonConformity:', err);
      }
    }
    return serverStore.getNonConformity(idOrCode);
  },

  async createNonConformity(data: any, user?: any) {
    if (hasDb) {
      try {
        const count = await prisma.nonConformity.count();
        const ncNumber = data.code || data.ncNumber || `FNC-2026-${String(count + 1).padStart(3, '0')}`;
        const rawSev = String(data.severity || 'MAJEURE').toUpperCase();
        const severity = rawSev.includes('MIN') ? 'MINEURE' : (rawSev.includes('CRIT') ? 'CRITIQUE' : 'MAJEURE');

        // Resolve project if project code or id is provided
        let projectId = data.projectId || null;
        if (data.projectCode && !projectId) {
          const prj = await prisma.project.findFirst({
            where: { OR: [{ code: data.projectCode }, { id: data.projectCode }] },
          });
          if (prj) projectId = prj.id;
        }

        const created = await prisma.nonConformity.create({
          data: {
            ncNumber,
            title: data.title || 'Fiche Non-Conformité',
            description: data.description || '',
            severity: severity as any,
            status: 'OPEN',
            detectedBy: data.detectedBy || user?.name || 'Inspecteur CND SILEX',
            projectId,
          },
        });
        await this.logAudit('CREATE_NON_CONFORMITY', 'QUALITY', created.ncNumber, `FNC ouverte : ${created.ncNumber} - ${created.title}`, user);
        return created;
      } catch (err) {
        console.warn('[DB Bridge] Error creating FNC in DB:', err);
      }
    }
    const res = serverStore.createNonConformity(data, user);
    await this.logAudit('CREATE_NON_CONFORMITY', 'QUALITY', res.ncNumber, `FNC ouverte : ${res.ncNumber} - ${res.title}`, user);
    return res;
  },

  async updateNonConformityStatus(idOrCode: string, updateData: any, user?: any) {
    if (hasDb) {
      try {
        const updated = await prisma.nonConformity.updateMany({
          where: { OR: [{ id: idOrCode }, { ncNumber: idOrCode }] },
          data: {
            status: updateData.status as any,
            rootCause: updateData.resolutionNotes || updateData.rootCause || undefined,
          },
        });
        if (updated.count > 0) {
          await this.logAudit('UPDATE_NON_CONFORMITY_STATUS', 'QUALITY', idOrCode, `Statut FNC mis à jour : ${updateData.status}`, user);
        }
      } catch (err) {
        console.warn('[DB Bridge] Error updating FNC status in DB:', err);
      }
    }
    return serverStore.updateNonConformityStatus(idOrCode, updateData, user);
  },

  async addNonConformityAction(idOrCode: string, actionData: any, user?: any) {
    if (hasDb) {
      try {
        const nc = await prisma.nonConformity.findFirst({
          where: { OR: [{ id: idOrCode }, { ncNumber: idOrCode }] },
        });
        if (nc) {
          const act = await prisma.correctiveAction.create({
            data: {
              nonConformityId: nc.id,
              description: actionData.description || 'Action corrective',
              responsible: actionData.responsible || 'Responsable QHSE',
              dueDate: new Date(actionData.targetDate || actionData.dueDate || Date.now() + 7 * 86400000),
              status: (actionData.status as any) || 'IN_PROGRESS',
            },
          });
          await this.logAudit('ADD_NON_CONFORMITY_ACTION', 'QUALITY', nc.ncNumber, `Action corrective ajoutée : ${act.description}`, user);
        }
      } catch (err) {
        console.warn('[DB Bridge] Error adding action in DB:', err);
      }
    }
    return serverStore.addNonConformityAction(idOrCode, actionData, user);
  },

  async getQualityDocuments(category?: string) {
    if (hasDb) {
      try {
        const whereClause = category ? { category: category as any } : {};
        const docs = await prisma.document.findMany({
          where: whereClause,
          include: { project: true },
          orderBy: { issueDate: 'desc' },
        });
        return docs || [];
      } catch (err) {
        console.warn('[DB Bridge] Fallback store for getQualityDocuments:', err);
      }
    }
    return serverStore.getQualityDocuments(category);
  },

  async getQualityDocument(idOrNumber: string) {
    if (hasDb) {
      try {
        const doc = await prisma.document.findFirst({
          where: { OR: [{ id: idOrNumber }, { docNumber: idOrNumber }] },
          include: { project: true },
        });
        if (doc) return doc;
      } catch (err) {
        console.warn('[DB Bridge] Fallback store for getQualityDocument:', err);
      }
    }
    return serverStore.getQualityDocument(idOrNumber);
  },

  async createQualityDocument(data: any, user?: any) {
    if (hasDb) {
      try {
        let proj = data.projectId ? await prisma.project.findUnique({ where: { id: data.projectId } }) : null;
        if (!proj) proj = await prisma.project.findFirst();
        if (proj) {
          const docNumber = data.docNumber || `DOC-2026-${Date.now().toString().slice(-4)}`;
          const created = await prisma.document.create({
            data: {
              projectId: proj.id,
              docNumber,
              title: data.title || data.name || 'Document Qualité',
              category: (data.category || 'PROCEDURE') as any,
              author: data.author || user?.name || 'SILEX QHSE',
              fileUrl: data.fileUrl || '/docs/sample.pdf',
              status: 'VALIDE',
            },
          });
          await this.logAudit('CREATE_DOCUMENT', 'QUALITY', docNumber, `Document qualité déposé : ${created.title}`, user);
          return created;
        }
      } catch (err) {
        console.warn('[DB Bridge] Error creating document in DB:', err);
      }
    }
    const res = serverStore.createQualityDocument(data, user);
    await this.logAudit('CREATE_DOCUMENT', 'QUALITY', res.docNumber, `Document déposé : ${res.title}`, user);
    return res;
  },

  async addQualityDocumentRevision(idOrNumber: string, revData: any, user?: any) {
    return serverStore.addQualityDocumentRevision(idOrNumber, revData, user);
  },

  // --- WELD BOOK & SOUDURES INDUSTRIELLES (ASME IX / ISO 9606) ---
  async getWeldJoints(projectId?: string) {
    if (hasDb) {
      try {
        const whereClause = projectId ? { OR: [{ projectId }, { projectCode: projectId }] } : {};
        const welds = await (prisma as any).weldJoint.findMany({
          where: whereClause,
          include: {
            repairs: true,
            nonConformities: true,
            welder: { include: { certifications: true } },
          },
          orderBy: { jointNumber: 'asc' },
        });
        // Une liste réelle vide est une réponse valide (aucune soudure enregistrée
        // pour l'instant) : elle ne doit jamais basculer sur les données de
        // démonstration en mémoire, sous peine d'afficher un chantier fictif.
        return (welds || []).map((w: any) => ({
          ...w,
          thicknessMm: w.thicknessMm ? Number(w.thicknessMm) : undefined,
          cndInspection: {
            type: w.cndType,
            requiredRatePercent: w.cndRatePercent,
            status: w.cndStatus,
            cndReportRef: w.cndReportRef,
            filmRef: w.cndFilmRef,
            controlDate: w.cndControlDate ? w.cndControlDate.toISOString().split('T')[0] : null,
            controllingBody: w.cndControllingBody,
          },
          repairHistory: (w.repairs || []).map((r: any) => ({
            repairIndex: r.repairIndex,
            repairDate: r.repairDate ? r.repairDate.toISOString().split('T')[0] : null,
            repairWelderStamp: r.repairWelderStamp,
            repairDmosRef: r.repairDmosRef,
            postRepairCndStatus: r.postRepairCndStatus,
            postRepairCndReportRef: r.postRepairCndReportRef,
          })),
        }));
      } catch (err) {
        handleDbPersistenceError('getWeldJoints', err);
      }
    }
    return serverStore.getWeldJoints(projectId);
  },

  async getWeldJoint(idOrNumber: string) {
    if (hasDb) {
      try {
        const weld = await (prisma as any).weldJoint.findFirst({
          where: { OR: [{ id: idOrNumber }, { jointNumber: idOrNumber }] },
          include: {
            repairs: true,
            nonConformities: true,
            welder: { include: { certifications: true } },
          },
        });
        if (weld) {
          return {
            ...weld,
            thicknessMm: weld.thicknessMm ? Number(weld.thicknessMm) : undefined,
            cndInspection: {
              type: weld.cndType,
              requiredRatePercent: weld.cndRatePercent,
              status: weld.cndStatus,
              cndReportRef: weld.cndReportRef,
              filmRef: weld.cndFilmRef,
              controlDate: weld.cndControlDate ? weld.cndControlDate.toISOString().split('T')[0] : null,
              controllingBody: weld.cndControllingBody,
            },
            repairHistory: (weld.repairs || []).map((r: any) => ({
              repairIndex: r.repairIndex,
              repairDate: r.repairDate ? r.repairDate.toISOString().split('T')[0] : null,
              repairWelderStamp: r.repairWelderStamp,
              repairDmosRef: r.repairDmosRef,
              postRepairCndStatus: r.postRepairCndStatus,
              postRepairCndReportRef: r.postRepairCndReportRef,
            })),
          };
        }
      } catch (err) {
        handleDbPersistenceError('getWeldJoint', err);
      }
    }
    return serverStore.getWeldJoint(idOrNumber);
  },

  async createWeldJoint(data: any, user?: any) {
    if (hasDb) {
      try {
        const proj = await prisma.project.findFirst({
          where: { OR: [{ id: data.projectId }, { code: data.projectCode }] },
        });
        const created = await (prisma as any).weldJoint.create({
          data: {
            jointNumber: data.jointNumber,
            projectId: proj?.id || data.projectId,
            projectCode: proj?.code || data.projectCode,
            lineIso: data.lineIso,
            spoolId: data.spoolId,
            diameterNominal: data.diameterNominal,
            thicknessMm: data.thicknessMm ? Number(data.thicknessMm) : undefined,
            material: data.material,
            heatNumberPipe: data.heatNumberPipe,
            heatNumberFitting: data.heatNumberFitting,
            welderName: data.welderName,
            welderStamp: data.welderStamp,
            welderCqsRef: data.welderCqsRef,
            weldingProcess: data.weldingProcess,
            dmosRef: data.dmosRef,
            weldDate: data.weldDate ? new Date(data.weldDate) : new Date(),
            visualInspection: data.visualInspection || 'CONFORME',
            cndType: data.cndInspection?.type || data.cndType || 'RT',
            cndRatePercent: data.cndInspection?.requiredRatePercent || 100,
            cndStatus: data.cndInspection?.status || 'EN_ATTENTE_CND',
            cndControllingBody: data.cndInspection?.controllingBody || 'CND Sud Contrôle (COFREND II)',
            status: (data.status || 'EN_ATTENTE_CND') as any,
            notes: data.notes || '',
          },
        });
        serverStore.createWeldJoint({ ...data, id: created.id }, user);
        await this.logAudit('CREATE_WELD_JOINT', 'QUALITY', created.jointNumber, `Joint consigné au Weld Book : ${created.jointNumber} (${created.lineIso})`, user);
        return created;
      } catch (err) {
        handleFinancePersistenceError('createWeldJoint', err);
      }
    }
    return serverStore.createWeldJoint(data, user);
  },

  async recordWeldCndResult(idOrNumber: string, data: any, user?: any) {
    if (hasDb) {
      try {
        const weld = await (prisma as any).weldJoint.findFirst({
          where: { OR: [{ id: idOrNumber }, { jointNumber: idOrNumber }] },
        });
        if (weld) {
          const cndStatus = data.status || 'CONFORME';
          const updated = await (prisma as any).weldJoint.update({
            where: { id: weld.id },
            data: {
              cndStatus,
              cndType: data.type || weld.cndType,
              cndReportRef: data.cndReportRef || weld.cndReportRef,
              cndFilmRef: data.filmRef || weld.cndFilmRef,
              cndControlDate: data.controlDate ? new Date(data.controlDate) : new Date(),
              cndControllingBody: data.controllingBody || weld.cndControllingBody,
              status: cndStatus === 'CONFORME' ? 'LIBERE_EPREUVE' : (cndStatus === 'A_REPARER' ? 'A_REPARER' : 'REJETE'),
            },
          });
          if (data.autoCreateFnc && (cndStatus === 'A_REPARER' || cndStatus === 'COUPE')) {
            await (prisma as any).nonConformity.create({
              data: {
                ncNumber: `FNC-2026-${Date.now().toString().slice(-3)}`,
                title: `Défaut CND sur joint ${weld.jointNumber} (${data.defectType || 'Inclusion'})`,
                description: `Contrôle CND non-conforme : ${data.defectType || 'Défaut de compacité'}. Rapport ${data.cndReportRef}.`,
                severity: 'MAJEURE',
                status: 'OPEN',
                detectedBy: data.controllingBody || 'Organisme de Contrôle CND',
                projectId: weld.projectId,
                weldJointId: weld.id,
                weldJointNumber: weld.jointNumber,
              },
            });
          }
          serverStore.recordWeldCndResult(weld.jointNumber, data, user);
          await this.logAudit('RECORD_WELD_CND_RESULT', 'QUALITY', weld.jointNumber, `Contrôle CND enregistré sur ${weld.jointNumber} : ${cndStatus}`, user);
          return updated;
        }
      } catch (err) {
        handleFinancePersistenceError('recordWeldCndResult', err);
      }
    }
    return serverStore.recordWeldCndResult(idOrNumber, data, user);
  },

  async recordWeldRepair(idOrNumber: string, data: any, user?: any) {
    if (hasDb) {
      try {
        const weld = await (prisma as any).weldJoint.findFirst({
          where: { OR: [{ id: idOrNumber }, { jointNumber: idOrNumber }] },
          include: { repairs: true },
        });
        if (weld) {
          const nextIdx = (weld.repairs?.length || 0) + 1;
          const postCnd = data.postRepairCndStatus || 'CONFORME';
          await (prisma as any).weldRepair.create({
            data: {
              weldJointId: weld.id,
              repairIndex: nextIdx,
              repairDate: data.repairDate ? new Date(data.repairDate) : new Date(),
              repairWelderStamp: data.repairWelderStamp || 'S-02',
              repairWelderName: data.repairWelderName,
              repairDmosRef: data.repairDmosRef || 'DMOS-REP-01',
              postRepairCndStatus: postCnd,
              postRepairCndReportRef: data.postRepairCndReportRef,
              notes: data.notes || '',
            },
          });
          await (prisma as any).weldJoint.update({
            where: { id: weld.id },
            data: {
              status: postCnd === 'CONFORME' ? 'REPARE_CONFORME' : 'A_REPARER',
              cndStatus: postCnd === 'CONFORME' ? 'CONFORME' : 'A_REPARER',
            },
          });
          serverStore.recordWeldRepair(weld.jointNumber, data, user);
          await this.logAudit('RECORD_WELD_REPAIR', 'QUALITY', weld.jointNumber, `Réparation enregistrée pour ${weld.jointNumber} (Index #${nextIdx}, DMOS: ${data.repairDmosRef || 'DMOS-REP-01'})`, user);
          return this.getWeldJoint(weld.id);
        }
      } catch (err) {
        handleFinancePersistenceError('recordWeldRepair', err);
      }
    }
    return serverStore.recordWeldRepair(idOrNumber, data, user);
  },

  // --- FINANCE ---
  async recordPayment(data: any) {
    const payment = serverStore.recordPayment(data);
    await this.logAudit('RECORD_PAYMENT', 'FINANCE', payment.paymentReference, `Encaissement de ${payment.amount.toLocaleString()} DA enregistré`, data.user);
    return payment;
  },

  async getFinanceOverview(options?: { includeDemo?: boolean }) {
    let projs: any[] = [];
    if (hasDb) {
      try {
        projs = await prisma.project.findMany({
          include: { workSituations: true, milestones: true },
          orderBy: { createdAt: 'desc' },
        });
      } catch (err) {
        projs = serverStore.getProjects();
      }
    } else {
      projs = serverStore.getProjects();
    }

    let totalContractAmount = 0;
    let totalBudgetAmount = 0;
    let totalCommittedCost = 0;
    let totalActualCost = 0;
    let totalBilled = 0;
    let totalWarrantyHeld = 0;

    const projectOverviews = (projs || []).map((p: any) => {
      const contractAmount = Number(p.contractAmount || 0);
      const budgetAmount = Number(p.budgetAmount || 0);
      const committedCost = Number(p.committedCost || 0);
      const actualCost = Number(p.actualCost || 0);

      totalContractAmount += contractAmount;
      totalBudgetAmount += budgetAmount;
      totalCommittedCost += committedCost;
      totalActualCost += actualCost;

      const wsList = Array.isArray(p.workSituations) ? p.workSituations : [];
      const projectBilled = wsList.reduce((sum: number, s: any) => sum + Number(s.amountHT || 0), 0);
      const projectWarranty = wsList.reduce((sum: number, s: any) => sum + Number(s.retenueGarantie || (Number(s.amountHT || 0) * 0.05)), 0);

      totalBilled += projectBilled;
      totalWarrantyHeld += projectWarranty;

      const projectPaid = (serverStore.financePayments || [])
        .filter((pay: any) => pay.projectId === p.id)
        .reduce((sum: number, pay: any) => sum + Number(pay.amount || 0), 0);

      const marginDA = Math.max(0, contractAmount - budgetAmount);
      const marginRate = contractAmount > 0 ? ((marginDA / contractAmount) * 100).toFixed(1) : '0.0';

      return {
        id: p.id,
        code: p.code,
        name: p.name,
        clientName: p.clientName,
        contractAmount,
        budgetAmount,
        committedCost,
        actualCost,
        billedAmount: projectBilled,
        paidAmount: projectPaid,
        pendingAmount: Math.max(0, projectBilled - projectPaid),
        warrantyHeld: projectWarranty,
        marginDA,
        marginRate,
        status: p.status,
      };
    });

    const totalCollected = (serverStore.financePayments || []).reduce((sum: number, pay: any) => sum + Number(pay.amount || 0), 0);
    const pendingCollection = Math.max(0, totalBilled - totalCollected);
    const globalMarginDA = Math.max(0, totalContractAmount - totalBudgetAmount);
    const globalMarginRate = totalContractAmount > 0 ? ((globalMarginDA / totalContractAmount) * 100).toFixed(1) : '0.0';

    const totals = {
      contractAmount: totalContractAmount,
      budgetAmount: totalBudgetAmount,
      committedCost: totalCommittedCost,
      actualCost: totalActualCost,
      globalMarginRate,
      totalBilled,
      totalCollected,
      pendingCollection,
      warrantyHeld: totalWarrantyHeld,
    };

    return {
      totals,
      kpis: {
        totalContracted: totalContractAmount,
        totalBilled,
        totalCollected,
        pendingCollection,
        warrantyHeld: totalWarrantyHeld,
        treasuryBalance: totalCollected - totalCommittedCost,
      },
      summary: totals,
      projects: projectOverviews,
      distribution: serverStore.getCostDistribution(),
      isDemoIncluded: options?.includeDemo === true,
    };
  },

  async getCostDistribution() {
    return serverStore.getCostDistribution();
  },

  // --- MODULE 06 : FINANCE & TRÉSORERIE (PERSISTANCE PRISMA / NEON AVEC FALLBACK SÉCURISÉ) ---
  async getFinancialConfig() {
    if (hasDb) {
      try {
        const dbCfg = await (prisma as any).financialConfig.findFirst({
          orderBy: { updatedAt: 'desc' },
        });
        if (dbCfg) {
          return {
            defaultVatRate: Number(dbCfg.defaultVatRate),
            defaultRetentionRate: Number(dbCfg.defaultRetentionRate),
            defaultWarrantyDurationMonths: dbCfg.defaultWarrantyDurationMonths,
            pmApprovalThresholdDA: Number(dbCfg.pmApprovalThresholdDA),
            dgApprovalThresholdDA: Number(dbCfg.dgApprovalThresholdDA),
            priceToleranceAbsoluteDA: Number(dbCfg.priceToleranceAbsoluteDA),
            priceToleranceRelativePct: Number(dbCfg.priceToleranceRelativePct),
            qtyTolerancePct: Number(dbCfg.qtyTolerancePct),
            allowAutoApprovalOnMatch: dbCfg.allowAutoApprovalOnMatch,
            allowedPaymentTermsDays: [30, 45, 60, 90],
            vatRegimes: [
              { code: 'NORMAL', label: 'Régime Normal Standard (19%)', rate: 19 },
              { code: 'REDUIT', label: 'Taux Réduit (9%)', rate: 9 },
              { code: 'EXONERE_ANDI', label: 'Exonération Conventionnelle ANDI / ANSEJ (0%)', rate: 0 },
            ],
          };
        }
      } catch (err) {
        handleDbPersistenceError('getFinancialConfig', err);
      }
    }
    return serverStore.getFinancialConfig();
  },

  async updateFinancialConfig(data: any, user?: any) {
    if (hasDb) {
      try {
        const existing = await (prisma as any).financialConfig.findFirst();
        if (existing) {
          await (prisma as any).financialConfig.update({
            where: { id: existing.id },
            data: {
              ...(data.defaultVatRate !== undefined ? { defaultVatRate: data.defaultVatRate } : {}),
              ...(data.defaultRetentionRate !== undefined ? { defaultRetentionRate: data.defaultRetentionRate } : {}),
              ...(data.pmApprovalThresholdDA !== undefined ? { pmApprovalThresholdDA: data.pmApprovalThresholdDA } : {}),
              ...(data.dgApprovalThresholdDA !== undefined ? { dgApprovalThresholdDA: data.dgApprovalThresholdDA } : {}),
              ...(data.priceToleranceAbsoluteDA !== undefined ? { priceToleranceAbsoluteDA: data.priceToleranceAbsoluteDA } : {}),
              ...(data.priceToleranceRelativePct !== undefined ? { priceToleranceRelativePct: data.priceToleranceRelativePct } : {}),
            },
          });
        } else {
          await (prisma as any).financialConfig.create({
            data: {
              defaultVatRate: data.defaultVatRate || 19,
              defaultRetentionRate: data.defaultRetentionRate || 5,
              defaultWarrantyDurationMonths: data.defaultWarrantyDurationMonths || 12,
              pmApprovalThresholdDA: data.pmApprovalThresholdDA || 500000,
              dgApprovalThresholdDA: data.dgApprovalThresholdDA || 2000000,
              priceToleranceAbsoluteDA: data.priceToleranceAbsoluteDA || 100,
              priceToleranceRelativePct: data.priceToleranceRelativePct || 0.5,
              qtyTolerancePct: data.qtyTolerancePct || 0,
              allowAutoApprovalOnMatch: data.allowAutoApprovalOnMatch ?? true,
            },
          });
        }
      } catch (err) {
        handleDbPersistenceError('updateFinancialConfig', err);
      }
    }
    return serverStore.updateFinancialConfig(data, user);
  },

  async getFinancialAccounts(filter?: any, user?: any) {
    const includeDemo = filter?.includeDemo === true && filter?.isDemoAccount !== false;
    let list: any[] = [];
    let dbQuerySucceeded = false;
    if (hasDb) {
      try {
        const where: any = {};
        if (!includeDemo) where.isDemoAccount = false;
        else if (filter?.isDemoAccount !== undefined) where.isDemoAccount = Boolean(filter.isDemoAccount);

        const dbAccounts = await (prisma as any).financialAccount.findMany({
          where,
          orderBy: { code: 'asc' },
        });
        list = (dbAccounts || []).map((a: any) => ({
          ...a,
          initialBalance: Number(a.initialBalance),
          currentBalance: Number(a.currentBalance),
        }));
        dbQuerySucceeded = true;
      } catch (err) {
        handleDbPersistenceError('getFinancialAccounts', err);
      }
    }

    // Une base réelle vide (aucun compte configuré) n'est jamais remplacée par la
    // démo : on ne retombe sur serverStore qu'en cas d'échec réel de la requête.
    let finalAccounts: any[] = [];
    if (dbQuerySucceeded) {
      if (includeDemo) {
        const demoAccounts = serverStore.getFinancialAccounts({ includeDemo: true }).filter(a => a.isDemoAccount);
        const combined = [...list];
        for (const demoAcc of demoAccounts) {
          if (!combined.some(a => a.code === demoAcc.code)) {
            combined.push(demoAcc);
          }
        }
        finalAccounts = combined;
      } else {
        finalAccounts = list.filter((a: any) => !a.isDemoAccount);
      }
    } else {
      finalAccounts = serverStore.getFinancialAccounts({ includeDemo });
    }

    // Masquage serveur du RIB pour les profils non autorisés (ex: RESPONSABLE_PROJET)
    const isPrivilegedTreasuryRole = [
      SystemRole.DIRECTEUR_GENERAL,
      SystemRole.RESPONSABLE_FINANCIER,
      SystemRole.ADMINISTRATEUR,
    ].includes(user?.role);

    if (!isPrivilegedTreasuryRole) {
      finalAccounts = finalAccounts.map((a: any) => {
        if (!a.ribNumber) return a;
        const cleaned = String(a.ribNumber).replace(/\s+/g, '');
        const masked = cleaned.length >= 8
          ? `${cleaned.slice(0, 5)} ••••• •••••••••• ${cleaned.slice(-2)}`
          : '•••• •••• •••• ••••';
        return { ...a, ribNumber: masked, isRibMasked: true };
      });
    }

    return finalAccounts;
  },

  async getFinancialAccount(idOrCode: string) {
    if (hasDb) {
      try {
        const dbAcc = await (prisma as any).financialAccount.findFirst({
          where: { OR: [{ id: idOrCode }, { code: idOrCode }] },
        });
        if (dbAcc) {
          return {
            ...dbAcc,
            initialBalance: Number(dbAcc.initialBalance),
            currentBalance: Number(dbAcc.currentBalance),
          };
        }
      } catch (err) {
        handleDbPersistenceError('getFinancialAccount', err);
      }
    }
    return serverStore.getFinancialAccount(idOrCode);
  },

  async createFinancialAccount(data: any, user?: any) {
    if (hasDb && !data.isDemoAccount) {
      try {
        const created = await (prisma as any).financialAccount.create({
          data: {
            code: data.code,
            name: data.name,
            type: data.type || 'BANQUE_COURANT',
            bankName: data.bankName,
            ribNumber: data.ribNumber,
            currency: data.currency || 'DZD',
            initialBalance: data.initialBalance || 0,
            currentBalance: data.initialBalance || 0,
            isDemoAccount: false,
            isActive: data.isActive !== undefined ? data.isActive : true,
            notes: data.notes,
          },
        });
        const storeAcc = serverStore.createFinancialAccount({ ...data, id: created.id }, user);
        return storeAcc;
      } catch (err: any) {
        handleFinancePersistenceError('createFinancialAccount', err);
      }
    }
    return serverStore.createFinancialAccount(data, user);
  },

  async getCashTransactions(filter?: any) {
    const includeDemo = filter?.includeDemo === true;
    let list: any[] = [];
    let dbQuerySucceeded = false;
    if (hasDb) {
      try {
        const where: any = {};
        if (filter?.accountId) where.accountId = filter.accountId;
        if (filter?.projectId) where.projectId = filter.projectId;
        if (filter?.type) where.type = filter.type;

        const dbTxs = await (prisma as any).cashTransaction.findMany({
          where,
          orderBy: { transactionDate: 'desc' },
        });
        list = (dbTxs || []).map((t: any) => ({
          ...t,
          amount: Number(t.amount),
        }));
        dbQuerySucceeded = true;
      } catch (err) {
        handleDbPersistenceError('getCashTransactions', err);
      }
    }
    // Un journal réel vide n'est jamais remplacé par la démo : on ne retombe sur
    // serverStore qu'en cas d'échec réel de la requête.
    if (dbQuerySucceeded) {
      if (includeDemo) {
        const storeTxs = serverStore.getCashTransactions({ ...filter, includeDemo });
        const combined = [...list];
        for (const st of storeTxs) {
          if (!combined.some(t => t.id === st.id || t.transactionNumber === st.transactionNumber)) {
            combined.push(st);
          }
        }
        return combined;
      }
      return list;
    }
    return serverStore.getCashTransactions({ ...filter, includeDemo });
  },

  async recordCashTransaction(data: any, user?: any) {
    if (hasDb && !data.isDemoTransaction) {
      // 1. Contrôle d'idempotence en base de données relationnelle
      if (data.idempotencyKey) {
        try {
          const existingTx = await (prisma as any).cashTransaction.findUnique({
            where: { idempotencyKey: data.idempotencyKey },
          });
          if (existingTx) {
            return {
              ...existingTx,
              amount: Number(existingTx.amount),
              persisted: true,
              idempotentReplay: true,
            };
          }
        } catch {}
      }

      let dbAcc = null;
      try {
        dbAcc = await (prisma as any).financialAccount.findUnique({
          where: { id: data.accountId },
        });
      } catch {
        dbAcc = null;
      }

      if (!dbAcc) {
        return serverStore.recordCashTransaction(data, user);
      }

      try {
        const result = await (prisma as any).$transaction(async (txPrisma: any) => {
          const txAmount = Number(data.amount || 0);
          if (txAmount <= 0) throw new Error('Le montant de la transaction doit être supérieur à zéro');

          let newBalance = Number(dbAcc.currentBalance);
          if (data.type.includes('ENCAISSEMENT') || data.type === 'VIREMENT_INTERNE_RECU' || data.type === 'LIBERATION_RETENUE_GARANTIE') {
            newBalance += txAmount;
          } else if (data.type.includes('DECAISSEMENT') || data.type === 'VIREMENT_INTERNE_EMIS' || data.type === 'FRAIS_BANCAIRES' || data.type.includes('PAIEMENT')) {
            if (newBalance < txAmount) {
              throw new Error(`Solde bancaire insuffisant : solde actuel ${newBalance.toLocaleString()} DA, montant requis ${txAmount.toLocaleString()} DA`);
            }
            newBalance -= txAmount;
          }

          const txNumber = data.transactionNumber || `TX-${Date.now().toString().slice(-6)}`;
          const createdTx = await txPrisma.cashTransaction.create({
            data: {
              transactionNumber: txNumber,
              transactionDate: data.transactionDate ? new Date(data.transactionDate) : new Date(),
              type: data.type,
              amount: txAmount,
              accountId: dbAcc.id,
              accountCode: dbAcc.code,
              counterpartAccountId: data.counterpartAccountId,
              counterpartAccountCode: data.counterpartAccountCode,
              customerInvoiceId: data.customerInvoiceId,
              customerInvoiceNumber: data.customerInvoiceNumber,
              supplierInvoiceId: data.supplierInvoiceId,
              supplierInvoiceNumber: data.supplierInvoiceNumber,
              projectId: data.projectId,
              projectCode: data.projectCode,
              referenceDocument: data.referenceDocument,
              paymentMethod: data.paymentMethod || 'VIREMENT',
              category: data.category || 'Opération de trésorerie',
              notes: data.notes,
              performedById: user?.id || 'usr-fin-001',
              performedByName: user?.name || 'Responsable Financier SILEX',
              status: 'VALIDE',
              idempotencyKey: data.idempotencyKey,
            },
          });

          await txPrisma.financialAccount.update({
            where: { id: dbAcc.id },
            data: { currentBalance: newBalance },
          });

          return {
            ...createdTx,
            amount: Number(createdTx.amount),
            currentBalance: newBalance,
            persisted: true,
          };
        });

        // Synchroniser le store mémoire local
        serverStore.recordCashTransaction({ ...data, id: result.id, transactionNumber: result.transactionNumber }, user);
        return result;
      } catch (err: any) {
        handleFinancePersistenceError('recordCashTransaction', err);
      }
    }
    return serverStore.recordCashTransaction(data, user);
  },

  async transferBetweenAccounts(data: any, user?: any) {
    if (hasDb && !data.isDemoTransfer) {
      let srcAccInDb = null;
      let dstAccInDb = null;
      try {
        srcAccInDb = await (prisma as any).financialAccount.findUnique({ where: { id: data.sourceAccountId } });
        dstAccInDb = await (prisma as any).financialAccount.findUnique({ where: { id: data.destinationAccountId } });
      } catch {
        srcAccInDb = null;
        dstAccInDb = null;
      }

      if (srcAccInDb && dstAccInDb) {
        try {
          const result = await (prisma as any).$transaction(async (txPrisma: any) => {
            const transferAmount = Number(data.amount || 0);
            if (transferAmount <= 0) throw new Error('Le montant du virement doit être strictement positif');
            if (Number(srcAccInDb.currentBalance) < transferAmount) {
              throw new Error(`Solde émetteur insuffisant : ${Number(srcAccInDb.currentBalance).toLocaleString()} DA`);
            }

            const newSrcBalance = Number(srcAccInDb.currentBalance) - transferAmount;
            const newDstBalance = Number(dstAccInDb.currentBalance) + transferAmount;

            await txPrisma.financialAccount.update({
              where: { id: srcAccInDb.id },
              data: { currentBalance: newSrcBalance },
            });

            await txPrisma.financialAccount.update({
              where: { id: dstAccInDb.id },
              data: { currentBalance: newDstBalance },
            });

            const txNumber = `VIR-${Date.now().toString().slice(-6)}`;
            await txPrisma.cashTransaction.create({
              data: {
                transactionNumber: txNumber,
                type: 'VIREMENT_INTERNE_EMIS',
                amount: transferAmount,
                accountId: srcAccInDb.id,
                accountCode: srcAccInDb.code,
                counterpartAccountId: dstAccInDb.id,
                counterpartAccountCode: dstAccInDb.code,
                category: 'Virement de trésorerie interne',
                referenceDocument: data.referenceDocument || `VIR-${srcAccInDb.code}->${dstAccInDb.code}`,
                paymentMethod: 'VIREMENT',
                notes: data.notes,
                performedById: user?.id || 'usr-fin-001',
                performedByName: user?.name || 'Responsable Financier SILEX',
                status: 'VALIDE',
              },
            });

            return {
              success: true,
              amount: transferAmount,
              sourceAccount: { ...srcAccInDb, currentBalance: newSrcBalance },
              destinationAccount: { ...dstAccInDb, currentBalance: newDstBalance },
              persisted: true,
            };
          });

          serverStore.transferBetweenAccounts(data, user);
          return result;
        } catch (err: any) {
          handleFinancePersistenceError('transferBetweenAccounts', err);
        }
      }
    }
    return serverStore.transferBetweenAccounts(data, user);
  },

  async getCustomerInvoices(filter?: any) {
    const includeDemo = filter?.includeDemo === true;
    if (hasDb) {
      try {
        const where: any = {};
        if (!includeDemo) where.isDemoInvoice = false;
        if (filter?.projectId) where.projectId = filter.projectId;
        if (filter?.status) where.status = filter.status;

        const dbInvoices = await (prisma as any).customerInvoice.findMany({
          where,
          orderBy: { issueDate: 'desc' },
        });
        return (dbInvoices || []).map((inv: any) => ({
          ...inv,
          amountHT: Number(inv.amountHT),
          vatRate: Number(inv.vatRate),
          vatAmount: Number(inv.vatAmount),
          retentionRate: Number(inv.retentionRate),
          retentionAmount: Number(inv.retentionAmount),
          amountTTC: Number(inv.amountTTC),
          netReceivableAmount: Number(inv.netReceivableAmount),
          paidAmount: Number(inv.paidAmount),
          remainingAmount: Number(inv.remainingAmount),
          warrantyHeldAmount: Number(inv.warrantyHeldAmount),
          warrantyReleasedAmount: Number(inv.warrantyReleasedAmount),
        }));
      } catch (err) {
        handleDbPersistenceError('getCustomerInvoices', err);
      }
    }
    return serverStore.getCustomerInvoices({ ...filter, includeDemo });
  },

  async getCustomerInvoice(idOrNum: string) {
    if (hasDb) {
      try {
        const dbInv = await (prisma as any).customerInvoice.findFirst({
          where: { OR: [{ id: idOrNum }, { invoiceNumber: idOrNum }] },
        });
        if (dbInv) {
          return {
            ...dbInv,
            amountHT: Number(dbInv.amountHT),
            vatRate: Number(dbInv.vatRate),
            vatAmount: Number(dbInv.vatAmount),
            retentionRate: Number(dbInv.retentionRate),
            retentionAmount: Number(dbInv.retentionAmount),
            amountTTC: Number(dbInv.amountTTC),
            netReceivableAmount: Number(dbInv.netReceivableAmount),
            paidAmount: Number(dbInv.paidAmount),
            remainingAmount: Number(dbInv.remainingAmount),
            warrantyHeldAmount: Number(dbInv.warrantyHeldAmount),
            warrantyReleasedAmount: Number(dbInv.warrantyReleasedAmount),
          };
        }
      } catch (err) {
        handleDbPersistenceError('getCustomerInvoice', err);
      }
    }
    return serverStore.getCustomerInvoice(idOrNum);
  },

  async createCustomerInvoice(data: any, user?: any) {
    if (hasDb && !data.isDemoInvoice) {
      const storeInv = serverStore.createCustomerInvoice(data, user);
      try {
        const created = await (prisma as any).customerInvoice.create({
          data: {
            id: storeInv.id,
            invoiceNumber: storeInv.invoiceNumber,
            clientId: storeInv.clientId,
            clientName: storeInv.clientName,
            projectId: storeInv.projectId,
            projectCode: storeInv.projectCode,
            projectName: storeInv.projectName,
            workSituationId: storeInv.workSituationId,
            workSituationNumber: storeInv.workSituationNumber,
            commercialQuoteId: storeInv.commercialQuoteId,
            issueDate: new Date(storeInv.issueDate),
            dueDate: new Date(storeInv.dueDate),
            amountHT: storeInv.amountHT,
            vatRate: storeInv.vatRate,
            vatAmount: storeInv.vatAmount,
            retentionRate: storeInv.retentionRate,
            retentionAmount: storeInv.retentionAmount,
            amountTTC: storeInv.amountTTC,
            netReceivableAmount: storeInv.netReceivableAmount,
            paidAmount: storeInv.paidAmount,
            remainingAmount: storeInv.remainingAmount,
            warrantyHeldAmount: storeInv.warrantyHeldAmount,
            warrantyReleasedAmount: storeInv.warrantyReleasedAmount,
            status: storeInv.status as any,
            paymentTerms: storeInv.paymentTerms,
            notes: storeInv.notes,
            isDemoInvoice: false,
          },
        });
        return {
          ...storeInv,
          id: created.id,
          persisted: true,
        };
      } catch (err: any) {
        handleFinancePersistenceError('createCustomerInvoice', err, () => {
          serverStore.rollbackCustomerInvoice(storeInv.id);
        });
      }
    }
    return serverStore.createCustomerInvoice(data, user);
  },

  async recordCustomerPayment(invoiceId: string, data: any, user?: any) {
    if (data?.accountId && !serverStore.getFinancialAccount(data.accountId) && hasDb) {
      try {
        const dbAcc = await (prisma as any).financialAccount.findUnique({ where: { id: data.accountId } });
        if (dbAcc) {
          (serverStore as any).financialAccounts.push({
            id: dbAcc.id,
            code: dbAcc.code,
            name: dbAcc.name,
            type: dbAcc.type,
            bankName: dbAcc.bankName,
            ribNumber: dbAcc.ribNumber,
            currency: dbAcc.currency || 'DZD',
            initialBalance: Number(dbAcc.initialBalance || 0),
            currentBalance: Number(dbAcc.currentBalance || 0),
            isDemoAccount: Boolean(dbAcc.isDemoAccount),
            isActive: Boolean(dbAcc.isActive),
          });
        }
      } catch {}
    }

    const res = serverStore.recordCustomerPayment(invoiceId, data, user);
    if (hasDb && !data.isDemoPayment && !res.invoice?.isDemoInvoice) {
      let invInDb = null;
      try {
        invInDb = await (prisma as any).customerInvoice.findUnique({ where: { id: res.invoice.id } });
      } catch {
        invInDb = null;
      }
      if (invInDb) {
        try {
          await (prisma as any).$transaction(async (txPrisma: any) => {
            await txPrisma.customerInvoice.update({
              where: { id: res.invoice.id },
              data: {
                paidAmount: res.invoice.paidAmount,
                remainingAmount: res.invoice.remainingAmount,
                status: res.invoice.status as any,
              },
            });
            if (data.accountId) {
              await txPrisma.financialAccount.update({
                where: { id: data.accountId },
                data: { currentBalance: { increment: Number(data.amount) } },
              }).catch(() => null);
            }
          });
          return { ...res, persisted: true };
        } catch (err: any) {
          handleFinancePersistenceError('recordCustomerPayment', err);
        }
      }
    }
    return res;
  },

  async releaseWarrantyRetention(invoiceId: string, data: any, user?: any) {
    if (data?.accountId && !serverStore.getFinancialAccount(data.accountId) && hasDb) {
      try {
        const dbAcc = await (prisma as any).financialAccount.findUnique({ where: { id: data.accountId } });
        if (dbAcc) {
          (serverStore as any).financialAccounts.push({
            id: dbAcc.id,
            code: dbAcc.code,
            name: dbAcc.name,
            type: dbAcc.type,
            bankName: dbAcc.bankName,
            ribNumber: dbAcc.ribNumber,
            currency: dbAcc.currency || 'DZD',
            initialBalance: Number(dbAcc.initialBalance || 0),
            currentBalance: Number(dbAcc.currentBalance || 0),
            isDemoAccount: Boolean(dbAcc.isDemoAccount),
            isActive: Boolean(dbAcc.isActive),
          });
        }
      } catch {}
    }

    const res = serverStore.releaseWarrantyRetention(invoiceId, data, user);
    if (hasDb && !data.isDemoRelease && !res.invoice?.isDemoInvoice) {
      let invInDb = null;
      try {
        invInDb = await (prisma as any).customerInvoice.findUnique({ where: { id: res.invoice.id } });
      } catch {
        invInDb = null;
      }
      if (invInDb) {
        try {
          await (prisma as any).$transaction(async (txPrisma: any) => {
            await txPrisma.customerInvoice.update({
              where: { id: res.invoice.id },
              data: {
                warrantyReleasedAmount: res.invoice.warrantyReleasedAmount,
              },
            });
            if (data.accountId && res.releasedAmount) {
              await txPrisma.financialAccount.update({
                where: { id: data.accountId },
                data: { currentBalance: { increment: Number(res.releasedAmount) } },
              }).catch(() => null);
            }
          });
          return { ...res, persisted: true };
        } catch (err: any) {
          handleFinancePersistenceError('releaseWarrantyRetention', err);
        }
      }
    }
    return res;
  },

  async getSupplierInvoices(filter?: any) {
    const includeDemo = filter?.includeDemo === true;
    if (hasDb) {
      try {
        const where: any = {};
        if (!includeDemo) where.isDemoInvoice = false;
        if (filter?.supplierId) where.supplierId = filter.supplierId;
        if (filter?.projectId) where.projectId = filter.projectId;
        if (filter?.status) where.status = filter.status;

        const dbInvoices = await (prisma as any).supplierInvoice.findMany({
          where,
          orderBy: { invoiceDate: 'desc' },
        });
        return (dbInvoices || []).map((inv: any) => ({
          ...inv,
          amountHT: Number(inv.amountHT),
          vatRate: Number(inv.vatRate),
          vatAmount: Number(inv.vatAmount),
          amountTTC: Number(inv.amountTTC),
          paidAmount: Number(inv.paidAmount),
          remainingAmount: Number(inv.remainingAmount),
        }));
      } catch (err) {
        handleDbPersistenceError('getSupplierInvoices', err);
      }
    }
    return serverStore.getSupplierInvoices({ ...filter, includeDemo });
  },

  async getSupplierInvoice(idOrRef: string) {
    if (hasDb) {
      try {
        const dbInv = await (prisma as any).supplierInvoice.findFirst({
          where: { OR: [{ id: idOrRef }, { internalReference: idOrRef }, { invoiceNumber: idOrRef }] },
        });
        if (dbInv) {
          return {
            ...dbInv,
            amountHT: Number(dbInv.amountHT),
            vatRate: Number(dbInv.vatRate),
            vatAmount: Number(dbInv.vatAmount),
            amountTTC: Number(dbInv.amountTTC),
            paidAmount: Number(dbInv.paidAmount),
            remainingAmount: Number(dbInv.remainingAmount),
          };
        }
      } catch (err) {
        handleDbPersistenceError('getSupplierInvoice', err);
      }
    }
    return serverStore.getSupplierInvoice(idOrRef);
  },

  async createSupplierInvoice(data: any, user?: any) {
    if (hasDb && !data.isDemoInvoice) {
      // Vérifier si la commande existe en base relationnelle
      let poInDb = null;
      if (data.purchaseOrderId || data.purchaseOrderCode) {
        try {
          poInDb = await (prisma as any).purchaseOrder.findFirst({
            where: {
              OR: [
                { id: data.purchaseOrderId || '' },
                { orderNumber: data.purchaseOrderCode || '' },
              ],
            },
          });
        } catch {
          poInDb = null;
        }
      }

      // Si la commande n'existe pas dans la base (ex: données démo en mémoire ou facture sans BC persistant), garder l'isolation mémoire
      if (!poInDb) {
        return serverStore.createSupplierInvoice(data, user);
      }

      const storeInv = serverStore.createSupplierInvoice(data, user);
      try {
        const result = await (prisma as any).$transaction(async (txPrisma: any) => {
          const created = await txPrisma.supplierInvoice.create({
            data: {
              id: storeInv.id,
              internalReference: storeInv.internalReference,
              invoiceNumber: storeInv.invoiceNumber,
              supplierId: storeInv.supplierId,
              supplierName: storeInv.supplierName,
              purchaseOrderId: storeInv.purchaseOrderId,
              purchaseOrderCode: storeInv.purchaseOrderCode,
              goodsReceiptId: storeInv.goodsReceiptId,
              goodsReceiptCode: storeInv.goodsReceiptCode,
              projectId: storeInv.projectId,
              projectCode: storeInv.projectCode,
              invoiceDate: new Date(storeInv.invoiceDate),
              dueDate: new Date(storeInv.dueDate),
              amountHT: storeInv.amountHT,
              vatRate: storeInv.vatRate,
              vatAmount: storeInv.vatAmount,
              amountTTC: storeInv.amountTTC,
              paidAmount: storeInv.paidAmount,
              remainingAmount: storeInv.remainingAmount,
              matchingStatus: storeInv.matchingStatus as any,
              approvalThresholdStatus: storeInv.approvalThresholdStatus || 'AUTO_APPROVED',
              status: storeInv.status as any,
              paymentTerms: storeInv.paymentTerms,
              notes: storeInv.notes,
              isDemoInvoice: false,
            },
          });

          // Persister les lignes de matching
          if (storeInv.lineMatchings && storeInv.lineMatchings.length > 0) {
            for (const m of storeInv.lineMatchings) {
              let validPoLineId: string | undefined = m.purchaseOrderLineId;
              if (validPoLineId) {
                const lineExists = await txPrisma.purchaseOrderLine.findUnique({ where: { id: validPoLineId } }).catch(() => null);
                if (!lineExists) validPoLineId = undefined;
              }

              let validGrId: string | undefined = m.goodsReceiptId;
              if (validGrId) {
                const grExists = await txPrisma.goodsReceipt.findUnique({ where: { id: validGrId } }).catch(() => null);
                if (!grExists) validGrId = undefined;
              }

              let validGrLineId: string | undefined = m.goodsReceiptLineId;
              if (validGrLineId) {
                const grLineExists = await txPrisma.goodsReceiptLine.findUnique({ where: { id: validGrLineId } }).catch(() => null);
                if (!grLineExists) validGrLineId = undefined;
              }

              if (validPoLineId) {
                await txPrisma.invoiceLineMatching.create({
                  data: {
                    id: m.id,
                    supplierInvoiceId: created.id,
                    purchaseOrderId: m.purchaseOrderId,
                    purchaseOrderLineId: validPoLineId,
                    goodsReceiptId: validGrId,
                    goodsReceiptLineId: validGrLineId,
                    quantityMatched: m.quantityMatched,
                    unitPriceMatched: m.unitPriceMatched,
                    amountMatchedHT: m.amountMatchedHT,
                    priceVarianceDA: m.priceVarianceDA,
                    status: m.status,
                    derogationReason: m.derogationReason,
                    matchedAt: new Date(m.matchedAt),
                    matchedById: m.matchedById,
                    matchedByName: m.matchedByName,
                    notes: m.notes,
                  },
                });
              }
            }
          }

          return created;
        });

        return {
          ...storeInv,
          id: result.id,
          persisted: true,
        };
      } catch (err: any) {
        handleFinancePersistenceError('createSupplierInvoice', err, () => {
          serverStore.rollbackSupplierInvoice(storeInv.id);
        });
      }
    }
    return serverStore.createSupplierInvoice(data, user);
  },

  async recordSupplierPayment(invoiceId: string, data: any, user?: any) {
    if (data?.accountId && !serverStore.getFinancialAccount(data.accountId) && hasDb) {
      try {
        const dbAcc = await (prisma as any).financialAccount.findUnique({ where: { id: data.accountId } });
        if (dbAcc) {
          (serverStore as any).financialAccounts.push({
            id: dbAcc.id,
            code: dbAcc.code,
            name: dbAcc.name,
            type: dbAcc.type,
            bankName: dbAcc.bankName,
            ribNumber: dbAcc.ribNumber,
            currency: dbAcc.currency || 'DZD',
            initialBalance: Number(dbAcc.initialBalance || 0),
            currentBalance: Number(dbAcc.currentBalance || 0),
            isDemoAccount: Boolean(dbAcc.isDemoAccount),
            isActive: Boolean(dbAcc.isActive),
          });
        }
      } catch {}
    }

    const res = serverStore.recordSupplierPayment(invoiceId, data, user);
    if (hasDb && !data.isDemoPayment && !res.invoice?.isDemoInvoice) {
      let invInDb = null;
      try {
        invInDb = await (prisma as any).supplierInvoice.findUnique({ where: { id: res.invoice.id } });
      } catch {
        invInDb = null;
      }
      if (invInDb) {
        try {
          await (prisma as any).$transaction(async (txPrisma: any) => {
            await txPrisma.supplierInvoice.update({
              where: { id: res.invoice.id },
              data: {
                paidAmount: res.invoice.paidAmount,
                remainingAmount: res.invoice.remainingAmount,
                status: res.invoice.status as any,
              },
            });
            if (data.accountId) {
              await txPrisma.financialAccount.update({
                where: { id: data.accountId },
                data: { currentBalance: { decrement: Number(data.amount) } },
              }).catch(() => null);
            }
          });
          return { ...res, persisted: true };
        } catch (err: any) {
          handleFinancePersistenceError('recordSupplierPayment', err);
        }
      }
    }
    return res;
  },

  async cancelSupplierInvoice(invoiceId: string, reason: string, user?: any) {
    const res = serverStore.cancelSupplierInvoice(invoiceId, reason, user);
    if (hasDb) {
      let invInDb = null;
      try {
        invInDb = await (prisma as any).supplierInvoice.findUnique({ where: { id: res.id } });
      } catch {
        invInDb = null;
      }
      if (invInDb) {
        try {
          await (prisma as any).$transaction(async (txPrisma: any) => {
            await txPrisma.supplierInvoice.update({
              where: { id: res.id },
              data: { status: 'REJETEE', notes: res.notes },
            });
            await txPrisma.invoiceLineMatching.updateMany({
              where: { supplierInvoiceId: res.id },
              data: { status: 'ANNULE', notes: `Annulé: ${reason}` },
            });
          });
          return { ...res, persisted: true };
        } catch (err: any) {
          handleFinancePersistenceError('cancelSupplierInvoice', err);
        }
      }
    }
    return res;
  },

  async approveSupplierInvoiceWithDerogation(invoiceId: string, reason: string, user: any) {
    const res = serverStore.approveSupplierInvoiceWithDerogation(invoiceId, reason, user);
    if (hasDb) {
      let invInDb = null;
      try {
        invInDb = await (prisma as any).supplierInvoice.findUnique({ where: { id: res.id } });
      } catch {
        invInDb = null;
      }
      if (invInDb) {
        try {
          await (prisma as any).$transaction(async (txPrisma: any) => {
            await txPrisma.supplierInvoice.update({
              where: { id: res.id },
              data: { status: 'APPROUVEE', approvalThresholdStatus: 'APPROVED', notes: res.notes },
            });
            await txPrisma.invoiceLineMatching.updateMany({
              where: { supplierInvoiceId: res.id },
              data: {
                status: 'DEROGATION',
                derogationReason: reason,
                derogationApprovedById: user?.id || 'usr-dg-001',
                derogationApprovedByName: user?.name || 'Direction Générale',
              },
            });
          });
          return { ...res, persisted: true };
        } catch (err: any) {
          handleFinancePersistenceError('approveSupplierInvoiceWithDerogation', err);
        }
      }
    }
    return res;
  },

  async getAgedTrialBalance(filter?: any) {
    const includeDemo = filter?.includeDemo === true;
    return serverStore.getAgedTrialBalance({ includeDemo });
  },

  async getProjectProfitability(projectIdOrCode: string) {
    const storePnl = serverStore.getProjectProfitability(projectIdOrCode);
    if (storePnl) return storePnl;

    if (hasDb) {
      try {
        const dbProj = await prisma.project.findFirst({
          where: {
            OR: [
              { id: projectIdOrCode },
              { code: projectIdOrCode },
            ],
          },
          include: { workSituations: true },
        });

        if (dbProj) {
          const contractAmount = Number(dbProj.contractAmount || 0);
          const estimatedBudget = Number(dbProj.budgetAmount || 0);
          const wsList = Array.isArray(dbProj.workSituations) ? dbProj.workSituations : [];
          const billedSituationsHT = wsList.reduce((sum: number, s: any) => sum + Number(s.amountHT || 0), 0);
          const actualCost = Number(dbProj.actualCost || 0);
          const committedCost = Number(dbProj.committedCost || 0);

          // La marge réalisée exige une base de facturation réelle (situations de travaux) : sans
          // facturation, le contrat entier ne doit jamais être présenté comme marge déjà acquise.
          const isMarginCalculable = billedSituationsHT > 0;
          const grossMarginDA = isMarginCalculable ? Math.max(0, billedSituationsHT - actualCost) : 0;
          const grossMarginPercent = isMarginCalculable
            ? Number(((grossMarginDA / billedSituationsHT) * 100).toFixed(2))
            : 0;

          return {
            projectId: dbProj.id,
            projectCode: dbProj.code,
            projectName: dbProj.name,
            clientName: dbProj.clientName,
            contractAmount,
            estimatedBudget,
            actualBilledHT: billedSituationsHT,
            collectedTTC: 0,
            realCosts: {
              materials: Math.round(actualCost * 0.6),
              labor: Math.round(actualCost * 0.3),
              otherExpenses: Math.round(actualCost * 0.1),
              totalDirectCost: actualCost,
            },
            committedRemaining: committedCost,
            projectedFinalCost: actualCost + committedCost,
            grossMarginDA,
            grossMarginPercent,
            isMarginCalculable,
            budgetVarianceDA: estimatedBudget - (actualCost + committedCost),
            isProfitable: isMarginCalculable ? grossMarginDA >= 0 : null,
          };
        }
      } catch (err) {
        console.warn('[dbBridge.getProjectProfitability] Fallback DB error:', err);
      }
    }

    return null;
  },



  // --- MODULE COMMERCIAL & DEVIS ---
  async getCommercialKpis() {
    if (hasDb) {
      try {
        const opps = await (prisma as any).opportunity.findMany({
          include: { costSheets: true, convertedProject: true },
        });
        const costSheets = await (prisma as any).costSheet.findMany();
        const projects = await (prisma as any).project.findMany();

        const totalOpportunities = (opps || []).length;
        const activeOpportunities = (opps || []).filter((o: any) => !['PERDUE', 'ANNULEE', 'GAGNEE'].includes(o.status)).length;
        const openOpportunities = (opps || []).filter((o: any) => !['PERDUE', 'ANNULEE'].includes(o.status)).length;
        const pipelineValue = (opps || [])
          .filter((o: any) => !['PERDUE', 'ANNULEE', 'GAGNEE'].includes(o.status))
          .reduce((acc: number, o: any) => acc + Number(o.estimatedAmount || 0), 0);
        const weightedPipelineValue = (opps || [])
          .filter((o: any) => !['PERDUE', 'ANNULEE', 'GAGNEE'].includes(o.status))
          .reduce((acc: number, o: any) => acc + Number(o.weightedValue || 0), 0);

        const inNegotiation = (opps || []).filter((o: any) => o.status === 'NEGOCIATION');
        const inCosting = (opps || []).filter((o: any) => o.status === 'CHIFFRAGE' || o.status === 'VALIDATION_INTERNE');
        const won = (opps || []).filter((o: any) => o.status === 'GAGNEE');

        const pendingCostSheetsCount = (costSheets || []).filter((s: any) => s.status === 'PRETE_POUR_VALIDATION' || s.status === 'EN_ATTENTE_DG').length;
        const approvedCostSheetsCount = (costSheets || []).filter((s: any) => s.status === 'APPROUVEE_DG' || s.status === 'VALIDEE').length;
        const validatedCostSheetsCount = approvedCostSheetsCount;

        const stagesBreakdown: Record<string, { count: number; value: number }> = {
          NOUVELLE: { count: 0, value: 0 },
          QUALIFIEE: { count: 0, value: 0 },
          VISITE_TECHNIQUE: { count: 0, value: 0 },
          CHIFFRAGE: { count: 0, value: 0 },
          VALIDATION_INTERNE: { count: 0, value: 0 },
          OFFRE_SOUMISE: { count: 0, value: 0 },
          NEGOCIATION: { count: 0, value: 0 },
          GAGNEE: { count: 0, value: 0 },
          PERDUE: { count: 0, value: 0 },
          ANNULEE: { count: 0, value: 0 },
        };
        for (const opp of (opps || [])) {
          const st = opp.status || 'NOUVELLE';
          if (!stagesBreakdown[st]) stagesBreakdown[st] = { count: 0, value: 0 };
          stagesBreakdown[st].count += 1;
          stagesBreakdown[st].value += Number(opp.estimatedAmount || 0);
        }

        const conversionRate = totalOpportunities > 0 ? Math.round((won.length / totalOpportunities) * 1000) / 10 : 0;
        const totalWonValue = won.reduce((acc: number, o: any) => acc + Number(o.estimatedAmount || 0), 0);
        const wonOpportunitiesCount = (projects || []).filter((p: any) => p.opportunityId).length || won.length;

        return {
          totalOpportunities,
          activeOpportunities,
          openOpportunities,
          pipelineValue,
          weightedPipelineValue,
          inNegotiationCount: inNegotiation.length,
          inNegotiationValue: inNegotiation.reduce((acc: number, o: any) => acc + Number(o.estimatedAmount || 0), 0),
          inCostingCount: inCosting.length,
          inCostingValue: inCosting.reduce((acc: number, o: any) => acc + Number(o.estimatedAmount || 0), 0),
          pendingCostSheetsCount,
          approvedCostSheetsCount,
          validatedCostSheetsCount,
          quotesSentCount: 0,
          quotesAcceptedCount: 0,
          totalWonValue,
          wonOpportunitiesCount,
          conversionRate,
          stagesBreakdown,
        };
      } catch (err) {
        handleDbPersistenceError('getCommercialKpis', err);
      }
    }
    return serverStore.getCommercialKpis();
  },

  async getOpportunities() {
    if (hasDb) {
      try {
        const dbOpps = await (prisma as any).opportunity.findMany({
          orderBy: { createdAt: 'desc' },
          include: { costSheets: true, convertedProject: true },
        });
        return (dbOpps || []).map((o: any) => ({
          ...o,
          estimatedAmount: Number(o.estimatedAmount || 0),
          weightedValue: Number(o.weightedValue || 0),
        }));
      } catch (err) {
        handleDbPersistenceError('getOpportunities', err);
      }
    }
    return serverStore.getOpportunities();
  },

  async getOpportunity(id: string) {
    if (hasDb) {
      try {
        const opp = await (prisma as any).opportunity.findFirst({
          where: {
            OR: [{ id }, { code: id }],
          },
          include: { costSheets: true, convertedProject: true },
        });
        if (opp) {
          return {
            ...opp,
            estimatedAmount: Number(opp.estimatedAmount || 0),
            weightedValue: Number(opp.weightedValue || 0),
          };
        }
        return null;
      } catch (err) {
        handleDbPersistenceError('getOpportunity', err);
      }
    }
    return serverStore.getOpportunity(id);
  },

  async createOpportunity(data: any, user?: any) {
    const count = hasDb ? await (prisma as any).opportunity.count() : serverStore.getOpportunities().length;
    const code = data.code || `OPP-2026-${String(count + 1).padStart(3, '0')}`;
    const amount = Number(data.estimatedAmount || 0);
    const prob = Number(data.winProbability ?? 50);
    const weighted = Math.round((amount * prob) / 100);

    if (hasDb) {
      try {
        const created = await (prisma as any).opportunity.create({
          data: {
            code,
            title: data.title || 'Opportunité Industrielle',
            clientName: data.clientName || 'Client Industriel',
            sector: mapToSector(data.sector),
            location: data.location || 'Site Algérie',
            wilaya: data.wilaya || 'Alger',
            contactName: data.contactName || '',
            contactEmail: data.contactEmail || '',
            contactPhone: data.contactPhone || '',
            estimatedAmount: amount,
            winProbability: prob,
            weightedValue: weighted,
            assignedCommercialId: user?.id || data.assignedCommercialId,
            assignedCommercialName: user?.name || data.assignedCommercialName,
            status: (data.status || 'NOUVELLE') as any,
            priority: data.priority || 'NORMALE',
            notes: data.notes || '',
            sourceOrigin: data.sourceOrigin || 'DIRECT',
            isDemo: Boolean(data.isDemo),
          },
        });
        serverStore.createOpportunity({ ...data, code }, user);
        await this.logAudit('CREATE_OPPORTUNITY', 'COMMERCIAL', created.code, `Opportunité commerciale créée : ${created.title} (${created.code})`, user);
        return {
          ...created,
          estimatedAmount: Number(created.estimatedAmount || 0),
          weightedValue: Number(created.weightedValue || 0),
        };
      } catch (err) {
        handleFinancePersistenceError('createOpportunity', err);
      }
    }
    return serverStore.createOpportunity(data, user);
  },

  async updateOpportunity(id: string, data: any, user?: any) {
    if (hasDb) {
      try {
        const opp = await (prisma as any).opportunity.findFirst({
          where: { OR: [{ id }, { code: id }] },
        });
        if (opp) {
          const updated = await (prisma as any).opportunity.update({
            where: { id: opp.id },
            data: {
              ...(data.title ? { title: data.title } : {}),
              ...(data.clientName ? { clientName: data.clientName } : {}),
              ...(data.status ? { status: data.status as any } : {}),
              ...(data.winProbability !== undefined ? { winProbability: data.winProbability } : {}),
              ...(data.notes ? { notes: data.notes } : {}),
            },
          });
          serverStore.updateOpportunity(id, data, user);
          return updated;
        }
      } catch (err) {
        handleFinancePersistenceError('updateOpportunity', err);
      }
    }
    return serverStore.updateOpportunity(id, data, user);
  },

  async updateOpportunityStage(id: string, newStage: string, data: any, user?: any) {
    if (hasDb) {
      try {
        const opp = await (prisma as any).opportunity.findFirst({
          where: { OR: [{ id }, { code: id }] },
        });
        if (opp) {
          const updated = await (prisma as any).opportunity.update({
            where: { id: opp.id },
            data: {
              status: newStage as any,
              ...(data?.winProbability !== undefined ? { winProbability: data.winProbability } : {}),
              ...(data?.notes ? { notes: data.notes } : {}),
            },
          });
          serverStore.updateOpportunityStage(id, newStage, data, user);
          await this.logAudit('UPDATE_OPPORTUNITY_STAGE', 'COMMERCIAL', opp.code, `Étape d'opportunité modifiée : ${opp.status} -> ${newStage}`, user);
          return updated;
        }
      } catch (err) {
        handleFinancePersistenceError('updateOpportunityStage', err);
      }
    }
    return serverStore.updateOpportunityStage(id, newStage, data, user);
  },

  async getCostSheets() {
    if (hasDb) {
      try {
        const sheets = await (prisma as any).costSheet.findMany({
          orderBy: { createdAt: 'desc' },
          include: {
            opportunity: true,
            contributions: true,
            lines: true,
            revisions: true,
          },
        });
        return (sheets || []).map((cs: any) => ({
          ...cs,
          totalDirectCost: Number(cs.totalDirectCost || 0),
          totalIndirectCost: Number(cs.totalIndirectCost || 0),
          totalEstimatedCost: Number(cs.totalEstimatedCost || 0),
          proposedSellingPrice: Number(cs.proposedSellingPrice || 0),
          estimatedMarginValue: Number(cs.estimatedMarginValue || 0),
          targetMarginPercent: Number(cs.targetMarginPercent || 0),
          marginRateOnCost: Number(cs.marginRateOnCost || 0),
          markupRate: Number(cs.markupRate || 0),
        }));
      } catch (err) {
        handleDbPersistenceError('getCostSheets', err);
      }
    }
    return serverStore.getCostSheets();
  },

  async getCostSheet(id: string) {
    if (hasDb) {
      try {
        const cs = await (prisma as any).costSheet.findFirst({
          where: { OR: [{ id }, { reference: id }] },
          include: {
            opportunity: true,
            contributions: true,
            lines: true,
            revisions: true,
          },
        });
        if (cs) {
          return {
            ...cs,
            totalDirectCost: Number(cs.totalDirectCost || 0),
            totalIndirectCost: Number(cs.totalIndirectCost || 0),
            totalEstimatedCost: Number(cs.totalEstimatedCost || 0),
            proposedSellingPrice: Number(cs.proposedSellingPrice || 0),
            estimatedMarginValue: Number(cs.estimatedMarginValue || 0),
            targetMarginPercent: Number(cs.targetMarginPercent || 0),
            marginRateOnCost: Number(cs.marginRateOnCost || 0),
            markupRate: Number(cs.markupRate || 0),
          };
        }
        return null;
      } catch (err) {
        handleDbPersistenceError('getCostSheet', err);
      }
    }
    return serverStore.getCostSheet(id);
  },

  async createCostSheet(data: any, user?: any) {
    if (hasDb) {
      try {
        const count = await (prisma as any).costSheet.count();
        const reference = data.reference || `FC-2026-${String(count + 1).padStart(3, '0')}`;
        const opp = await (prisma as any).opportunity.findFirst({
          where: { OR: [{ id: data.opportunityId }, { code: data.opportunityCode }] },
        });
        if (opp) {
          const created = await (prisma as any).costSheet.create({
            data: {
              reference,
              opportunityId: opp.id,
              title: data.title || `Fiche de Chiffrage ${reference}`,
              clientName: data.clientName || opp.clientName,
              sector: data.sector || opp.sector,
              siteLocation: data.siteLocation || opp.location,
              status: 'BROUILLON',
              version: 1,
              totalDirectCost: 0,
              totalIndirectCost: 0,
              totalEstimatedCost: 0,
              proposedSellingPrice: 0,
              estimatedMarginValue: 0,
            },
          });
          serverStore.createCostSheet({ ...data, id: created.id, reference: created.reference }, user);
          await this.logAudit('CREATE_COST_SHEET', 'COMMERCIAL', created.reference, `Fiche de chiffrage créée : ${created.reference}`, user);
          return created;
        }
      } catch (err) {
        handleFinancePersistenceError('createCostSheet', err);
      }
    }
    return serverStore.createCostSheet(data, user);
  },

  async updateCostSheetContribution(id: string, department: 'PROJECT' | 'PROCUREMENT' | 'HR' | 'FINANCE', data: any, user?: any) {
    const updatedStoreSheet = serverStore.updateCostSheetContribution(id, department, data, user);
    if (hasDb) {
      try {
        const dbSheet = await (prisma as any).costSheet.findFirst({
          where: { OR: [{ id }, { reference: id }] },
        });
        if (dbSheet) {
          const deptEnum = department === 'PROJECT' ? 'PROJET' : (department === 'PROCUREMENT' ? 'ACHATS' : (department === 'HR' ? 'RH' : department));
          await (prisma as any).costSheetContribution.upsert({
            where: {
              costSheetId_department: {
                costSheetId: dbSheet.id,
                department: deptEnum,
              },
            },
            update: {
              completed: data.completed !== undefined ? Boolean(data.completed) : true,
              completedAt: new Date(),
              summaryNotes: data.summaryNotes || data.notes || '',
              responsibleId: user?.id || null,
              responsibleName: user?.name || null,
              dataPayload: data,
            },
            create: {
              costSheetId: dbSheet.id,
              department: deptEnum,
              completed: data.completed !== undefined ? Boolean(data.completed) : true,
              completedAt: new Date(),
              summaryNotes: data.summaryNotes || data.notes || '',
              responsibleId: user?.id || null,
              responsibleName: user?.name || null,
              dataPayload: data,
            },
          });

          if (Array.isArray(data.lines) && data.lines.length > 0) {
            await (prisma as any).costSheetLine.deleteMany({
              where: {
                costSheetId: dbSheet.id,
                department: deptEnum,
              },
            });
            await (prisma as any).costSheetLine.createMany({
              data: data.lines.map((l: any, idx: number) => ({
                costSheetId: dbSheet.id,
                department: deptEnum,
                category: l.category || 'DIRECT',
                label: l.designation || l.label || 'Ligne de coût',
                quantity: Number(l.quantity || 1),
                unit: l.unit || 'U',
                unitPrice: Number(l.unitPrice || l.unitCost || 0),
                totalAmount: Number(l.totalAmount || (Number(l.quantity || 1) * Number(l.unitPrice || l.unitCost || 0))),
                notes: l.notes || '',
                orderIndex: idx + 1,
              })),
            });
          }

          await (prisma as any).costSheet.update({
            where: { id: dbSheet.id },
            data: {
              totalDirectCost: updatedStoreSheet?.totalDirectCost ?? 0,
              totalIndirectCost: updatedStoreSheet?.totalIndirectCost ?? 0,
              totalEstimatedCost: updatedStoreSheet?.totalEstimatedCost ?? 0,
              proposedSellingPrice: updatedStoreSheet?.proposedSellingPrice ?? 0,
              estimatedMarginValue: updatedStoreSheet?.estimatedMarginValue ?? 0,
              targetMarginPercent: updatedStoreSheet?.targetMarginPercent ?? 0,
              marginRateOnCost: updatedStoreSheet?.marginRateOnCost ?? 0,
              markupRate: updatedStoreSheet?.markupRate ?? 0,
            },
          });
        }
      } catch (err) {
        handleDbPersistenceError('updateCostSheetContribution', err);
      }
    }
    return updatedStoreSheet;
  },

  async submitCostSheetToDG(id: string, user?: any) {
    const updatedStoreSheet = serverStore.submitCostSheetToDG(id, user);
    if (hasDb) {
      try {
        const dbSheet = await (prisma as any).costSheet.findFirst({
          where: { OR: [{ id }, { reference: id }] },
        });
        if (dbSheet) {
          await (prisma as any).costSheet.update({
            where: { id: dbSheet.id },
            data: { status: 'EN_ATTENTE_DG' },
          });
          await this.logAudit('SUBMIT_COST_SHEET_DG', 'COMMERCIAL', dbSheet.reference, `Fiche de coût soumise à la DG : ${dbSheet.reference}`, user);
        }
      } catch (err) {
        handleDbPersistenceError('submitCostSheetToDG', err);
      }
    }
    return updatedStoreSheet;
  },

  async arbitrateCostSheet(id: string, decision: 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED', notes: string, user?: any) {
    const updatedStoreSheet = serverStore.arbitrateCostSheet(id, decision, notes, user);
    if (hasDb) {
      try {
        const dbSheet = await (prisma as any).costSheet.findFirst({
          where: { OR: [{ id }, { reference: id }] },
        });
        if (dbSheet) {
          const dbStatus = decision === 'APPROVED' ? 'VALIDEE' : (decision === 'REJECTED' ? 'REFUSEE' : 'BROUILLON');
          await (prisma as any).costSheet.update({
            where: { id: dbSheet.id },
            data: {
              status: dbStatus,
              dgDecision: decision,
              dgDecisionNotes: notes,
              dgDecisionDate: new Date(),
              dgDecisionBy: user?.name || 'Direction Générale',
              isImmutable: decision === 'APPROVED',
            },
          });
          await this.logAudit('ARBITRATE_COST_SHEET', 'COMMERCIAL', dbSheet.reference, `Arbitrage DG : ${decision} (${notes})`, user);
        }
      } catch (err) {
        handleDbPersistenceError('arbitrateCostSheet', err);
      }
    }
    return updatedStoreSheet;
  },

  async createCostSheetRevision(id: string, reason: string, user?: any) {
    const updatedStoreSheet = serverStore.createCostSheetRevision(id, reason, user);
    if (hasDb) {
      try {
        const dbSheet = await (prisma as any).costSheet.findFirst({
          where: { OR: [{ id }, { reference: id }] },
        });
        if (dbSheet) {
          await (prisma as any).costSheetRevision.create({
            data: {
              costSheetId: dbSheet.id,
              revisionNumber: `REV-${dbSheet.version}`,
              authorId: user?.id || null,
              authorName: user?.name || 'Direction Commerciale',
              authorRole: user?.role || 'RESPONSABLE_COMMERCIAL',
              reason,
              totalDirectCost: dbSheet.totalDirectCost,
              totalEstimatedCost: dbSheet.totalEstimatedCost,
              proposedSellingPrice: dbSheet.proposedSellingPrice,
              marginValue: dbSheet.estimatedMarginValue,
              snapshotData: updatedStoreSheet || {},
            },
          });
          await (prisma as any).costSheet.update({
            where: { id: dbSheet.id },
            data: {
              version: { increment: 1 },
              status: 'BROUILLON',
              isImmutable: false,
            },
          });
          await this.logAudit('REVISE_COST_SHEET', 'COMMERCIAL', dbSheet.reference, `Nouvelle révision créée : REV-${dbSheet.version + 1} (${reason})`, user);
        }
      } catch (err) {
        handleDbPersistenceError('createCostSheetRevision', err);
      }
    }
    return updatedStoreSheet;
  },

  async compareCostSheetVersions(id: string, vA: number, vB: number) {
    return serverStore.compareCostSheetVersions(id, vA, vB);
  },

  async createCustomerQuote(costSheetId: string, user?: any) {
    return serverStore.createCustomerQuoteFromCostSheet(costSheetId, user);
  },

  async getCustomerQuotes() {
    return serverStore.getCustomerQuotes();
  },

  async getCustomerQuote(id: string) {
    return serverStore.getCustomerQuote(id);
  },

  async getClientSatisfactionSurveys(projectCode?: string) {
    return serverStore.getClientSatisfactionSurveys(projectCode);
  },

  async createClientSatisfactionSurvey(data: any, user?: any) {
    return serverStore.createClientSatisfactionSurvey(data, user);
  },

  async convertCostSheetToProject(costSheetId: string, user?: any) {
    if (hasDb) {
      try {
        const sheet = await (prisma as any).costSheet.findFirst({
          where: { OR: [{ id: costSheetId }, { reference: costSheetId }] },
          include: { opportunity: { include: { convertedProject: true } } },
        });
        if (sheet?.opportunity?.convertedProject) {
          // Idempotence stricte : renvoie le projet déjà créé sans créer de doublon
          return sheet.opportunity.convertedProject;
        }

        const storeProj = serverStore.convertCostSheetToProject(costSheetId, user);

        const pmUser = await prisma.user.findFirst({
          where: { role: 'RESPONSABLE_PROJET' },
        });
        const managerId = pmUser?.id || user?.id || 'usr-rp-002';

        let projCode = storeProj.code;
        const existingCode = await prisma.project.findUnique({ where: { code: projCode } });
        if (existingCode) {
          const count = await prisma.project.count();
          projCode = `PRJ-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
        }

        const createdProject = await prisma.project.create({
          data: {
            code: projCode,
            name: storeProj.name,
            description: storeProj.description || storeProj.name,
            clientName: storeProj.clientName,
            sector: (storeProj.sector as any) || 'OIL_AND_GAS',
            siteLocation: storeProj.siteLocation || 'Skikda',
            managerId,
            contractAmount: storeProj.contractAmount || 0,
            budgetAmount: storeProj.budgetAmount || 0,
            committedCost: 0,
            actualCost: 0,
            startDate: new Date(storeProj.startDate || new Date()),
            contractEndDate: new Date(storeProj.contractEndDate || (Date.now() + 60 * 86400000)),
            status: 'PLANNING',
            riskLevel: storeProj.riskLevel === 'HIGH' ? 'HIGH' : 'LOW',
            opportunityId: sheet?.opportunityId || undefined,
            milestones: {
              create: [
                {
                  title: 'Ordre de Service (ODS) & Mobilisation Chantier',
                  targetDate: new Date(Date.now() + 7 * 86400000),
                  orderIndex: 1,
                  status: 'PENDING',
                },
                {
                  title: 'Exécution Travaux Tuyauterie & Contrôles CND',
                  targetDate: new Date(Date.now() + 30 * 86400000),
                  orderIndex: 2,
                  status: 'PENDING',
                },
                {
                  title: 'Épreuves Hydrauliques & Dossier Constructeur',
                  targetDate: new Date(Date.now() + 45 * 86400000),
                  orderIndex: 3,
                  status: 'PENDING',
                },
                {
                  title: 'Réception Provisoire (PVRP) & Clôture',
                  targetDate: new Date(Date.now() + 60 * 86400000),
                  orderIndex: 4,
                  status: 'PENDING',
                },
              ],
            },
          },
        });

        if (sheet) {
          await (prisma as any).costSheet.update({
            where: { id: sheet.id },
            data: { status: 'GAGNEE' },
          });
          if (sheet.opportunityId) {
            await (prisma as any).opportunity.update({
              where: { id: sheet.opportunityId },
              data: { status: 'GAGNEE' },
            });
          }
        }

        await this.logAudit('CONVERT_COST_SHEET_TO_PROJECT', 'COMMERCIAL', createdProject.code, `Projet créé depuis chiffrage ${sheet?.reference} : ${createdProject.code}`, user);
        return createdProject;
      } catch (err) {
        handleDbPersistenceError('convertCostSheetToProject', err);
      }
    }
    return serverStore.convertCostSheetToProject(costSheetId, user);
  },

  // --- AUDIT TRAIL (Traçabilité) ---
  async getAuditLogs() {
    if (hasDb) {
      try {
        const logs = await prisma.auditLog.findMany({
          orderBy: { createdAt: 'desc' },
          take: 100,
        });
        return (logs || []).map((l: any) => ({
          ...l,
          entityType: l.entityName,
          details: l.description,
          timestamp: l.createdAt ? l.createdAt.toISOString() : new Date().toISOString(),
        }));
      } catch (err) {
        console.warn('[DB Bridge] Fallback store for getAuditLogs:', err);
      }
    }
    return serverStore.getAuditLogs().map((l: any) => ({
      ...l,
      entityName: l.entityType,
      description: l.details,
      createdAt: l.timestamp,
    }));
  },

  // --- MODULE 02 PROJET : METHODES INDUSTRIELLES (PHASE 3) ---

  async getProjectTasks(code: string) {
    return serverStore.getProjectTasks(code);
  },

  async createProjectTask(code: string, data: any, user?: any) {
    return serverStore.createProjectTask(code, data, user);
  },

  async updateProjectTask(code: string, taskId: string, data: any, user?: any) {
    return serverStore.updateProjectTask(code, taskId, data, user);
  },

  async deleteProjectTask(code: string, taskId: string, user?: any) {
    return serverStore.deleteProjectTask(code, taskId, user);
  },

  async getContractItems(code: string) {
    return serverStore.getContractItems(code);
  },

  async updateContractItem(code: string, itemId: string, data: any, user?: any) {
    return serverStore.updateContractItem(code, itemId, data, user);
  },

  async getDailyReports(code: string) {
    return serverStore.getDailyReports(code);
  },

  async getDailyReport(code: string, id: string) {
    return serverStore.getDailyReport(code, id);
  },

  async createDailyReport(code: string, data: any, user?: any) {
    return serverStore.createDailyReport(code, data, user);
  },

  async updateDailyReport(code: string, id: string, data: any, user?: any) {
    return serverStore.updateDailyReport(code, id, data, user);
  },

  async validateDailyReport(code: string, id: string, user?: any) {
    return serverStore.validateDailyReport(code, id, user);
  },

  async getSituationReports(code: string) {
    return serverStore.getSituationReports(code);
  },

  async createSituationReport(code: string, data: any, user?: any) {
    return serverStore.createSituationReport(code, data, user);
  },

  async getProjectConstraints(code: string) {
    return serverStore.getProjectConstraints(code);
  },

  async createProjectConstraint(code: string, data: any, user?: any) {
    return serverStore.createProjectConstraint(code, data, user);
  },

  async updateProjectConstraint(code: string, id: string, data: any, user?: any) {
    return serverStore.updateProjectConstraint(code, id, data, user);
  },

  async getHseIncidents(code: string) {
    return serverStore.getHseIncidents(code);
  },

  async createHseIncident(code: string, data: any, user?: any) {
    return serverStore.createHseIncident(code, data, user);
  },

  async updateHseIncident(code: string, id: string, data: any, user?: any) {
    return serverStore.updateHseIncident(code, id, data, user);
  },

  async createProjectPurchaseRequest(code: string, data: any, user?: any) {
    return serverStore.createProjectPurchaseRequest(code, data, user);
  },

  async recordProjectStockConsumption(code: string, data: any, user?: any) {
    return serverStore.recordProjectStockConsumption(code, data, user);
  },

  async getProjectTimesheets(code: string) {
    return serverStore.getProjectTimesheets(code);
  },

  async createProjectTimesheet(code: string, data: any, user?: any) {
    return serverStore.createProjectTimesheet(code, data, user);
  },

  async updateProjectReception(code: string, data: any, user?: any) {
    return serverStore.updateProjectReception(code, data, user);
  },

  // ============================================================================
  // ============================================================================
  // PHASE 4 : ACHATS, APPROVISIONNEMENTS, TCO, CONTRATS, RECEPTIONS & INVENTAIRES
  // ============================================================================

  async getNeedRequests(projectId?: string) {
    return serverStore.getNeedRequests(projectId);
  },

  async createNeedRequest(data: any, user?: any) {
    return serverStore.createNeedRequest(data, user);
  },

  async validateNeedRequest(id: string, user?: any) {
    return serverStore.validateNeedRequest(id, user);
  },

  async convertNeedRequestToPR(id: string, user?: any) {
    return serverStore.convertNeedRequestToPR(id, user);
  },

  async getRfqConsultations(projectId?: string) {
    const rfqs = serverStore.getRfqConsultations();
    if (projectId) return rfqs.filter(r => r.projectId === projectId);
    return rfqs;
  },

  async createRfqConsultation(data: any, user?: any) {
    return serverStore.createRfqConsultation(data, user);
  },

  async addOfferToRfq(rfqId: string, offerData: any, user?: any) {
    return serverStore.addOfferToRfq(rfqId, offerData, user);
  },

  async calculateTcoComparison(rfqId: string, user?: any) {
    return serverStore.calculateTcoComparison(rfqId, user);
  },

  async approveTcoDG(tcoId: string, justification: string, user?: any) {
    return serverStore.approveTcoDG(tcoId, justification, user);
  },

  async createPurchaseOrderFromTco(tcoId: string, user?: any) {
    return serverStore.createPurchaseOrderFromTco(tcoId, user);
  },

  async getGoodsReceipts(orderId?: string) {
    return serverStore.getGoodsReceipts(orderId);
  },

  async recordGoodsReceipt(data: any, user?: any) {
    return serverStore.recordGoodsReceipt(data, user);
  },

  async createGoodsReceipt(data: any, user?: any) {
    return this.recordGoodsReceipt(data, user);
  },

  async createStockMovement(data: any) {
    return this.recordStockMovement(data);
  },

  async createAttendance(data: any) {
    return this.recordAttendance(data);
  },

  async getBonsDeSortie(projectId?: string) {
    return serverStore.getBonsDeSortie(projectId);
  },

  async getBonDeSortie(idOrNumber: string) {
    return serverStore.getBonDeSortie(idOrNumber);
  },

  async createBonDeSortie(data: any, user?: any) {
    const res = serverStore.createBonDeSortie(data, user);
    await this.logAudit('CREATE_BON_DE_SORTIE', 'INVENTORY', res.bonNumber, `BSM ${res.bonNumber} émis (${res.totalAmountDA.toLocaleString()} DA PUMP)`, user);
    return res;
  },

  async getMaterialTraceability(query: string) {
    return serverStore.getMaterialTraceability(query);
  },

  async getSupplierContracts(supplierId?: string) {
    return serverStore.getSupplierContracts(supplierId);
  },

  async createSupplierContract(data: any, user?: any) {
    return serverStore.createSupplierContract(data, user);
  },

  async getPhysicalInventories(warehouseId?: string) {
    return serverStore.getPhysicalInventories(warehouseId);
  },

  async createPhysicalInventory(data: any, user?: any) {
    return serverStore.createPhysicalInventory(data, user);
  },

  async submitInventoryCount(id: string, counts: Array<{ itemId: string; physicalCount: number; reason?: string }>, user?: any) {
    return serverStore.submitInventoryCount(id, counts, user);
  },

  async validateAndAdjustInventoryDG(id: string, user?: any) {
    return serverStore.validateAndAdjustInventoryDG(id, user);
  },

  async getSupplierEvaluations(supplierId?: string) {
    return serverStore.getSupplierEvaluations(supplierId);
  },

  async recordSupplierEvaluation(data: any, user?: any) {
    return serverStore.recordSupplierEvaluation(data, user);
  },

  async updateSupplierStatus(id: string, status: any, user?: any) {
    return serverStore.updateSupplierStatus(id, status, user);
  },

  async getProcurementKpis() {
    return serverStore.getProcurementKpis();
  },

  async getInventoryKpis() {
    return serverStore.getInventoryKpis();
  },

  // ============================================================================
  // PHASE 5 : RESSOURCES HUMAINES INDUSTRIELLES, CQS, CONGÉS, MISSIONS & PAIE
  // ============================================================================

  async getIndustrialCertifications(employeeId?: string) {
    return serverStore.getIndustrialCertifications(employeeId);
  },

  async createIndustrialCertification(data: any, user?: any) {
    return serverStore.createIndustrialCertification(data, user);
  },

  async auditIndustrialCertification(id: string, decision: 'VALIDE' | 'REJETE', motif?: string, user?: any) {
    return serverStore.auditIndustrialCertification(id, decision, motif, user);
  },

  async getLeaveRequests(employeeId?: string) {
    return serverStore.getLeaveRequests(employeeId);
  },

  async createLeaveRequest(data: any, user?: any) {
    return serverStore.createLeaveRequest(data, user);
  },

  async approveLeaveRH(id: string, user?: any) {
    return serverStore.approveLeaveRH(id, user);
  },

  async approveLeaveDG(id: string, user?: any) {
    return serverStore.approveLeaveDG(id, user);
  },

  async getMissionOrders(employeeId?: string) {
    return serverStore.getMissionOrders(employeeId);
  },

  async createMissionOrder(data: any, user?: any) {
    return serverStore.createMissionOrder(data, user);
  },

  async approveMissionOrderDG(id: string, user?: any) {
    return serverStore.approveMissionOrderDG(id, user);
  },

  async getRecruitmentRequests(projectId?: string) {
    return serverStore.getRecruitmentRequests(projectId);
  },

  async createRecruitmentRequest(data: any, user?: any) {
    return serverStore.createRecruitmentRequest(data, user);
  },

  async approveRecruitmentRequestDG(id: string, user?: any) {
    return serverStore.approveRecruitmentRequestDG(id, user);
  },

  async getRotationCycles() {
    return serverStore.getRotationCycles();
  },

  async assignEmployeeToRotation(rotationId: string, employeeId: string, user?: any) {
    return serverStore.assignEmployeeToRotation(rotationId, employeeId, user);
  },

  async getSalaryRubrics() {
    return serverStore.getSalaryRubrics();
  },

  async calculatePayslipDemo(employeeId: string, options?: any) {
    return serverStore.calculatePayslipDemo(employeeId, options);
  },

  async getHrKpis() {
    return serverStore.getHrKpis();
  },

  async getEmploymentContracts(employeeId?: string) {
    return serverStore.getEmploymentContracts(employeeId);
  },

  async createEmploymentContract(data: any, user?: any) {
    return serverStore.createEmploymentContract(data, user);
  },

  async getSocialDeclarations(type?: string) {
    return serverStore.getSocialDeclarations(type);
  },

  async createSocialDeclaration(data: any, user?: any) {
    return serverStore.createSocialDeclaration(data, user);
  },


};
