import { Injectable, NotFoundException, BadRequestException, Inject } from "@nestjs/common";
import type { PrismaClient } from "@prisma/client";
import type { ActionDraft, SOPDraft } from "@aisop/domain";
import { CreateSOPDto, CreateSOPResponseDto } from "./dto/sop.dto";

/**
 * SOPs Service
 * 
 * 處理 SOP 與 Action 的建立、查詢與更新
 * 對應任務：T017
 */
@Injectable()
export class SOPsService {
  constructor(@Inject("PrismaClient") private readonly prisma: PrismaClient) {}

  /**
   * 從草稿建立 SOP 與 Actions
   * 
   * 1. 建立 SOP 記錄
   * 2. 建立 SOPVersion（初始版本）
   * 3. 建立 Action 記錄
   * 4. 建立 SOPActionLink（關聯 SOP 與 Action）
   * 5. 記錄審計日誌（TODO: T019）
   */
  async createSOPFromDraft(
    userId: string,
    orgId: string,
    sopDraft: SOPDraft,
    request?: CreateSOPDto
  ): Promise<CreateSOPResponseDto> {
    // 驗證所有行動卡草稿都已審核通過
    const hasUnapprovedActions = sopDraft.actionDrafts.some(
      (action) => action.reviewStatus !== "approved"
    );

    if (hasUnapprovedActions) {
      throw new BadRequestException("所有行動卡必須先審核通過才能建立 SOP");
    }

    // 使用事務確保資料一致性
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. 建立 SOP
      const sop = await tx.sOP.create({
        data: {
          orgId,
          title: request?.title || sopDraft.title,
          projectId: request?.projectId || sopDraft.frontmatter.projectId,
          status: "draft", // 所有自動產出皆為 draft 狀態
          tags: request?.tags || sopDraft.frontmatter.tags || {},
          notes: request?.notes || sopDraft.notes?.join("\n"),
          createdById: userId,
        },
      });

      // 2. 建立初始 SOPVersion
      const sopVersion = await tx.sOPVersion.create({
        data: {
          sopId: sop.id,
          semver: sopDraft.frontmatter.version || "0.1.0",
          contentMarkdown: sopDraft.markdownContent,
          contentJson: sopDraft.jsonContent,
          status: "draft",
        },
      });

      // 3. 更新 SOP 的 currentVersionId
      await tx.sOP.update({
        where: { id: sop.id },
        data: { currentVersionId: sopVersion.id },
      });

      // 4. 建立 Actions 與 SOPActionLink
      const actionIds: string[] = [];

      // 按照順序排序行動卡草稿
      const sortedActions = [...sopDraft.actionDrafts].sort(
        (a, b) => a.order - b.order
      );

      for (let i = 0; i < sortedActions.length; i++) {
        const actionDraft = sortedActions[i];

        // 確定負責人 ID（優先使用草稿中的 suggestedOwnerId，否則使用 userId）
        const ownerId =
          actionDraft.suggestedOwnerId ||
          actionDraft.suggestedOwner || // 如果只有名稱，這裡需要查詢 User ID（簡化處理，使用 userId）
          userId;

        // 驗證 ownerId 是否存在於該組織
        const owner = await tx.user.findFirst({
          where: {
            id: ownerId,
            orgId: orgId,
          },
        });

        if (!owner) {
          throw new BadRequestException(
            `負責人 ${ownerId} 不存在於組織中或無權限`
          );
        }

        // 建立 Action
        const action = await tx.action.create({
          data: {
            orgId,
            title: actionDraft.title,
            description: actionDraft.description,
            ownerId,
            status: "pending", // 預設為 pending
            dueAt: actionDraft.suggestedDueDate
              ? new Date(actionDraft.suggestedDueDate)
              : null,
            tags: actionDraft.suggestedTags || {},
            sourceInboxId: sopDraft.sourceConversationId || null,
          },
        });

        actionIds.push(action.id);

        // 建立 SOPActionLink
        await tx.sOPActionLink.create({
          data: {
            sopId: sop.id,
            actionId: action.id,
            ord: actionDraft.order || i + 1,
            meta: {
              draftId: actionDraft.draftId,
              aiConfidence: actionDraft.aiConfidence,
              aiReasoning: actionDraft.aiReasoning,
            },
          },
        });
      }

      // TODO: T019 - 記錄審計日誌
      // await this.auditLogService.log({
      //   orgId,
      //   userId,
      //   action: "create_sop_from_draft",
      //   entityType: "SOP",
      //   entityId: sop.id,
      //   metadata: {
      //     draftId: sopDraft.draftId,
      //     promptVersion: sopDraft.promptVersion,
      //     actionCount: actionIds.length,
      //   },
      // });

      return {
        sop,
        actionIds,
      };
    });

    return {
      id: result.sop.id,
      title: result.sop.title,
      projectId: result.sop.projectId || undefined,
      status: result.sop.status,
      tags: (result.sop.tags as Record<string, unknown>) || undefined,
      notes: result.sop.notes || undefined,
      createdAt: result.sop.createdAt.toISOString(),
      actionIds: result.actionIds,
    };
  }

  /**
   * 根據 ID 查詢 SOP（含最新版本）
   */
  async findOne(id: string, orgId: string): Promise<any> {
    const sop = await this.prisma.sOP.findFirst({
      where: {
        id,
        orgId, // 確保只查詢該組織的 SOP
      },
      include: {
        currentVersion: true,
        actionLinks: {
          include: {
            action: true,
          },
          orderBy: {
            ord: "asc",
          },
        },
      },
    });

    if (!sop) {
      throw new NotFoundException(`SOP with ID ${id} not found`);
    }

    return sop;
  }

  /**
   * 查詢 SOP 列表（含分頁與篩選）
   */
  async findAll(
    orgId: string,
    filters?: {
      status?: string;
      projectId?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ items: any[]; total: number }> {
    const where: any = {
      orgId,
    };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.projectId) {
      where.projectId = filters.projectId;
    }

    const [items, total] = await Promise.all([
      this.prisma.sOP.findMany({
        where,
        include: {
          currentVersion: true,
        },
        take: filters?.limit || 20,
        skip: filters?.offset || 0,
        orderBy: {
          createdAt: "desc",
        },
      }),
      this.prisma.sOP.count({ where }),
    ]);

    return { items, total };
  }
}

