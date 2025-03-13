
import { useState } from "react";
import type { NewsItem } from "@/services/NewsService";

export const useNewsState = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null);
  const [formData, setFormData] = useState<NewsItem>({
    title: "",
    subtitle: "",
    content: "",
    author: "",
    category: "",
    image_url: "",
    source_url: "",
    publication_date: new Date().toISOString()
  });

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      content: "",
      author: "",
      category: "",
      image_url: "",
      source_url: "",
      publication_date: new Date().toISOString()
    });
    setSelectedNewsId(null);
    setIsEditing(false);
  };

  return {
    formData,
    isEditing,
    selectedNewsId,
    setFormData,
    setIsEditing,
    setSelectedNewsId,
    resetForm
  };
};
