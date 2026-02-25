import React, { useState, useEffect } from 'react';
import { Category, Transaction } from '../types/transaction';

interface CategoryFilterProps {
  transactions: Transaction[];
  onFilterChange: (category: Category | 'ALL') => void;
}

interface CategoryBreakdown {
  category: string;
  total: number;
  count: number;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  transactions,
  onFilterChange
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'ALL'>('ALL');
  const [breakdown, setBreakdown] = useState<CategoryBreakdown[]>([]);

  useEffect(() => {
    calculateBreakdown();
  }, [transactions]);

  const calculateBreakdown = () => {
    const categoryMap = new Map<string, { total: number; count: number }>();

    // Initialize all categories with zero
    Object.values(Category).forEach(cat => {
      categoryMap.set(cat, { total: 0, count: 0 });
    });

    // Calculate totals
    transactions.forEach(transaction => {
      const current = categoryMap.get(transaction.category) || { total: 0, count: 0 };
      categoryMap.set(transaction.category, {
        total: current.total + transaction.amount,
        count: current.count + 1
      });
    });

    // Convert to array and sort by total descending
    const breakdownArray: CategoryBreakdown[] = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count
      }))
      .sort((a, b) => b.total - a.total);

    setBreakdown(breakdownArray);
  };

  const handleCategoryChange = (category: Category | 'ALL') => {
    setSelectedCategory(category);
    onFilterChange(category);
  };

  const getTotalSpending = (): number => {
    return breakdown.reduce((sum, item) => sum + item.total, 0);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', marginBottom: '20px' }}>
      <h3 style={{ marginTop: 0 }}>Category Breakdown</h3>

      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="categorySelect" style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
          Filter by Category:
        </label>
        <select
          id="categorySelect"
          value={selectedCategory}
          onChange={(e) => handleCategoryChange(e.target.value as Category | 'ALL')}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        >
          <option value="ALL">All Categories</option>
          {Object.values(Category).map(cat => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h4 style={{ marginBottom: '15px' }}>Spending by Category</h4>
        
        {breakdown.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>No transactions to display</p>
        ) : (
          <>
            <div style={{ marginBottom: '15px' }}>
              {breakdown.map(item => (
                <div
                  key={item.category}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    marginBottom: '8px',
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    border: selectedCategory === item.category ? '2px solid #007bff' : '1px solid #ddd'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                      {item.category}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {item.count} transaction{item.count !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                      ${item.total.toFixed(2)}
                    </div>
                    {getTotalSpending() > 0 && (
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {((item.total / getTotalSpending()) * 100).toFixed(1)}%
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                padding: '15px',
                backgroundColor: '#e3f2fd',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontWeight: 'bold'
              }}
            >
              <span>Total Spending:</span>
              <span style={{ fontSize: '20px' }}>${getTotalSpending().toFixed(2)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
