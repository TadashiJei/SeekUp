
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash, Plus, Calendar, Clock, AlertCircle, Filter } from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { TaskService, Task } from "@/services/TaskService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TasksPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPriority, setSelectedPriority] = useState<"low" | "medium" | "high">("medium");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Fetch tasks on component mount if user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchTasks();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);
  
  const fetchTasks = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const userTasks = await TaskService.getUserTasks(user.id);
      setTasks(userTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to load your tasks");
    } finally {
      setIsLoading(false);
    }
  };

  const addTask = async () => {
    if (!user) return;
    if (!newTaskText.trim()) return;
    
    try {
      const newTask = await TaskService.addTask({
        text: newTaskText,
        completed: false,
        userId: user.id,
        priority: selectedPriority
      });
      
      setTasks([...tasks, newTask]);
      setNewTaskText("");
      toast.success("Task added successfully");
    } catch (error) {
      console.error("Error adding task:", error);
      toast.error("Failed to add task");
    }
  };

  const toggleTask = async (taskId: string) => {
    if (!user) return;
    
    try {
      const taskToUpdate = tasks.find(task => task.id === taskId);
      if (!taskToUpdate) return;
      
      const updatedTask = await TaskService.updateTask(
        user.id,
        taskId,
        { completed: !taskToUpdate.completed }
      );
      
      setTasks(tasks.map(task => 
        task.id === taskId ? updatedTask : task
      ));
      
      if (updatedTask.completed) {
        toast.success("Task completed! 🎉");
      }
    } catch (error) {
      console.error("Error toggling task:", error);
      toast.error("Failed to update task");
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;
    
    try {
      await TaskService.deleteTask(user.id, taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
      toast.info("Task deleted");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTask();
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
        return "text-red-500 border-red-200";
      case "medium":
        return "text-amber-500 border-amber-200";
      case "low":
        return "text-green-500 border-green-200";
      default:
        return "text-gray-500";
    }
  };

  // Filter tasks based on selected filters
  const filteredTasks = tasks.filter(task => {
    const matchesPriority = filterPriority === "all" || task.priority === filterPriority;
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "completed" && task.completed) ||
                         (filterStatus === "active" && !task.completed);
    
    return matchesPriority && matchesStatus;
  });

  return (
    <PageLayout>
      <div className="container mx-auto py-8 px-4 max-w-3xl">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Volunteer Tasks</CardTitle>
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
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-4 mb-6">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a new task..."
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="flex-1"
                      disabled={isLoading}
                    />
                    <Select
                      value={selectedPriority}
                      onValueChange={(value) => setSelectedPriority(value as "low" | "medium" | "high")}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={addTask} 
                      className="flex items-center gap-1 bg-seekup-blue hover:bg-seekup-blue/90"
                      disabled={isLoading}
                    >
                      <Plus size={18} /> Add
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 justify-between">
                    <div className="flex items-center">
                      <Filter size={16} className="mr-2 text-gray-500" />
                      <span className="text-sm text-gray-500 mr-2">Filter:</span>
                      <div className="flex gap-2">
                        <Select
                          value={filterPriority}
                          onValueChange={setFilterPriority}
                        >
                          <SelectTrigger className="w-[130px] h-8 text-xs">
                            <SelectValue placeholder="Priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Priorities</SelectItem>
                            <SelectItem value="low">Low Priority</SelectItem>
                            <SelectItem value="medium">Medium Priority</SelectItem>
                            <SelectItem value="high">High Priority</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Select
                          value={filterStatus}
                          onValueChange={setFilterStatus}
                        >
                          <SelectTrigger className="w-[130px] h-8 text-xs">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      {tasks.filter(t => t.completed).length}/{tasks.length} completed
                    </div>
                  </div>
                </div>
                
                {isLoading ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Loading your tasks...</p>
                  </div>
                ) : filteredTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No tasks match your filters. Try changing your filter options or add a new task.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-500 mb-2 px-3">
                      <span>Task Description</span>
                      <span>Date Added</span>
                    </div>
                    {filteredTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`flex items-center justify-between p-3 rounded-md border ${
                          task.completed ? "bg-gray-50" : "bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={() => toggleTask(task.id)}
                            id={`task-${task.id}`}
                          />
                          <div>
                            <Label
                              htmlFor={`task-${task.id}`}
                              className={`${
                                task.completed ? "line-through text-gray-500" : ""
                              }`}
                            >
                              {task.text}
                            </Label>
                            {task.priority && (
                              <div className="flex items-center gap-1 mt-1">
                                <Badge 
                                  variant="outline"
                                  className={`text-xs ${getPriorityColor(task.priority)}`}
                                >
                                  {task.priority} priority
                                </Badge>
                                {task.eventId && (
                                  <Badge variant="outline" className="text-xs text-blue-500 border-blue-200">
                                    event
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(task.createdAt)}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                            onClick={() => deleteTask(task.id)}
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

export default TasksPage;
