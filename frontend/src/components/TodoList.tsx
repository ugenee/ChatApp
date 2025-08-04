import { useContext } from "react"
import { TodoContext } from "@/contexts/TodoContext"
import { Badge } from "@/components/ui/badge"
import { Trash } from 'lucide-react';

export function TodoList() {
  const { todos, setSelectedTodo, setIsDetailOpen, deleteTodo } = useContext(TodoContext)!
  return (
    <div className="space-y-4">
      {todos.length === 0 ? (
        <p>No todos yet</p>
      ) : (
        todos.map((todo) => (
          <div
            key={todo.id}
            onClick={() => {
              setSelectedTodo(todo)
              setIsDetailOpen(true)
            }}
            className="border rounded p-4 bg-gray-200 cursor-pointer hover:bg-gray-100 flex justify-between items-start"
          >
            <div className="space-y-1">
            <h3 className="font-bold text-black">Title: {todo.title}</h3>
            <Badge className= {todo.priority === "low" ? "bg-green-500" : todo.priority === "medium" ? "bg-yellow-500" : "bg-red-500"}><p>{todo.priority}</p></Badge>
            </div>
            <Trash className="text-gray-500 hover:text-red-500" onClick={(e)=> {
              e.stopPropagation()
              deleteTodo(todo.id)
            }}/>
            
          </div>
        ))
      )
      }
    </div>
  )
}
