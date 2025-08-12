import React, { createContext, useContext, useReducer, useEffect } from 'react';

interface VerificationResult {
  verdict: string;
  confidence: number;
  explanation: string;
  citations?: Citation[];
  language?: string;
  model?: string;
  processingTime?: string;
}

interface Citation {
  title: string;
  source: string;
  url: string;
  publishedAt?: string;
  summary?: string;
}

interface Verification {
  id: string;
  input: string;
  result: VerificationResult;
  timestamp: string;
}

interface VerificationState {
  verifications: Verification[];
}

type VerificationAction = 
  | { type: 'ADD_VERIFICATION'; payload: Verification }
  | { type: 'REMOVE_VERIFICATION'; payload: string }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'LOAD_FROM_STORAGE'; payload: Verification[] };

const VerificationContext = createContext<{
  verifications: Verification[];
  addVerification: (verification: Verification) => void;
  removeVerification: (id: string) => void;
  getVerification: (id: string) => Verification | undefined;
  clearHistory: () => void;
} | undefined>(undefined);

const verificationReducer = (state: VerificationState, action: VerificationAction): VerificationState => {
  switch (action.type) {
    case 'ADD_VERIFICATION':
      return {
        ...state,
        verifications: [action.payload, ...state.verifications]
      };
    case 'REMOVE_VERIFICATION':
      return {
        ...state,
        verifications: state.verifications.filter(v => v.id !== action.payload)
      };
    case 'CLEAR_HISTORY':
      return {
        ...state,
        verifications: []
      };
    case 'LOAD_FROM_STORAGE':
      return {
        ...state,
        verifications: action.payload
      };
    default:
      return state;
  }
};

export const VerificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(verificationReducer, { verifications: [] });

  useEffect(() => {
    // Load from localStorage on mount
    try {
      const stored = localStorage.getItem('healthcheck-verifications');
      if (stored) {
        const verifications = JSON.parse(stored);
        dispatch({ type: 'LOAD_FROM_STORAGE', payload: verifications });
      }
    } catch (error) {
      console.error('Failed to load verifications from localStorage:', error);
    }
  }, []);

  useEffect(() => {
    // Save to localStorage whenever verifications change
    try {
      localStorage.setItem('healthcheck-verifications', JSON.stringify(state.verifications));
    } catch (error) {
      console.error('Failed to save verifications to localStorage:', error);
    }
  }, [state.verifications]);

  const addVerification = (verification: Verification) => {
    dispatch({ type: 'ADD_VERIFICATION', payload: verification });
  };

  const removeVerification = (id: string) => {
    dispatch({ type: 'REMOVE_VERIFICATION', payload: id });
  };

  const getVerification = (id: string) => {
    return state.verifications.find(v => v.id === id);
  };

  const clearHistory = () => {
    dispatch({ type: 'CLEAR_HISTORY' });
  };

  return (
    <VerificationContext.Provider value={{
      verifications: state.verifications,
      addVerification,
      removeVerification,
      getVerification,
      clearHistory
    }}>
      {children}
    </VerificationContext.Provider>
  );
};

export const useVerification = () => {
  const context = useContext(VerificationContext);
  if (context === undefined) {
    throw new Error('useVerification must be used within a VerificationProvider');
  }
  return context;
};