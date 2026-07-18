import combineContext from '@/utils/combineContext';

import { AuthContextProvider } from './AuthContext';
import { ThemeContextProvider } from './ThemeContext';

export const AppContextProvider = combineContext(
    ThemeContextProvider,
    AuthContextProvider,
    // UserContextProvider
);