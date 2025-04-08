import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

// Default theme values as fallback
const defaultTheme = {
  background: '#FFFFFF',
  surface: '#F8F8F8',
  text: '#000000',
  textSecondary: '#666666',
  primary: '#000000',
  border: '#EEEEEE',
};

interface MarketplaceFiltersScreenProps {
  route: {
    params: {
      currentState: string;
      currentCity: string;
      onApply: (state: string, city: string) => void;
    };
  };
  navigation: any;
}

// Sample data for states and their major cities
const stateCities: { [key: string]: string[] } = {
  'California': ['Los Angeles', 'San Francisco', 'San Diego', 'Sacramento', 'San Jose'],
  'New York': ['New York City', 'Buffalo', 'Rochester', 'Albany', 'Syracuse'],
  'Texas': ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth'],
  'Florida': ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Tallahassee'],
  'Illinois': ['Chicago', 'Springfield', 'Peoria', 'Rockford', 'Naperville'],
  'Pennsylvania': ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Harrisburg'],
  'Ohio': ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron'],
  'Georgia': ['Atlanta', 'Savannah', 'Augusta', 'Columbus', 'Macon'],
  'North Carolina': ['Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem'],
  'Michigan': ['Detroit', 'Grand Rapids', 'Ann Arbor', 'Lansing', 'Flint'],
  'New Jersey': ['Newark', 'Jersey City', 'Paterson', 'Elizabeth', 'Edison'],
  'Virginia': ['Virginia Beach', 'Norfolk', 'Richmond', 'Arlington', 'Newport News'],
  'Washington': ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue'],
  'Arizona': ['Phoenix', 'Tucson', 'Mesa', 'Chandler', 'Glendale'],
  'Massachusetts': ['Boston', 'Worcester', 'Springfield', 'Cambridge', 'Lowell'],
  'Tennessee': ['Nashville', 'Memphis', 'Knoxville', 'Chattanooga', 'Clarksville'],
  'Indiana': ['Indianapolis', 'Fort Wayne', 'Evansville', 'South Bend', 'Carmel'],
  'Missouri': ['Kansas City', 'St. Louis', 'Springfield', 'Columbia', 'Independence'],
  'Maryland': ['Baltimore', 'Rockville', 'Frederick', 'Gaithersburg', 'Bowie'],
  'Wisconsin': ['Milwaukee', 'Madison', 'Green Bay', 'Kenosha', 'Racine'],
  'Minnesota': ['Minneapolis', 'Saint Paul', 'Rochester', 'Duluth', 'Bloomington'],
  'Colorado': ['Denver', 'Colorado Springs', 'Aurora', 'Fort Collins', 'Lakewood'],
  'Alabama': ['Birmingham', 'Montgomery', 'Mobile', 'Huntsville', 'Tuscaloosa'],
  'South Carolina': ['Columbia', 'Charleston', 'North Charleston', 'Mount Pleasant', 'Rock Hill'],
  'Louisiana': ['New Orleans', 'Baton Rouge', 'Shreveport', 'Lafayette', 'Lake Charles'],
  'Kentucky': ['Louisville', 'Lexington', 'Bowling Green', 'Owensboro', 'Covington'],
  'Oregon': ['Portland', 'Eugene', 'Salem', 'Gresham', 'Hillsboro'],
  'Oklahoma': ['Oklahoma City', 'Tulsa', 'Norman', 'Broken Arrow', 'Lawton'],
  'Connecticut': ['Bridgeport', 'New Haven', 'Hartford', 'Stamford', 'Waterbury'],
  'Iowa': ['Des Moines', 'Cedar Rapids', 'Davenport', 'Sioux City', 'Iowa City'],
  'Utah': ['Salt Lake City', 'West Valley City', 'Provo', 'West Jordan', 'Orem'],
  'Nevada': ['Las Vegas', 'Henderson', 'Reno', 'North Las Vegas', 'Sparks'],
  'Arkansas': ['Little Rock', 'Fort Smith', 'Fayetteville', 'Springdale', 'Jonesboro'],
  'Mississippi': ['Jackson', 'Gulfport', 'Southaven', 'Hattiesburg', 'Biloxi'],
  'Kansas': ['Wichita', 'Overland Park', 'Kansas City', 'Topeka', 'Olathe'],
  'New Mexico': ['Albuquerque', 'Las Cruces', 'Rio Rancho', 'Santa Fe', 'Roswell'],
  'Nebraska': ['Omaha', 'Lincoln', 'Bellevue', 'Grand Island', 'Kearney'],
  'West Virginia': ['Charleston', 'Huntington', 'Morgantown', 'Parkersburg', 'Wheeling'],
  'Idaho': ['Boise', 'Meridian', 'Nampa', 'Idaho Falls', 'Pocatello'],
  'Hawaii': ['Honolulu', 'East Honolulu', 'Pearl City', 'Hilo', 'Kailua'],
  'New Hampshire': ['Manchester', 'Nashua', 'Concord', 'Dover', 'Rochester'],
  'Maine': ['Portland', 'Lewiston', 'Bangor', 'South Portland', 'Auburn'],
  'Rhode Island': ['Providence', 'Warwick', 'Cranston', 'Pawtucket', 'East Providence'],
  'Montana': ['Billings', 'Missoula', 'Great Falls', 'Bozeman', 'Butte'],
  'Delaware': ['Wilmington', 'Dover', 'Newark', 'Middletown', 'Smyrna'],
  'South Dakota': ['Sioux Falls', 'Rapid City', 'Aberdeen', 'Brookings', 'Watertown'],
  'North Dakota': ['Fargo', 'Bismarck', 'Grand Forks', 'Minot', 'West Fargo'],
  'Alaska': ['Anchorage', 'Fairbanks', 'Juneau', 'Sitka', 'Ketchikan'],
  'Vermont': ['Burlington', 'South Burlington', 'Rutland', 'Barre', 'Montpelier'],
  'Wyoming': ['Cheyenne', 'Casper', 'Laramie', 'Gillette', 'Rock Springs']
};

