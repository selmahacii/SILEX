import { prisma } from './prisma';
import { serverStore } from './server-store';
import { SystemRole } from '@silex/shared';

const hasDb = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres'));

export const dbBridge = {
  isDbConnected(): boolean {
    return hasDb;
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
        return created;
      } catch (err) {
        console.warn('[DB Bridge] Error creating user in DB:', err);
      }
    }
    return serverStore.createUser(data);
  },

  // --- PROJECTS ---
  async getProjects() {
    if (hasDb) {
      try {
        const projects = await prisma.project.findMany({
          include: {
            milestones: true,
            serviceOrders: true,
            workSituations: true,
            assignedUsers: true,
          },
          orderBy: { createdAt: 'desc' },
        });
        return projects;
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
            OR: [{ code: codeOrId }, { id: codeOrId }],
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
            sector: data.sector || 'OIL_AND_GAS',
            siteLocation: data.siteLocation || 'Chantier Algérie',
            status: data.status || 'IN_PROGRESS',
            riskLevel: data.riskLevel || 'LOW',
            contractAmount: Number(data.contractAmount || 0),
            budgetAmount: Number(data.budgetAmount || 0),
            startDate: data.startDate ? new Date(data.startDate) : new Date(),
            contractEndDate: data.contractEndDate ? new Date(data.contractEndDate) : new Date(Date.now() + 90 * 86400000),
            description: data.description || '',
            managerId: data.managerId || 'usr-rp-002',
          },
        });
        return created;
      } catch (err) {
        console.warn('[DB Bridge] Error creating project in DB:', err);
      }
    }
    return serverStore.createProject(data);
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
          return updated;
        }
      } catch (err) {
        console.warn('[DB Bridge] Error updating project in DB:', err);
      }
    }
    return serverStore.updateProject(codeOrId, data);
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
          return updated;
        }
      } catch (err) {
        console.warn('[DB Bridge] Error updating progress in DB:', err);
      }
    }
    return serverStore.updateProgress(codeOrId, physical, financial);
  },

  async addMilestone(codeOrId: string, data: any) {
    if (hasDb) {
      try {
        const project = await prisma.project.findFirst({
          where: { OR: [{ code: codeOrId }, { id: codeOrId }] },
        });
        if (project) {
          const count = await prisma.milestone.count({ where: { projectId: project.id } });
          const created = await prisma.milestone.create({
            data: {
              projectId: project.id,
              orderIndex: count + 1,
              title: data.title,
              description: data.description || '',
            managerId: data.managerId || 'usr-rp-002',
              weight: Number(data.weight || 10),
              targetDate: data.targetDate ? new Date(data.targetDate) : new Date(),
              completed: false,
            },
          });
          return created;
        }
      } catch (err) {
        console.warn('[DB Bridge] Error adding milestone in DB:', err);
      }
    }
    return serverStore.addMilestone(codeOrId, data);
  },

  async addServiceOrder(codeOrId: string, data: any) {
    if (hasDb) {
      try {
        const project = await prisma.project.findFirst({
          where: { OR: [{ code: codeOrId }, { id: codeOrId }] },
        });
        if (project) {
          const count = await prisma.serviceOrder.count({ where: { projectId: project.id } });
          const orderNumber = data.orderNumber || `ODS-${project.code}-${String(count + 1).padStart(2, '0')}`;
          const created = await prisma.serviceOrder.create({
            data: {
              projectId: project.id,
              orderNumber,
              type: data.type || 'DEMARRAGE',
              description: data.description || '',
            managerId: data.managerId || 'usr-rp-002',
              delayDays: Number(data.delayDays || 0),
              costImpact: Number(data.costImpact || 0),
              clientRef: data.clientRef || '',
              status: 'SIGNE',
              effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : new Date(),
            },
          });
          return created;
        }
      } catch (err) {
        console.warn('[DB Bridge] Error adding service order in DB:', err);
      }
    }
    return serverStore.addServiceOrder(codeOrId, data);
  },

  async addWorkSituation(codeOrId: string, data: any) {
    if (hasDb) {
      try {
        const project = await prisma.project.findFirst({
          where: { OR: [{ code: codeOrId }, { id: codeOrId }] },
        });
        if (project) {
          const count = await prisma.workSituation.count({ where: { projectId: project.id } });
          const situationNumber = `SIT-${project.code}-${String(count + 1).padStart(2, '0')}`;
          const amountHT = Number(data.totalHT || data.amountHT || 0);
          const retenueGarantie = amountHT * 0.05;
          const amountTVA = amountHT * 0.19;
          const amountTTC = amountHT - retenueGarantie + amountTVA;

          const created = await prisma.workSituation.create({
            data: {
              projectId: project.id,
              situationNumber,
              periodStart: data.periodStart ? new Date(data.periodStart) : new Date(),
              periodEnd: data.periodEnd ? new Date(data.periodEnd) : new Date(),
              status: 'SOUMIS',
              amountHT,
              retenueGarantie,
              amountTVA,
              amountTTC,
              cumulatedAmountHT: amountHT,
            },
          });

          // Workflow QCD partagé
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
            amountTVA,
            amountTTC,
            justification: `Attachement contradictoire pour situation ${situationNumber}`,
          });

          return created;
        }
      } catch (err) {
        console.warn('[DB Bridge] Error adding work situation in DB:', err);
      }
    }
    return serverStore.addWorkSituation(codeOrId, data);
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
            spentBudget: true,
          },
        });
        const totalContracted = Number(agg._sum.contractAmount || 0);
        const totalBudget = Number(agg._sum.budgetAmount || 0);
        const monthlyExpenditure = Number(agg._sum.spentBudget || 0);

        return {
          totalProjects,
          activeProjects,
          activeProjectsCount: activeProjects,
          totalContractValue: totalContracted,
          totalContracted,
          totalBudgetAllocated: totalBudget,
          totalBudget,
          totalSpent: monthlyExpenditure,
          monthlyExpenditure,
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
    if (hasDb) {
      try {
        const wfs = await prisma.workflowInstance.findMany({
          orderBy: { detectedDate: 'desc' },
        });
        if (wfs && wfs.length > 0) return wfs;
      } catch (err) {
        console.warn('[DB Bridge] Fallback store for getWorkflows:', err);
      }
    }
    return serverStore.getWorkflows();
  },

  async createWorkflow(data: any) {
    if (hasDb) {
      try {
        const count = await prisma.workflowInstance.count();
        const code = `WF-${String(count + 1).padStart(4, '0')}`;
        const created = await prisma.workflowInstance.create({
          data: {
            code,
            reference: data.reference || code,
            title: data.title,
            type: data.type || 'PURCHASE_REQUEST',
            status: 'PENDING_DG' as any,
            priority: (data.priority || 'NORMAL') as any,
            initiatorId: data.initiatorId || 'usr-rp-002',
            initiatorName: data.initiatorName || 'Responsable Projet',
            targetId: data.targetId || '',
            amountHT: Number(data.amountHT || 0),
            amountTVA: Number(data.amountTVA || 0),
            amountTTC: Number(data.amountTTC || 0),
          },
        });
        return created;
      } catch (err) {
        console.warn('[DB Bridge] Error creating workflow in DB:', err);
      }
    }
    return serverStore.createWorkflow(data);
  },

  async approveWorkflow(id: string, notes: string = '', user?: any) {
    if (hasDb) {
      try {
        const wf = await prisma.workflowInstance.findFirst({
          where: { OR: [{ id }, { code: id }, { reference: id }] },
        });
        if (wf) {
          const updated = await prisma.workflowInstance.update({
            where: { id: wf.id },
            data: {
              status: 'APPROVED' as any,
              decidedAt: new Date(),
              decisionNotes: notes,
            },
          });
          return updated;
        }
      } catch (err) {
        console.warn('[DB Bridge] Error approving workflow in DB:', err);
      }
    }
    return serverStore.approveWorkflow(id, notes, user);
  },

  async rejectWorkflow(id: string, reason: string = '', user?: any) {
    if (hasDb) {
      try {
        const wf = await prisma.workflowInstance.findFirst({
          where: { OR: [{ id }, { code: id }, { reference: id }] },
        });
        if (wf) {
          const updated = await prisma.workflowInstance.update({
            where: { id: wf.id },
            data: {
              status: 'REJECTED' as any,
              decidedAt: new Date(),
              decisionNotes: reason,
            },
          });
          return updated;
        }
      } catch (err) {
        console.warn('[DB Bridge] Error rejecting workflow in DB:', err);
      }
    }
    return serverStore.rejectWorkflow(id, reason, user);
  },

  async requestRevisionWorkflow(id: string, instructions: string = '', user?: any) {
    if (hasDb) {
      try {
        const wf = await prisma.workflowInstance.findFirst({
          where: { OR: [{ id }, { code: id }, { reference: id }] },
        });
        if (wf) {
          const updated = await prisma.workflowInstance.update({
            where: { id: wf.id },
            data: {
              status: 'REVISION_REQUESTED' as any,
              decisionNotes: instructions,
            },
          });
          return updated;
        }
      } catch (err) {
        console.warn('[DB Bridge] Error revising workflow in DB:', err);
      }
    }
    return serverStore.requestRevisionWorkflow(id, instructions, user);
  },

  // --- PROCUREMENT ---
  async getPurchaseRequests() {
    if (hasDb) {
      try {
        const prs = await prisma.purchaseRequest.findMany({
          include: { lines: true, project: true },
          orderBy: { createdAt: 'desc' },
        });
        return prs;
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
        const amountHT = Number(data.totalHT || data.amountHT || 0);
        const vatRate = Number(data.vatRate || 19);
        const vatAmount = amountHT * (vatRate / 100);
        const totalTTC = amountHT + vatAmount;

        const created = await prisma.purchaseRequest.create({
          data: {
            code,
            projectId: data.projectId,
            requestedById: data.requestedById || 'usr-rp-002',
            category: data.category || 'TUYAUTERIE',
            urgency: data.urgency || 'NORMAL',
            status: 'PENDING',
            desiredDeliveryDate: data.desiredDeliveryDate ? new Date(data.desiredDeliveryDate) : new Date(Date.now() + 7 * 86400000),
            amountHT,
            vatRate,
            amountTVA: vatAmount,
            amountTTC: totalTTC,
            justification: data.justification || '',
          },
        });

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
        });

        return created;
      } catch (err) {
        console.warn('[DB Bridge] Error creating DA in DB:', err);
      }
    }
    return serverStore.createPurchaseRequest(data);
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
            contactName: data.contactName || '',
            phone: data.phone || '',
            email: data.email || '',
            taxId: data.taxId || '',
            tradeRegistryNumber: data.tradeRegistryNumber || '',
            bankRIB: data.bankRIB || '',
            address: data.address || '',
            specialties: 'Fournitures Industrielles',
          },
        });
        return created;
      } catch (err) {
        console.warn('[DB Bridge] Error creating supplier in DB:', err);
      }
    }
    return serverStore.createSupplier(data);
  },

  async getPurchaseOrders() {
    if (hasDb) {
      try {
        const pos = await prisma.purchaseOrder.findMany({
          include: { supplier: true, project: true },
          orderBy: { createdAt: 'desc' },
        });
        return pos;
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
        const created = await prisma.purchaseOrder.create({
          data: {
            code,
            projectId: data.projectId,
            purchaseRequestId: data.purchaseRequestId,
            supplierId: data.supplierId,
            status: 'ISSUED',
            totalHT: Number(data.totalHT || 0),
            vatAmount: Number(data.vatAmount || 0),
            totalTTC: Number(data.totalTTC || 0),
          },
        });
        return created;
      } catch (err) {
        console.warn('[DB Bridge] Error creating PO in DB:', err);
      }
    }
    return serverStore.createPurchaseOrder(data);
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
        return created;
      } catch (err) {
        console.warn('[DB Bridge] Error creating warehouse in DB:', err);
      }
    }
    return serverStore.createWarehouse(data);
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
        const count = await prisma.inventoryItem.count();
        const code = data.code || `ART-2026-${String(count + 1).padStart(3, '0')}`;
        const created = await prisma.inventoryItem.create({
          data: {
            code,
            name: data.name,
            description: data.description || '',
            managerId: data.managerId || 'usr-rp-002',
            category: data.category || 'TUYAUTERIE',
            unit: data.unit || 'UNITE',
            unitCost: Number(data.unitCost || 0),
            minStock: Number(data.minStock || 0),
            currentStock: Number(data.currentStock || 0),
          },
        });
        return created;
      } catch (err) {
        console.warn('[DB Bridge] Error creating inventory item in DB:', err);
      }
    }
    return serverStore.createInventoryItem(data);
  },

  async getStockMovements() {
    if (hasDb) {
      try {
        const mvts = await prisma.stockMovement.findMany({
          include: { item: true, warehouse: true },
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
        const isEntry = data.type === 'ENTRY' || data.type === 'RECEPTION';

        const created = await prisma.stockMovement.create({
          data: {
            movementNumber: mvtNumber,
            itemId: data.itemId,
            warehouseId: data.warehouseId,
            type: data.type || 'ENTRY',
            quantity: qty,
            referenceDocument: data.documentRef || '',
          },
        });

        // Recalcul du stock physique en base
        if (isEntry) {
          await prisma.inventoryItem.update({
            where: { id: data.itemId },
            data: { currentStock: { increment: qty } },
          });
        } else {
          await prisma.inventoryItem.update({
            where: { id: data.itemId },
            data: { currentStock: { decrement: qty } },
          });
        }

        return created;
      } catch (err) {
        console.warn('[DB Bridge] Error recording stock movement in DB:', err);
      }
    }
    return serverStore.recordStockMovement(data);
  },

  // --- HR ---
  async getEmployees() {
    if (hasDb) {
      try {
        const emps = await prisma.employee.findMany({ orderBy: { lastName: 'asc' } });
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
        const count = await prisma.employee.count();
        const matricule = `MAT-${String(count + 1).padStart(4, '0')}`;
        const created = await prisma.employee.create({
          data: {
            matricule,
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            title: data.title || 'Technicien Chantier',
            email: data.email || null,
            phone: data.phone || null,
            contractType: data.contractType || 'CHANTIER',
            dailyRate: Number(data.baseRate || data.dailyRate || 5500),
            active: true,
          },
        });
        return created;
      } catch (err) {
        console.warn('[DB Bridge] Error creating employee in DB:', err);
      }
    }
    return serverStore.createEmployee(data);
  },

  async getCertifications() {
    if (hasDb) {
      try {
        const certs = await prisma.employeeCertification.findMany({ orderBy: { expiryDate: 'asc' } });
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
        const created = await prisma.certification.create({
          data: {
            employeeId: data.employeeId,
            name: data.name,
            certificateNumber: data.certificateNumber || '',
            standard: data.standard || 'ASME IX',
            issuingBody: data.issuingBody || 'Bureau Veritas',
            issuedDate: data.issuedDate ? new Date(data.issuedDate) : new Date(),
            expiryDate: data.expiryDate ? new Date(data.expiryDate) : new Date(Date.now() + 365 * 86400000),
            status: 'VALIDE',
          },
        });
        return created;
      } catch (err) {
        console.warn('[DB Bridge] Error creating certification in DB:', err);
      }
    }
    return serverStore.createCertification(data);
  },

  async getAttendances() {
    if (hasDb) {
      try {
        const atts = await prisma.attendance.findMany({ orderBy: { date: 'desc' } });
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
        const created = await prisma.attendance.create({
          data: {
            employeeId: data.employeeId,
            date: data.date ? new Date(data.date) : new Date(),
            hoursWorked: Number(data.hoursWorked || 8),
            overtimeHours: Number(data.overtimeHours || 0),
            type: data.type || 'PRESENT',
            allowanceAmount: Number(data.allowance || 0),
          },
        });
        return created;
      } catch (err) {
        console.warn('[DB Bridge] Error recording attendance in DB:', err);
      }
    }
    return serverStore.recordAttendance(data);
  },

  // --- FLEET & MAINTENANCE ---
  async getFleetAssets() {
    if (hasDb) {
      try {
        const asts = await prisma.asset.findMany({ orderBy: { name: 'asc' } });
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
        const code = data.code || `EQP-${String(count + 1).padStart(3, '0')}`;
        const created = await prisma.asset.create({
          data: {
            code,
            name: data.name,
            type: data.type || 'ENGIN',
            brand: data.brand || '',
            model: data.model || '',
            serialNumber: data.serialNumber || '',
            matricule: data.matricule || null,
            status: 'DISPONIBLE',
            operatingHours: Number(data.operatingHours || 0),
          },
        });
        return created;
      } catch (err) {
        console.warn('[DB Bridge] Error creating asset in DB:', err);
      }
    }
    return serverStore.createFleetAsset(data);
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
        const count = await prisma.maintenanceOrder.count();
        const code = `OT-2026-${String(count + 1).padStart(4, '0')}`;
        const created = await prisma.maintenanceOrder.create({
          data: {
            code,
            assetId: data.assetId,
            type: data.type || 'PREVENTIVE',
            priority: data.priority || 'MEDIUM',
            status: 'PLANIFIE',
            description: data.description || '',
            managerId: data.managerId || 'usr-rp-002',
            scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : new Date(),
            estimatedCost: Number(data.orderCost || data.estimatedCost || 0),
          },
        });
        return created;
      } catch (err) {
        console.warn('[DB Bridge] Error creating maintenance order in DB:', err);
      }
    }
    return serverStore.createMaintenanceOrder(data);
  },

  // --- QUALITY & QHSE ---
  async getNonConformities() {
    if (hasDb) {
      try {
        const ncs = await prisma.nonConformity.findMany({
          include: { project: true },
          orderBy: { detectedDate: 'desc' },
        });
        return ncs;
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
        const code = `FNC-2026-${String(count + 1).padStart(3, '0')}`;
        const created = await prisma.nonConformity.create({
          data: {
            code,
            title: data.title,
            description: data.description || '',
            managerId: data.managerId || 'usr-rp-002',
            severity: data.severity || 'MAJEURE',
            status: 'OUVERTE',
            detectedBy: data.detectedBy || 'Inspecteur CND SILEX',
            projectId: data.projectId,
            correctiveAction: data.correctiveAction || null,
          },
        });
        return created;
      } catch (err) {
        console.warn('[DB Bridge] Error creating FNC in DB:', err);
      }
    }
    return serverStore.createNonConformity(data);
  },

  async getQualityDocuments() {
    if (hasDb) {
      try {
        const docs = await prisma.document.findMany({ orderBy: { uploadDate: 'desc' } });
        return docs;
      } catch (err) {
        console.warn('[DB Bridge] Fallback store for getQualityDocuments:', err);
      }
    }
    return serverStore.getQualityDocuments();
  },

  async createQualityDocument(data: any) {
    if (hasDb) {
      try {
        const count = await prisma.qualityDocument.count();
        const docNumber = data.docNumber || `DOC-2026-${String(count + 1).padStart(3, '0')}`;
        const created = await prisma.qualityDocument.create({
          data: {
            docNumber,
            title: data.title,
            category: data.category || 'PROCEDURE',
            author: data.author || 'Direction Technique SILEX',
            version: data.version || '1.0',
            status: 'VALIDE',
          },
        });
        return created;
      } catch (err) {
        console.warn('[DB Bridge] Error creating quality document in DB:', err);
      }
    }
    return serverStore.createQualityDocument(data);
  },

  // --- FINANCE ---
  async getFinanceOverview() {
    return serverStore.getFinanceOverview();
  },

  async getCostDistribution() {
    return serverStore.getCostDistribution();
  },

  async recordPayment(data: any) {
    return serverStore.recordPayment(data);
  },

  // --- AUDIT ---
  async getAuditLogs() {
    if (hasDb) {
      try {
        const logs = await prisma.auditLog.findMany({
          orderBy: { timestamp: 'desc' },
          take: 50,
        });
        if (logs && logs.length > 0) return logs;
      } catch (err) {
        console.warn('[DB Bridge] Fallback store for getAuditLogs:', err);
      }
    }
    return serverStore.getAuditLogs();
  },
};
