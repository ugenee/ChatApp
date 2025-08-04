"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useContext, useEffect } from "react"
import { TodoContext } from "@/contexts/TodoContext"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
const formSchema = z.object({
  title: z.string().min(8, {
    message: "title must be at least 8 characters.",
  }),
  description: z.string().max(30, {
    message: "description can have at most 30 characters.",
  }),
  priority: z.union([z.literal('low'), z.literal('medium'), z.literal('high')]),
})

export function EditTodoForm() {
  const {
    selectedTodo,
    updateTodo,
    setSelectedTodo,
    setIsFormOpen,
    setIsDetailOpen,
  } = useContext(TodoContext)!

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: 
      selectedTodo ? selectedTodo : undefined
  })


  useEffect(() => {
    if (selectedTodo) {
      form.reset({
        title: selectedTodo.title,
        description: selectedTodo.description,
        priority: selectedTodo.priority,
      })
    }
  }, [selectedTodo, form])

  
  function onSubmit(values: z.infer<typeof formSchema>) {
  if (selectedTodo) {
    updateTodo({
      ...values,
      id: selectedTodo.id,
      completed: selectedTodo.completed,
    })
  }
    setIsFormOpen(false)
    setIsDetailOpen(false)
    setSelectedTodo(null)
    form.reset()
  }
  console.log("Current form values:", form.watch())
console.log("Selected todo:", selectedTodo)
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Save Changes</Button>
      </form>
    </Form>
  )
}
