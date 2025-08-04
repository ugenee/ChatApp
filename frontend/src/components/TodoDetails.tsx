import { useContext } from "react"
import { TodoContext } from "@/contexts/TodoContext"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Checkbox } from "./ui/checkbox"


export function TodoDetails() {
  const { selectedTodo, isDetailOpen, setIsDetailOpen, setIsFormOpen, toggleCompleted } = useContext(TodoContext)!

  return (
    <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
      <DialogContent className="space-y-4">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Todo Details
          </DialogTitle>
          <DialogTitle className="text-gray-500 text-sm">Todo Details for: {selectedTodo?.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 font-bold">
          <div className="flex">
            <span className="w-28">Title:</span>
            <span>{selectedTodo?.title}</span>
          </div>
          <div className="flex">
            <span className="w-28">Description:</span>
            <span>{selectedTodo?.description}</span>
          </div>
          <div className="flex">
            <span className="w-28">Priority:</span>
            <Badge className={selectedTodo?.priority === "low"
              ? "bg-green-500"
              : selectedTodo?.priority === "medium"
              ? "bg-yellow-500"
              : "bg-red-500"}>
              {selectedTodo?.priority}
            </Badge>
          </div>
          <div className="flex items-center"><span className="w-28">Completed:</span>
          <Checkbox id="completed" checked={selectedTodo?.completed} onCheckedChange={() => { if (selectedTodo) toggleCompleted(selectedTodo.id)}}/></div>
        </div>
        <Button onClick={() => {setIsDetailOpen(false), setIsFormOpen(true)}}>Edit</Button>
      </DialogContent>
    </Dialog>
  )
}
