const categories = ['All', 'Work', 'Personal'];

export default function CategoryFilter({ value, onChange, disabled }) {
  return (
    <section aria-label="Filter tasks by category">
      <h2>Filter</h2>

      <div className="filters">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            aria-pressed={value === category}
            disabled={disabled}
            onClick={() => onChange(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </section>
  );
}