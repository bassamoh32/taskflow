import Category from '../models/Category.js';
import Task from '../models/Task.js';

/**
 * Create a new category
 */
export const createCategory = async (req, res) => {
  try {
    const { name, color, description } = req.body;

    // Validate inputs
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    // Check if category with same name already exists for this user
    const existingCategory = await Category.findOne({
      owner: req.user.id,
      name: { $regex: `^${name}$`, $options: 'i' }
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    const category = new Category({
      name,
      color: color || '#3B82F6',
      description: description || '',
      owner: req.user.id
    });

    await category.save();

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * Get all categories for the current user
 */
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ owner: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: categories,
      count: categories.length
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * Get a single category
 */
export const getCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * Update a category
 */
export const updateCategory = async (req, res) => {
  try {
    const { name, color, description } = req.body;

    let category = await Category.findOne({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if new name conflicts with existing category
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({
        owner: req.user.id,
        name: { $regex: `^${name}$`, $options: 'i' },
        _id: { $ne: req.params.id }
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists'
        });
      }
    }

    if (name) category.name = name;
    if (color) category.color = color;
    if (description !== undefined) category.description = description;
    category.updatedAt = Date.now();

    await category.save();

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * Delete a category
 */
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Also remove category reference from all tasks
    await Task.updateMany(
      { category: req.params.id },
      { $unset: { category: 1 } }
    );

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
