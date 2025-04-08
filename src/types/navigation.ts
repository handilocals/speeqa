import { Politician } from './politician';

export type RootStackParamList = {
  Home: {
    screen: 'CreatePoll' | 'Rating';
  };
  Rating: undefined;
  PoliticianComments: {
    politician: Politician;
  };
  Search: {
    category?: string;
  };
  Profile: {
    userId?: string;
    tab?: 'listings' | 'saved';
  };
  Settings: undefined;
  Support: undefined;
  // Add other screens as needed
}; 