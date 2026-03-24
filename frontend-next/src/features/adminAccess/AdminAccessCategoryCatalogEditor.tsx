import {
  AdminEmptyBlock,
  AdminInsetBlock,
  AdminToggleField
} from "@/src/components/admin/AdminPrimitives";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import type {
  AdminNormalizedCategoryCatalogItem,
  AdminNormalizedCategoryCatalogSubcategory
} from "@/src/lib/admin/adminAccountSettingsModel";

export function CategoryCatalogEditor({
  categories,
  onAddCategory,
  onUpdateCategory,
  onRemoveCategory,
  onMoveCategory,
  onAddSubcategory,
  onUpdateSubcategory,
  onRemoveSubcategory,
  onMoveSubcategory
}: {
  categories: AdminNormalizedCategoryCatalogItem[];
  onAddCategory: () => void;
  onUpdateCategory: (categoryIndex: number, patch: Partial<AdminNormalizedCategoryCatalogItem>) => void;
  onRemoveCategory: (categoryIndex: number) => void;
  onMoveCategory: (categoryIndex: number, direction: -1 | 1) => void;
  onAddSubcategory: (categoryIndex: number) => void;
  onUpdateSubcategory: (
    categoryIndex: number,
    subcategoryIndex: number,
    patch: Partial<AdminNormalizedCategoryCatalogSubcategory>
  ) => void;
  onRemoveSubcategory: (categoryIndex: number, subcategoryIndex: number) => void;
  onMoveSubcategory: (categoryIndex: number, subcategoryIndex: number, direction: -1 | 1) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="text-sm font-semibold text-[color:var(--ui-text-primary)]">Category Catalog</div>
        <p className="text-sm text-[color:var(--ui-text-secondary)]">
          Manage backend category and subcategory definitions used by admin ingestion and public marketplace navigation.
        </p>
      </div>

      <div className="space-y-4">
        {categories.map((category, categoryIndex) => (
          <AdminInsetBlock key={`${category.slug || "category"}-${categoryIndex}`} className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-semibold text-[color:var(--ui-text-primary)]">Category {categoryIndex + 1}</div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => onMoveCategory(categoryIndex, -1)} disabled={categoryIndex === 0}>
                  Move Up
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onMoveCategory(categoryIndex, 1)}
                  disabled={categoryIndex === categories.length - 1}
                >
                  Move Down
                </Button>
                <Button size="sm" variant="outline" onClick={() => onRemoveCategory(categoryIndex)}>
                  Remove
                </Button>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-2 text-sm text-[color:var(--ui-text-secondary)]">
                <span className="font-medium text-[color:var(--ui-text-primary)]">Name</span>
                <Input value={category.name} onChange={(event) => onUpdateCategory(categoryIndex, { name: event.target.value })} />
              </label>
              <label className="space-y-2 text-sm text-[color:var(--ui-text-secondary)]">
                <span className="font-medium text-[color:var(--ui-text-primary)]">Slug</span>
                <Input value={category.slug} onChange={(event) => onUpdateCategory(categoryIndex, { slug: event.target.value })} />
              </label>
            </div>

            <label className="space-y-2 text-sm text-[color:var(--ui-text-secondary)]">
              <span className="font-medium text-[color:var(--ui-text-primary)]">Description</span>
              <Input
                value={category.description}
                onChange={(event) => onUpdateCategory(categoryIndex, { description: event.target.value })}
              />
            </label>

            <AdminToggleField
              ariaLabel={`Enable category ${categoryIndex + 1}`}
              label="Enabled"
              checked={category.enabled}
              onChange={(checked) => onUpdateCategory(categoryIndex, { enabled: checked })}
            />

            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-semibold text-[color:var(--ui-text-primary)]">Subcategories</div>
                <Button size="sm" variant="outline" onClick={() => onAddSubcategory(categoryIndex)}>
                  Add Subcategory
                </Button>
              </div>

              <div className="space-y-3">
                {category.subcategories.map((subcategory, subcategoryIndex) => (
                  <AdminInsetBlock
                    key={`${subcategory.slug || "subcategory"}-${categoryIndex}-${subcategoryIndex}`}
                    className="space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm font-medium text-[color:var(--ui-text-primary)]">
                        Subcategory {subcategoryIndex + 1}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onMoveSubcategory(categoryIndex, subcategoryIndex, -1)}
                          disabled={subcategoryIndex === 0}
                        >
                          Move Up
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onMoveSubcategory(categoryIndex, subcategoryIndex, 1)}
                          disabled={subcategoryIndex === category.subcategories.length - 1}
                        >
                          Move Down
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onRemoveSubcategory(categoryIndex, subcategoryIndex)}>
                          Remove
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="space-y-2 text-sm text-[color:var(--ui-text-secondary)]">
                        <span className="font-medium text-[color:var(--ui-text-primary)]">Name</span>
                        <Input
                          value={subcategory.name}
                          onChange={(event) =>
                            onUpdateSubcategory(categoryIndex, subcategoryIndex, { name: event.target.value })
                          }
                        />
                      </label>
                      <label className="space-y-2 text-sm text-[color:var(--ui-text-secondary)]">
                        <span className="font-medium text-[color:var(--ui-text-primary)]">Slug</span>
                        <Input
                          value={subcategory.slug}
                          onChange={(event) =>
                            onUpdateSubcategory(categoryIndex, subcategoryIndex, { slug: event.target.value })
                          }
                        />
                      </label>
                    </div>

                    <AdminToggleField
                      ariaLabel={`Enable subcategory ${subcategoryIndex + 1}`}
                      label="Enabled"
                      checked={subcategory.enabled}
                      onChange={(checked) => onUpdateSubcategory(categoryIndex, subcategoryIndex, { enabled: checked })}
                    />
                  </AdminInsetBlock>
                ))}

                {!category.subcategories.length ? <AdminEmptyBlock>No subcategories configured yet.</AdminEmptyBlock> : null}
              </div>
            </div>
          </AdminInsetBlock>
        ))}

        {!categories.length ? <AdminEmptyBlock>No categories configured yet.</AdminEmptyBlock> : null}
      </div>

      <Button variant="outline" onClick={onAddCategory}>
        Add Category
      </Button>
    </div>
  );
}
