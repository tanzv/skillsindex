import {
  AdminEmptyBlock,
  AdminInsetBlock,
  AdminToggleField
} from "@/src/components/admin/AdminPrimitives";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import type {
  AdminNormalizedPresentationTaxonomyCategory,
  AdminNormalizedPresentationTaxonomySubcategory
} from "@/src/lib/admin/adminAccountSettingsModel";

function joinValues(values: string[]): string {
  return values.join(", ");
}

function parseValues(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function PresentationTaxonomyEditor({
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
  categories: AdminNormalizedPresentationTaxonomyCategory[];
  onAddCategory: () => void;
  onUpdateCategory: (categoryIndex: number, patch: Partial<AdminNormalizedPresentationTaxonomyCategory>) => void;
  onRemoveCategory: (categoryIndex: number) => void;
  onMoveCategory: (categoryIndex: number, direction: -1 | 1) => void;
  onAddSubcategory: (categoryIndex: number) => void;
  onUpdateSubcategory: (
    categoryIndex: number,
    subcategoryIndex: number,
    patch: Partial<AdminNormalizedPresentationTaxonomySubcategory>
  ) => void;
  onRemoveSubcategory: (categoryIndex: number, subcategoryIndex: number) => void;
  onMoveSubcategory: (categoryIndex: number, subcategoryIndex: number, direction: -1 | 1) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="text-sm font-semibold text-[color:var(--ui-text-primary)]">Presentation Taxonomy</div>
        <p className="text-sm text-[color:var(--ui-text-secondary)]">
          Manage the grouped marketplace taxonomy used by public category, ranking, compare, and detail pages.
        </p>
      </div>

      <div className="space-y-4">
        {categories.map((category, categoryIndex) => (
          <AdminInsetBlock key={`${category.slug || "presentation-category"}-${categoryIndex}`} className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-semibold text-[color:var(--ui-text-primary)]">Group {categoryIndex + 1}</div>
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
              ariaLabel={`Enable taxonomy group ${categoryIndex + 1}`}
              label="Enabled"
              checked={category.enabled}
              onChange={(checked) => onUpdateCategory(categoryIndex, { enabled: checked })}
            />

            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-semibold text-[color:var(--ui-text-primary)]">Grouped Subcategories</div>
                <Button size="sm" variant="outline" onClick={() => onAddSubcategory(categoryIndex)}>
                  Add Grouped Subcategory
                </Button>
              </div>

              <div className="space-y-3">
                {category.subcategories.map((subcategory, subcategoryIndex) => (
                  <AdminInsetBlock
                    key={`${subcategory.slug || "presentation-subcategory"}-${categoryIndex}-${subcategoryIndex}`}
                    className="space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm font-medium text-[color:var(--ui-text-primary)]">
                        Grouped Subcategory {subcategoryIndex + 1}
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

                    <label className="space-y-2 text-sm text-[color:var(--ui-text-secondary)]">
                      <span className="font-medium text-[color:var(--ui-text-primary)]">Legacy Categories</span>
                      <Input
                        value={joinValues(subcategory.legacyCategorySlugs)}
                        onChange={(event) =>
                          onUpdateSubcategory(categoryIndex, subcategoryIndex, {
                            legacyCategorySlugs: parseValues(event.target.value)
                          })
                        }
                      />
                    </label>

                    <label className="space-y-2 text-sm text-[color:var(--ui-text-secondary)]">
                      <span className="font-medium text-[color:var(--ui-text-primary)]">Legacy Subcategories</span>
                      <Input
                        value={joinValues(subcategory.legacySubcategorySlugs)}
                        onChange={(event) =>
                          onUpdateSubcategory(categoryIndex, subcategoryIndex, {
                            legacySubcategorySlugs: parseValues(event.target.value)
                          })
                        }
                      />
                    </label>

                    <label className="space-y-2 text-sm text-[color:var(--ui-text-secondary)]">
                      <span className="font-medium text-[color:var(--ui-text-primary)]">Keywords</span>
                      <Input
                        value={joinValues(subcategory.keywords)}
                        onChange={(event) =>
                          onUpdateSubcategory(categoryIndex, subcategoryIndex, {
                            keywords: parseValues(event.target.value)
                          })
                        }
                      />
                    </label>

                    <AdminToggleField
                      ariaLabel={`Enable grouped subcategory ${subcategoryIndex + 1}`}
                      label="Enabled"
                      checked={subcategory.enabled}
                      onChange={(checked) => onUpdateSubcategory(categoryIndex, subcategoryIndex, { enabled: checked })}
                    />
                  </AdminInsetBlock>
                ))}

                {!category.subcategories.length ? <AdminEmptyBlock>No grouped subcategories configured yet.</AdminEmptyBlock> : null}
              </div>
            </div>
          </AdminInsetBlock>
        ))}

        {!categories.length ? <AdminEmptyBlock>No presentation taxonomy configured yet.</AdminEmptyBlock> : null}
      </div>

      <Button variant="outline" onClick={onAddCategory}>
        Add Group
      </Button>
    </div>
  );
}
