import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { TagsService } from "./tags.service";
import {
  TagSuggestionRequestDto,
  TagSuggestionResponseDto,
  CommitTagsRequestDto,
} from "./dto/tag-suggestion.dto";
import { User, RequestUser } from "../common/decorators/user.decorator";
import { Roles } from "../common/decorators/roles.decorator";

@ApiTags("Tags")
@Controller("tags")
@ApiBearerAuth("bearerAuth")
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post("suggest")
  @ApiOperation({ summary: "Get AI tag suggestions" })
  async suggestTags(
    @Body() dto: TagSuggestionRequestDto,
    @User() user: RequestUser
  ): Promise<TagSuggestionResponseDto> {
    return this.tagsService.suggestTags({
      text: dto.text,
      context: dto.context,
      includeFreeTags: dto.includeFreeTags ?? true,
    });
  }

  @Post("commit")
  @ApiOperation({ summary: "Commit approved tags to entity" })
  @Roles("reviewer", "creator")
  async commitTags(
    @Body() dto: CommitTagsRequestDto,
    @User() user: RequestUser
  ): Promise<{ success: boolean; message: string }> {
    return this.tagsService.commitTags(user.userId, user.orgId, {
      entityId: dto.entityId,
      entityType: dto.entityType,
      candidateIds: dto.candidateIds,
      autoCreate: dto.autoCreate ?? false,
    });
  }
}

