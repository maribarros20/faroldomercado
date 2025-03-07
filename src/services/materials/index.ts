
import MaterialsService from './MaterialsService';
import CategoryService from './CategoryService';
import NavigationService from './NavigationService';
import FormatService from './FormatService';
import ThemeService from './ThemeService';
export * from './types';

// Create a facade that combines all services
const Materials = {
  // Materials
  getMaterials: MaterialsService.getMaterials.bind(MaterialsService),
  getMaterialById: MaterialsService.getMaterialById.bind(MaterialsService),
  getMaterialsByCategory: MaterialsService.getMaterialsByCategory.bind(MaterialsService),
  createMaterial: MaterialsService.createMaterial.bind(MaterialsService),
  updateMaterial: MaterialsService.updateMaterial.bind(MaterialsService),
  deleteMaterial: MaterialsService.deleteMaterial.bind(MaterialsService),
  downloadMaterial: MaterialsService.downloadMaterial.bind(MaterialsService),
  incrementDownloads: MaterialsService.incrementDownloads.bind(MaterialsService),
  
  // Categories
  getMaterialCategories: CategoryService.getMaterialCategories.bind(CategoryService),
  createMaterialCategory: CategoryService.createMaterialCategory.bind(CategoryService),
  deleteMaterialCategory: CategoryService.deleteMaterialCategory.bind(CategoryService),
  
  // Navigations
  getKnowledgeNavigations: NavigationService.getKnowledgeNavigations.bind(NavigationService),
  createKnowledgeNavigation: NavigationService.createKnowledgeNavigation.bind(NavigationService),
  deleteKnowledgeNavigation: NavigationService.deleteKnowledgeNavigation.bind(NavigationService),
  getNavigationNameById: NavigationService.getNavigationNameById.bind(NavigationService),
  
  // Formats
  getMaterialFormats: FormatService.getMaterialFormats.bind(FormatService),
  createMaterialFormat: FormatService.createMaterialFormat.bind(FormatService),
  deleteMaterialFormat: FormatService.deleteMaterialFormat.bind(FormatService),
  getFormatNameById: FormatService.getFormatNameById.bind(FormatService),
  
  // Themes
  getMaterialThemes: ThemeService.getMaterialThemes.bind(ThemeService),
  createMaterialTheme: ThemeService.createMaterialTheme.bind(ThemeService),
  deleteMaterialTheme: ThemeService.deleteMaterialTheme.bind(ThemeService)
};

export default Materials;
