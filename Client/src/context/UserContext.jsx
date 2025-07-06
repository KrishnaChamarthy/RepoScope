import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [repos, setRepos] = useState([]); 

  const BASE_API_URL = import.meta.env.VITE_API_URL || '/api';
  console.log('BASE_API_URL:', BASE_API_URL);

  const connectGitHub = () => {
    window.location.href = `${BASE_API_URL}/auth/github`;
  };

  const fetchGitHubUser = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_API_URL}/auth/github/user`, { withCredentials: true });
      setUser(res.data.user);
      setLoading(false);
      return res.data.user;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const fetchGitHubRepos = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_API_URL}/github/repos`, { withCredentials: true });
      setRepos(res.data.repos);
      setLoading(false);
      return res.data.repos;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${BASE_API_URL}/auth/logout`, {}, { withCredentials: true });
    } catch (err) {
      // ignore error, just clear state
    }
    setUser(null);
    setRepos([]);
  };

  const api = axios.create({
    baseURL: BASE_API_URL,
    headers: user?.token ? { Authorization: `Bearer ${user.token}` } : {},
  });

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        repos,
        setRepos,
        logout,
        api,
        connectGitHub,
        fetchGitHubUser,
        fetchGitHubRepos,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);