
import React, { useState, useEffect } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash, Plus, Calendar, Clock, AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  category?: string;
  priority?: "low" | "medium" | "high";
}

const TodoList = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoText, setNewTodoText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  
  // Fetch todos on component mount if user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchTodos();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);
  
  const fetchTodos = async () => {
    try {
      setIsLoading(true);
      
      // For now we'll use local storage as a temporary solution
      // This will be replaced with Supabase database calls later
      const storedTodos = localStorage.getItem(`todos-${user?.id}`);
      if (storedTodos) {
        // Parse the stored todos and convert date strings back to Date objects
        const parsedTodos = JSON.parse(storedTodos).map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt)
        }));
        setTodos(parsedTodos);
      }
    } catch (error) {
      console.error("Error fetching todos:", error);
      toast.error("Failed to load your tasks");
    } finally {
      setIsLoading(false);
    }
  };
  
  const saveTodos = (updatedTodos: Todo[]) => {
    try {
      if (user) {
        // Save to local storage for now
        localStorage.setItem(`todos-${user.id}`, JSON.stringify(updatedTodos));
      }
    } catch (error) {
      console.error("Error saving todos:", error);
    }
  };

  const addTodo = () => {
    if (!newTodoText.trim()) return;
    
    const newTodo: Todo = {
      id: Date.now().toString(),
      text: newTodoText,
      completed: false,
      createdAt: new Date(),
      priority: "medium",
    };
    
    const updatedTodos = [...todos, newTodo];
    setTodos(updatedTodos);
    saveTodos(updatedTodos);
    setNewTodoText("");
    toast.success("Task added successfully");
  };

  const toggleTodo = (id: string) => {
    const updatedTodos = todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(updatedTodos);
    saveTodos(updatedTodos);
    
    const completedTodo = updatedTodos.find(todo => todo.id === id && todo.completed);
    if (completedTodo) {
      toast.success("Task completed! 🎉");
    }
  };

  const deleteTodo = (id: string) => {
    const updatedTodos = todos.filter(todo => todo.id !== id);
    setTodos(updatedTodos);
    saveTodos(updatedTodos);
    toast.info("Task deleted");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTodo();
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-amber-500";
      case "low":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <PageLayout>
      <div className="container mx-auto py-8 px-4 max-w-3xl">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Volunteer Task List</CardTitle>
          </CardHeader>
          <CardContent>
            {!isAuthenticated ? (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
                <p className="text-lg font-medium mb-2">You need to sign in first</p>
                <p className="mb-4">Sign in to create and track your volunteering tasks.</p>
                <Button
                  variant="default"
                  className="bg-seekup-blue hover:bg-seekup-blue/90"
                  onClick={() => window.location.href = '/login'}
                >
                  Sign In
                </Button>
              </div>
            ) : (
              <>
                <div className="flex gap-2 mb-6">
                  <Input
                    placeholder="Add a new task..."
                    value={newTodoText}
                    onChange={(e) => setNewTodoText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button 
                    onClick={addTodo} 
                    className="flex items-center gap-1 bg-seekup-blue hover:bg-seekup-blue/90"
                    disabled={isLoading}
                  >
                    <Plus size={18} /> Add
                  </Button>
                </div>
                
                {isLoading ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Loading your tasks...</p>
                  </div>
                ) : todos.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No tasks yet. Add your first volunteering task above!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-500 mb-2 px-3">
                      <span>Task Description</span>
                      <span>Date Added</span>
                    </div>
                    {todos.map((todo) => (
                      <div
                        key={todo.id}
                        className={`flex items-center justify-between p-3 rounded-md border ${
                          todo.completed ? "bg-gray-50" : "bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={todo.completed}
                            onCheckedChange={() => toggleTodo(todo.id)}
                            id={`todo-${todo.id}`}
                          />
                          <div>
                            <Label
                              htmlFor={`todo-${todo.id}`}
                              className={`${
                                todo.completed ? "line-through text-gray-500" : ""
                              }`}
                            >
                              {todo.text}
                            </Label>
                            {todo.priority && (
                              <div className="flex items-center gap-1 mt-1">
                                <Badge 
                                  variant="outline"
                                  className={`text-xs ${getPriorityColor(todo.priority)}`}
                                >
                                  {todo.priority} priority
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(todo.createdAt)}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                            onClick={() => deleteTodo(todo.id)}
                          >
                            <Trash size={16} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default TodoList;
