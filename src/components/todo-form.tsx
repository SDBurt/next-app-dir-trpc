"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod";

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { Checkbox } from "./ui/checkbox";
import { serverClient } from "@/app/_trpc/server";
import { trpc } from "@/app/_trpc/client";
import { Card, CardContent } from "./ui/card";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  content: z.string().default(""),
})

type FormSchemaValue = z.infer<typeof formSchema>

export function TodoForm({
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
  const removeTodo = trpc.removeTodo.useMutation({
    onSettled: () => {
      getTodos.refetch();
    }
  });

  async function checkboxClickedHandler(id: number, done: string | boolean) {
    await setTodoDone.mutate({
      id,
      done: done ? 1 : 0
    })
  }

  async function deleteClickedHandler(id: number) {
    await removeTodo.mutate(id)
  }

  const form = useForm<FormSchemaValue>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  })

 
  function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.content.length) {
      addTodo.mutate(values.content)
      form.reset()
    }
  }

  const data = getTodos.data.map(todo => ({...todo, done: todo.done ? true : false}))

  console.log(data)

  return (
    <div className="py-12">
      <div className="flex flex-col space-y-2">
        <Card className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Input placeholder="todo content" {...field} />
                      </FormControl>
                      <FormDescription>
                        Describe your task in a few words.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <Button type="submit">Submit</Button>
            </form>
          </Form>
          
        </Card>
        {
          data && data.map(todo => {
            return (
              <Card key={todo.id} className="p-6">
                <CardContent className="p-0 flex flex-row justify-between">
                  <div className="flex flex-row items-center justify-center space-x-4">
                    <Checkbox checked={todo.done} onCheckedChange={async(checked) => await checkboxClickedHandler(todo.id, checked)}/>
                    <h2 className={cn("font-semibold tracking-tight text-lg", todo.done ? "line-through" : "")}>{todo.content}</h2>
                  </div>
                    <Button onClick={async() => await deleteClickedHandler(todo.id)} variant="destructive" size="icon">X</Button>
                </CardContent>
              </Card>
            )
          })
        }
      
        
      </div>
    </div>
  )

}

