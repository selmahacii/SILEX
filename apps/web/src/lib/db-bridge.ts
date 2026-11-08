import { prisma } from './prisma';
import { serverStore } from './server-store';
import { SystemRole } from '@silex/shared';

const hasDb = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres'));

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

  async getUsers() {
    if (hasDb) {
      try {
        const users = await prisma.user.findMany({ orderBy: { createdAt: 'asc' } });
        if (users && users.length > 0) return users;
      } catch (err) {
        console.warn('[DB Bridge] Fallback store for getUsers:', err);
      }
    }
    return serverStore.getUsers();
  },

  async createUser(data: any) {
    if (hasDb) {
      try {
        const created = await prisma.user.create({
          data: {
            name: data.name,
            email: data.email.toLowerCase(),
            passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$dummyhashdemo2026',
            title: data.title || 'Collaborateur SILEX',
            role: data.role || 'RESPONSABLE_PROJET',
            departmentCode: data.departmentCode || 'OPERATIONS_PROJETS',
            active: data.active ?? true,
          },
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
          },
        });
        if (projects && projects.length > 0) return projects;
      } catch (err) {
        console.warn('[DB Bridge] Fallback store for getProjects:', err);
      }
    }
    return serverStore.getProjects();
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
            milestones: true,
            serviceOrders: true,
            workSituations: true,
            assignedUsers: true,
          },
        });
        if (project) return project;
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
            sector: (data.sector || 'OIL_AND_GAS') as any,
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
            },
          });
          await this.logAudit('UPDATE_PROJECT', 'PROJECT', updated.code, `Mise à jour du projet ${updated.code}`, data.user);
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
        const totalProjects = await prisma.project.count();
        const activeProjects = await prisma.project.count({ where: { status: 'IN_PROGRESS' } });
        const agg = await prisma.project.aggregate({
          _sum: {
            contractAmount: true,
            budgetAmount: true,
            actualCost: true,
            committedCost: true,
          },
        });
        const totalContracted = Number(agg._sum.contractAmount || 0);
        const totalBudget = Number(agg._sum.budgetAmount || 0);
        const totalSpent = Number(agg._sum.actualCost || 0);
        const totalCommitted = Number(agg._sum.committedCost || 0);

        return {
          totalProjects,
          activeProjects,
          activeProjectsCount: activeProjects,
          totalContractValue: totalContracted,
          totalContracted,
          totalBudgetAllocated: totalBudget,
          totalBudget,
          totalSpent,
          totalActualCosts: totalSpent,
          totalCommitted,
          totalCommittedCosts: totalCommitted,
          monthlyExpenditure: totalSpent,
          avgPhysicalProgress: 0,
          clientReceivables: 0,
          supplierPayables: 0,
        };
      } catch (err) {
        console.warn('[DB Bridge] Fallback store for getProjectKpis:', err);
      }
    }
    return serverStore.getProjectKpis();
  },

  // --- WORKFLOWS (Circuit QCD) ---
  async getWorkflows() {
    return serverStore.getWorkflows();
  },

  async createWorkflow(data: any) {
    const wf = serverStore.createWorkflow(data);
    await this.logAudit('CREATE_WORKFLOW', 'WORKFLOW', wf.code, `Dossier workflow ${wf.reference} soumis au circuit QCD`, null);
    return wf;
  },

  async approveWorkflow(id: string, notes: string = '', user?: any) {
    const res = serverStore.approveWorkflow(id, notes, user);
    await this.logAudit('APPROVE_WORKFLOW', 'WORKFLOW', id, `Dossier approuvé avec mention: ${notes || 'Validé'}`, user);
    return res;
  },

  async rejectWorkflow(id: string, reason: string = '', user?: any) {
    const res = serverStore.rejectWorkflow(id, reason, user);
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
          include: { lines: { include: { item: true } }, project: true, createdBy: true },
          orderBy: { createdAt: 'desc' },
        });
        if (prs && prs.length > 0) {
          return prs.map((pr: any) => ({
            ...pr,
            code: pr.reference || pr.code,
            reference: pr.reference || pr.code,
            amountHT: Number(pr.totalEstimatedAmount || pr.amountHT || 0),
            totalHT: Number(pr.totalEstimatedAmount || pr.amountHT || 0),
            amountTVA: Number(pr.totalEstimatedAmount || 0) * 0.19,
            amountTTC: Number(pr.totalEstimatedAmount || 0) * 1.19,
            desiredDeliveryDate: pr.desiredDate || pr.desiredDeliveryDate,
            urgency: pr.urgencyLevel || pr.urgency || 'NORMAL',
          }));
        }
      } catch (err) {
        console.warn('[DB Bridge] Fallback store for getPurchaseRequests:', err);
      }
    }
    return serverStore.getPurchaseRequests();
  },

  async createPurchaseRequest(data: any) {
    if (hasDb) {
      try {
        const count = await prisma.purchaseRequest.count();
        const code = `DA-2026-${String(count + 1).padStart(4, '0')}`;
        const amountHT = Number(data.totalHT || data.amountHT || data.estimatedAmount || 0);
        const vatRate = Number(data.vatRate || 19);
        const vatAmount = amountHT * (vatRate / 100);
        const totalTTC = amountHT + vatAmount;

        const created = await prisma.purchaseRequest.create({
          data: {
            reference: code,
            projectId: data.projectId,
            createdById: data.requestedById || data.createdById || 'usr-rp-002',
            urgencyLevel: (data.urgency || data.urgencyLevel || 'NORMAL'),
            status: 'SUBMITTED',
            desiredDate: data.desiredDeliveryDate ? new Date(data.desiredDeliveryDate) : (data.desiredDate ? new Date(data.desiredDate) : new Date(Date.now() + 7 * 86400000)),
            totalEstimatedAmount: amountHT,
            justification: data.justification || 'Demande d’achat matériel chantier',
          },
        });

        // Lignes de DA
        const rawLines = Array.isArray(data.items) ? data.items : (Array.isArray(data.lines) ? data.lines : []);
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
            const linePrice = Number(line.unitPrice || 0);
            await prisma.purchaseRequestLine.create({
              data: {
                purchaseRequestId: created.id,
                itemId: line.itemId || defaultItem.id,
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
        if (supps && supps.length > 0) return supps;
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
        if (pos && pos.length > 0) {
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
        if (!supId) {
          const firstSup = await prisma.supplier.findFirst();
          supId = firstSup?.id;
        }

        let prId = data.purchaseRequestId;
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
              await prisma.purchaseOrderLine.create({
                data: {
                  purchaseOrderId: created.id,
                  itemId: line.itemId || defaultItem.id,
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
        if (whs && whs.length > 0) return whs;
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
        if (items && items.length > 0) return items;
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
            name: data.name,
            description: data.description || data.name,
            categoryId: cat.id,
            unit: data.unit || 'UNITE',
            unitCost: Number(data.unitCost || 0),
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

  async getStockMovements() {
    if (hasDb) {
      try {
        const mvts = await prisma.stockMovement.findMany({
          include: { item: true, warehouse: true, project: true },
          orderBy: { createdAt: 'desc' },
        });
        if (mvts && mvts.length > 0) return mvts;
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
            projectId: data.projectId || null,
            referenceDocument: data.documentRef || data.deliveryNoteNumber || '',
            notes: data.notes || '',
            createdById: data.createdById || 'usr-mag-004',
          },
        });

        await prisma.item.update({
          where: { id: itm.id },
          data: {
            currentStock: isEntry ? { increment: qty } : { decrement: qty },
          },
        });

        if (!isEntry && data.projectId && totalCost > 0) {
          await prisma.project.update({
            where: { id: data.projectId },
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
        if (emps && emps.length > 0) return emps;
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
        console.warn('[DB Bridge] Error creating employee in DB:', err);
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
        if (certs && certs.length > 0) return certs;
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
              name: data.name,
              certificateNumber: data.certificateNumber || data.certNumber || `CERT-${Date.now()}`,
              standard: data.standard || 'ASME IX',
              issuingBody: data.issuingBody || 'Bureau Veritas',
              issuedDate: data.issuedDate ? new Date(data.issuedDate) : new Date(),
              expiryDate: data.expiryDate ? new Date(data.expiryDate) : new Date(Date.now() + 365 * 86400000),
              status: 'VALID',
            },
          });
          await this.logAudit('CREATE_CERTIFICATION', 'HR', created.certificateNumber, `Certification enregistrée : ${created.name}`, data.user);
          return created;
        }
      } catch (err) {
        console.warn('[DB Bridge] Error creating certification in DB:', err);
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
        if (atts && atts.length > 0) return atts;
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
        console.warn('[DB Bridge] Error recording attendance in DB:', err);
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
        if (asts && asts.length > 0) return asts;
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
        if (orders && orders.length > 0) return orders;
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
  async getNonConformities() {
    if (hasDb) {
      try {
        const ncs = await prisma.nonConformity.findMany({
          include: { project: true, actions: true },
          orderBy: { detectedDate: 'desc' },
        });
        if (ncs && ncs.length > 0) return ncs;
      } catch (err) {
        console.warn('[DB Bridge] Fallback store for getNonConformities:', err);
      }
    }
    return serverStore.getNonConformities();
  },

  async createNonConformity(data: any) {
    if (hasDb) {
      try {
        const count = await prisma.nonConformity.count();
        const ncNumber = data.code || data.ncNumber || `FNC-2026-${String(count + 1).padStart(3, '0')}`;
        const created = await prisma.nonConformity.create({
          data: {
            ncNumber,
            title: data.title || 'Fiche Non-Conformité',
            description: data.description || '',
            severity: (data.severity || 'MAJOR') as any,
            status: 'OPEN',
            detectedBy: data.detectedBy || 'Inspecteur CND SILEX',
            projectId: data.projectId || null,
          },
        });
        await this.logAudit('CREATE_NON_CONFORMITY', 'QUALITY', created.ncNumber, `FNC ouverte : ${created.ncNumber} - ${created.title}`, data.user);
        return created;
      } catch (err) {
        console.warn('[DB Bridge] Error creating FNC in DB:', err);
      }
    }
    const res = serverStore.createNonConformity(data);
    await this.logAudit('CREATE_NON_CONFORMITY', 'QUALITY', res.code, `FNC ouverte : ${res.code}`, data.user);
    return res;
  },

  async getQualityDocuments() {
    if (hasDb) {
      try {
        const docs = await prisma.document.findMany({
          include: { project: true },
          orderBy: { createdAt: 'desc' },
        });
        if (docs && docs.length > 0) return docs;
      } catch (err) {
        console.warn('[DB Bridge] Fallback store for getQualityDocuments:', err);
      }
    }
    return serverStore.getQualityDocuments();
  },

  async createQualityDocument(data: any) {
    if (hasDb) {
      try {
        let proj = data.projectId ? await prisma.project.findUnique({ where: { id: data.projectId } }) : null;
        if (!proj) proj = await prisma.project.findFirst();
        if (proj) {
          const docNumber = data.docNumber || `DOC-2026-${Date.now().toString().slice(-4)}`;
          const created = await prisma.document.create({
            data: {
              projectId: proj.id,
              name: data.title || data.name || 'Document Qualité',
              fileUrl: data.fileUrl || '/docs/sample.pdf',
              documentType: (data.category || 'PROCEDURE') as any,
              uploadedById: 'usr-dg-001',
            },
          });
          await this.logAudit('CREATE_DOCUMENT', 'QUALITY', docNumber, `Document qualité déposé : ${created.name}`, data.user);
          return created;
        }
      } catch (err) {
        console.warn('[DB Bridge] Error creating document in DB:', err);
      }
    }
    const res = serverStore.createQualityDocument(data);
    await this.logAudit('CREATE_DOCUMENT', 'QUALITY', res.docNumber, `Document déposé : ${res.title}`, data.user);
    return res;
  },

  // --- FINANCE ---
  async recordPayment(data: any) {
    const payment = serverStore.recordPayment(data);
    await this.logAudit('RECORD_PAYMENT', 'FINANCE', payment.paymentReference, `Encaissement de ${payment.amount.toLocaleString()} DA enregistré`, data.user);
    return payment;
  },

  async getFinanceOverview() {
    return serverStore.getFinanceOverview();
  },

  async getCostDistribution() {
    return serverStore.getCostDistribution();
  },

  // --- AUDIT TRAIL (Traçabilité) ---
  async getAuditLogs() {
    if (hasDb) {
      try {
        const logs = await prisma.auditLog.findMany({
          orderBy: { createdAt: 'desc' },
          take: 100,
        });
        if (logs && logs.length > 0) {
          return logs.map((l: any) => ({
            ...l,
            entityType: l.entityName,
            details: l.description,
            timestamp: l.createdAt ? l.createdAt.toISOString() : new Date().toISOString(),
          }));
        }
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
};
