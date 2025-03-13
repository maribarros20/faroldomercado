
import { useNewsState } from './useNewsState';
import { useNewsCrud } from './useNewsCrud';
import { useNewsUtils } from './useNewsUtils';

export const useNewsManager = () => {
  const {
    formData,
    isEditing,
    selectedNewsId,
    setFormData,
    setIsEditing,
    setSelectedNewsId,
    resetForm
  } = useNewsState();

  const {
    newsList,
    isLoading,
    createNewsMutation,
    updateNewsMutation,
    deleteNewsMutation,
    refetch,
    loadNewsForEdit
  } = useNewsCrud({
    resetForm,
    setFormData,
    setIsEditing,
    setSelectedNewsId
  });

  const {
    handleChange,
    handleCategoryChange,
    handleSubmit,
    handleCreate,
    handleGenerateMarketSummary,
    getCategoryNewsCount
  } = useNewsUtils({
    formData,
    isEditing,
    selectedNewsId,
    newsList,
    setFormData,
    resetForm,
    createNewsMutation,
    updateNewsMutation
  });

  return {
    newsList,
    isLoading,
    formData,
    isEditing,
    selectedNewsId,
    createNewsMutation,
    updateNewsMutation,
    deleteNewsMutation,
    handleChange,
    handleCategoryChange,
    resetForm,
    handleCreate,
    handleSubmit,
    loadNewsForEdit,
    refetch,
    handleGenerateMarketSummary,
    getCategoryNewsCount
  };
};
