"use client";
import { Spacer } from "@nextui-org/react";
import { Comment, Like, User } from "@prisma/client";
import AddPost from "./AddPost";
import Header from "./Header";
import Post from "./Post";

type FeedProps = {
  posts: {
    id: string;
    content: string;
    user: User;
    createdAt: string;
    likes: Like[];
    comments: {
      id: string;
      user: User;
      createdAt: string;
      content: string;
    }[];
    imageUrl?: string; // imageUrl is optional
  }[] | undefined; // Allow posts to be null
};

export default function Feed({ posts }: FeedProps) {
  return (
    <main>
      <div className="container mx-auto px-6 sm:px-8 md:px-16 lg:px-20 max-w-3xl mt-6 items-center">
        <Spacer y={0.5} />
        <Header />
        <AddPost />

        {posts?.length ? (
          posts.map((post) => (
            <Post
              key={post.id}
              id={post.id}
              userId={post.user.id}
              subscriptionStatus={post.user.subscriptionStatus}
              name={post.user.name}
              avatar={post.user.image}
              createdAt={post.createdAt}
              content={post.content}
              imageUrl={post.imageUrl ?? undefined} // imageUrl can be null
              likes={post.likes}
              comments={post.comments}
            />
          ))
        ) : (
          <p>No posts found.</p>
        )}
      </div>
    </main>
  );
}
