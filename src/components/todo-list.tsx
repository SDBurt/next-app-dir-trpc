"use client"

import { trpc } from "@/app/_trpc/client"
import { serverClient } from "@/app/_trpc/server";
import { useState } from "react";

export default function TodoList({
  initialTodos
}: {
  initialTodos: Awaited<ReturnType<(typeof serverClient)["getTodos"]>>
}) {
  const getTodos = trpc.getTodos.useQuery(undefined, {
    initialData: initialTodos,
    refetchOnMount: false,
    refetchOnReconnect: false
  });
  const addTodo = trpc.addTodo.useMutation({
    onSettled: () => {
      getTodos.refetch();
    }
  });
  const setTodoDone = trpc.setTodoDone.useMutation({
    onSettled: () => {
      getTodos.refetch();
    }
  });

  const [ content, setContent] = useState("")
  return (
  <div>
    <div>{JSON.stringify(getTodos.data, null)}</div>
    <div>
      <label htmlFor="content">Content</label>
      <input
        id="content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="text-slate-900"
        />
        <button onClick={async () => {
          if (content.length) {
            addTodo.mutate(content)
            setContent("")
          }
        }}>Add Todo</button>
    </div>
  </div>
  )
}