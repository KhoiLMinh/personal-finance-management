import CategoriesPage from '../CategoriesPage';

// Same screen and API as the user page; in admin mode the template (system) categories are editable.
export default function AdminCategoriesPage() {
  return <CategoriesPage admin />;
}
