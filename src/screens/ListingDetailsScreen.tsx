import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCollections } from '../contexts/CollectionContext';

const { width } = Dimensions.get('window');

// Define navigation types
type RootStackParamList = {
  Profile: { userId: string };
  Chat: { userId: string; username: string; listingId: string; type: string };
};

type ListingDetailsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Define listing types
interface Location {
  city: string;
  state: string;
}

interface User {
  id: string;
  username: string;
  avatar?: string;
}

interface ListingImage {
  id: string;
  url: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  images: ListingImage[];
  location: Location;
  user: User;
  is_reserved: boolean;
  is_bargainable: boolean;
  created_at: string;
  condition?: string;
  brand?: string;
  model?: string;
  color?: string;
  storage?: string;
}

interface ListingDetailsScreenProps {
  route: {
    params: {
      listing: Listing;
    }
  };
}

export function ListingDetailsScreen({ route }: ListingDetailsScreenProps) {
  const { listing } = route.params;
  const navigation = useNavigation<ListingDetailsScreenNavigationProp>();
  const { theme } = useTheme();
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showCollectionsModal, setShowCollectionsModal] = useState(false);
  const { collections, loadCollections, addToCollection } = useCollections();

  useEffect(() => {
    loadCollections();
  }, []);

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
  };

  const handleAddToCollection = async (collectionId: string) => {
    try {
      await addToCollection(collectionId, undefined, listing.id);
      setShowCollectionsModal(false);
      Alert.alert('Success', 'Item added to collection');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      Alert.alert('Error', errorMessage);
    }
  };

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.colors.neutral[50] }]}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={theme.colors.neutral[900]} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: theme.colors.neutral[900] }]}>
        Details
      </Text>
      <TouchableOpacity style={styles.menuButton}>
        <Ionicons name="ellipsis-horizontal" size={24} color={theme.colors.neutral[900]} />
      </TouchableOpacity>
    </View>
  );

  const renderImageGallery = () => (
    <View style={styles.imageContainer}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          setActiveImageIndex(newIndex);
        }}
      >
        {listing.images?.map((image: ListingImage, index: number) => (
          <Image
            key={image.id || index}
            source={{ uri: image.url }}
            style={styles.mainImage}
            resizeMode="cover"
          />
        ))}
      </ScrollView>
      <View style={styles.imageIndicator}>
        {listing.images?.map((_: ListingImage, index: number) => (
          <View
            key={index}
            style={[
              styles.indicatorDot,
              { backgroundColor: index === activeImageIndex ? theme.colors.primary[500] : 'rgba(255, 255, 255, 0.5)' }
            ]}
          />
        ))}
      </View>
      <View style={styles.imageActions}>
        <TouchableOpacity 
          style={styles.favoriteIconButton} 
          onPress={handleFavoriteToggle}
        >
          <Ionicons 
            name={isFavorite ? "heart" : "heart-outline"} 
            size={24} 
            color={isFavorite ? 'red' : 'white'} 
          />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.collectionIconButton} 
          onPress={() => setShowCollectionsModal(true)}
        >
          <Ionicons 
            name="bookmark-outline" 
            size={24} 
            color="white" 
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCollectionsModal = () => (
    <Modal
      visible={showCollectionsModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowCollectionsModal(false)}
    >
      <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.neutral[50] }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.neutral[900] }]}>
            Add to Collection
          </Text>

          <FlatList
            data={collections}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.collectionItem, { backgroundColor: theme.colors.neutral[50] }]}
                onPress={() => handleAddToCollection(item.id)}
              >
                <Text style={[styles.collectionName, { color: theme.colors.neutral[900] }]}>
                  {item.name}
                </Text>
                {item.is_private && (
                  <Ionicons name="lock-closed" size={16} color={theme.colors.neutral[500]} />
                )}
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: theme.colors.neutral[500] }]}>
                No collections yet
              </Text>
            }
          />

          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: theme.colors.error[500] }]}
            onPress={() => setShowCollectionsModal(false)}
          >
            <Text style={[styles.buttonText, { color: theme.colors.neutral[50] }]}>
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderPriceAndTitle = () => (
    <View style={styles.detailsContainer}>
      <Text style={[styles.price, { color: theme.colors.neutral[900] }]}>
        {listing.price?.toFixed(0)} €
      </Text>
      <Text style={[styles.title, { color: theme.colors.neutral[900] }]}>
        {listing.title}
      </Text>
      <View style={styles.statusContainer}>
        {listing.is_reserved && (
          <View style={[styles.tagBadge, { backgroundColor: theme.colors.primary[200] }]}>
            <Text style={[styles.tagBadgeText, { color: theme.colors.primary[500] }]}>Reserved</Text>
          </View>
        )}
        {listing.is_bargainable && (
          <View style={[styles.tagBadge, { backgroundColor: theme.colors.primary[200] }]}>
            <Text style={[styles.tagBadgeText, { color: theme.colors.primary[500] }]}>Bargainable</Text>
          </View>
        )}
      </View>
      <View style={styles.deliveryInfo}>
        <Ionicons name="location-outline" size={18} color={theme.colors.neutral[500]} />
        <Text style={[styles.deliveryText, { color: theme.colors.neutral[500] }]}>
          {listing.location?.city}, {listing.location?.state} • Posted {listing.created_at ? new Date(listing.created_at).toLocaleDateString() : 'recently'}
        </Text>
      </View>
    </View>
  );

  const renderSellerInfo = () => (
    <View style={[styles.sellerContainer, { borderColor: theme.colors.neutral[200] }]}>
      <View style={styles.sellerLeft}>
        <Image 
          source={{ uri: listing.user?.avatar || 'https://via.placeholder.com/40' }} 
          style={styles.sellerAvatar} 
        />
        <View>
          <Text style={[styles.sellerName, { color: theme.colors.neutral[900] }]}>
            {listing.user?.username || 'Seller'}
          </Text>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons 
                key={star} 
                name="star" 
                size={16} 
                color="#FFD700" 
              />
            ))}
            <Text style={[styles.ratingText, { color: theme.colors.neutral[900] }]}>
              5.0
            </Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.viewProfileButton, { borderColor: theme.colors.primary[500] }]}
        onPress={() => navigation.navigate('Profile', { userId: listing.user.id })}
      >
        <Text style={[styles.viewProfileText, { color: theme.colors.primary[500] }]}>
          View Profile
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderProductDetails = () => (
    <View style={[styles.sectionContainer, { borderColor: theme.colors.neutral[200] }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.neutral[900] }]}>
        Description
      </Text>
      <Text style={[styles.productDescription, { color: theme.colors.neutral[900] }]}>
        {listing.description || `SAMSUNG GALAXY S25 ULTRA 256GB TITANIUM GRAY SEALED\nDelivered with Samsung invoice from February 2025\n3 year warranty\n\nCompatible with: Apple, iPad, iMac, MacBook, Sony, Oppo, Xiaomi, Garmin, Honor, Huawei, Google Pixel, Oneplus`}
      </Text>
    </View>
  );

  const renderSpecifications = () => (
    <View style={[styles.sectionContainer, { borderColor: theme.colors.neutral[200] }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.neutral[900] }]}>
        Item Details
      </Text>
      <View style={styles.specifications}>
        <View style={[styles.specRow, { borderBottomColor: theme.colors.neutral[200] }]}>
          <Text style={[styles.specLabel, { color: theme.colors.neutral[500] }]}>Condition</Text>
          <Text style={[styles.specValue, { color: theme.colors.neutral[900] }]}>{listing.condition || 'New - Sealed'}</Text>
        </View>
        <View style={[styles.specRow, { borderBottomColor: theme.colors.neutral[200] }]}>
          <Text style={[styles.specLabel, { color: theme.colors.neutral[500] }]}>Brand</Text>
          <Text style={[styles.specValue, { color: theme.colors.neutral[900] }]}>{listing.brand || 'Samsung'}</Text>
        </View>
        <View style={[styles.specRow, { borderBottomColor: theme.colors.neutral[200] }]}>
          <Text style={[styles.specLabel, { color: theme.colors.neutral[500] }]}>Model</Text>
          <Text style={[styles.specValue, { color: theme.colors.neutral[900] }]}>{listing.model || 'Galaxy S25 Ultra'}</Text>
        </View>
        <View style={[styles.specRow, { borderBottomColor: theme.colors.neutral[200] }]}>
          <Text style={[styles.specLabel, { color: theme.colors.neutral[500] }]}>Color</Text>
          <Text style={[styles.specValue, { color: theme.colors.neutral[900] }]}>{listing.color || 'Grey'}</Text>
        </View>
        <View style={styles.specRow}>
          <Text style={[styles.specLabel, { color: theme.colors.neutral[500] }]}>Storage</Text>
          <Text style={[styles.specValue, { color: theme.colors.neutral[900] }]}>{listing.storage || '256 GB'}</Text>
        </View>
      </View>
    </View>
  );

  const renderCategories = () => (
    <View style={[styles.sectionContainer, { borderColor: theme.colors.neutral[200] }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.neutral[900] }]}>
        Category
      </Text>
      <View style={styles.categoryChips}>
        <View style={[styles.categoryChip, { backgroundColor: theme.colors.neutral[50] }]}>
          <Text style={[styles.categoryChipText, { color: theme.colors.neutral[900] }]}>Electronics</Text>
        </View>
        <View style={[styles.categoryChip, { backgroundColor: theme.colors.neutral[50] }]}>
          <Text style={[styles.categoryChipText, { color: theme.colors.neutral[900] }]}>Phones</Text>
        </View>
        <View style={[styles.categoryChip, { backgroundColor: theme.colors.neutral[50] }]}>
          <Text style={[styles.categoryChipText, { color: theme.colors.neutral[900] }]}>Samsung</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.neutral[50] }]}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />
      {renderHeader()}
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderImageGallery()}
        {renderPriceAndTitle()}
        {renderSellerInfo()}
        {renderProductDetails()}
        {renderSpecifications()}
        {renderCategories()}
        <View style={styles.spacer} />
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.colors.neutral[50], borderTopColor: theme.colors.neutral[200] }]}>
        <TouchableOpacity 
          style={[styles.chatButton, { backgroundColor: theme.colors.primary[500] }]}
          onPress={() => navigation.navigate('Chat', { 
            userId: listing.user?.id,
            username: listing.user?.username || '',
            listingId: listing.id,
            type: 'marketplace'
          })}
        >
          <Text style={[styles.chatButtonText, { color: theme.colors.neutral[50] }]}>
            Contact Seller
          </Text>
        </TouchableOpacity>
      </View>
      {renderCollectionsModal()}
    </SafeAreaView>
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
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  menuButton: {
    padding: 4,
  },
  imageContainer: {
    width: '100%',
    height: width * 0.8,
    position: 'relative',
  },
  mainImage: {
    width,
    height: width * 0.8,
  },
  imageIndicator: {
    position: 'absolute',
    bottom: 16,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  favoriteIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageActions: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    flexDirection: 'row',
    gap: 12,
  },
  collectionIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    padding: 16,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryText: {
    fontSize: 14,
    marginLeft: 8,
  },
  sellerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 12,
  },
  sellerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sellerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 14,
    marginLeft: 4,
    fontWeight: '500',
  },
  viewProfileButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  viewProfileText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sectionContainer: {
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  productDescription: {
    fontSize: 14,
    lineHeight: 22,
  },
  specifications: {
  },
  specRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  specLabel: {
    width: 100,
    fontSize: 14,
  },
  specValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  categoryChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryChipText: {
    fontSize: 14,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  chatButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  chatButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  spacer: {
    height: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 8,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  collectionItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  collectionName: {
    fontSize: 16,
  },
  closeButton: {
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 16,
  },
}); 