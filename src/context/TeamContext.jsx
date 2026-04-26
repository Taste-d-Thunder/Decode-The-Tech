"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const TeamContext = createContext(null);

export function TeamProvider({ children }) {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedTeam = sessionStorage.getItem('team_session');
    if (savedTeam) {
      try {
        setTeam(JSON.parse(savedTeam));
      } catch (e) {
        sessionStorage.removeItem('team_session');
      }
    }
    setLoading(false);
  }, []);

  const joinTeam = (teamData) => {
    sessionStorage.setItem('team_session', JSON.stringify(teamData));
    setTeam(teamData);
  };

  const leaveTeam = () => {
    sessionStorage.removeItem('team_session');
    setTeam(null);
    router.push('/');
  };

  return (
    <TeamContext.Provider value={{ team, loading, joinTeam, leaveTeam }}>
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
}
