
import { supabase } from "@/integrations/supabase/client";

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  userId: string;
  eventId?: string;
  category?: string;
  priority?: "low" | "medium" | "high";
  dueDate?: Date;
  hours?: number;
}

/**
 * Service to handle all task-related operations
 * Currently using local storage but prepared for Supabase integration
 */
export class TaskService {
  /**
   * Get all tasks for a user
   */
  static async getUserTasks(userId: string): Promise<Task[]> {
    try {
      const storedTasks = localStorage.getItem(`tasks-${userId}`);
      
      if (storedTasks) {
        // Parse stored tasks and convert date strings back to Date objects
        return JSON.parse(storedTasks).map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined
        }));
      }
      
      return [];
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    }
  }
  
  /**
   * Add a new task
   */
  static async addTask(task: Omit<Task, "id" | "createdAt">): Promise<Task> {
    try {
      const newTask: Task = {
        ...task,
        id: Date.now().toString(),
        createdAt: new Date(),
      };
      
      const existingTasks = await this.getUserTasks(task.userId);
      const updatedTasks = [...existingTasks, newTask];
      
      localStorage.setItem(`tasks-${task.userId}`, JSON.stringify(updatedTasks));
      
      return newTask;
    } catch (error) {
      console.error("Error adding task:", error);
      throw error;
    }
  }
  
  /**
   * Update a task
   */
  static async updateTask(userId: string, taskId: string, updates: Partial<Task>): Promise<Task> {
    try {
      const tasks = await this.getUserTasks(userId);
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      
      if (taskIndex === -1) {
        throw new Error("Task not found");
      }
      
      const updatedTask = { ...tasks[taskIndex], ...updates };
      tasks[taskIndex] = updatedTask;
      
      localStorage.setItem(`tasks-${userId}`, JSON.stringify(tasks));
      
      return updatedTask;
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  }
  
  /**
   * Delete a task
   */
  static async deleteTask(userId: string, taskId: string): Promise<void> {
    try {
      const tasks = await this.getUserTasks(userId);
      const updatedTasks = tasks.filter(t => t.id !== taskId);
      
      localStorage.setItem(`tasks-${userId}`, JSON.stringify(updatedTasks));
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  }
  
  /**
   * Get tasks for a specific event
   */
  static async getEventTasks(userId: string, eventId: string): Promise<Task[]> {
    try {
      const allTasks = await this.getUserTasks(userId);
      return allTasks.filter(task => task.eventId === eventId);
    } catch (error) {
      console.error("Error fetching event tasks:", error);
      throw error;
    }
  }
  
  /**
   * Log volunteer hours for a task
   */
  static async logTaskHours(userId: string, taskId: string, hours: number): Promise<Task> {
    try {
      return this.updateTask(userId, taskId, { hours });
    } catch (error) {
      console.error("Error logging hours for task:", error);
      throw error;
    }
  }
}
