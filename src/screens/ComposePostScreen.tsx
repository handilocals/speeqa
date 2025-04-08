import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { usePosts } from "../contexts/PostContext";
import { useTheme } from "../contexts/ThemeContext";

const MAX_CHARS = 280;

export function ComposePostScreen({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) {
  const [content, setContent] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { fetchPosts, editPost, createPost } = usePosts();
  const { theme } = useTheme();
  const { postId, initialContent, initialImageUrl, quotePost, isQuote } =
    route.params || {};

  useEffect(() => {
    if (postId && initialContent && !isQuote) {
      setContent(initialContent);
      if (initialImageUrl) {
        setImageUri(initialImageUrl);
      }
    }
  }, [postId, initialContent, initialImageUrl, isQuote]);

  const renderQuotedPost = () => {
    if (!quotePost || !isQuote) return null;

    return (
      <View
        style={[
          styles.quotedPost,
          {
            backgroundColor: theme.colors.neutral[100],
            borderColor: theme.colors.neutral[200],
          },
        ]}
      >
        <Text
          style={[styles.quotedUsername, { color: theme.colors.neutral[900] }]}
        >
          @{quotePost.username}
        </Text>
        <Text
          style={[styles.quotedContent, { color: theme.colors.neutral[700] }]}
        >
          {quotePost.content}
        </Text>
        {quotePost.image_url && (
          <Image
            source={{ uri: quotePost.image_url }}
            style={styles.quotedImage}
          />
        )}
      </View>
    );
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handlePost = async () => {
    if (!content.trim()) {
      Alert.alert("Error", "Post cannot be empty");
      return;
    }

    if (content.length > MAX_CHARS) {
      Alert.alert("Error", "Post exceeds character limit");
      return;
    }

    setLoading(true);

    try {
      let imageUrl = imageUri;
      if (imageUri && !imageUri.startsWith("http")) {
        try {
          console.log("Preparing to upload image:", imageUri);

          // Convert image URI to blob
          const response = await fetch(imageUri);
          const blob = await response.blob();

          const fileName = `${user?.id}/${Date.now()}.jpg`;
          console.log("Uploading to path:", fileName);

          // Upload the blob directly
          const { data: fileData, error: uploadError } = await supabase.storage
            .from("post_images")
            .upload(fileName, blob, {
              contentType: "image/jpeg",
              cacheControl: "3600",
            });

          if (uploadError) {
            console.error("Image upload error:", uploadError);
            throw uploadError;
          }

          console.log("Image uploaded successfully:", fileData);

          // Get the public URL for the uploaded image
          const { data: publicUrlData } = await supabase.storage
            .from("post_images")
            .getPublicUrl(fileName);

          console.log("Public URL data:", publicUrlData);
          imageUrl = publicUrlData.publicUrl;
          console.log("Final image URL:", imageUrl);
        } catch (uploadErr) {
          console.error("Error in image upload process:", uploadErr);
          throw new Error(`Image upload failed: ${uploadErr.message}`);
        }
      }

      if (isQuote) {
        await createPost(content, imageUrl, quotePost.id);
      } else if (postId) {
        await editPost(postId, content, imageUrl as string);
      } else {
        await createPost(content, imageUrl);
      }

      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Text>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handlePost}
          style={[styles.headerButton, styles.postButton]}
          disabled={loading || !content.trim()}
        >
          <Text style={styles.postButtonText}>
            {loading ? "Posting..." : postId ? "Update" : "Post"}
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        multiline
        placeholder={isQuote ? "Add a comment..." : "What's happening?"}
        value={content}
        onChangeText={setContent}
        maxLength={MAX_CHARS}
        autoFocus
      />

      {renderQuotedPost()}

      <Text style={styles.charCount}>
        {content.length}/{MAX_CHARS}
      </Text>

      <TouchableOpacity style={styles.mediaButton} onPress={pickImage}>
        <Text>Add Image</Text>
      </TouchableOpacity>

      {imageUri && (
        <View style={styles.imagePreview}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
          <TouchableOpacity
            style={styles.removeImageButton}
            onPress={() => setImageUri(null)}
          >
            <Text style={styles.removeImageText}>Remove Image</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerButton: {
    padding: 8,
  },
  postButton: {
    backgroundColor: "#1DA1F2",
    borderRadius: 20,
    paddingHorizontal: 16,
  },
  postButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  input: {
    flex: 1,
    fontSize: 16,
    textAlignVertical: "top",
  },
  charCount: {
    textAlign: "right",
    color: "#657786",
    marginTop: 8,
  },
  mediaButton: {
    marginTop: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: "#1DA1F2",
    borderRadius: 20,
    alignItems: "center",
  },
  imagePreview: {
    marginTop: 16,
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  removeImageButton: {
    marginTop: 8,
    padding: 8,
  },
  removeImageText: {
    color: "#E0245E",
  },
  quotedPost: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  quotedUsername: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  quotedContent: {
    fontSize: 14,
    marginBottom: 8,
  },
  quotedImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
  },
});
