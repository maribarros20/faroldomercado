
import React from "react";
import { NewsManagerHeader } from "./NewsManagerHeader";
import { NewsForm } from "./NewsForm";
import { NewsStats } from "./NewsStats";
import { NewsList } from "./NewsList";
import { useNewsManager } from "./hooks/useNewsManager";

const AdminNewsManager = () => {
  const {
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
  } = useNewsManager();

  const categoryNewsCount = getCategoryNewsCount();

  return (
    <div className="space-y-6">
      <NewsManagerHeader 
        handleCreate={handleCreate}
        handleGenerateMarketSummary={handleGenerateMarketSummary}
        refetch={refetch}
      />

      <NewsStats 
        newsCount={newsList?.length || 0} 
        categoryNewsCount={categoryNewsCount} 
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <NewsForm
            formData={formData}
            isEditing={isEditing}
            handleChange={handleChange}
            handleCategoryChange={handleCategoryChange}
            handleSubmit={handleSubmit}
            resetForm={resetForm}
            isPending={createNewsMutation.isPending || updateNewsMutation.isPending}
          />
        </div>

        <div className="md:col-span-1">
          <NewsList
            newsList={newsList}
            isLoading={isLoading}
            onEdit={loadNewsForEdit}
            onDelete={(id) => id && deleteNewsMutation.mutate(id)}
            refetch={refetch}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminNewsManager;
