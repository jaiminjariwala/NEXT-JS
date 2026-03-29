import type { CommunityComponentRow, ShowcaseItem } from "@/types";

function EmptyCommunityComponent() {
  return null;
}

export function mapCommunityRowToShowcaseItem(
  row: CommunityComponentRow,
  viewerReactions?: Set<string>
): ShowcaseItem {
  const reactionKeyPrefix = `${row.id}:`;

  return {
    id: `community-${row.id}`,
    name: row.name,
    category: row.category || "Community",
    component: EmptyCommunityComponent,
    source: "community",
    previewMode: "sandbox",
    authorName: row.author_name || "Community",
    description: row.description || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ownerId: row.owner_id,
    slug: row.slug,
    status: row.status,
    forkedFromId: row.forked_from_id,
    bookmarkCount: row.bookmark_count ?? 0,
    viewerHasBookmarked: viewerReactions?.has(`${reactionKeyPrefix}bookmark`) ?? false,
    code: {
      tsx: row.tsx || "",
      css: row.css || "",
      html: row.html || undefined,
      js: row.js || undefined,
      language: row.language || "typescript",
    },
  };
}