export function MarketplaceFiltersScreen({ route, navigation }: MarketplaceFiltersScreenProps) {
  const themeContext = useTheme();
  const theme = themeContext?.theme || defaultTheme;
  const { currentState, currentCity, onApply } = route.params;
  const [selectedState, setSelectedState] = useState(currentState);
  const [selectedCity, setSelectedCity] = useState(currentCity);

  const states = Object.keys(stateCities);

  const handleApply = () => {
    onApply(selectedState, selectedCity);
    navigation.goBack();
  };

  const handleClear = () => {
    setSelectedState('');
    setSelectedCity('');
    onApply('', '');
    navigation.goBack();
  };

  const handleStateSelect = (state: string) => {
    setSelectedState(state);
    setSelectedCity('');
  };

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.neutral[50] }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.neutral[200] }]}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color={theme.colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.neutral[900] }]}>Filter by Location</Text>
        <TouchableOpacity
          style={[styles.clearButton, { backgroundColor: theme.colors.neutral[100] }]}
          onPress={handleClear}
        >
          <Text style={[styles.clearButtonText, { color: theme.colors.neutral[900] }]}>Clear</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <ScrollView style={styles.statesList}>
          {states.map((state) => (
            <TouchableOpacity
              key={state}
              style={[
                styles.stateItem,
                { 
                  backgroundColor: state === selectedState ? theme.colors.primary[500] : theme.colors.neutral[100],
                  borderBottomColor: theme.colors.neutral[200]
                }
              ]}
              onPress={() => handleStateSelect(state)}
            >
              <Text
                style={[
                  styles.stateText,
                  { color: state === selectedState ? theme.colors.neutral[50] : theme.colors.neutral[900] }
                ]}
              >
                {state}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {selectedState && (
          <ScrollView style={styles.citiesList}>
            {stateCities[selectedState].map((city) => (
              <TouchableOpacity
                key={city}
                style={[
                  styles.cityItem,
                  { 
                    backgroundColor: city === selectedCity ? theme.colors.primary[500] : theme.colors.neutral[100],
                    borderBottomColor: theme.colors.neutral[200]
                  }
                ]}
                onPress={() => handleCitySelect(city)}
              >
                <Text
                  style={[
                    styles.cityText,
                    { color: city === selectedCity ? theme.colors.neutral[50] : theme.colors.neutral[900] }
                  ]}
                >
                  {city}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <View style={[styles.footer, { borderTopColor: theme.colors.neutral[200] }]}>
        <TouchableOpacity
          style={[styles.applyButton, { backgroundColor: theme.colors.primary[500] }]}
          onPress={handleApply}
        >
          <Text style={[styles.applyButtonText, { color: theme.colors.neutral[50] }]}>
            Apply Filter
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  clearButtonText: {
    fontSize: 14,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  statesList: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#EEEEEE',
  },
  citiesList: {
    flex: 1,
  },
  stateItem: {
    padding: 16,
    borderBottomWidth: 1,
  },
  cityItem: {
    padding: 16,
    borderBottomWidth: 1,
  },
  stateText: {
    fontSize: 16,
  },
  cityText: {
    fontSize: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  applyButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 