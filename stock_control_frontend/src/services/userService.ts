import api from './api';
import type { Paginated } from '@/types/api';

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  isStaff: boolean;
  isSuperuser: boolean;
  permissionsList: string[];
  isMaster: boolean;
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  password2: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  isStaff?: boolean;
  isSuperuser?: boolean;
  permissionsList?: string[];
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  isStaff?: boolean;
  isSuperuser?: boolean;
  permissionsList?: string[];
  password?: string;
  password2?: string;
}

const userService = {
  /**
   * Get all users with pagination
   */
  getUsers: async (page = 1, filters?: { username?: string; email?: string; isActive?: boolean; ordering?: string }): Promise<Paginated<User>> => {
    const params = new URLSearchParams({ page: String(page) });
    
    if (filters?.username) {
      params.append('username', filters.username);
    }
    if (filters?.email) {
      params.append('email', filters.email);
    }
    if (filters?.isActive !== undefined) {
      params.append('isActive', String(filters.isActive));
    }
    if (filters?.ordering) {
      params.append('ordering', filters.ordering);
    }
    
    const url = `/api/v1/users/?${params.toString()}`;
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Get user by ID
   */
  getUserById: async (id: number): Promise<User> => {
    const response = await api.get(`/api/v1/users/${id}/`);
    return response.data;
  },

  /**
   * Get current logged in user
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/api/v1/current-user-info/');
    return response.data;
  },

  /**
   * Create a new user
   */
  createUser: async (userData: CreateUserData): Promise<User> => {
    const response = await api.post('/api/v1/register/', userData);
    return response.data.user;
  },

  /**
   * Update a user
   */
  updateUser: async (id: number, userData: UpdateUserData): Promise<User> => {
    const response = await api.patch(`/api/v1/users/${id}/`, userData);
    return response.data;
  },

  /**
   * Update user permissions
   */
  updatePermissions: async (id: number, permissions: string[]): Promise<User> => {
    return userService.updateUser(id, { permissionsList: permissions });
  },

  /**
   * Delete a user
   */
  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/api/v1/users/${id}/`);
  }
};

export default userService;
