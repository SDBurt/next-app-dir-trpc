import TodoList from "@/components/todo-list";
import { serverClient } from "./_trpc/server";
import { TodoForm } from "@/components/todo-form";

export default async function Home() {
  
  const todos = await serverClient.getTodos();
  


  return (
    <main>
      <TodoForm initialTodos={todos}/>
    </main>
  )
}
