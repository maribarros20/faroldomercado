
import React from 'react';
import { Post, Profile } from "@/types/community";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MoreHorizontal, Heart, MessageSquare, HeartOff } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PostCommentSection from './PostCommentSection';

interface PostItemProps {
  post: Post;
  currentUser: Profile | null;
  activeCommentPostId: string | null;
  onToggleComments: (postId: string) => void;
  onLike: (postId: string) => void;
  onAddComment: (postId: string, content: string) => void;
}

const PostItem: React.FC<PostItemProps> = ({
  post,
  currentUser,
  activeCommentPostId,
  onToggleComments,
  onLike,
  onAddComment
}) => {
  const isCommentsOpen = activeCommentPostId === post.id;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={post.user?.photo || ""} alt={`${post.user?.first_name} ${post.user?.last_name}`} />
            <AvatarFallback>{post.user?.first_name?.[0]}{post.user?.last_name?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold">{post.user?.first_name} {post.user?.last_name}</div>
            <div className="text-gray-500 text-sm">{new Date(post.created_at).toLocaleDateString()}</div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Editar</DropdownMenuItem>
            <DropdownMenuItem>Deletar</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <h2 className="text-xl font-bold mt-2">{post.title}</h2>
      <p className="text-gray-700 mt-1">{post.content}</p>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => onLike(post.id)}>
            {post.user_has_liked ? (
              <Heart className="h-5 w-5 text-red-500" />
            ) : (
              <HeartOff className="h-5 w-5" />
            )}
            <span className="ml-1">{post.likes_count}</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onToggleComments(post.id)}>
            <MessageSquare className="h-5 w-5" />
            <span className="ml-1">{post.comments_count}</span>
          </Button>
        </div>
      </div>

      {/* Comments Section */}
      {isCommentsOpen && (
        <PostCommentSection
          postId={post.id}
          comments={post.comments}
          commentsCount={post.comments_count}
          user={currentUser}
          onAddComment={onAddComment}
        />
      )}
    </div>
  );
};

export default PostItem;
