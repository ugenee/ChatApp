import { AddTodoForm } from './components/AddTodoForm'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from './components/ui/button'
import { TodoContext } from './contexts/TodoContext'
import { TodoList } from './components/TodoList'
import { useContext } from 'react'
import { EditTodoForm } from './components/EditTodoForm'

export function MainPage() {
  const todoContext = useContext(TodoContext)!
  const {isFormOpen, setIsFormOpen, selectedTodo, setSelectedTodo} = todoContext
  return (
      <main className='py-10 h-screen space-y-5'>
        <h1 className='font-bold text-3xl text-center'>Todo List</h1>
        <div className='max-w-lvh mx-auto bg-gray-300 rounded-md p-5 space-y-6'>
          <TodoList/>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className='absolute top-10 right-10 w-20 h-10' onClick = {() => setSelectedTodo(null)}>
              Create
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] space-y-4">
            <DialogHeader>
              <DialogTitle className='font-bold text-2xl'>{selectedTodo ? "Edit Todo" : "Create New Todo"}</DialogTitle>
              <DialogTitle className='text-gray-500 text-sm'>{selectedTodo ? "Fill in the details below to edit todo item" : "Fill in the details below to create a new todo item"}</DialogTitle>
            </DialogHeader>
            {selectedTodo ? <EditTodoForm /> : <AddTodoForm />}
          </DialogContent>
        </Dialog>
      </main>
  )
}

