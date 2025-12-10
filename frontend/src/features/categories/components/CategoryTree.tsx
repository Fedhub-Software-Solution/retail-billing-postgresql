import { useState } from 'react'
import { ChevronRight, ChevronDown, Folder, FolderOpen, Edit, Trash2, Grid3x3 } from 'lucide-react'
import { Category } from '../../../store/api/categoryApi'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { cn } from '../../../lib/utils'

interface CategoryTreeProps {
  categories: Category[]
  onEdit?: (category: Category) => void
  onDelete?: (category: Category) => void
  selectedId?: number
  onSelect?: (category: Category) => void
}

const CategoryTreeItem = ({
  category,
  level = 0,
  onEdit,
  onDelete,
  selectedId,
  onSelect,
}: {
  category: Category
  level?: number
  onEdit?: (category: Category) => void
  onDelete?: (category: Category) => void
  selectedId?: number
  onSelect?: (category: Category) => void
}) => {
  const [open, setOpen] = useState(false)
  const hasChildren = category.children && category.children.length > 0
  const isSelected = selectedId === category.id

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2 px-4 py-3 rounded-lg transition-colors group',
          isSelected
            ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200'
            : 'hover:bg-gray-50'
        )}
        style={{ paddingLeft: `${level * 1.5 + 1}rem` }}
      >
        {/* Expand/Collapse Button */}
        {hasChildren ? (
          <button
            onClick={() => setOpen(!open)}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 transition-colors"
          >
            {open ? (
              <ChevronDown className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            )}
          </button>
        ) : (
          <div className="w-6" />
        )}

        {/* Category Icon */}
        <div
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
            isSelected
              ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
              : 'bg-gradient-to-br from-gray-100 to-gray-200'
          )}
        >
          {open ? (
            <FolderOpen
              className={cn('w-4 h-4', isSelected ? 'text-white' : 'text-gray-600')}
            />
          ) : (
            <Folder className={cn('w-4 h-4', isSelected ? 'text-white' : 'text-gray-600')} />
          )}
        </div>

        {/* Category Info */}
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => {
            if (onSelect) onSelect(category)
          }}
        >
          <div className="flex items-center gap-2">
            <p className={cn('font-medium', isSelected ? 'text-purple-700' : 'text-gray-900')}>
              {category.name}
            </p>
            {!category.isActive && (
              <Badge variant="secondary" className="text-xs">
                Inactive
              </Badge>
            )}
          </div>
          {category.description && (
            <p className="text-xs text-gray-500 truncate mt-0.5">{category.description}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(category)
              }}
              className="h-8 w-8 p-0"
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(category)
              }}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Children */}
      {hasChildren && open && (
        <div className="ml-4">
          {category.children!.map((child) => (
            <CategoryTreeItem
              key={child.id}
              category={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const CategoryTree = ({
  categories,
  onEdit,
  onDelete,
  selectedId,
  onSelect,
}: CategoryTreeProps) => {
  // Filter to show only top-level categories (no parent)
  const topLevelCategories = categories.filter((cat) => !cat.parentId)

  if (topLevelCategories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-4">
          <Grid3x3 className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 text-lg">No categories found</p>
        <p className="text-gray-400 text-sm mt-1">Get started by adding your first category</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {topLevelCategories.map((category) => (
        <CategoryTreeItem
          key={category.id}
          category={category}
          onEdit={onEdit}
          onDelete={onDelete}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

export default CategoryTree
