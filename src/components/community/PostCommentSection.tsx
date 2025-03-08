
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Comment, Profile } from "@/types/community";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface PostCommentSectionProps {
  postId: string;
  comments?: Comment[];
  commentsCount: number;
  user: Profile | null;
  onAddComment: (postId: string, content: string) => void;
}

const PostCommentSection: React.FC<PostCommentSectionProps> = ({
  postId,
  comments,
  commentsCount,
  user,
  onAddComment
}) => {
  const [commentContent, setCommentContent] = useState('');

  const handleAddComment = () => {
    if (commentContent.trim()) {
      onAddComment(postId, commentContent);
      setCommentContent('');
    }
  };

  return (
    <div className="mt-4">
      <div className="flex items-center space-x-2 mb-2">
        <Avatar>
          <AvatarImage src={user?.photo || ""} alt={`${user?.first_name} ${user?.last_name}`} />
          <AvatarFallback>{user?.first_name?.[0]}{user?.last_name?.[0]}</AvatarFallback>
        </Avatar>
        <Input
          type="text"
          placeholder="Adicionar um comentário..."
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
          className="flex-1"
        />
        <Button size="sm" onClick={handleAddComment}>
          Enviar
        </Button>
      </div>

      {comments && comments.length > 0 ? (
        comments.map((comment) => (
          <div key={comment.id} className="bg-gray-100 rounded-lg p-2 mb-2">
            <div className="flex items-start space-x-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src={comment.user?.photo || ""} alt={`${comment.user?.first_name} ${comment.user?.last_name}`} />
                <AvatarFallback>{comment.user?.first_name?.[0]}{comment.user?.last_name?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-sm">{comment.user?.first_name} {comment.user?.last_name}</div>
                <div className="text-gray-700 text-sm">{comment.content}</div>
                <div className="text-gray-500 text-xs">{new Date(comment.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center p-2 text-gray-500 text-sm">
          Seja o primeiro a comentar!
        </div>
      )}
    </div>
  );
};

export default PostCommentSection;
