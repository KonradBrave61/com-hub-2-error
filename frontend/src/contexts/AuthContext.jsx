import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setUser({ ...JSON.parse(storedUser), token: storedToken });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      const userWithToken = { ...data.user, token: data.access_token };
      setUser(userWithToken);
      localStorage.setItem('authToken', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return { success: true, user: userWithToken };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const data = await response.json();
      const userWithToken = { ...data.user, token: data.access_token };
      setUser(userWithToken);
      localStorage.setItem('authToken', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return { success: true, user: userWithToken };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error('Profile update failed');
      }

      const updatedUser = await response.json();
      const userWithToken = { ...updatedUser, token: user.token };
      setUser(userWithToken);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return { success: true, user: userWithToken };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: error.message };
    }
  };

  const saveTeam = async (teamData) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify(teamData),
      });

      if (!response.ok) {
        throw new Error('Team save failed');
      }

      const savedTeam = await response.json();
      return { success: true, team: savedTeam };
    } catch (error) {
      console.error('Team save error:', error);
      return { success: false, error: error.message };
    }
  };

  const updateTeam = async (teamId, teamData) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/teams/${teamId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify(teamData),
      });

      if (!response.ok) {
        throw new Error('Team update failed');
      }

      const updatedTeam = await response.json();
      return { success: true, team: updatedTeam };
    } catch (error) {
      console.error('Team update error:', error);
      return { success: false, error: error.message };
    }
  };

  const deleteTeam = async (teamId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/teams/${teamId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Team deletion failed');
      }

      return { success: true };
    } catch (error) {
      console.error('Team deletion error:', error);
      return { success: false, error: error.message };
    }
  };

  const loadTeams = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/teams`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Teams load failed');
      }

      const teams = await response.json();
      return { success: true, teams };
    } catch (error) {
      console.error('Teams load error:', error);
      return { success: false, error: error.message };
    }
  };

  const loadCommunityTeams = async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.formation) params.append('formation', filters.formation);
      if (filters.sort_by) params.append('sort_by', filters.sort_by);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.offset) params.append('offset', filters.offset);

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/community/teams?${params}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Community teams load failed');
      }

      const teams = await response.json();
      return { success: true, teams };
    } catch (error) {
      console.error('Community teams load error:', error);
      return { success: false, error: error.message };
    }
  };

  const likeTeam = async (teamId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/teams/${teamId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Like action failed');
      }

      const result = await response.json();
      return { success: true, liked: result.liked };
    } catch (error) {
      console.error('Like action error:', error);
      return { success: false, error: error.message };
    }
  };

  const commentOnTeam = async (teamId, content) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/teams/${teamId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Comment action failed');
      }

      const result = await response.json();
      return { success: true, comment: result.comment };
    } catch (error) {
      console.error('Comment action error:', error);
      return { success: false, error: error.message };
    }
  };

  const followUser = async (userId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/community/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) {
        throw new Error('Follow action failed');
      }

      const result = await response.json();
      return { success: true, following: result.following };
    } catch (error) {
      console.error('Follow action error:', error);
      return { success: false, error: error.message };
    }
  };

  const loadFeaturedContent = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/community/featured`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Featured content load failed');
      }

      const data = await response.json();
      return { success: true, ...data };
    } catch (error) {
      console.error('Featured content load error:', error);
      return { success: false, error: error.message };
    }
  };

  const loadCommunityStats = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/community/stats`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Community stats load failed');
      }

      const data = await response.json();
      return { success: true, stats: data };
    } catch (error) {
      console.error('Community stats load error:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    saveTeam,
    updateTeam,
    deleteTeam,
    loadTeams,
    loadCommunityTeams,
    likeTeam,
    commentOnTeam,
    followUser,
    loadFeaturedContent,
    loadCommunityStats,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};