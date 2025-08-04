import React, {createContext, useEffect } from "react";

export interface Todo {
  id: number;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
}
export type TodoContextType = {
  todos: Todo[];
  saveTodo: (todo: Omit<Todo, 'id' | 'completed'>) => void;
  isFormOpen: boolean;
  setIsFormOpen: (open: boolean) => void;
  selectedTodo: Todo | null
  setSelectedTodo: (todo: Todo | null) => void;
  isDetailOpen: boolean
  setIsDetailOpen: (open: boolean) => void
  updateTodo: (todo: Todo) => void;
  deleteTodo: (id: number) => void;
  toggleCompleted: (id: number) => void;
};
//create context 
export const TodoContext = createContext<TodoContextType | undefined>(undefined);

// create the provider
const TodoProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [todos, setTodos] = React.useState<Todo[]>(() => {
    const saved = localStorage.getItem("todoData");
    return saved ? JSON.parse(saved) as Todo[] : [];
  });
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [selectedTodo, setSelectedTodo] = React.useState<Todo | null>(null)
  const [isDetailOpen, setIsDetailOpen] = React.useState(false)



const saveTodo = (todo: Omit<Todo, 'id' | 'completed'>) => {
  const newTodo: Todo = {
    id: Date.now(),
    title: todo.title,
    description: todo.description,
    priority: todo.priority,
    completed: false,
  }
  setTodos((prev) => [...prev, newTodo])
}

const updateTodo = (updated: Todo) => {
  setTodos(prev =>
    prev.map(todo => todo.id === updated.id ? updated : todo)
  )
}

const deleteTodo = (id: number) => {
  setTodos((prev => prev.filter(todo => todo.id !== id)))
}

const toggleCompleted = (id: number) => {
  setTodos(prev =>
    prev.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    )
  )
setSelectedTodo(prev => 
    prev?.id === id ? { ...prev, completed: !prev.completed } : prev
  );
}

useEffect(() => {
  localStorage.setItem("todoData", JSON.stringify(todos))
}, [todos])



return (
    <TodoContext.Provider value={{ todos, saveTodo, isFormOpen, setIsFormOpen, selectedTodo, setSelectedTodo, isDetailOpen, setIsDetailOpen ,updateTodo, deleteTodo, toggleCompleted }}>
      {children}
    </TodoContext.Provider>
  );
};

export default TodoProvider;