import { Comment } from 'generated/prisma/client';

export function serializeComments(comment: Comment) {
  return {
    ...comment,
    id: Number(comment.id),
    pullRequestId: Number(comment.pullRequestId),
  };
}
